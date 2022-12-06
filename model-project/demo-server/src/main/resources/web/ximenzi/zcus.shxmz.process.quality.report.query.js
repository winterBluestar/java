function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const operationModeler = 'zbom_operation';
    const operationMap = new Map()
    let sql = "select zpt.produce_tx_id,zpt.mo_id,zpt.completed_qty,zpt.creation_date,zpt.operation_id,zm.mo_num,zpt.attribute_tinyint1 from zwip_produce_tx zpt left join zwip_mo zm on zpt.mo_id = zm.mo_id where zpt.tenant_id = #{tenantId} "
    const queryParamMap = {
        tenantId: tenantId
    };
    if (input != null && input.txIdsStr != null && input.txIdsStr != 'null') {
        sql = sql + " and zpt.produce_tx_id in (" + input.txIdsStr + ")"
    } else {
        sql = sql + " and zpt.attribute_tinyint1 is null order by zpt.creation_date desc"
    }
    // 查询数据
    BASE.Logger.debug('-------查询工序数量上报SQL参数-------{}', queryParamMap)
    let qualityRes = H0.SqlHelper.selectList(wipServiceId, sql, queryParamMap);
    BASE.Logger.debug('-------查询工序数量上报SQL结果-------{}', qualityRes)
    if (qualityRes != null && qualityRes.length > 0) {
        for (let qualityIndex = 0; qualityIndex < qualityRes.length; qualityIndex++) {
            const quality = qualityRes[qualityIndex]
            // 查询工序编码
            if (quality.operationId != null) {
                if (operationMap.get(quality.operationId) == null) {
                    let operation = H0.ModelerHelper.selectOne(operationModeler, tenantId, {
                        "operationId": quality.operationId
                    });
                    quality.operationCode = operation.operationCode
                    operationMap.set(quality.operationId, operation)
                } else {
                    quality.operationCode = operationMap.get(quality.operationId).operationCode
                }
            }
            quality.fileName = quality.operationCode + 'erp' + quality.moNum + quality.produceTxId + '.xml'
            quality.directory = '/data/xmz-dev/fab'
        }
    }
    BASE.Logger.debug('-------查询工序数量上报返回结果-------{}', qualityRes)
    return qualityRes
}