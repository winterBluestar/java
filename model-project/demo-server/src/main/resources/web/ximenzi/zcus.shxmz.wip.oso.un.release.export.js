function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const scpServerId = 'zosc-scp';
    const queryPath = '/v1/' + tenantId + '/moOperation-outsource/mo-list?customizeUnitCode=ZOSC.SCP.OPOUTSOURCEMDP.LIST.TABLE.WAITISSUE&page=-1&size=-1';

    // 查询数据
    const param = {tenantId: tenantId}
    if (input.organizationId != null) {
        param.organizationId = input.organizationId[0]
    }
    if (input.customizeUnitCode != null) {
        param.customizeUnitCode = input.customizeUnitCode[0]
    }
    if (input.moTypeId != null) {
        param.moTypeId = input.moTypeId[0]
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
    if (input.creationDateTo != null) {
        param.creationDateTo = input.creationDateTo[0]
    }
    if (input.creationDateFrom != null) {
        param.creationDateFrom = input.creationDateFrom[0]
    }
    if (input.processStatusList != null) {
        param.processStatusList = input.processStatusList
    }
    BASE.Logger.debug('-------------------工序管理平台未下发查询参数转换-------------------{}', param)
    let queryRes = H0.FeignClient.selectClient(scpServerId).doPost(queryPath, param)
    queryRes = CORE.JSON.parse(queryRes)
    if (queryRes != null) {
        return queryRes.content;
    } else {
        BASE.Logger.debug('-------------------工序管理平台未下发未查询到可导出的数据-------------------')
    }
}