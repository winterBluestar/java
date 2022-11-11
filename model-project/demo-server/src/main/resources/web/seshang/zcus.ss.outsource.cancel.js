function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 76;
    const serviceId = 'zosc-second-service';
    const storageModeler = 'zcus_ss_outsource_storage';
    if (input.docList === null || input.docList.length === 0) {
        H0.ExceptionHelper.throwCommonException("未勾选为委外出入库订单，请确认后重试！");
    }
    let sql = "select tenant_id, doc_id, doc_status_code, object_version_number from zosc_second_service.zcus_ss_outsource_storage where tenant_id = #{tenantId} ";
    const queryParamMap = {
        tenantId: tenantId
    }
    let ids = '';
    input.docList.forEach(function (value, index) {
        if (index < input.docList.length - 1) {
            ids = ids + value + ','
        } else if (index === input.docList.length - 1) {
            ids = ids + value
        }
    })
    sql = sql + 'and doc_id in (' + ids + ')'
    let resList = H0.SqlHelper.selectList(serviceId, sql, queryParamMap);
    if (resList !== null && resList.length > 0) {
        resList.forEach(function (value, index) {
            value.docStatusCode = 'CANCELED'
        })
        return H0.ModelerHelper.batchUpdateByPrimaryKey(storageModeler, tenantId, resList)
    }
    return input;
}