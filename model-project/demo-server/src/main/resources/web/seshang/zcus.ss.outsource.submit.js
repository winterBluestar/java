function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const locatorModeler = 'zpfm_locator';
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    // 根据id查询委外出入库头数据
    if (input != null && input.docList != null && input.docList.length > 0) {
        for (let i = 0; i < input.docList.length; i++) {
            const value = input.docList[i]
            const storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
                "docId": value.docId
            });
            if (storage == null) {
                H0.ExceptionHelper.throwCommonException("委外出入库订单" + value.docNum + "不存在，请确认后重试！");
            }
            if (storage.docStatusCode !== 'NEW') {
                H0.ExceptionHelper.throwCommonException("委外出入库订单" + value.docNum + "状态不为新建，请确认后重试！");
            }
            if (storage.invType !== 'SCC') {
                //todo 将订单状态更新为 已推送, 并将出入库指令推送给旺店通
                storage.docStatusCode = 'PUSHED'
            } else if (storage.invType === 'SCC') {
                // 更新状态为已完成, 更新行执行数量 = 数量, 调用杂入杂出接口
                storage.docStatusCode = 'COMPLETED'
                const storageLineList = H0.ModelerHelper.selectList(storageLineModeler, tenantId, {
                    "docId": value.docId
                });
                if (storageLineList == null || storageLineList.length <= 0) {
                    H0.ExceptionHelper.throwCommonException("委外出入库订单" + value.docNum + "不存在行数据，请确认后重试！");
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
                //return paramList
                const miscRes = H0.FeignClient.selectClient('zosc-open-api').doPost(invokePath, paramList);
                const miscObj = CORE.JSON.parse(miscRes);
                return miscObj
                if (miscRes == null) {
                    H0.ExceptionHelper.throwCommonException("调用杂项出入库接口无返回信息！");
                } else {
                    if (miscObj.failed) {
                        H0.ExceptionHelper.throwCommonException(miscObj.message);
                    }
                }
            }
            H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
        }
    }
    return input;
}

function getDateTimeStr() {
    let dateString = new Date().toLocaleDateString();
    let timeString = new Date().toLocaleTimeString();
    return dateString + " " + timeString
}