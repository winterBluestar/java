function process(input) {
    BASE.Logger.debug('-------上海西门子工序终止上报: input-------{}', input)
    //let tenantId = CORE.CurrentContext.getTenantId();
    let tenantId = 95;
    const secondServiceId = "zosc-second-service";
    const wipServiceId = "zosc-wip";
    const customerModeler = 'zopo_customer';
    let taskExpandSql = "select tenant_id, id, process_oem_task_id from zcus_shxmz_process_oem_task_expand where "
    let taskSql = "select zpot.tenant_id,zpot.process_oem_task_id,zpot.customer_mo_num,zpot.creation_date,zpoto.id,zpoto.operation_code,zpoto.sequence_num from zwip_process_oem_task zpot left join zwip_process_oem_task_operation zpoto on zpot.process_oem_task_id = zpoto.process_oem_task_id where "
    if (input != null && input.tenantId != null) {
        tenantId = input.tenantId
    }
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询供应商id
    let customerCodeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.START.CUSTOMER', tenantId, 'zh_CN');
    let supplierTenantIdStr = ""
    if (customerCodeRes != null && customerCodeRes.length > 0) {
        for (let customerCodeIndex = 0; customerCodeIndex < customerCodeRes.length; customerCodeIndex++) {
            const customerCode = customerCodeRes[customerCodeIndex]
            if (customerCodeIndex != customerCodeRes.length - 1) {
                supplierTenantIdStr = supplierTenantIdStr + customerCode.meaning + ','
            } else {
                supplierTenantIdStr = supplierTenantIdStr + customerCode.meaning
            }
        }
    }
    if (supplierTenantIdStr == null) {
        return '查询工序终止无供应商信息则不执行后续逻辑'
    }
    taskExpandSql = taskExpandSql + " tenant_id in (" + supplierTenantIdStr + ")"
    if (input != null && input.expandIdListStr != null && input.expandIdListStr != 'null') {
        taskExpandSql = taskExpandSql + "and id in (" + input.expandIdListStr + ") ";
    } else {
        taskExpandSql = taskExpandSql + "and JUDGMENT_EXP_FLAG = 0 and judgment_result is not null order by CREATION_DATE "
    }
    // 查询task-expand数据
    BASE.Logger.debug('-------查询工序终止上报task-expand-SQL参数-------{}', queryParamMap)
    let taskExpandRes = H0.SqlHelper.selectList(secondServiceId, taskExpandSql, queryParamMap);
    BASE.Logger.debug('-------查询工序终止上报task-expand-SQL参数-------{}', taskExpandRes)
    let taskIdStr = ''
    const expandMap = new Map()
    if (taskExpandRes != null && taskExpandRes.length > 0) {
        for (let expandIndex = 0; expandIndex < taskExpandRes.length; expandIndex++) {
            const taskExpand = taskExpandRes[expandIndex]
            if (expandIndex !== (taskExpandRes.length - 1)) {
                taskIdStr = taskIdStr + taskExpand.processOemTaskId + ','
            } else {
                taskIdStr = taskIdStr + taskExpand.processOemTaskId
            }
            expandMap.set(taskExpand.processOemTaskId, taskExpand.id)
        }
    }
    // 查询task数据
    if (taskIdStr != null && taskIdStr !== '') {
        if (supplierTenantIdStr != null) {
            taskSql = taskSql + " zpot.tenant_id in " + '(' + supplierTenantIdStr + ')'
        }
        const concatStr = " and zpot.process_oem_task_id in (" + taskIdStr + ") order by zpot.creation_date desc"
        taskSql = taskSql + concatStr
        BASE.Logger.debug('-------查询工序终止上报task-SQL-------{}', taskSql)
        let qualityRes = H0.SqlHelper.selectList(wipServiceId, taskSql, {});
        BASE.Logger.debug('-------查询工序终止上报task-SQL返回参数-------{}', taskExpandRes)
        if (qualityRes != null && qualityRes.length > 0) {
            for (let qualityIndex = 0; qualityIndex < qualityRes.length; qualityIndex++) {
                const quality = qualityRes[qualityIndex]
                quality.expandId = expandMap.get(quality.processOemTaskId)
                const codeRule = H0.CodeRuleHelper.generateCode(tenantId, 'ZCUS.SHXMZ.OP_STOP', 'GLOBAL', 'GLOBAL', {})
                quality.fileName = quality.operationCode + 'stop' + quality.customerMoNum + codeRule + '.xml'
                quality.directory = '/data/xmz-dev/fab'
                quality.backDirectory = '/data/xmz-dev/' + getLocalTime(8).toLocaleDateString().replace('-', "").substring(0, 6)
                quality.contextStr = '<?xml version="1.0" encoding="Windows-1252"?>' +
                    '<FABImport Version="1.0">' +
                    '<FeedbackWorkplaceToFab>' +
                    '<OrderStoppedFeedbacks>' +
                    '<OrderStopped OrderNo="' + quality.customerMoNum + '">' +
                    '<OrderStatus>0</OrderStatus>' +
                    '<FinishedParts>0</FinishedParts>' +
                    '<ScrapParts>0</ScrapParts>' +
                    '<ProcessingTime>0</ProcessingTime>' +
                    '<Timestamp>' + quality.creationDate +
                    '</TimeStamp>' +
                    '</OrderStopped>' +
                    '</OrderStoppedFeedbacks>' +
                    '</FeedbackWorkplaceToFab>' +
                    '</FABImport>'
            }
        }
        BASE.Logger.debug('-------查询工序终止上报返回结果-------{}', qualityRes)
        return qualityRes
    }
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