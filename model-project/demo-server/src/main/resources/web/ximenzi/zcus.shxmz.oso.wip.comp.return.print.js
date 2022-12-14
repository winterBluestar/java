function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 95;
    const wipServerId = 'zosc-wip'
    const lovModeler = 'hpfm_lov_value'
    const supplierAddressModeler = 'zopo_supplier_address'
    const userModeler = 'SYS_USER'
    const itemModeler = 'zpdt_item'
    const operationModeler = 'zbom_operation'
    const lovMap = new Map()
    const addressMap = new Map()
    const userMap = new Map()
    const itemMap = new Map()
    const operationMap = new Map()
    const lovCode = 'ZWIP.OSO_ASN_TYPE'

    // 校验委外完工退回发出头id不能为空
    if (input.osoCompReturnIdList == null || input.osoCompReturnIdList.length <= 0) {
        H0.ExceptionHelper.throwCommonException("工序委外完工退回发出头ID不能为空！")
    }
    let osoCompReturnIdStr = '';
    for (let idIndex = 0; idIndex < input.osoCompReturnIdList.length; idIndex++) {
        if (idIndex != input.osoCompReturnIdList.length - 1) {
            osoCompReturnIdStr = osoCompReturnIdStr + input.osoCompReturnIdList[idIndex] + ','
        } else {
            osoCompReturnIdStr = osoCompReturnIdStr + input.osoCompReturnIdList[idIndex]
        }
    }
    let sql = "select zocr.tenant_id,zocr.oso_comp_return_id,zocr.oso_asn_shipping_party,zocr.oso_comp_return_code,zocr.oso_asn_code,zocr.oso_asn_type,zocr.issued_time,zocr.oso_asn_shipping_party,zocr.created_by,zocr.oso_asn_rcv_party,zocr.rcv_contacts_name,zocr.rcv_contacts_mobile,zocr.related_party_address_id from zwip_oso_comp_return zocr where zocr.tenant_id = #{tenantId} "
    let lineSql = "select zocrl.oso_comp_return_id,zocrl.sequence_num,zocrl.mo_id,zocrl.mo_operation_id,zocrl.shipping_qty,zocrl.uom_id,zm.mo_num,zm.item_id,zm.plan_completed_qty,zmo.operation_id,zmo.process_oem_task_code from zwip_oso_comp_return_line zocrl left join zwip_mo zm on zocrl.mo_id = zm.mo_id left join zwip_mo_operation zmo on zocrl.mo_operation_id = zmo.mo_operation_id where zocrl.tenant_id = #{tenantId} "
    const queryHeadParam = {
        tenantId: tenantId,
    }
    // 查询头数据
    sql = sql + " and zocr.oso_comp_return_id in ("+osoCompReturnIdStr+") order by zocr.oso_comp_return_id"
    BASE.Logger.debug('----------------------查询头数据的SQL: {}----------------------', sql)
    let headRes = H0.SqlHelper.selectList(wipServerId, sql, queryHeadParam);
    BASE.Logger.debug('----------------------查询头数据的返回数据: {}----------------------', headRes)
    // 查询行数据
    lineSql = lineSql + "and zocrl.oso_comp_return_id in ("+osoCompReturnIdStr+") order by zocrl.oso_comp_return_id,zocrl.sequence_num"
    BASE.Logger.debug('----------------------查询行数据的SQL: {}----------------------', lineSql)
    let lineRes = H0.SqlHelper.selectList(wipServerId, lineSql, queryHeadParam);
    BASE.Logger.debug('----------------------查询行数据的返回数据: {}----------------------', lineRes)
    for (let headIndex = 0; headIndex < headRes.length; headIndex++) {
        const head = headRes[headIndex]
        // 根据code查询单据名称
        if (lovMap.get(head.osoAsnType) == null) {
            const lov = H0.ModelerHelper.selectOne(lovModeler, 0, {
                lovCode: lovCode,
                value: head.osoAsnType
            });
            if (lov != null) {
                head.osoAsnTypeName = lov.meaning
                lovMap.set(head.osoAsnType, lov)
            }
        } else {
            head.osoAsnTypeName = lovMap.get(head.osoAsnType).meaning
        }
        // 查询对应用户名称
        if (userMap.get(head.createdBy) == null) {
            const user = H0.ModelerHelper.selectOne(userModeler, tenantId, {
                id: head.createdBy
            });
            if (user != null) {
                head.createdByName = user.realName
                userMap.set(head.createdBy, user)
            }
        } else {
            head.createdByName = userMap.get(head.createdBy).realName
        }
        // 查询收货地址
        if (addressMap.get(head.relatedPartyAddressId) == null) {
            const address = H0.ModelerHelper.selectOne(supplierAddressModeler, tenantId, {
                addressId: head.relatedPartyAddressId
            });
            if (address != null) {
                head.addressDetail = address.regionName + address.regionName1 + address.regionName2 + address.addressDetail
                addressMap.set(head.relatedPartyAddressId, address)
            }
        } else {
            head.addressDetail = addressMap.get(head.relatedPartyAddressId).regionName
                + addressMap.get(head.relatedPartyAddressId).regionName1
                + addressMap.get(head.relatedPartyAddressId).regionName2
                + addressMap.get(head.relatedPartyAddressId).addressDetail
        }
        // 给头分配行
        if (lineRes != null && lineRes.length > 0) {
            const lineList = []
            for (let lineIndex = 0; lineIndex < lineRes.length; lineIndex++) {
                const line = lineRes[lineIndex]
                if (head.osoCompReturnId == line.osoCompReturnId) {
                    // 查询物料编码,描述,单位
                    if (itemMap.get(line.itemId) == null) {
                        const item = H0.ModelerHelper.selectOne(itemModeler, tenantId, {
                            itemId: line.itemId
                        });
                        if (item != null) {
                            line.itemCode = item.itemCode
                            line.itemDesc = item.itemDesc
                            line.uomName = item.uomName
                        }
                    } else {
                        line.itemCode = itemMap.get(line.itemId).itemCode
                        line.itemDesc = itemMap.get(line.itemId).itemDesc
                        line.uomName = itemMap.get(line.itemId).uomName
                    }
                    // 查询工序编码和描述
                    if (operationMap.get(line.moOperationId) == null) {
                        const operation = H0.ModelerHelper.selectOne(operationModeler, tenantId, {
                            operationId: line.operationId
                        });
                        if (operation != null) {
                            line.operationCode = operation.operationCode
                            line.operationName = operation.operationName
                        }
                    }
                    lineList.push(line)
                }
            }
            head.osoCompReturnLineList = lineList
        }
    }
    return headRes
}