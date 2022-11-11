function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const stockModeler = 'zinv_stock';
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    const scriptCode = 'zcus.ss.outsource.submit';
    // 校验单据类型为“委外出库”时库存量是否大于用户填写的数量
    if (input.docTypeCode === 'OUT') {
        if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
            for (let i = 0; i < input.outsourceLineList.length; i++) {
                const value = input.outsourceLineList[i]
                const stockRes = H0.ModelerHelper.selectOne(stockModeler, tenantId, {
                    "warehouseId": value.warehouseId,
                    "organizationId": input.organizationId,
                    "itemId": value.itemId,
                    "itemSkuId": value.itemSkuId
                });
                if (stockRes == null || (value.quantity > stockRes.quantity)) {
                    H0.ExceptionHelper.throwCommonException(value.lineNumber + "行当前仓库库存数量小于执行数量！请确认后重新提交！");
                }
            }
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
            value.docTypeCode = resHead.docTypeCode
            if (value._status === 'create') {
                H0.ModelerHelper.insert(storageLineModeler, tenantId, value, true);
            } else if (value._status === 'update') {
                H0.ModelerHelper.updateByPrimaryKey(storageLineModeler, tenantId, value, true)
            } else if (value._status === 'delete') {
                H0.ModelerHelper.deleteByPrimaryKey(storageLineModeler, tenantId, value)
            }
        })
    }
    // 判断是否为保存并提交, 如果是的话则调用提交脚本
    if (input.isSubmit) {
        const docList = [];
        const param = {
            docId: resHead.docId,
            docNum: resHead.docNum,
            organizationCode: input.organizationCode
        }
        docList.push(param)
        const docParam = {
            "docList": docList
        }
        H0.ScriptHelper.execute (tenantId, scriptCode, docParam);
    }
    return resHead;
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