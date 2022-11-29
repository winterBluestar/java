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
    const queryWmsInPath = "/v1/" + tenantId + "/ss-wdt/wdt-interface-invoke/STOCKIN_ORDER_QUERY";
    const queryWmsOutPath = "/v1/" + tenantId + "/ss-wdt/wdt-interface-invoke/STOCKOUT_ORDER_QUERY";
    // 查询状态为已推送的委外出入库订单
    let sql = "select doc_id, doc_num, wdt_doc_num from zcus_ss_outsource_storage where tenant_id = #{tenantId} and doc_status_code in ('PUSH_SUCCESS','EXECUTE_FAIL') and INV_TYPE = 'ASCP' and wdt_doc_num is not null order by creation_date desc limit 20";
    const queryParamMap = {
        tenantId: tenantId
    }
    const res = H0.SqlHelper.selectList(secondServiceId, sql, queryParamMap);
    BASE.Logger.debug('-------需要同步的单据-------{}', res)
    if (res != null && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
            let storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
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
            // 调用zosc-second-service
            const wmsQueryParam = {
                src_order_no: res[i].wdtDocNum,
                keyCode: res[i].docNum
            }
            BASE.Logger.debug("-------wmsQueryParam-------{}", wmsQueryParam)
            let wdtRes;
            if (storage.docTypeCode == 'IN') {
                wdtRes = BASE.FeignClient.selectClient(secondServiceId)
                    .doPost(queryWmsInPath, wmsQueryParam);
            } else if (storage.docTypeCode == 'OUT') {
                wdtRes = BASE.FeignClient.selectClient(secondServiceId)
                    .doPost(queryWmsOutPath, wmsQueryParam);
            }
            BASE.Logger.debug("-------解析之前的 WDT RES-------{}", wdtRes)
            if (wdtRes != null) {
                wdtRes = CORE.JSON.parse(wdtRes);
                BASE.Logger.debug("-------WDT RES-------{}", wdtRes)
                const wdtObjRes = CORE.JSON.parse(wdtRes.message);
                if (wdtObjRes.code == 0) {
                    let wdtResList = null;
                    if (storage.docTypeCode == 'IN') {
                        wdtResList = wdtObjRes.stockin_list
                    } else {
                        wdtResList = wdtObjRes.stockout_list
                    }
                    for (let b = 0; b < wdtResList.length; b++) {
                        const head = wdtResList[b];
                        BASE.Logger.debug('委外查询出入库订单信息[{}]', head)
                        if (head.status == 80 || head.status == 110) {
                            // 计算scc委外出入库订单行执行数量回写
                            storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
                                "docId": res[i].docId
                            });
                            const storageLineList = H0.ModelerHelper.selectList(storageLineModeler, tenantId, {
                                "docId": res[i].docId
                            });
                            //BASE.Logger.debug('委外查询出入库SCC行信息信息[{}]', storageLineList)
                            if (storageLineList != null && storageLineList.length > 0) {
                                for (let k = 0; k < storageLineList.length; k++) {
                                    const storageLine = storageLineList[k]
                                    let executeQty = 0;
                                    for (let l = 0; l < head.details_list.length; l++) {
                                        const lineQtyDetail = head.details_list[l]
                                        if (lineQtyDetail.right_num > 0 || lineQtyDetail.goods_count > 0) {
                                            const storageLineStr = storageLine.itemCode + '_' + storageLine.itemSkuCode
                                            const lineDetailStr = lineQtyDetail.goods_no + '_' + lineQtyDetail.spec_no
                                            if (storageLineStr === lineDetailStr) {
                                                if (storage.docTypeCode == 'IN') {
                                                    executeQty = executeQty + Number(lineQtyDetail.right_num)
                                                } else {
                                                    executeQty = executeQty + Number(lineQtyDetail.goods_count)
                                                }
                                            }
                                        }
                                    }
                                    if (executeQty !== 0) {
                                        storageLine.executeQty = (storageLine.executeQty == null ? 0 : storageLine.executeQty) + executeQty
                                    }
                                }
                            }
                            // 库存事务(杂入杂出)
                            if (head.details_list != null && head.details_list.length > 0) {
                                const paramList = []
                                for (let j = 0; j < head.details_list.length; j++) {
                                    const lineDetail = head.details_list[j]
                                    // 当执行数量>0进行杂入杂出操作
                                    if (lineDetail.right_num > 0 || lineDetail.goods_count > 0) {
                                        // 组装库存事务参数
                                        const param = {
                                            organizationCode: storage.organizationCode,
                                            warehouseCode: storage.warehouseCode,
                                            locatorCode: locator.locatorCode,
                                            itemCode: lineDetail.goods_no,
                                            itemSkuCode: lineDetail.spec_no,
                                            executeTime: getDateTimeStr(),
                                            remark: storage.docNum
                                        }
                                        if (storage.docTypeCode == 'IN') {
                                            param.miscInQty = lineDetail.right_num
                                        } else {
                                            param.miscInQty = lineDetail.goods_count
                                        }
                                        if (storage.invBusinessReasonId != null) {
                                            param.businessReasonCode = codeValueMap.get(storage.invBusinessReasonId).valueCode
                                            param.businessReasonDesc = codeValueMap.get(storage.invBusinessReasonId).valueDesc
                                        }
                                        if (lineDetail.batch_no != null && lineDetail.batch_no.length > 0) {
                                            param.lotNumber = lineDetail.batch_no
                                            if (lineDetail.production_date != null && lineDetail.production_date != '0000-00-00 00:00:00' && storage.docTypeCode == 'IN') {
                                                param.lotActiveDate = lineDetail.production_date
                                            }
                                            if (lineDetail.expire_date != null && lineDetail.expire_date != '0000-00-00 00:00:00' && storage.docTypeCode == 'IN') {
                                                param.lotExpireDate = lineDetail.expire_date
                                            }
                                        }
                                        if (lineDetail.goods_unit != null) {
                                            param.uomName = lineDetail.goods_unit
                                        } else {
                                            param.uomName = '件'
                                        }
                                        paramList.push(param)
                                    }
                                }
                                // 创建杂入杂出库存事务
                                let invokePath;
                                if (head.order_type == 13) {
                                    invokePath = "/v1/" + tenantId + "/stocks/misc-out"
                                } else if (head.order_type == 12) {
                                    invokePath = "/v1/" + tenantId + "/stocks/misc-in";
                                } else {
                                    BASE.Logger.debug("单据类别不为委外出入库类型[" + head.order_type + "]")
                                }
                                BASE.Logger.debug("调用杂项出入库接口参数------{}-------------", paramList)
                                let miscRes = null;
                                if (paramList != null && paramList.length > 0) {
                                    miscRes = H0.FeignClient.selectClient('zosc-open-api').doPost(invokePath, paramList);
                                }
                                const miscObj = CORE.JSON.parse(miscRes);
                                BASE.Logger.debug("调用杂项出入库接口返回参数------{}-------------", miscObj)
                                if (miscRes == null) {
                                    BASE.Logger.debug("调用杂项出入库接口无返回信息！");
                                    storage.docStatusCode = 'EXECUTE_FAIL'
                                    storage.syncStatus = '失败'
                                    storage.syncMsg = '调用杂项出入库接口无返回信息'
                                } else {
                                    if (miscObj.failed) {
                                        BASE.Logger.debug("杂入杂出操作失败[" + miscObj.message + "]")
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
                                            BASE.Logger.debug("开始更新委外订单行执行数量----------{}------------", storageLineList)
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