function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 95;
    const secondServiceServerId = 'zosc-second-service';
    const scpServerId = 'zosc-scp';
    const updateTaskPath = '/v1/' + tenantId + '/shxmz-process-oem-task-expands/updateByTaskId';
    const queryPath = '/v1/' + tenantId + '/moOperation-outsource/operation-list?customizeUnitCode=ZOSC.SCP.OPOUTSOURCEMDP.LIST.TABLE.RELEASED&page=0&size=-1';

    // 查询数据
    const param = {tenantId: tenantId}
    if (input.organizationId != null) {
        param.organizationId = input.organizationId[0]
    }
    if (input.customizeUnitCode != null) {
        param.customizeUnitCode = input.customizeUnitCode[0]
    }
    if (input.moFlag != null) {
        param.moFlag = input.moFlag[0]
    }
    if (input.itemId != null) {
        param.itemId = input.itemId[0]
    }
    if (input.itemSkuId != null) {
        param.itemSkuId = input.itemSkuId[0]
    }
    if (input.moId != null) {
        param.moId = input.moId[0]
    }
    if (input.supplierId != null) {
        param.supplierId = input.supplierId[0]
    }
    if (input.operationId != null) {
        param.operationId = input.operationId[0]
    }
    if (input.supplierAddressId != null) {
        param.supplierAddressId = input.supplierAddressId[0]
    }
    if (input.planStartDateTo != null) {
        param.planStartDateTo = input.planStartDateTo[0]
    }
    if (input.planStartDateFrom != null) {
        param.planStartDateFrom = input.planStartDateFrom[0]
    }
    if (input.processStatusList != null) {
        param.processStatusList = input.processStatusList
    }
    if (input.riskIdList != null) {
        param.riskIdList = input.riskIdList
    }
    if (input.delayIdList != null) {
        param.delayIdList = input.delayIdList
    }
    BASE.Logger.debug('-------------------工序管理平台已下发查询参数转换-------------------{}', param)
    let queryRes = H0.FeignClient.selectClient(scpServerId).doPost(queryPath, param)
    queryRes = CORE.JSON.parse(queryRes)
    if (queryRes.failed) {
        H0.ExceptionHelper.throwCommonException(queryRes.code)
    }
    if (queryRes != null && queryRes.content != null && queryRes.content.length > 0) {
        const processOemTaskIds = []
        for (let i = 0; i < queryRes.content.length; i++) {
            const task = queryRes.content[i]
            processOemTaskIds.push(task.processOemTaskId)
        }
        // 更新状态
        //let updateRes = H0.FeignClient.selectClient(secondServiceServerId).doPost(updateTaskPath, {processOemTaskIds: processOemTaskIds})
        //updateRes = CORE.JSON.parse(updateRes)
        //if (updateRes.failed) {
        //    H0.ExceptionHelper.throwCommonException(queryRes.message)
        //}
        return queryRes.content;
    } else {
        BASE.Logger.debug('-------------------工序管理平台已下发未查询到可导出的数据-------------------')
    }
}