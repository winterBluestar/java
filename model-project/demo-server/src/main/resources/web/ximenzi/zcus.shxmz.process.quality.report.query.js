function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 95;
    const operationModeler = 'zbom_operation';
    const operationMap = new Map()
    let sql = "select zpt.produce_tx_id,zpt.mo_id,zpt.completed_qty,zpt.creation_date,zpt.operation_id,zm.mo_num,zpt.attribute_tinyint1 from zwip_produce_tx zpt left join zwip_mo zm on zpt.mo_id = zm.mo_id where zpt.tenant_id = #{tenantId} and zpt.creation_date &gt;= #{startTime} and zpt.creation_date &lt;= #{endTime} and zpt.attribute_tinyint1 is null order by zpt.creation_date desc limit 2"
    const queryParamMap = {
        tenantId: tenantId
    };
    // 查询时间
    let timeRes = H0.LovHelper.queryLovValue('ZCUS.SHXMZ.PROCESS.QUALITY.REPORT.TIME.RANGE', tenantId, 'zh_CN');
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
            //quality.charsetName = 'Windows-1252'
            quality.directory = '/data/xmz-dev'
        }
    }
    BASE.Logger.debug('-------查询工序数量上报返回结果-------{}', qualityRes)
    return qualityRes
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