function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 95;
    const messageServerId = 'zosc-cdm';
    const wipServerId = 'zosc-wip'
    const supplierModeler = 'zopo_supplier'
    const itemModeler = 'zpdt_item'
    const fileDisModeler = 'zpdt_process_file_distribution'
    const supplierContactsModeler = 'zopo_supplier_contacts'
    const organizationModeler = 'zpfm_organization'
    const supplierIdMap = new Map()
    const supplierEmailIdMap = new Map()
    const taskGroupMap = new Map()
    const itemMap = new Map()
    const organizationMap = new Map()
    const sendMessagePath = '/v1/' + tenantId + '/message-receiving-items/sendMessage';

    let sql = "select zpot.tenant_id,zpot.organization_id,zmo.supplier_id,zpot.customer_mo_num,zpot.process_oem_task_code,zpot.item_id,zpot.customer_demand_qty,zpot.`status`,zpot.oem_confirm_status from zwip_process_oem_task zpot left join zwip_mo_operation zmo on zpot.process_oem_task_id = zmo.process_oem_task_id where zpot.`status` = 'OPEN' and zpot.oem_confirm_status = 'CONFIRMED'"
    // 查询供应商
    let supplierList = H0.ModelerHelper.selectList(supplierModeler, tenantId, {});
    BASE.Logger.debug('-------西门子供应商列表-------{}', supplierList)
    if (supplierList == null || supplierList.length <= 0) {
        BASE.Logger.debug("------------西门子供应商没有维护------------")
        return;
    }
    let tenantIdStr = '';
    const supplierIdArr = []
    for (let supplierIndex = 0; supplierIndex < supplierList.length; supplierIndex++) {
        const supplier = supplierList[supplierIndex]
        supplierIdArr.push(supplier.supplierId)
        supplierIdMap.set(supplier.supplierId, supplier)
        // 查询供应商联系人
        let supplierContactsList = H0.ModelerHelper.selectList(supplierContactsModeler, tenantId, {supplierId: supplier.supplierId});
        if (supplierContactsList != null && supplierContactsList.length > 0) {
            const emailList = []
            for (let contactsIndex = 0; contactsIndex < supplierContactsList.length; contactsIndex++) {
                const contacts = supplierContactsList[contactsIndex]
                if (contacts.email != null) {
                    emailList.push(contacts.email)
                }
            }
            supplierEmailIdMap.set(supplier.supplierId, emailList)
        }
        if (supplierIndex != supplierList.length - 1) {
            tenantIdStr = tenantIdStr + supplier.supplierTenantId + ','
        } else {
            tenantIdStr = tenantIdStr + supplier.supplierTenantId
        }
    }
    sql = sql + ' and zpot.tenant_id in (' + tenantIdStr + ')'
    sql = sql + ' order by zmo.supplier_id, zpot.tenant_id'
    BASE.Logger.debug("------------代工任务查询SQL打印: {}------------", sql)
    let taskRes = H0.SqlHelper.selectList(wipServerId, sql, {});
    BASE.Logger.debug("------------代工任务查询返回结果打印: {}------------", sql)
    if (taskRes != null && taskRes.length > 0) {
        for (let sIdIndex = 0; sIdIndex < supplierIdArr.length; sIdIndex++) {
            const supplierId = supplierIdArr[sIdIndex]
            const taskArr = []
            let sortNum = 0
            for (let taskIndex = 0; taskIndex < taskRes.length; taskIndex++) {
                const task = taskRes[taskIndex]
                if (supplierId == task.supplierId) {
                    task.organizationName = supplierIdMap.get(supplierId).organizationName
                    // 查询是否分配工艺文件
                    const fileDisRes = H0.ModelerHelper.selectList(fileDisModeler, task.tenantId, {
                        objectId: task.itemId,
                        objectType: 'ITEM'
                    });
                    if (fileDisRes == null || fileDisRes.length <= 0) {
                        if (itemMap.get(task.itemId) == null) {
                            const item = H0.ModelerHelper.selectOne(itemModeler, task.tenantId, {itemId: task.itemId});
                            if (item != null) {
                                task.itemCode = item.itemCode
                                itemMap.set(task.itemId, item)
                            } else {
                                task.itemCode = ''
                            }
                        } else {
                            task.itemCode = itemMap.get(task.itemId).itemCode
                        }
                        if (organizationMap.get(task.organizationId) == null) {
                            const organization = H0.ModelerHelper.selectOne(organizationModeler, task.tenantId, {organizationId: task.organizationId});
                            if (organization != null) {
                                task.organizationName = organization.organizationName
                                itemMap.set(task.organizationId, organization)
                            }
                        } else {
                            task.organizationName = organizationMap.get(task.organizationId).organizationName
                        }
                        sortNum = sortNum + 1
                        task.sortNum = sortNum
                        taskArr.push(task)
                    }
                }
            }
            taskGroupMap.set(supplierId, taskArr)
        }
    }
    // 发送邮件
    const sendMessageDTOList = []
    for (let supplierIdSendIndex = 0; supplierIdSendIndex < supplierIdArr.length; supplierIdSendIndex++) {
        const supplierId = supplierIdArr[supplierIdSendIndex]
        const emailSendList = supplierEmailIdMap.get(supplierId)
        const taskInfoList = taskGroupMap.get(supplierId)
        const sendMessageDTO = {
            tenantId: supplierIdMap.get(supplierId).tenantId,
            messageItemCode: "SHXMZ_OEM_MISS_DRAWING_EMAIL",
            messageParam: {taskInfoList: taskInfoList},
            mailboxList: emailSendList
        }
        sendMessageDTOList.push(sendMessageDTO)
    }
    if (sendMessageDTOList.length > 0) {
        BASE.Logger.debug("-----------图纸缺失发送邮件参数sendMessageDTOList: {}---------", sendMessageDTOList)
        return H0.FeignClient.selectClient(messageServerId).doPost(sendMessagePath, sendMessageDTOList)
    }
}