function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 76;
    const regionModeler = 'zpfm_region';
    const locatorModeler = 'zpfm_locator';
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    const secondServerId = "zosc-second-service";
    const serverId = "hzero-interface";
    const path = "/v2/rest/invoke?namespace=" + CORE.CurrentContext.getTenantNum() + "&serverCode=ZCUS.SS.WDT_INTERFACE&interfaceCode=vipWmsStockinoutOrderPush";
    const bulidParamsPath = "/v1/" + tenantId + "/ss-wdt/bulid-wdt-params";
    // 根据id查询委外出入库头数据
    if (input != null && input.docList != null && input.docList.length > 0) {
        for (let i = 0; i < input.docList.length; i++) {
            const value = input.docList[i]
            const storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
                "docId": value.docId
            });
            if (storage == null) {
                return "委外出入库订单" + value.docNum + "不存在，请确认后重试！";
            }
            if (storage.docStatusCode != 'NEW' && storage.docStatusCode != 'PUSH_FAIL' && storage.docStatusCode != 'EXECUTE_FAIL') {
                return "委外出入库订单" + value.docNum + "状态不为新建，请确认后重试！";
            }
            if (storage.invType !== 'SCC') {
                if (storage.invType === 'WDT' && storage.targetWarehouseCode != null) {
                    // 推广售卖
                    BASE.Logger.debug('-------推广售卖入参storage-------{}', storage)
                    return H0.ScriptHelper.execute(tenantId, 'zcus.ss.outsource.popularize.sale', storage);
                } else {
                    // 将订单状态更新为 已推送, 并将出入库指令推送给旺店通
                    //storage = ascpToWdt(storage,storageLineModeler,regionModeler, tenantId);
                    const province = H0.ModelerHelper.selectOne(regionModeler, 0, {"regionId": storage.provinceRegionId});
                    const city = H0.ModelerHelper.selectOne(regionModeler, 0, {"regionId": storage.cityRegionId});
                    const district = H0.ModelerHelper.selectOne(regionModeler, 0, {"regionId": storage.districtRegionId});
                    const stockin_info = {};
                    stockin_info.api_outer_no = storage.docNum;
                    stockin_info.warehouse_no = storage.warehouseCode;
                    stockin_info.order_type = storage.docTypeCode === 'OUT' ? '1' : '2';
                    stockin_info.province = province.regionName;
                    stockin_info.city = city.regionName;
                    stockin_info.district = district.regionName;
                    stockin_info.address = storage.addressDetail;
                    stockin_info.contact = storage.contacts;
                    stockin_info.mobile = storage.phone;
                    stockin_info.auto_check = "1";
                    stockin_info.remark = storage.remark;
                    const storageLineList = H0.ModelerHelper.selectList(storageLineModeler, tenantId, {
                        "docId": storage.docId
                    });
                    const goods_list = []
                    for (let j = 0; j < storageLineList.length; j++) {
                        const goods = {};
                        const storageLine = storageLineList[j];
                        goods.spec_no = storageLine.itemSkuCode;
                        goods.num = storageLine.quantity;
                        goods.price = 0;
                        goods.batch_no = storageLine.lotNum;
                        goods.remark = storageLine.remark;
                        goods_list.push(goods);
                    }
                    stockin_info.goods_list = goods_list;
                    // 调用zosc-second-service公共方法
                    let wdtParam = {}
                    wdtParam.stockin_info = CORE.JSON.stringify(stockin_info)
                    BASE.Logger.debug("-------wdtParam-------{}", wdtParam)
                    // 组装参数
                    let paramsRes = BASE.FeignClient.selectClient(secondServerId)
                        .doPost(bulidParamsPath, wdtParam);
                    BASE.Logger.debug("-------paramsRes-------{}", paramsRes)
                    paramsRes = CORE.JSON.parse(paramsRes);
                    if (paramsRes.sign != null) {
                        const param = {
                            bodyParamMap: paramsRes
                        }
                        const resStr = BASE.FeignClient.selectClient(serverId)
                            .doPost(path, param);
                        resObj = CORE.JSON.parse(resStr);
                        BASE.Logger.debug("-------WDT RES-------{}", resObj)
                        const wdtRes = CORE.JSON.parse(resObj.payload);
                        if (wdtRes.code != 0) {
                            BASE.Logger.error('创建委外出入库订单[{}]失败:{}', storage.docNum,)
                            return "旺店通创建委外出入库订单[" + storage.docNum + "]失败：" + wdtRes.message
                        } else {
                            storage.docStatusCode = 'PUSH_SUCCESS'
                            storage.wdtDocNum = wdtRes.data.stockout_no
                        }
                    }
                }
            } else if (storage.invType === 'SCC') {
                // 更新状态为已完成, 更新行执行数量 = 数量, 调用杂入杂出接口
                const storageLineList = H0.ModelerHelper.selectList(storageLineModeler, tenantId, {
                    "docId": value.docId
                });
                if (storageLineList == null || storageLineList.length <= 0) {
                    return "委外出入库订单" + value.docNum + "不存在行数据，请确认后重试！";
                }
                const paramList = [];
                storageLineList.forEach(function (value, index) {
                    value.executeQty = value.quantity
                    const locator = H0.ModelerHelper.selectOne(locatorModeler, tenantId, {
                        "locatorId": value.locatorId
                    });
                    const param = {
                        organizationCode: value.organizationCode,
                        warehouseName: value.warehouseName,
                        locatorCode: locator.locatorCode,
                        itemCode: value.itemCode,
                        itemSkuCode: value.itemSkuCode,
                        uomName: value.uomName,
                        miscInQty: value.quantity,
                        executeTime: getDateTimeStr(),
                        remark: value.docNum
                    }
                    if (value.lotNum != null) {
                        param.lotNumber = value.lotNum
                    }
                    paramList.push(param)
                })
                // 更新行执行数量
                H0.ModelerHelper.batchUpdateByPrimaryKey(storageLineModeler, tenantId, storageLineList, true)
                // 拼接杂入杂出的路径
                let invokePath;
                if (storage.docTypeCode === 'IN') {
                    invokePath = "/v1/" + tenantId + "/stocks/misc-in";
                } else if (storage.docTypeCode === 'OUT') {
                    invokePath = "/v1/" + tenantId + "/stocks/misc-out"
                }
                const miscRes = H0.FeignClient.selectClient('zosc-open-api').doPost(invokePath, paramList);
                const miscObj = CORE.JSON.parse(miscRes);
                BASE.Logger.debug('-------执行库存事务返回消息---------{}', miscObj)
                if (miscRes == null) {
                    return "调用杂项出入库接口无返回信息！";
                } else {
                    if (miscObj.failed) {
                        return miscObj.message;
                    }
                }
                storage.docStatusCode = 'EXECUTE_SUCCESS'
            }
            H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
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