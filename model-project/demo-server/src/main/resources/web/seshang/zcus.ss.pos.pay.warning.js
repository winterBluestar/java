function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const supplierModeler = 'zopo_supplier';
    const companyModeler = 'zpfm_company';
    const poServerId = 'zosc-po';
    const userServerId = 'hzero-iam';
    const messageServerId = 'hzero-message';
    const supplierMap = new Map();
    const companyMap = new Map();
    const sendInboxGroupPath = '/v1/' + tenantId + '/user-groups?groupCode=POS_WARNING_SEND_INBOX_GROUP&page=0&size=10';
    const sendEmailGroupPath = '/v1/' + tenantId + '/user-groups?groupCode=POS_WARNING_SEND_EMAIL_GROUP&page=0&size=10';
    const sendMessagePath = '/v1/' + tenantId + '/message/relevance/with-receipt';

    // 查询对账单OA审批状态为“未审批”或“已拒绝”的数据
    const headQuerySql = "select pos_id, pos_code, execution_date, total_amount, company_id, supplier_id, tax_amount from zopo_pos where tenant_id = #{tenantId} and attribute_string2 in ('UNAPPROVED','REJECTED') order by pos_code";
    let posList = H0.SqlHelper.selectList(poServerId, headQuerySql, {tenantId: tenantId});
    BASE.Logger.debug('-------需要预警的对账单头信息-------{}', posList)
    if (posList != null && posList.length > 0) {
        // 查询预警提前时间
        const valueList = H0.LovHelper.queryLovValue('ZCUS.SS.POS_PAY_EARLY_WARNING', tenantId, 'zh_CN');
        const earlyDate = valueList[0]
        // 查询发送站内信用户组信息
        const inboxMessageSender = {
            messageCode: 'POS_WARNING_SEND_MSG',
            messageServerCode: 'ZONE-ONESTEP-CLOUD',
            tenantId: tenantId
        }
        let userGroup = BASE.FeignClient.selectClient(userServerId).doGet(sendInboxGroupPath);
        userGroup = JSON.parse(userGroup)
        if (userGroup != null && userGroup.content != null && userGroup.content.length > 0) {
            const inboxUserPath = '/v1/' + tenantId + '/user-groups/' + userGroup.content[0].userGroupId + '/users?page=0&size=-1';
            let sendInboxMessageList = BASE.FeignClient.selectClient(userServerId).doGet(inboxUserPath);
            sendInboxMessageList = JSON.parse(sendInboxMessageList)
            BASE.Logger.debug("-----------查询站内信发送用户信息sendInboxMessageList: {}---------", sendInboxMessageList)
            const receiverAddressList = []
            if (sendInboxMessageList != null && sendInboxMessageList.content != null && sendInboxMessageList.content.length > 0) {
                for (let j = 0; j < sendInboxMessageList.content.length; j++) {
                    const receiver = {userId: sendInboxMessageList.content[j].userId, targetUserTenantId: tenantId}
                    receiverAddressList.push(receiver)
                }
            }
            inboxMessageSender.receiverAddressList = receiverAddressList
            inboxMessageSender.typeCodeList = ['WEB']
        }
        // 查询发送邮件用户组信息
        const emailSender = {
            messageCode: 'POS_WARNING_SEND_MSG',
            messageServerCode: 'ZONE-ONESTEP-CLOUD',
            tenantId: tenantId
        }
        let emailGroup = BASE.FeignClient.selectClient(userServerId).doGet(sendEmailGroupPath);
        emailGroup = JSON.parse(emailGroup)
        if (emailGroup != null && emailGroup.content != null && emailGroup.content.length > 0) {
            const sendEmailPath = '/v1/' + tenantId + '/user-groups/' + emailGroup.content[0].userGroupId + '/users?page=0&size=-1';
            let sendEmailList = BASE.FeignClient.selectClient(userServerId).doGet(sendEmailPath);
            sendEmailList = JSON.parse(sendEmailList)
            BASE.Logger.debug("-----------查询邮件发送用户信息sendEmailList: {}---------", sendEmailList)
            const receiverAddressList = []
            if (sendEmailList != null && sendEmailList.content != null && sendEmailList.content.length > 0) {
                for (let k = 0; k < sendEmailList.content.length; k++) {
                    const receiver = {userId: sendEmailList.content[k].userId, targetUserTenantId: tenantId}
                    // 查询邮箱
                    const userPath = '/hzero/v1/' + tenantId + '/users/paging?customizeUnitCode=HIAM.SUB_ACCOUND.GRID&loginName=' + sendEmailList.content[k].loginName + '&page=0&size=10&userType=P';
                    let user = BASE.FeignClient.selectClient(userServerId).doGet(userPath);
                    user = JSON.parse(user)
                    BASE.Logger.debug("-----------查询用户信息user: {}---------", user)
                    receiver.email = user.content[0].email;
                    receiverAddressList.push(receiver)
                }
            }
            emailSender.receiverAddressList = receiverAddressList
            emailSender.typeCodeList = ['EMAIL']
        }
        for (let i = 0; i < posList.length; i++) {
            const pos = posList[i];
            // 查询公司
            let company = companyMap.get(pos.companyId);
            if (company == null) {
                company = H0.ModelerHelper.selectOne(companyModeler, tenantId, {companyId: pos.companyId});
                companyMap.set(company.companyId, company)
            }
            // 查询供应商信息
            let supplier = supplierMap.get(pos.supplierId);
            if (supplier == null) {
                supplier = H0.ModelerHelper.selectOne(supplierModeler, tenantId, {supplierId: pos.supplierId});
                supplierMap.set(supplier.supplierId, supplier);
            }
            const lineQuerySql = "select pos_id, pos_line_id, source_tx_time from zopo_pos_line where tenant_id = #{tenantId} and pos_id = #{posId} order by source_tx_time desc limit 1"
            let posLine = H0.SqlHelper.selectOne(poServerId, lineQuerySql, {tenantId: tenantId, posId: pos.posId});
            // 查询当前日期是否在预警范围内
            let dateDifference = 0;
            const sourceTxTime = new Date(posLine.sourceTxTime);
            if (supplier.attributeString1 != null) {
                dateDifference = Number(supplier.attributeString1) - Number(earlyDate.value)
            } else {
                dateDifference = dateDifference - Number(earlyDate.value)
            }
            const warningTimestamp = sourceTxTime.getTime() + 24 * 60 * 60 * 1000 * dateDifference
            const nowTimestamp = new Date().getTime() + 8 * 60 * 60 * 1000
            const timeSub = (nowTimestamp - warningTimestamp)
            // 如果当前时间大于等于预警时间时则开始预警
            if (timeSub >= 0) {
                const warningInfo = {
                    posId: pos.posId,
                    posCode: pos.posCode,
                    companyName: company.companyName,
                    supplierName: supplier.supplierName == null ? '' : supplier.supplierName,
                    attributeString1: supplier.attributeString1 == null ? '' : supplier.attributeString1,
                    executionDate: pos.executionDate == null ? '' : pos.executionDate,
                    totalAmount: pos.totalAmount == null ? '' : pos.totalAmount,
                    taxAmount: pos.taxAmount == null ? '' : pos.taxAmount,
                    dateTimeString: new Date(nowTimestamp).toLocaleDateString() + ' ' + new Date(nowTimestamp).toLocaleTimeString()
                }
                inboxMessageSender.objectArgs = warningInfo
                emailSender.objectArgs = warningInfo
                // 调用hzero-message消息发送接口发送站内信或邮件
                if (inboxMessageSender.receiverAddressList != null && inboxMessageSender.receiverAddressList.length > 0) {
                    BASE.Logger.debug("-----------发送站内信参数inboxMessageSender: {}---------", inboxMessageSender)
                    H0.FeignClient.selectClient(messageServerId).doPost(sendMessagePath, inboxMessageSender)
                }
                if (emailSender.receiverAddressList != null && emailSender.receiverAddressList.length > 0) {
                    BASE.Logger.debug("-----------发送邮件参数emailSender: {}---------", emailSender)
                    H0.FeignClient.selectClient(messageServerId).doPost(sendMessagePath, emailSender)
                }
            }
        }
    }
}