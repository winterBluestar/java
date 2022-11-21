function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const secondServiceId = 'zosc-second-service';
    const serverId = "hzero-interface";
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    const locatorModeler = 'zpfm_locator';
    const codeValueModeler = 'zpfm_business_code_value';
    const codeValueMap = new Map();
    const buildParamsPath = "/v1/" + tenantId + "/ss-wdt/bulid-wdt-params";
    const path = "/v2/rest/invoke?namespace=" + CORE.CurrentContext.getTenantNum() + "&serverCode=ZCUS.SS.WDT_INTERFACE&interfaceCode=vipStockOutsideWmsQuery";
    // 查询状态为已推送的委外出入库订单
    let sql = "select doc_id, doc_num, wdt_doc_num from zcus_ss_outsource_storage where tenant_id = #{tenantId} and doc_status_code = 'PUSH_SUCCESS' and INV_TYPE = 'ASCP' and wdt_doc_num is not null  order by creation_date limit 50";
    const queryParamMap = {
        tenantId: tenantId
    }
    const res = H0.SqlHelper.selectList(secondServiceId, sql, queryParamMap);
    if (res != null && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
            const storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
                "docId": res[i].docId
            });
            const locator = H0.ModelerHelper.selectOne(locatorModeler, tenantId, {
                "locatorId": storage.defaultLocatorId
            });
            if (storage.invBusinessReasonId != null) {
                if (codeValueMap.get(storage.invBusinessReasonId) == null) {
                    const codeValue = H0.ModelerHelper.selectOne(codeValueModeler, tenantId, {
                        "businessCodeValueId": storage.invBusinessReasonId
                    });
                    codeValueMap.set(codeValue.businessCodeValueId, codeValue)
                }
            }
            // 调用zosc-second-service组装参数
            const wmsQueryParam = {
                order_no: res[i].wdtDocNum
            }
            BASE.Logger.debug("-------wmsQueryParam-------{}", wmsQueryParam)
            let paramsRes = BASE.FeignClient.selectClient(secondServiceId)
                .doPost(buildParamsPath, wmsQueryParam);
            BASE.Logger.debug("-------paramsRes-------{}", paramsRes)
            paramsRes = CORE.JSON.parse(paramsRes);
            if (paramsRes.sign != null) {
                const param = {
                    bodyParamMap: paramsRes
                }
                // 调用旺店通接口获取数据
                let wdtRes = BASE.FeignClient.selectClient(serverId)
                    .doPost(path, param);
                wdtRes = CORE.JSON.parse(wdtRes);
                BASE.Logger.debug("-------WDT RES-------{}", wdtRes)
                const wdtObjRes = CORE.JSON.parse(wdtRes.payload);
                if (wdtObjRes.code == 0) {
                    const head = wdtObjRes.order_list[0];
                    BASE.Logger.error('委外查询出入库订单信息[{}]', head)
                    if (head.status == 70 || head.status == 75 || head.status == 80) {
                        // 计算scc委外出入库订单行执行数量回写
                        const storageLineList = H0.ModelerHelper.selectList(storageLineModeler, tenantId, {
                            "docId": storage.docId
                        });
                        BASE.Logger.error('委外查询出入库SCC行信息信息[{}]', storageLineList)
                        if (storageLineList != null && storageLineList.length > 0) {
                            for (let k = 0; k < storageLineList.length; k++) {
                                const storageLine = storageLineList[k]
                                let executeQty = 0;
                                for (let l = 0; l < head.details_list.length; l++) {
                                    const lineQtyDetail = head.details_list[l]
                                    if (lineQtyDetail.inout_num > 0) {
                                        const storageLineStr = storageLine.itemCode + '_' + storageLine.itemSkuCode
                                        const lineDetailStr = lineQtyDetail.goods_no + '_' + lineQtyDetail.spec_no
                                        if (storageLineStr === lineDetailStr) {
                                            executeQty = executeQty + Number(lineQtyDetail.inout_num)
                                        }
                                    }
                                }
                                if (executeQty !== 0) {
                                    storageLine.executeQty = executeQty
                                }
                            }
                        }
                        // 库存事务(杂入杂出)
                        if (head.details_list != null && head.details_list.length > 0) {
                            const paramList = []
                            for (let j = 0; j < head.details_list.length; j++) {
                                const LineDetail = head.details_list[j]
                                // 当执行数量>0进行杂入杂出操作
                                if (LineDetail.inout_num > 0) {
                                    // 组装库存事务参数
                                    const param = {
                                        organizationCode: storage.organizationCode,
                                        warehouseCode: storage.warehouseCode,
                                        locatorCode: locator.locatorCode,
                                        itemCode: LineDetail.goods_no,
                                        itemSkuCode: LineDetail.spec_no,
                                        miscInQty: LineDetail.inout_num,
                                        executeTime: getDateTimeStr(),
                                        remark: storage.docNum
                                    }
                                    if (storage.invBusinessReasonId != null) {
                                        param.businessReasonCode = codeValueMap.get(storage.invBusinessReasonId).valueCode
                                        param.businessReasonDesc = codeValueMap.get(storage.invBusinessReasonId).valueDesc
                                    }
                                    if (LineDetail.batch_no != null) {
                                        param.lotNumber = LineDetail.batch_no
                                    }
                                    if (LineDetail.goods_unit != null) {
                                        param.uomName = LineDetail.goods_unit
                                    } else {
                                        param.uomName = '件'
                                    }
                                    paramList.push(param)
                                }
                            }
                            // 创建杂入杂出库存事务
                            let invokePath;
                            if (head.order_type == 1) {
                                invokePath = "/v1/" + tenantId + "/stocks/misc-out"
                            } else if (head.order_type == 2) {
                                invokePath = "/v1/" + tenantId + "/stocks/misc-in";
                            } else {
                                BASE.Logger.error("单据类别不为委外出入库类型[" + head.order_type + "]")
                            }
                            const miscRes = H0.FeignClient.selectClient('zosc-open-api').doPost(invokePath, paramList);
                            const miscObj = CORE.JSON.parse(miscRes);
                            if (miscRes == null) {
                                BASE.Logger.error("调用杂项出入库接口无返回信息！");
                                storage.docStatusCode = 'EXECUTE_FAIL'
                                storage.syncStatus = '失败'
                                storage.syncMsg = '调用杂项出入库接口无返回信息'
                            } else {
                                if (miscObj.failed) {
                                    BASE.Logger.error("杂入杂出操作失败[" + miscObj.message + "]")
                                    storage.docStatusCode = 'EXECUTE_FAIL'
                                    storage.syncStatus = '失败'
                                    storage.syncMsg = miscObj.message
                                } else {
                                    // 更新头状态, 仓储单号, 行数量
                                    storage.docStatusCode = 'EXECUTE_SUCCESS'
                                    storage.storageDocNum = head.wms_outer_no
                                    storage.syncStatus = null
                                    storage.syncMsg = null
                                    if (storageLineList.length > 0) {
                                        H0.ModelerHelper.batchUpdateByPrimaryKey(storageLineModeler, tenantId, storageLineList)
                                    }
                                }
                            }
                            H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
                        }
                    }
                }
            }
        }
    }
}


/**
 * 获取yyyy-MM-dd HH:mm:ss 字符串格式
 * @returns {string}
 */
function getDateTimeStr() {
    const dateString = getLocalTime(8).toLocaleDateString();
    const timeString = getLocalTime(8).toLocaleTimeString();
    return dateString + " " + timeString
}

function getLocalTime(i) {
    if (typeof i !== 'number') return;
    const d = new Date();
    //得到1970年一月一日到现在的秒数
    const len = d.getTime();
    //本地时间与GMT时间的时间偏移差(注意：GMT这是UTC的民间名称。GMT=UTC）
    const offset = d.getTimezoneOffset() * 60000;
    //得到现在的格林尼治时间
    const utcTime = len + offset;
    return new Date(utcTime + 3600000 * i);
}