function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 55;
    const stockModeler = 'zinv_stock_tx';
    const fileModeler = 'zcus_ss_transaction_file'
    //return input.stockTxId;
    //return input.fileList.length;
    // 删除所有检验报告
    if (input != null && (input.fileList == null || input.fileList.length === 0)) {
        const deleteParamMap = {
            stockTxId: input.stockTxId
        }
        const res = H0.ModelerHelper.selectPage(fileModeler, tenantId, deleteParamMap, {});
        return H0.ModelerHelper.batchDeleteByPrimaryKey(fileModeler, tenantId, res.content);
    }
    // 新增或更新检验报告
    if (input != null && input.fileList != null && input.fileList.length > 0) {
        const queryParamMap = {
            stockTxId: input.stockTxId
        };
        var res = H0.ModelerHelper.selectOne(stockModeler, tenantId, queryParamMap)
        if (res != null && res.content != null && res.content.length > 0) {
            // 查询是否需要更新库存事务扩展字段attributeString1
            const updateRes = res.content[0];
            if (updateRes.attributeString1 == null || updateRes.attributeString1 === "1") {
                updateRes.attributeString1 = '1'
                H0.ModelerHelper.updateByPrimaryKey(stockModeler, tenantId, updateRes);
            }
        }
        // 先删除检验报告, 再插入检验报告
        const deleteParamMap = {
            stockTxId: input.stockTxId
        }
        const fileRes = H0.ModelerHelper.selectPage(fileModeler, tenantId, deleteParamMap, {});
        H0.ModelerHelper.batchDeleteByPrimaryKey(fileModeler, tenantId, fileRes.content);
        return H0.ModelerHelper.batchInsert(fileModeler, tenantId, input.fileList, true);
        return input;
    }
}