function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const customerModeler = 'zopo_customer';
    let sql = "select zpot.tenant_id,zpot.customer_mo_num,zpot.creation_date,zpoto.sequence_num,zpoto.owner_operation_id,zpoto.operation_code,zpoto.id from zwip_process_oem_task zpot left join zwip_process_oem_task_operation zpoto on zpot.process_oem_task_id = zpoto.process_oem_task_id where "
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询客户id
    let customerCodeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.CUSTOMER', tenantId, 'zh_CN');
    if (customerCodeRes != null && customerCodeRes.length > 0) {
        let customerIdStr = ''
        let supplierTenantIdStr = ''
        for (let customerCodeIndex = 0; customerCodeIndex < customerCodeRes.length; customerCodeIndex++) {
            const customerCode = customerCodeRes[customerCodeIndex]
            let customer = H0.ModelerHelper.selectOne(customerModeler, customerCode.meaning, {
                "customerCode": '30S1'
            });
            if (customer != null) {
                if (customerCodeIndex != customerCodeRes.length - 1) {
                    customerIdStr = customerIdStr + customer.customerId + ','
                    supplierTenantIdStr = supplierTenantIdStr + customerCode.meaning + ','
                } else {
                    customerIdStr = customerIdStr + customer.customerId
                    supplierTenantIdStr = supplierTenantIdStr + customerCode.meaning
                }
            }
        }
        if (customerIdStr != null) {
            sql = sql + " zpot.customer_id in " + '(' + customerIdStr + ')'
            sql = sql + " and zpot.tenant_id in " + '(' + supplierTenantIdStr + ')'
            if (input != null && input.taskIdsStr != null && input.taskIdsStr != 'null') {
                // 定时任务中设置了需要重新生成xml文件的任务id
                sql = sql + " and zpot.process_oem_task_id in (" + input.taskIdsStr + ")"
            } else {
                sql = sql + " and zpoto.attribute_tinyint1 is null order by zpot.creation_date desc"
            }
        }
    } else {
        BASE.Logger.debug('-------------------查询工序开始无客户信息则不执行后续逻辑-------------------')
        return '查询工序开始无客户信息则不执行后续逻辑'
    }
    // 查询数据
    BASE.Logger.debug('-------查询工序开始SQL参数-------{}', queryParamMap)
    let oemRes = H0.SqlHelper.selectList(wipServiceId, sql, queryParamMap);
    BASE.Logger.debug('-------查询工序开始SQL结果-------{}', oemRes)
    if (oemRes != null && oemRes.length > 0) {
        for (let oemIndex = 0; oemIndex < oemRes.length; oemIndex++) {
            const oem = oemRes[oemIndex]
            oem.fileName = oem.operationCode + 'erp' + oem.customerMoNum + oem.sequenceNum + '.xml'
            //oem.charsetName = 'utf-8'
            oem.directory = '/data/xmz-dev/fab'
        }
    }
    BASE.Logger.debug('-------查询工序开始返回结果-------{}', oemRes)
    return oemRes
}