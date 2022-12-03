function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 95;
    const operationModeler = 'zbom_operation';
    const operationMap = new Map()
    //let sql = "select zpt.produce_tx_id,zpt.mo_id,zpt.completed_qty,zpt.creation_date,zpt.operation_id,zm.mo_num,zpt.attribute_tinyint1 from zwip_produce_tx zpt left join zwip_mo zm on zpt.mo_id = zm.mo_id where zpt.tenant_id = #{tenantId} and zpt.creation_date >= #{startTime} and zpt.creation_date <= #{endTime} and zpt.attribute_tinyint1 is null order by zpt.creation_date desc limit 2"
    let sql = "select zpt.produce_tx_id,zpt.mo_id,zpt.completed_qty,zpt.creation_date,zpt.operation_id,zm.mo_num,zpt.attribute_tinyint1 from zwip_produce_tx zpt left join zwip_mo zm on zpt.mo_id = zm.mo_id where zpt.tenant_id = 95 and zpt.attribute_tinyint1 is null order by zpt.creation_date desc limit 2"
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询时间
    let timeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.QUALITY.REPORT.TIME.RANGE', tenantId, 'zh_CN');
    if (timeRes != null && timeRes.length > 0) {
        for (let timeIndex = 0; timeIndex < timeRes.length; timeIndex++) {
            const time = timeRes[timeIndex];
            if (time.value == 'startTime') {
                queryParamMap.startTime = time.meaning
            } else {
                queryParamMap.endTime = time.meaning
            }
        }
    }
    // 查询数据
    BASE.Logger.debug('-------查询工序数量上报SQL参数-------{}', queryParamMap)
    const qualityRes = H0.SqlHelper.selectList(wipServiceId, sql, queryParamMap);
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
            quality.fileName = quality.operationCode + 'erp' + quality.moNum + quality.produceTxId
            quality.charsetName = 'Windows-1252'
        }
    }
    BASE.Logger.debug('-------查询工序数量上报返回结果-------{}', qualityRes)
    return qualityRes
}