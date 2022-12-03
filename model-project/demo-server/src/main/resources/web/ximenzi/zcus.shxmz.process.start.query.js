function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const scmServiceId = "zosc-scm";
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 76;
    const customerModeler = 'zopo_customer';
    const operationModeler = 'zbom_operation';
    const operationMap = new Map()
    let sql = "select zpot.customer_mo_num,zpot.creation_date,zpoto.sequence_num,zpoto.owner_operation_id,zpoto.id from zwip_process_oem_task zpot left join zwip_process_oem_task_operation zpoto on zpot.process_oem_task_id = zpoto.process_oem_task_id where zpot.tenant_id = #{tenantId} and zpot.creation_date >= #{startTime} and zpot.creation_date <= #{endTime} and zpot.customer_id in #{customerIdStr} and zpoto.attribute_tinyint1 != 1"
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询时间
    let timeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.TIME.RANGE', tenantId, 'zh_CN');
    if (timeRes != null && timeRes.length > 0) {
        for (let timeIndex = 0; timeIndex < timeRes.length; timeIndex++) {
            const time = timeRes[timeIndex];
            if (time.value == 'startTime') {
                queryParamMap.startTime = time.meaning
            } else {
                queryParamMap.endTime = time.meaning
            }
        }
    }
    // 查询客户id
    let customerCodeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.CUSTOMER', tenantId, 'zh_CN');
    if (customerCodeRes != null && customerCodeRes.length > 0) {
        let customerIdStr
        for (let customerCodeIndex = 0; customerCodeIndex < customerCodeRes.length; customerCodeIndex++) {
            const customerCode = customerCodeRes[customerCodeIndex]
            let customer = H0.ModelerHelper.selectOne(customerModeler, tenantId, {
                "customerCode": customerCode.meaning
            });
            if (customerCodeIndex != customerCodeRes.length) {
                customerIdStr = customerIdStr + customer.customerId + ','
            } else {
                customerIdStr = customerIdStr + customer.customerId
            }
        }
        if (customerIdStr != null) {
            queryParamMap.customerIdStr = '(' + customerIdStr + ')'
        }
    }
    // 查询数据
    BASE.Logger.debug('-------查询工序开始SQL参数-------{}', queryParamMap)
    const oemRes = H0.SqlHelper.selectList(scmServiceId, sql, queryParamMap);
    BASE.Logger.debug('-------查询工序开始SQL结果-------{}', oemRes)
    const fileInfoList = [];
    if (oemRes != null && oemRes.length > 0) {
        for (let oemIndex = 0; oemIndex < oemRes.length; oemIndex++) {
            const oem = oemRes[oemIndex]
            // 查询工序编码
            if (oem.ownerOperationId != null) {
                if (operationMap.get(oem.ownerOperationId) == null) {
                    let operation = H0.ModelerHelper.selectOne(operationModeler, tenantId, {
                        "operationId": oem.ownerOperationId
                    });
                    oem.operationCode = operation.operationCode
                    operationMap.set(oem.ownerOperationId, operation)
                } else {
                    oem.operationCode = operationMap.get(oem.ownerOperationId).operationCode
                }
            }
            // 组装报文
            const fileInfo = {
                id: oem.id,
                fileName: oem.operationCode + 'erp' + oem.customerMoNum + oem.sequenceNum
            }
            const contextStr = '<?xml version="1.0" encoding="Windows-1252"?>\n' + '<FABImport Version="1.0">\n'
                + '<FeedbackWorkplaceToFab>\n' + '<OrderStartedFeedbacks>\n' + '<OrderStarted OrderNo="' + oem.customerMoNum + '">\n'
                + '<Timestamp>' + oem.creationDate + '</TimeStamp>\n' + '</OrderStarted>\n' + '</OrderStartedFeedbacks>\n'
                + '</FeedbackWorkplaceToFab>\n' + '</FABImport>'
            contextStr.concat('<?xml version="1.0" encoding="Windows-1252"?><FABImport Version="1.0"><FeedbackWorkplaceToFab><OrderStartedFeedbacks>')
                .concat('<OrderStarted OrderNo="').concat(oem.customerMoNum).concat('">').concat('<Timestamp>').concat(oem.creationDate)
                .concat('</TimeStamp></OrderStarted></OrderStartedFeedbacks></FeedbackWorkplaceToFab></FABImport>')
            fileInfo.contextStr = contextStr.toString()
            fileInfoList.push(fileInfo)
        }
    }
    BASE.Logger.debug('-------查询工序开始返回结果-------{}', fileInfoList)
    return fileInfoList
}