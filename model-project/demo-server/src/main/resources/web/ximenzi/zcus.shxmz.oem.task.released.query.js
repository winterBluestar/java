function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const wipServerId = 'zosc-wip'
    const organizationModeler = 'zpfm_organization'
    const supplierModeler = 'zopo_supplier'
    const itemModeler = 'zpdt_item'
    const operationModeler = 'zbom_operation'
    const supplierIdMap = new Map()
    const zmoGroupMap = new Map()
    const itemMap = new Map()
    const operationMap = new Map()
    let sql = "select zm.tenant_id, zm.organization_id, zm.MO_ID, zm.MO_NUM, zm.ITEM_ID, zm.ITEM_SKU_ID, zmt.MO_TYPE_NAME, zmo.MO_OPERATION_ID, zmo.SEQUENCE_NUM, zmo.OPERATION_ID, zm.UOM_ID, zmo.SUPPLIER_ID, zmo.PROCESS_OEM_TASK_CODE, zm.MO_COOPERATE_STATUS from zwip_mo_operation zmo inner join zwip_mo zm on zm.MO_ID = zmo.MO_ID inner join zwip_mo_type zmt on zmt.MO_TYPE_ID = zm.MO_TYPE_ID where zmo.TENANT_ID = #{tenantId} and zmo.OUTSOURCE_FLAG = 1 and zm.MO_STATUS in ('RELEASED') and zm.ORGANIZATION_ID = #{organizationId} "
    const queryZmoParam = {
        tenantId: tenantId
    }
    const organizationCode = '30S1'
    const organization = H0.ModelerHelper.selectOne(organizationModeler, tenantId, {organizationCode: organizationCode});
    if (organization == null) {
        return '组织编码[' + organizationCode + ']没有查询到组织！'
    }
    queryZmoParam.organizationId = organization.organizationId
    // 查询当天任务id
    let supplierList = H0.ModelerHelper.selectList(supplierModeler, tenantId, {});
    BASE.Logger.debug('-------西门子供应商列表-------{}', supplierList)
    let taskIdStr = ''
    if (supplierList != null && supplierList.length > 0) {
        let taskSql = "select process_oem_task_id from zwip_process_oem_task where "
        let tenantStr = ''
        for (let supplierIndex = 0; supplierIndex < supplierList.length; supplierIndex++) {
            const supplier = supplierList[supplierIndex]
            if (supplierIndex != (supplierList.length - 1)) {
                tenantStr = tenantStr + supplier.supplierTenantId + ','
            } else {
                tenantStr = tenantStr + supplier.supplierTenantId
            }
        }
        if (tenantStr != null && tenantStr != '') {
            taskSql = taskSql + ' tenant_id in (' + tenantStr + ')'
            //const startTime = getLocalTime(8).toLocaleDateString() + ' 00:00:00'
            //const endTime = getLocalTime(8).toLocaleDateString() + ' 23:59:59'
            const startTime = '2022-12-08 00:00:00'
            const endTime = '2022-12-08 23:59:59'
            taskSql = taskSql + " and creation_date &gt;= #{startTime} and creation_date &lt;= #{endTime}"
            const queryTaskParam = {startTime: startTime, endTime: endTime, tenantStr: tenantStr}
            let taskRes = H0.SqlHelper.selectList(wipServerId, taskSql, queryTaskParam)
            BASE.Logger.debug('-------西门子供应商当日工序代工任务-------{}', taskRes)
            if (taskRes != null && taskRes.length > 0) {
                for (let taskIndex = 0; taskIndex < taskRes.length; taskIndex++) {
                    const task = taskRes[taskIndex]
                    if (taskIndex != (taskRes.length - 1)) {
                        taskIdStr = taskIdStr + task.processOemTaskId + ','
                    } else {
                        taskIdStr = taskIdStr + task.processOemTaskId
                    }
                }
            }
        }
    } else {
        return '没有配置供应商, 请确认后重试!'
    }
    sql = sql + " and zmo.PROCESS_OEM_TASK_ID in(" + taskIdStr + ")" + " order by zmo.CREATION_DATE DESC"
    BASE.Logger.debug('-------查询已下发工单工序数据入参-------{}', queryZmoParam)
    let zmoRes = H0.SqlHelper.selectList(wipServerId, sql, queryZmoParam);
    BASE.Logger.debug('-------查询已下发工单工序返回数据-------{}', zmoRes)
    if (zmoRes == null || zmoRes.length <= 0) {
        return '当日无工单工序已下发数据'
    }
    for (let zmoIndex = 0; zmoIndex < zmoRes.length; zmoIndex++) {
        const zmo = zmoRes[zmoIndex]
        if (itemMap.get(zmo.itemId) == null) {
            const item = H0.ModelerHelper.selectOne(itemModeler, tenantId, {itemId: zmo.itemId});
            if (item != null) {
                zmo.itemName = item.itemName
                zmo.uomName = item.uomName
                itemMap.set(zmo.itemId, item)
            }
        } else {
            zmo.itemName = itemMap.get(zmo.itemId).itemName
            zmo.uomName = itemMap.get(zmo.itemId).uomName
        }
        if (operationMap.get(zmo.operationId) == null) {
            const operation = H0.ModelerHelper.selectOne(operationModeler, tenantId, {operationId: zmo.operationId});
            if (operation != null) {
                zmo.operationName = operation.operationName
                zmo.workCenterName = operation.workCenterName
                operationMap.set(zmo.operationId, operation)
            } else {
                zmo.operationName = operationMap.get(zmo.operationId).operationName
                zmo.workCenterName = operationMap.get(zmo.operationId).workCenterName
            }
        }
        const supplierId = zmo.supplierId;
        if (supplierIdMap.get(supplierId) == null) {
            const supplier = H0.ModelerHelper.selectOne(supplierModeler, tenantId, {supplierId: supplierId});
            supplierIdMap.set(supplierId, supplier)
        }
        if (zmoGroupMap.get(supplierId) == null) {
            zmoGroupMap.set(supplierId, [zmo])
        } else {
            zmoGroupMap.get(supplierId).push.apply(zmoGroupMap.get(supplierId), [zmo])
            //zmoGroupMap.get(supplierId).concat([zmo])
        }
    }
    let zmoGroupArr = []
    for (let i = 0; i < supplierList.length; i++) {
        const supplier = supplierList[i]
        const supplierId = supplier.supplierId
        const sendInfo = {supplierId: supplierId, zmoGroup: zmoGroupMap.get(supplierId), email:supplier.email}
        zmoGroupArr.push(sendInfo)
    }
    return zmoGroupArr
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