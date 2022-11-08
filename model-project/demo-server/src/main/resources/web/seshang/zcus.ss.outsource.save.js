function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const stockModeler = 'zinv_stock';
    const locatorModeler = 'zpfm_locator';
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    // 校验单据类型为“委外出库”时库存量是否大于用户填写的数量
    if (input.docTypeCode === 'OUT') {
        if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
            input.outsourceLineList.forEach(function (value, index) {
                const stockRes = H0.ModelerHelper.selectOne(stockModeler, tenantId, {
                    "warehouseId": input.warehouseId,
                    "organizationId": input.organizationId,
                    "itemId": input.itemId,
                    "itemSkuId": input.itemSkuId
                });
                if (stockRes != null || stockRes !== "{}") {
                    if (value.quantity > stockRes.quantity) {
                        H0.ExceptionHelper.throwCommonException(value.lineNumber + "当前仓库库存数量小于执行数量！请确认后重新提交！");
                    }
                }
            })
        }
    }
    // 判断是否为保存并提交
    if (input.isSubmit === 'true') {
        // 推送旺店通
        if (!isEmptyStr(input.syncFlag) && input.syncFlag === 'true') {
            input.docStatusCode = 'PUSHED'
            H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
            //TODO 将出入库指令推送给外部系统旺店通
        }
        // 不推送旺店通
        if (isEmptyStr(input.syncFlag) || (!isEmptyStr(input.syncFlag) && input.syncFlag === 'false')) {
            input.docStatusCode = 'COMPLETED';
            if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
                input.outsourceLineList.forEach(function (value, index) {
                    value.executeQty = value.quantity
                })
            }
            const paramList = [];
            let invokePath;
            if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
                input.outsourceLineList.forEach(function (value, index) {
                    const locator = H0.ModelerHelper.selectOne(locatorModeler, tenantId, {
                        "locatorId": value.locatorId
                    });
                    const param = {
                        organizationCode: input.organizationCode,
                        warehouseCode: value.warehouseCode,
                        locatorCode: locator.locatorCode,
                        itemCode: value.itemCode,
                        itemSkuCode: value.itemSkuCode,
                        uomName: value.uomName,
                        miscInQty: value.quantity,
                        executeTime: new Date()
                    }
                    paramList.push(param)
                })
            }
            // 拼接杂入杂出的路径
            if (input.docTypeCode === 'IN') {
                invokePath = "/hitf/v1/" + tenantId + "/rest/invoke";
            } else if (input.docTypeCode === 'OUT') {
                invokePath = "/hitf/v1" + tenantId + "/rest/invoke?namespace=HZERO&serverCode=ZOSC_OPEN_API&interfaceCode=zosc-open-api.stock-api-controller.miscOut"
            }
            H0.FeignClient.selectClient('zosc-open-api').doPost(invokePath, paramList)
        }
    }

    // 保存头数据
    let resHead;
    if (input._status === 'create') {
        resHead = H0.ModelerHelper.insert(storageModeler, tenantId, input, true);
    } else if (input._status === 'update') {
        resHead = H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, input, true)
    }
    // 保存行数据
    if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
        input.outsourceLineList.forEach(function (value, index) {
            value.docId = resHead.docId
            value.docNum = resHead.docNum
            if (value._status === 'create') {
                H0.ModelerHelper.insert(storageLineModeler, tenantId, value, true);
            } else if (value._status === 'update') {
                H0.ModelerHelper.updateByPrimaryKey(storageLineModeler, tenantId, value, true)
            } else if (value._status === 'delete') {
                H0.ModelerHelper.deleteByPrimaryKey(storageLineModeler, tenantId, value)
            }
        })
    }
    return input;
}

/**
 * 判空
 * @param s
 * @returns {boolean}
 */
function isEmptyStr(s) {
    if (s == null || s === '') {
        return true;
    }
    return false;
}