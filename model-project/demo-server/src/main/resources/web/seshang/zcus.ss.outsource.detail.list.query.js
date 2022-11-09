function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const serviceId = 'zosc-second-service';
    const locatorModeler = 'zpfm_locator';
    const storageModeler = 'zcus_ss_outsource_storage';
    const syncStatusMap = new Map();
    const locatorMap = new Map();
    let sql = "SELECT zsosl.CREATED_BY,zsosl.CREATION_DATE,zsosl.LAST_UPDATED_BY,zsosl.LAST_UPDATE_DATE,zsosl.object_version_number,zsosl.tenant_id," +
        "zsosl.line_id,zsosl.doc_id,zsosl.doc_num,zsosl.line_number,zsosl.item_id,zsosl.specification_model,zsosl.item_sku_id,zsosl.warehouse_id," +
        "zsosl.QUANTITY,zsosl.EXECUTE_QTY,zsosl.lot_num,zsosl.EXPIRATION_DATE,zsosl.DOC_TYPE_CODE,zsosl.REMARK,zsos.INV_TYPE FROM zcus_ss_outsource_storage_line zsosl " +
        "LEFT JOIN zcus_ss_outsource_storage zsos ON zsosl.tenant_id = zsos.tenant_id AND zsosl.doc_id = zsos.doc_id WHERE zsosl.tenant_id = #{tenantId}";
    const queryParamMap = {
        tenantId: tenantId
    }
    const pageRequestObject = {
        page: input.page,
        size: input.size
    }
    if (input.docNum != null && input.docNum.length > 0) {
        sql = sql + " and zsosl.doc_num = #{docNum}"
        queryParamMap.docNum = input.docNum
    }
    if (input.docTypeCode != null && input.docTypeCode.length > 0) {
        sql = sql + " and zsosl.DOC_TYPE_CODE = #{docTypeCode}"
        queryParamMap.docTypeCode = input.docTypeCode
    }
    if (input.itemId != null && input.itemId.length > 0) {
        sql = sql + " and zsosl.item_id = #{itemId}"
        queryParamMap.itemId = input.itemId
    }
    if (input.itemSkuId != null && input.itemSkuId.length > 0) {
        sql = sql + " and zsosl.item_sku_id = #{itemSkuId}"
        queryParamMap.itemSkuId = input.itemSkuId
    }
    if (input.warehouseId != null && input.warehouseId.length > 0) {
        sql = sql + " and zsosl.warehouse_id = #{warehouseId}"
        queryParamMap.warehouseId = input.warehouseId
    }
    if (input.specificationModel != null && input.specificationModel.length > 0) {
        sql = sql + " and zsosl.specification_model like concat('%',#{specificationModel},'%')"
        queryParamMap.specificationModel = input.specificationModel
    }
    let linePage = H0.SqlHelper.selectPage(serviceId, sql, queryParamMap, pageRequestObject);
    if (linePage != null && linePage.getcontent != null && linePage.getcontent.length > 0) {
        linePage.getcontent.forEach(function (value, index) {
            if (syncStatusMap.has(value.docId)) {
                value.syncFlag = syncStatusMap.get(value.docId).syncFlag
            } else {
                let storageRes = H0.ModelerHelper.selectOne(storageModeler, tenantId, {docId: value.docId});
                if (storageRes != null && storageRes.docId != null) {
                    value.syncFlag = storageRes.syncFlag
                    syncStatusMap.set(storageRes.docId, storageRes)
                }
            }
            if (locatorMap.has(value.warehouseId)) {
                value.locatorId = locatorMap.get(value.warehouseId).locatorId
            } else {
                let locator = H0.ModelerHelper.selectOne(locatorModeler, tenantId, {warehouseId: value.warehouseId});
                if (locator != null && locator.warehouseId != null) {
                    value.locatorId = locator.locatorId
                    locatorMap.set(locator.warehouseId, locator)
                }
            }
        })
    }
    return linePage;
}
