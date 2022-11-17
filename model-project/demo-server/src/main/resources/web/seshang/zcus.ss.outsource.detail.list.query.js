function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const serviceId = 'zosc-second-service';
    const itemModeler = 'zpdt_item';
    const categoryModeler = 'zpdt_item_category';
    const itemSkuModeler = 'zpdt_item_sku';
    const uomModeler = 'zpdt_uom';
    const locatorModeler = 'zpfm_locator';
    const storageModeler = 'zcus_ss_outsource_storage';
    const stockModeler = 'zinv_stock';
    const wareModeler = 'zpfm_warehouse';
    const lotModeler = 'zinv_lot';
    const lotOrganizationModeler = 'zpdt_item_organization';
    const codeValueModeler = 'zpfm_business_code_value';
    const syncStatusMap = new Map();
    const locatorMap = new Map();
    const itemMap = new Map();
    const itemSkuMap = new Map();
    const uomMap = new Map();
    const categoryMap = new Map();
    const warehouseMap = new Map();
    const codeValueMap = new Map();
    let sql = "SELECT zsosl.CREATED_BY,zsosl.CREATION_DATE,zsosl.LAST_UPDATED_BY,zsosl.LAST_UPDATE_DATE,zsosl.object_version_number,zsosl.tenant_id," +
        "zsosl.line_id,zsosl.doc_id,zsosl.doc_num,zsosl.line_number,zsosl.item_id,zsosl.specification_model,zsosl.item_sku_id,zsosl.warehouse_id," +
        "zsosl.QUANTITY,zsosl.EXECUTE_QTY,zsosl.lot_num,zsosl.EXPIRATION_DATE,zsosl.DOC_TYPE_CODE,zsosl.REMARK,zsosl.lot_id,zsos.INV_TYPE FROM zcus_ss_outsource_storage_line zsosl " +
        "LEFT JOIN zcus_ss_outsource_storage zsos ON zsosl.tenant_id = zsos.tenant_id AND zsosl.doc_id = zsos.doc_id WHERE zsosl.tenant_id = #{tenantId}";
    const queryParamMap = {
        tenantId: tenantId
    }
    const pageRequestObject = {
        page: input.page,
        size: input.size
    }
    if (input.docId != null && input.docId.length > 0) {
        sql = sql + " and zsosl.doc_id = #{docId}"
        queryParamMap.docId = input.docId
    }
    if (input.docNum != null && input.docNum.length > 0) {
        sql = sql + " and zsosl.doc_num like concat('%',#{docNum},'%')"
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
    sql = sql + " order by zsosl.doc_num desc";
    let linePage = H0.SqlHelper.selectPage(serviceId, sql, queryParamMap, pageRequestObject);
    if (linePage !== null && linePage.content !== null && linePage.content.length > 0) {
        linePage.content.forEach(function (value, index) {
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
            if (itemMap.has(value.itemId)) {
                value.itemCode = itemMap.get(value.itemId)
                    .itemCode
                value.itemDesc = itemMap.get(value.itemId)
                    .itemDesc
                value.uomId = itemMap.get(value.itemId)
                    .uomId
                value.itemCategoryId = itemMap.get(value.itemId)
                    .itemCategoryId
                value.skuEnabledFlag = itemMap.get(value.itemId)
                    .skuEnabledFlag
            } else {
                const item = H0.ModelerHelper.selectOne(itemModeler, tenantId, {
                    "itemId": value.itemId
                });
                if (item != null && item.itemId != null) {
                    value.itemCode = item.itemCode
                    value.itemDesc = item.itemDesc
                    value.uomId = item.uomId
                    value.itemCategoryId = item.itemCategoryId
                    value.skuEnabledFlag = item.skuEnabledFlag
                    itemMap.set(item.itemId, item)
                }
            }
            if (itemMap.get(value.itemId).skuEnabledFlag === '1') {
                if (itemSkuMap.has(value.itemSkuId)) {
                    value.itemSkuCode = itemSkuMap.get(value.itemSkuId)
                        .itemSkuCode
                    value.itemSkuDesc = itemSkuMap.get(value.itemSkuId)
                        .itemSkuDesc
                } else {
                    const itemSku = H0.ModelerHelper.selectOne(itemSkuModeler, tenantId, {
                        "itemSkuId": value.itemSkuId
                    });
                    if (itemSku != null && itemSku.itemSkuId != null) {
                        value.itemSkuCode = itemSku.itemSkuCode
                        value.itemSkuDesc = itemSku.itemSkuDesc
                        itemSkuMap.set(itemSku.itemSkuId, itemSku)
                    }
                }
            }
            if (categoryMap.has(value.itemCategoryId)) {
                value.itemCategoryDesc = categoryMap.get(value.itemCategoryId)
                    .itemCategoryDesc
            } else {
                const category = H0.ModelerHelper.selectOne(categoryModeler, tenantId, {
                    "itemCategoryId": value.itemCategoryId
                });
                if (category != null && category.itemCategoryId != null) {
                    value.itemCategoryDesc = category.itemCategoryDesc
                    categoryMap.set(category.itemCategoryId, category)
                }
            }
            if (uomMap.has(value.uomId)) {
                value.uomName = uomMap.get(value.uomId).uomName
            } else {
                const uom = H0.ModelerHelper.selectOne(uomModeler, tenantId, {
                    "uomId": value.uomId
                });
                if (uom != null && uom.uomId != null) {
                    value.uomName = uom.uomName
                    uomMap.set(uom.uomId, uom)
                }
            }
            const stockRes = H0.ModelerHelper.selectOne(stockModeler, tenantId, {
                "warehouseId": value.warehouseId,
                "itemId": value.itemId,
                "itemSkuId": value.itemSkuId
            });
            if (stockRes != null) {
                value.stockQuantity = stockRes.quantity
            }
            if (warehouseMap.has(value.warehouseId)) {
                value.warehouseName = warehouseMap.get(value.warehouseId).warehouseName
                value.warehouseCode = warehouseMap.get(value.warehouseId).warehouseCode
                value.organizationName = warehouseMap.get(value.warehouseId).organizationName
                value.organizationId = warehouseMap.get(value.warehouseId).organizationId
            } else {
                const warehouse = H0.ModelerHelper.selectOne(wareModeler, tenantId, {
                    "warehouseId": value.warehouseId
                });
                if (warehouse != null && warehouse.warehouseId != null) {
                    value.warehouseName = warehouse.warehouseName
                    value.warehouseCode = warehouse.warehouseCode
                    value.organizationName = warehouse.organizationName
                    value.organizationId = warehouse.organizationId
                    warehouseMap.set(warehouse.warehouseId, warehouse)
                }
            }
            const itemTypeId = itemMap.get(value.itemId).itemTypeId;
            if (codeValueMap.has(itemTypeId)) {
                value.itemTypeMeaning = codeValueMap.get(itemTypeId).valueDesc
                value.itemTypeId = itemTypeId
            } else {
                const codeValue = H0.ModelerHelper.selectOne(codeValueModeler, tenantId, {
                    "businessCodeValueId": itemTypeId
                });
                value.itemTypeMeaning = codeValue.valueDesc
                value.itemTypeId = itemTypeId
                codeValueMap.set(itemTypeId,codeValue)
            }
            if(value.lotId != null){
                const lotInfo = H0.ModelerHelper.selectOne(lotModeler, tenantId, {
                    "lotId": value.lotId
                });
                if(lotInfo != null) {
                    value.activeTime = lotInfo.activeTime
                    value.expireTime = lotInfo.expireTime
                }
                const lotOrganization = H0.ModelerHelper.selectOne(lotOrganizationModeler, tenantId, {
                    "lotId": value.lotId,
                    "organizationId": value.organizationId
                });
                value.lotEnableFlag = Number(lotOrganization.lotEnableFlag)
            }
        })
    }
    return linePage;
}