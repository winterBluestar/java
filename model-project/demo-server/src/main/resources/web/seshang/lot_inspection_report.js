function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const serviceId = "zosc-inv";
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const itemModeler = 'zpdt_item';
    const itemSkuModeler = 'zpdt_item_sku';
    const fileModeler = 'zcus_ss_transaction_file';
    const organizationModeler = 'zpfm_organization';
    const itemMap = new Map();
    const itemSkuMap = new Map();
    const organizationMap = new Map();
    let sql = "SELECT zst.tenant_id,zst.organization_id,zst.item_id,zst.item_sku_id,zst.inv_tx_type_id,ztt.tx_type_name as invTxTypeName, zst.lot_id,zst.tx_qty,zst.stock_qty,zst.inv_tx_time,zst.source_dc_category,'采购订单' source_dc_category_name,zst.source_dc_type_id,zst.source_dc_id,zst.source_dc_num,zst.inv_dc_type,zst.inv_dc_id,zst.inv_dc_num,zst.stock_tx_id,case when zst.attribute_string1 is null then 0 else zst.attribute_string1 end attribute_string1,zst.attribute_datetime1,zl.lot_num,ztt.tx_type_name,zp.supplier_id,zs.supplier_name from zinv_stock_tx zst left join zinv_lot zl on zst.lot_id = zl.lot_id left join zinv_tx_type ztt on zst.inv_tx_type_id = ztt.tx_type_id left join zwip_mo_type zmt on zmt.mo_type_id = zst.source_dc_type_id left join zopo_po_type_rule zptr on zptr.po_type_rule_id = zst.source_dc_type_id left join zopo_po zp on zp.po_id = zst.source_dc_id left join zopo_supplier zs on zp.supplier_id = zs.supplier_id where zst.tenant_id = #{tenantId} and zst.SOURCE_DC_CATEGORY = 'PURCHASING_ORDER' and ztt.tx_type_code = 'PO_ACCEPT'";
    const queryParamMap = {
        tenantId: tenantId
    };
    if (input.organizationId != null && input.organizationId.length > 0) {
        sql = sql + " and zst.ORGANIZATION_ID = #{organizationId}"
        queryParamMap.organizationId = input.organizationId
    }
    if (input.sourceDcId != null && input.sourceDcId.length > 0) {
        sql = sql + " and zst.source_dc_id = #{sourceDcId}"
        queryParamMap.sourceDcId = input.sourceDcId
    }
    if (input.invDcId != null && input.invDcId.length > 0) {
        sql = sql + " and zst.INV_DC_ID = #{invDcId}"
        queryParamMap.invDcId = input.invDcId
    }
    if (input.supplierId != null && input.supplierId.length > 0) {
        sql = sql + " and zs.supplier_id = #{supplierId}"
        queryParamMap.supplierId = input.supplierId
    }
    if (input.itemId != null && input.itemId.length > 0) {
        sql = sql + " and zst.item_id = #{itemId}"
        queryParamMap.itemId = input.itemId
    }
    if (input.itemSkuId != null && input.itemSkuId.length > 0) {
        sql = sql + " and zst.ITEM_SKU_ID = #{itemSkuId}"
        queryParamMap.itemSkuId = input.itemSkuId
    }
    if (input.lotNum != null && input.lotNum.length > 0) {
        sql = sql + " and zl.LOT_NUM like concat('%',#{lotNum},'%')"
        queryParamMap.lotNum = input.lotNum
    }
    if (input.attributeString1 != null && input.attributeString1.length > 0) {
        if (input.attributeString1 === '1') {
            sql = sql + " and zst.attribute_string1 = #{attributeString1}"
        } else {
            sql = sql + " and (zst.attribute_string1 = #{attributeString1} or zst.attribute_string1 is null)"
        }
        queryParamMap.attributeString1 = input.attributeString1
    }
    sql = sql + " ORDER BY zst.INV_TX_TIME DESC"
    const pageRequestObject = {
        page: input.page,
        size: input.size
    }
    var res = H0.SqlHelper.selectPage(serviceId, sql, queryParamMap, pageRequestObject);
    if (res != null && res.content != null && res.content.length > 0) {
        res.content.forEach(function (value, index) {
            if (itemMap.has(value.itemId)) {
                value.itemCode = itemMap.get(value.itemId)
                    .itemCode
                value.itemDesc = itemMap.get(value.itemId)
                    .itemDesc
                value.skuEnabledFlag = itemMap.get(value.itemId)
                    .skuEnabledFlag
            } else {
                const item = H0.ModelerHelper.selectOne(itemModeler, tenantId, {
                    "itemId": value.itemId
                });
                if (item != null && item.itemId != null) {
                    value.itemCode = item.itemCode
                    value.itemDesc = item.itemDesc
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
            if (organizationMap.has(value.organizationId)) {
                value.organizationName = organizationMap.get(value.organizationId).organizationName
            } else {
                const organization = H0.ModelerHelper.selectOne(organizationModeler, tenantId, {
                    "organizationId": value.organizationId
                });
                value.organizationName = organization.organizationName
                organizationMap.set(organization.organizationId, organization)
            }
            const queryFileMap = {
                "stockTxId": value.stockTxId
            }
            let res = H0.ModelerHelper.selectPage(fileModeler, tenantId, queryFileMap, {});
            value.stockTxAttachList = res;
        })
    }
    return res;
}