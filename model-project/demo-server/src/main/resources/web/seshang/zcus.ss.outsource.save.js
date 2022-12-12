function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    //const tenantId = 76;
    const saveScriptCode = 'zcus.ss.outsource.only.save';
    const submitScriptCode = 'zcus.ss.outsource.submit';
    // 调用保存脚本
    const saveRes = H0.ScriptHelper.execute(tenantId, saveScriptCode, input);
    BASE.Logger.debug('-------保存并提交第一步：保存成功saveRes-------{}', saveRes)
    if(saveRes.msg != null) {
        return saveRes.msg
    }
    // 判断是否为保存并提交, 如果是的话则调用提交脚本
    if (input.isSubmit) {
        const docList = [];
        const param = {
            docId: saveRes.docId,
            docNum: saveRes.docNum,
            organizationCode: input.organizationCode
        }
        docList.push(param)
        const docParam = {
            "docList": docList
        }
        return H0.ScriptHelper.execute(tenantId, submitScriptCode, docParam);
    }
}