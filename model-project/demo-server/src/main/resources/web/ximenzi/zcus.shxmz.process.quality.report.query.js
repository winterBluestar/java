function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const wipServiceId = "zosc-wip";
    //let tenantId = CORE.CurrentContext.getTenantId();
    let tenantId = 95;
    const operationModeler = 'zbom_operation';
    const operationMap = new Map()
    let sql = "select zpt.produce_tx_id,zpt.mo_id,zpt.completed_qty,FROM_UNIXTIME(ROUND( UNIX_TIMESTAMP( zpt.creation_date ) + zmo.sequence_num / 10 - 1 )) creation_date,zpt.operation_id,zm.mo_num,zpt.attribute_tinyint1 from zwip_produce_tx zpt left join zwip_mo zm on zpt.mo_id = zm.mo_id and zpt.tenant_id = zm.tenant_id left join zwip_mo_operation zmo on zpt.mo_operation_id = zmo.mo_operation_id and zpt.tenant_id = zmo.tenant_id where zpt.tenant_id = #{tenantId} "
    if (input != null && input.tenantId != null) {
        tenantId = input.tenantId
    }
    const queryParamMap = {
        tenantId: tenantId
    };
    if (input != null && input.txIdsStr != null && input.txIdsStr != 'null') {
        sql = sql + " and zpt.produce_tx_id in (" + input.txIdsStr + ")"
    } else {
        sql = sql + " and zpt.completed_qty > 0 and zpt.attribute_tinyint1 is null order by zm.mo_num DESC, zmo.sequence_num"
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
            const codeRule = H0.CodeRuleHelper.generateCode(tenantId, 'ZCUS.SHXMZ.OP_QTYREP', 'GLOBAL', 'GLOBAL', {})
            quality.fileName = quality.operationCode + 'qtyrep' + quality.moNum + codeRule + '.xml'
            quality.directory = '/data/xmz-dev/fab'
            quality.backDirectory = '/data/xmz-dev/' + getLocalTime(8).toLocaleDateString().replace('-',"").substring(0,6)
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