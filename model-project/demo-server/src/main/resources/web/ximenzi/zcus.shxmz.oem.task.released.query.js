function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const wipServerId = 'zosc-wip'
    const organizationModeler = 'zpfm_organization'
    const supplierModeler = 'zopo_supplier'
    const supplierIdMap = new Map()
    const zmoGroupMap = new Map()
    const supplierIdArr = []

    let sql = "select zm.tenant_id, zm.organization_id, zm.MO_ID, zm.MO_NUM, zm.ITEM_ID, zm.ITEM_SKU_ID, zmt.MO_TYPE_NAME, zmo.MO_OPERATION_ID, zmo.SEQUENCE_NUM, zmo.OPERATION_ID, zm.UOM_ID, zmo.SUPPLIER_ID, zmo.PROCESS_OEM_TASK_ID, zmo.PROCESS_OEM_TASK_CODE, zm.MO_COOPERATE_STATUS from zwip_mo_operation zmo inner join zwip_mo zm on zm.TENANT_ID = #{tenantId} and zm.MO_ID = zmo.MO_ID inner join zwip_mo_type zmt on zmt.TENANT_ID = #{tenantId} and zmt.MO_TYPE_ID = zm.MO_TYPE_ID where zmo.TENANT_ID = #{tenantId} and zmo.OUTSOURCE_FLAG = 1 and zm.MO_STATUS in ('RELEASED') and zm.ORGANIZATION_ID = #{organizationId} order by zmo.CREATION_DATE DESC"
    const queryZmoParam = {
        tenantId: tenantId
    }
    const organizationCode = '30S1'
    const organization = H0.ModelerHelper.selectOne(organizationModeler, tenantId, {organizationCode: organizationCode});
    if (organization == null) {
        return '组织编码[' + organizationCode + ']没有查询到组织！'
    }
    queryZmoParam.organizationId = organization.organizationId
    BASE.Logger.debug('-------查询已下发工单工序数据入参-------{}', queryZmoParam)
    let zmoRes = H0.SqlHelper.selectList(wipServerId, sql, queryZmoParam);
    BASE.Logger.debug('-------查询已下发工单工序返回数据-------{}', zmoRes)
    if (zmoRes == null || zmoRes.length <= 0) {
        return '当日无工单工序已下发数据'
    }
    for (let zmoIndex = 0; zmoIndex < zmoRes.length; zmoIndex++) {
        const zmo = zmoRes[zmoIndex]
        const supplierId = zmo.supplierId;
        if (supplierIdMap.get(supplierId) == null) {
            const supplier = H0.ModelerHelper.selectOne(supplierModeler, tenantId, {supplierId: supplierId});
            supplierIdMap.set(supplierId, supplier)
        }

        if (zmoGroupMap.get(supplierId) == null) {
            zmoGroupMap.set(supplierId,[zmo])
        } else {
            const arr = zmoGroupMap.get(supplierId).toArray().push()
        }
    }
    for (let i = 0; i < zmoGroupMap.size; i++) {

    }
}

