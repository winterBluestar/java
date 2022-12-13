function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 95;
    const messageServerId = 'zosc-cdm';
    const wipServerId = 'zosc-wip'
    const organizationModeler = 'zpfm_organization'
    const supplierModeler = 'zopo_supplier'
    const itemModeler = 'zpdt_item'
    const operationModeler = 'zbom_operation'
    const userModeler = 'SYS_USER'
    const supplierContactsModeler = 'zopo_supplier_contacts'
    const supplierIdMap = new Map()
    const zmoGroupMap = new Map()
    const itemMap = new Map()
    const operationMap = new Map()
    const keyMap = new Map()
    const sendMessagePath = '/v1/' + tenantId + '/message-receiving-items/sendMessage';
    //const messageServerId1 = 'hzero-message';
    //const sendMessagePath1 = '/v1/' + tenantId + '/message/relevance/with-receipt';

    let sql = "select zm.tenant_id, zm.organization_id, zm.MO_ID, zm.MO_NUM, zm.plan_completed_qty, zm.ITEM_ID, zm.ITEM_SKU_ID, zmt.MO_TYPE_NAME, zmo.MO_OPERATION_ID, zmo.SEQUENCE_NUM, zmo.OPERATION_ID, zm.UOM_ID, zmo.SUPPLIER_ID, zmo.PROCESS_OEM_TASK_CODE, zmo.supplier_address_id from zwip_mo_operation zmo inner join zwip_mo zm on zm.MO_ID = zmo.MO_ID inner join zwip_mo_type zmt on zmt.MO_TYPE_ID = zm.MO_TYPE_ID where zmo.TENANT_ID = #{tenantId} and zmo.OUTSOURCE_FLAG = 1 and zm.MO_STATUS in ('RELEASED') and zm.ORGANIZATION_ID = #{organizationId} "
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
            const startTime = getLocalTime(8).toLocaleDateString() + ' 00:00:00'
            const endTime = getLocalTime(8).toLocaleDateString() + ' 23:59:59'
            //const startTime = '2022-12-08 00:00:00'
            //const endTime = '2022-12-08 23:59:59'
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
        zmo.customerName = '上海西门子开关有限公司'
        if (itemMap.get(zmo.itemId) == null) {
            const item = H0.ModelerHelper.selectOne(itemModeler, tenantId, {itemId: zmo.itemId});
            if (item != null) {
                zmo.itemName = item.itemName
                zmo.itemCode = item.itemCode
                zmo.uomName = item.uomName
                itemMap.set(zmo.itemId, item)
            }
        } else {
            zmo.itemName = itemMap.get(zmo.itemId).itemName
            zmo.itemCode = itemMap.get(zmo.itemId).itemCode
            zmo.uomName = itemMap.get(zmo.itemId).uomName
        }
        if (operationMap.get(zmo.operationId) == null) {
            if (zmo.operationId != null) {
                const operation = H0.ModelerHelper.selectOne(operationModeler, tenantId, {operationId: zmo.operationId});
                if (operation != null) {
                    zmo.operationName = operation.operationName
                    zmo.operationCode = operation.operationCode
                    zmo.workCenterName = operation.workCenterName
                    zmo.workCenterCode = operation.workCenterCode
                    operationMap.set(zmo.operationId, operation)
                }
            } else {
                zmo.operationName = ''
                zmo.operationCode = ''
                zmo.workCenterName = ''
                zmo.workCenterCode = ''
            }
        } else {
            zmo.operationName = operationMap.get(zmo.operationId).operationName
            zmo.operationCode = operationMap.get(zmo.operationId).operationCode
            zmo.workCenterName = operationMap.get(zmo.operationId).workCenterName
            zmo.workCenterCode = operationMap.get(zmo.operationId).workCenterCode
        }
        if (zmo.planCompletedQty == null) {
            zmo.planCompletedQty = ''
        }
        const supplierId = zmo.supplierId
        if (supplierIdMap.get(supplierId) == null) {
            const supplier = H0.ModelerHelper.selectOne(supplierModeler, tenantId, {supplierId: supplierId});
            supplierIdMap.set(supplierId, supplier)
        }
        const zmoKey = zmo.supplierId + '_' + zmo.supplierAddressId
        if (keyMap.get(zmoKey) == null) {
            keyMap.set(zmoKey, zmoKey)
        }
        if (zmoGroupMap.get(zmoKey) == null) {
            zmo.sortNum = 1
            zmoGroupMap.set(zmoKey, [zmo])
        } else {
            zmo.sortNum = zmoGroupMap.get(zmoKey).length + 1
            zmoGroupMap.get(zmoKey).push.apply(zmoGroupMap.get(zmoKey), [zmo])
        }
    }
    let zmoGroupArr = []
    keyMap.forEach((value, key, map) => {
        const supplierAddressId = key.split('_')[1]
        const supplierContactsList = H0.ModelerHelper.selectList(supplierContactsModeler, tenantId, {supplierAddressId: supplierAddressId});
        const emailArr = []
        if (supplierContactsList != null && supplierContactsList.length > 0) {
            for (let contactIndex = 0; contactIndex < supplierContactsList.length; contactIndex++) {
                const supplierContact = supplierContactsList[contactIndex]
                if (supplierContact.email != null) {
                    emailArr.push(supplierContact.email)
                }
            }
        }
        const sendInfo = {
            zmoKey: key,
            zmoGroup: zmoGroupMap.get(key),
            supplierTenantId: supplierIdMap.get(key.split('_')[0]).supplierTenantId
        }
        if (emailArr.length > 0) {
            sendInfo.emailList = emailArr
        }
        zmoGroupArr.push(sendInfo)
    })
    // 发送邮件
    if (zmoGroupArr.length > 0) {
        for (let zmoGroupIndex = 0; zmoGroupIndex < zmoGroupArr.length; zmoGroupIndex++) {
            const zmoInfo = zmoGroupArr[zmoGroupIndex]
            //const emailSender = {
            //    messageCode: 'TEST_EXCEL',
            //    messageServerCode: 'ZONE-ONESTEP-CLOUD',
            //    tenantId: tenantId,
            //    typeCodeList: ['EMAIL']
            //}
            //const receiverAddressList = []
            //if (zmoInfo.emailList != null && zmoInfo.emailList.length > 0) {
            //    for (let emailIndex = 0; emailIndex < zmoInfo.emailList.length; emailIndex++) {
            //        const email = zmoInfo.emailList[emailIndex]
            //        const userList = H0.ModelerHelper.selectList(userModeler, 95, {email: email});
            //        if (userList != null && userList.length > 0) {
            //            const receiver = {
            //                userId: userList[0].id,
            //                targetUserTenantId: 95,
            //                email: email
            //            }
            //            receiverAddressList.push(receiver)
            //        } else {
            //            BASE.Logger.debug('-------通过邮箱和供应商租户id查询不到用户数据-------租户编码{}----邮箱{}----', zmoInfo.supplierTenantId, email)
            //        }
            //    }
            //}
            //emailSender.receiverAddressList = receiverAddressList
            //emailSender.objectArgs = {}
            //emailSender.objectArgs.zmoInfoList = zmoInfo.zmoGroup
            //emailSender.objectArgs.cxd = "陈旭东"
            //if (emailSender.receiverAddressList != null && emailSender.receiverAddressList.length > 0) {
            //    BASE.Logger.debug("-----------工序任务发送邮件参数emailSender: {}---------", emailSender)
            //    return H0.FeignClient.selectClient(messageServerId1).doPost(sendMessagePath1, emailSender)
            //}

            const sendMessageDTOList = []
            const sendMessageDTO = {
                tenantId: tenantId,
                messageItemCode: "SHXMZ_OEM_TASK_RELEASED",
                messageParam: {zmoInfoList: zmoInfo.zmoGroup},
                mailboxList: zmoInfo.emailList
            }
            sendMessageDTOList.push(sendMessageDTO)
            if (sendMessageDTOList.length > 0) {
                BASE.Logger.debug("-----------工序任务发送邮件参数sendMessageDTOList: {}---------", sendMessageDTOList)
                return H0.FeignClient.selectClient(messageServerId).doPost(sendMessagePath, sendMessageDTOList)
            }
        }
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