function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 81;
    const stockModeler = 'zinv_stock';
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    let errorContent = {};
    // 校验单据类型为“委外出库”时库存量是否大于用户填写的数量
    //if (input.docTypeCode === 'OUT') {
    //    if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
    //        for (let i = 0; i < input.outsourceLineList.length; i++) {
    //            const value = input.outsourceLineList[i]
    //            let stockRes = null
    //            const stockParam = {
    //                organizationId: input.organizationId,
    //                itemId: value.itemId,
    //                itemSkuId: value.itemSkuId
    //            }
    //            if(value.lotId != null){
    //                stockParam.lotId = value.lotId
    //            }
    //            if (input.targetWarehouseCode != null) {
    //                stockParam.warehouseId = value.targetWarehouseId
    //            } else {
    //                stockParam.warehouseId = value.warehouseId
    //            }
    //            stockRes = H0.ModelerHelper.selectOne(stockModeler, tenantId, stockParam);
    //            if (stockRes == null || (value.quantity > stockRes.quantity)) {
    //                if (input.isSubmit != null && input.isSubmit) {
    //                    errorContent.msg = value.lineNumber + "行当前仓库库存数量小于执行数量！请确认后重新提交！"
    //                    return errorContent;
    //                } else {
    //                    H0.ExceptionHelper.throwCommonException(value.lineNumber + "行当前仓库库存数量小于执行数量！请确认后重新提交！")
    //                }
    //            }
    //        }
    //    }
    //}
    if (input.outsourceLineList != null && input.outsourceLineList.length > 1) {
        for (let i = 0; i < input.outsourceLineList.length; i++) {
            const compareLine = input.outsourceLineList[i];
            if (compareLine._status != 'delete') {
                for (let j = 0; j < input.outsourceLineList.length; j++) {
                    const compareToLine = input.outsourceLineList[j];
                    if (i !== j && compareToLine._status != 'delete' && compareLine.itemId === compareToLine.itemId
                        && compareLine.itemSkuId === compareToLine.itemSkuId) {
                        if (input.isSubmit != null && input.isSubmit) {
                            errorContent.msg = "委外出入库订单物料SKU不能重复"
                            return errorContent;
                        } else {
                            H0.ExceptionHelper.throwCommonException("委外出入库订单物料SKU不能重复")
                        }
                    }
                }
            }
        }
    }
    // 保存头数据
    let resHead;
    const exitStorage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
        "docNum": input.docNum
    });
    if (exitStorage != null) {
        input.objectVersionNumber = Number(exitStorage.objectVersionNumber)
        input._status = 'update'
        input.docId = exitStorage.docId
    }
    if (input._status == 'create') {
        if (exitStorage != null) {
            if (input.isSubmit != null && input.isSubmit) {
                errorContent.msg = '委外出入库订单号：' + input.docNum + '已存在'
                return errorContent;
            } else {
                H0.ExceptionHelper.throwCommonException('委外出入库订单号：' + input.docNum + '已存在')
            }
        }
        resHead = H0.ModelerHelper.insert(storageModeler, tenantId, input, true);
    } else if (input._status == 'update') {
        resHead = H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, input, true)
    }
    // 保存行数据
    if (input.outsourceLineList != null && input.outsourceLineList.length > 0) {
        input.outsourceLineList.forEach(function (value, index) {
            value.docId = resHead.docId
            value.docNum = resHead.docNum
            value.docTypeCode = resHead.docTypeCode
            const exitStorageLine = H0.ModelerHelper.selectOne(storageLineModeler, tenantId, {
                "docNum": value.docNum,
                "lineNumber": value.lineNumber
            });
            if (exitStorageLine != null) {
                value.objectVersionNumber = Number(exitStorageLine.objectVersionNumber)
                value._status = 'update'
                value.lineId = exitStorageLine.lineId
            }
            if (value._status === 'create') {
                H0.ModelerHelper.insert(storageLineModeler, tenantId, value, true);
            } else if (value._status === 'update') {
                H0.ModelerHelper.updateByPrimaryKey(storageLineModeler, tenantId, value, true)
            } else if (value._status === 'delete') {
                H0.ModelerHelper.deleteByPrimaryKey(storageLineModeler, tenantId, value)
            }
        })
    }
    return resHead
}