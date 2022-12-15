function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 95;
    const secondServiceServerId = 'zosc-second-service';
    const scpServerId = 'zosc-scp';
    const updateTaskPath = '/v1/' + tenantId + '/shxmz-process-oem-task-expands/updateByTaskId';
    const queryPath = '/v1/' + tenantId + '/moOperation-outsource/operation-list?customizeUnitCode=ZOSC.SCP.OPOUTSOURCEMDP.LIST.TABLE.RELEASED&page=0&size=-1';

    // 查询数据
    const param = input
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
        let updateRes = H0.FeignClient.selectClient(secondServiceServerId).doPost(updateTaskPath, {processOemTaskIds: processOemTaskIds})
        updateRes = CORE.JSON.parse(updateRes)
        if (updateRes.failed) {
            H0.ExceptionHelper.throwCommonException(queryRes.message)
        }
        return queryRes.content;
    } else {
        BASE.Logger.debug('-------------------工序管理平台已下发未查询到可导出的数据-------------------')
    }
}