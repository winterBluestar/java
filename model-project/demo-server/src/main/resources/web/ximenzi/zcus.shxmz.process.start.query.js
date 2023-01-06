function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    //let tenantId = CORE.CurrentContext.getTenantId();
    let tenantId = 95;
    let sql = "select zpot.tenant_id,zpot.process_oem_task_id,zpot.customer_mo_num,FROM_UNIXTIME(ROUND(UNIX_TIMESTAMP(zpot.creation_date) + zpoto.sequence_num/10 - 1)) creation_date,zpoto.sequence_num,zpoto.owner_operation_id,zpoto.operation_code,zpoto.id from zwip_process_oem_task zpot left join zwip_process_oem_task_operation zpoto on zpot.process_oem_task_id = zpoto.process_oem_task_id where "
    let taskSql = "select zpot.process_oem_task_id from zwip_process_oem_task zpot left join zwip_process_oem_task_operation zpoto on zpot.process_oem_task_id = zpoto.process_oem_task_id where "
    if (input != null && input.tenantId != null) {
        tenantId = input.tenantId
    }
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询供应商id
    let supplierCodeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.CUSTOMER', tenantId, 'zh_CN');
    if (supplierCodeRes != null && supplierCodeRes.length > 0) {
        let supplierTenantIdStr = ''
        for (let supplierCodeIndex = 0; supplierCodeIndex < supplierCodeRes.length; supplierCodeIndex++) {
            const supplierCode = supplierCodeRes[supplierCodeIndex]
            if (supplierCodeIndex != supplierCodeRes.length - 1) {
                supplierTenantIdStr = supplierTenantIdStr + supplierCode.meaning + ','
            } else {
                supplierTenantIdStr = supplierTenantIdStr + supplierCode.meaning
            }
        }
        sql = sql + " zpot.tenant_id in " + '(' + supplierTenantIdStr + ')'
        taskSql = taskSql + " zpot.tenant_id in " + '(' + supplierTenantIdStr + ')'
        if (input != null && input.taskIdsStr != null && input.taskIdsStr != 'null') {
            // 定时任务中设置了需要重新生成xml文件的任务id
            sql = sql + " and zpot.process_oem_task_id in (" + input.taskIdsStr + ")"
        } else {
            taskSql = taskSql + " and zpoto.oso_wip_issue_qty > 0 and zpoto.attribute_tinyint1 is null order by zpot.creation_date desc"
            let moreThanZeroRes = H0.SqlHelper.selectList(wipServiceId, taskSql, {});
            if (moreThanZeroRes != null && moreThanZeroRes.length > 0) {
                const taskIdList = moreThanZeroRes.map((moreThanZeroRes) => {
                    return moreThanZeroRes.processOemTaskId
                })
                sql = sql + " and zpot.process_oem_task_id in (" + taskIdList.join() + ")"
            }
            sql = sql + " and zpoto.attribute_tinyint1 is null order by zpot.creation_date desc"
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
            const codeRule = H0.CodeRuleHelper.generateCode(tenantId, 'ZCUS.SHXMZ.OP_START', 'GLOBAL', 'GLOBAL', {})
            oem.fileName = oem.operationCode + 'expstart' + oem.customerMoNum + codeRule + '.xml'
            //oem.charsetName = 'utf-8'
            oem.directory = '/data/xmz-dev/fab'
            oem.backDirectory = '/data/xmz-dev/' + getLocalTime(8).toLocaleDateString().replace('-', "").substring(0, 6)
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