function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 96;
    const wipServerId = 'zosc-wip'
    const lovModeler = 'hpfm_lov_value'
    const customerAddressModeler = 'zoso_customer_address'
    const userModeler = 'SYS_USER'
    const lovMap = new Map()
    const addressMap = new Map()
    const userMap = new Map()
    const lovCode = 'ZWIP.OSO_ASN_TYPE'

    // 校验工序代工在制退回头id不能为空
    if (input.oeoWipReturnIdList == null || input.oeoWipReturnIdList.length <= 0) {
        H0.ExceptionHelper.throwCommonException("工序代工在制退回发出头ID不能为空！")
    }
    let sql = "SELECT zowr.tenant_id,zowr.oeo_wip_return_id,zowr.oso_asn_shipping_party,zowr.oeo_wip_return_code,zowr.oso_asn_code,zowr.oso_asn_type,zowr.shipping_time,zowr.oso_asn_shipping_party,zowr.created_by,zowr.oso_asn_rcv_party,zowr.rcv_contacts_name,zowr.rcv_contacts_mobile,zowr.related_party_address_id FROM zwip_oeo_wip_return zowr WHERE zowr.tenant_id = #{tenantId} "
    let lineSql = "select zowrl.oeo_wip_return_id,zowrl.sequence_num,zowrl.oeo_wip_return_line_id,zowrl.process_oem_task_id,zowrl.process_oem_task_operation_id,zowrl.shipping_qty,zpot.customer_item_code,zpot.customer_item_desc,zpot.process_oem_task_code,zpot.customer_mo_num,zpot.customer_demand_qty,zpot.customer_info,zpoto.id,zpoto.operation_code,zpoto.operation_name from zwip_oeo_wip_return_line zowrl left join zwip_process_oem_task zpot on zowrl.process_oem_task_id = zpot.process_oem_task_id left join zwip_process_oem_task_operation zpoto on zowrl.process_oem_task_operation_id = zpoto.id where zowrl.tenant_id = #{tenantId} "
    const queryHeadParam = {
        tenantId: tenantId
    }
    let oeoWipReturnIdStr = '';
    for (let idIndex = 0; idIndex < input.oeoWipReturnIdList.length; idIndex++) {
        if (idIndex != input.oeoWipReturnIdList.length - 1) {
            oeoWipReturnIdStr = oeoWipReturnIdStr + input.oeoWipReturnIdList[idIndex] + ','
        } else {
            oeoWipReturnIdStr = oeoWipReturnIdStr + input.oeoWipReturnIdList[idIndex]
        }
    }
    if (oeoWipReturnIdStr != '') {
        sql = sql + " AND zowr.oeo_wip_return_id IN (" + oeoWipReturnIdStr + ") order by zowr.oeo_wip_return_id"
        lineSql = lineSql + "and zowrl.oeo_wip_return_id in (" + oeoWipReturnIdStr + ") order by zowrl.oeo_wip_return_id,zowrl.sequence_num"
    }
    // 查询行数据
    BASE.Logger.debug('----------------------查询头数据的SQL: {}----------------------', sql)
    let headRes = H0.SqlHelper.selectList(wipServerId, sql, queryHeadParam);
    BASE.Logger.debug('----------------------查询头数据的返回数据: {}----------------------', headRes)
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
            const address = H0.ModelerHelper.selectOne(customerAddressModeler, tenantId, {
                addressId: head.relatedPartyAddressId
            });
            if (address != null) {
                head.addressDetail = address.regionName2 + address.regionName + address.regionName1 + address.addressDetail
                addressMap.set(head.relatedPartyAddressId, address)
            }
        } else {
            head.addressDetail = addressMap.get(head.relatedPartyAddressId).regionName2
                + addressMap.get(head.relatedPartyAddressId).regionName
                + addressMap.get(head.relatedPartyAddressId).regionName1
                + addressMap.get(head.relatedPartyAddressId).addressDetail
        }
        // 给头分配行
        if (lineRes != null && lineRes.length > 0) {
            const lineList = []
            for (let lineIndex = 0; lineIndex < lineRes.length; lineIndex++) {
                const line = lineRes[lineIndex]
                if (head.oeoWipReturnId == line.oeoWipReturnId) {
                    const customerInfo = CORE.JSON.parse(line.customerInfo)
                    line.customerUomName = customerInfo.customerUomName
                    lineList.push(line)
                }
            }
            head.oeoWipReturnLineList = lineList
        }
    }
    return headRes
}