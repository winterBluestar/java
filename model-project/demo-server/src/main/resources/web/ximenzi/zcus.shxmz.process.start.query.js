function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 96;
    const customerModeler = 'zopo_customer';
    let sql = "select zpot.customer_mo_num,zpot.creation_date,zpoto.sequence_num,zpoto.owner_operation_id,zpoto.operation_code from zwip_process_oem_task zpot left join zwip_process_oem_task_operation zpoto on zpot.process_oem_task_id = zpoto.process_oem_task_id where zpot.tenant_id = #{tenantId}"
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询时间
    let timeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.TIME.RANGE', tenantId, 'zh_CN');
    if (timeRes != null && timeRes.length > 0) {
        for (let timeIndex = 0; timeIndex < timeRes.length; timeIndex++) {
            const time = timeRes[timeIndex];
            if (time.value == 'startTime') {
                if (time.meaning == 'null') {
                    queryParamMap.startTime = getLocalTime(8).toLocaleDateString() + ' 00:00:00'
                } else {
                    queryParamMap.startTime = time.meaning
                }
            } else {
                if (time.meaning == 'null') {
                    queryParamMap.endTime = getLocalTime(8).toLocaleDateString() + ' 23:59:59'
                } else {
                    queryParamMap.endTime = time.meaning
                }
            }
        }
        sql = sql + " and zpot.creation_date &gt;= '" + queryParamMap.startTime + "'"
        sql = sql + " and zpot.creation_date &lt;= '" + queryParamMap.endTime + "'"
    }
    // 查询客户id
    let customerCodeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.CUSTOMER', tenantId, 'zh_CN');
    if (customerCodeRes != null && customerCodeRes.length > 0) {
        let customerIdStr = ''
        for (let customerCodeIndex = 0; customerCodeIndex < customerCodeRes.length; customerCodeIndex++) {
            const customerCode = customerCodeRes[customerCodeIndex]
            let customer = H0.ModelerHelper.selectOne(customerModeler, tenantId, {
                "customerCode": customerCode.value
            });
            if (customer != null) {
                if (customerCodeIndex != customerCodeRes.length - 1) {
                    customerIdStr = customerIdStr + customer.customerId + ','
                } else {
                    customerIdStr = customerIdStr + customer.customerId
                }
            }
        }
        if (customerIdStr != null) {
            queryParamMap.customerIdStr = '(' + customerIdStr + ')'
            sql = sql + " and zpot.customer_id in " + queryParamMap.customerIdStr
        }
    } else {
        BASE.Logger.debug('-------------------查询工序开始无客户信息则不执行后续逻辑-------------------')
        return '查询工序开始无客户信息则不执行后续逻辑'
    }
    sql = sql + " and zpoto.attribute_tinyint1 is null order by zpot.creation_date desc limit 2"
    // 查询数据
    BASE.Logger.debug('-------查询工序开始SQL参数-------{}', queryParamMap)
    let oemRes = H0.SqlHelper.selectList(wipServiceId, sql, queryParamMap);
    BASE.Logger.debug('-------查询工序开始SQL结果-------{}', oemRes)
    if (oemRes != null && oemRes.length > 0) {
        for (let oemIndex = 0; oemIndex < oemRes.length; oemIndex++) {
            const oem = oemRes[oemIndex]
            oem.fileName = oem.operationCode + 'erp' + oem.customerMoNum + oem.sequenceNum + '.xml'
            //oem.charsetName = 'utf-8'
            oem.directory = '/data/xmz-dev'
        }
    }
    BASE.Logger.debug('-------查询工序开始返回结果-------{}', oemRes)
    return oemRes
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