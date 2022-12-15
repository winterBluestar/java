function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const scpServerId = 'zosc-scp';
    const queryPath = '/v1/' + tenantId + '/moOperation-outsource/mo-list?customizeUnitCode=ZOSC.SCP.OPOUTSOURCEMDP.LIST.TABLE.WAITISSUE&page=-1&size=-1';

    // 查询数据
    const param = input
    BASE.Logger.debug('-------------------工序管理平台未下发查询参数转换-------------------{}', param)
    let queryRes = H0.FeignClient.selectClient(scpServerId).doPost(queryPath, param)
    queryRes = CORE.JSON.parse(queryRes)
    if (queryRes != null) {
        return queryRes.content;
    } else {
        BASE.Logger.debug('-------------------工序管理平台未下发未查询到可导出的数据-------------------')
    }
}