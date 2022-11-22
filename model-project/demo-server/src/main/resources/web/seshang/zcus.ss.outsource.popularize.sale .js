function process(input) {
    BASE.Logger.debug('-------input-------{}', input)
    //const tenantId = CORE.CurrentContext.getTenantId();
    const tenantId = 76;
    const secondServiceId = 'zosc-second-service';
    const serverId = "hzero-interface";
    const storageModeler = 'zcus_ss_outsource_storage';
    const storageLineModeler = 'zcus_ss_outsource_storage_line';
    const lotModeler = 'zinv_lot';
    const codeValueModeler = 'zpfm_business_code_value';
    const locatorModeler = 'zpfm_locator';
    const codeValueMap = new Map();
    const buildParamsPath = "/v1/" + tenantId + "/ss-wdt/bulid-wdt-params";
    const createPoPath = "/v1/" + tenantId + "/ss-wdt/wdt-interface-invoke/PURCHASE_ORDER_PUSH";
    const createPoStockInPath = "/v1/" + tenantId + "/ss-wdt/wdt-interface-invoke/STOCKIN_PURCHASE_PUSH";
    //const createPoPath = "/v2/rest/invoke?namespace=" + CORE.CurrentContext.getTenantNum() + "&serverCode=ZCUS.SS.WDT_INTERFACE&interfaceCode=purchaseOrderPush";
    //const createPoStockInPath = "/v2/rest/invoke?namespace=" + CORE.CurrentContext.getTenantNum() + "&serverCode=ZCUS.SS.WDT_INTERFACE&interfaceCode=stockinPurchasePush";
    const queryPoStockInPath = "/v2/rest/invoke?namespace=" + CORE.CurrentContext.getTenantNum() + "&serverCode=ZCUS.SS.WDT_INTERFACE&interfaceCode=stockinOrderQueryPurchase";
    // 创建采购单
    let storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
        "docId": input.docId
    });
    const storageLineList = H0.ModelerHelper.selectList(storageLineModeler, tenantId, {
        "docId": input.docId
    });
    let sourcelocator = H0.ModelerHelper.selectOne(locatorModeler, tenantId, {locatorId: storage.targetDefaultLocatorId});
    let locator = H0.ModelerHelper.selectOne(locatorModeler, tenantId, {locatorId: storage.defaultLocatorId});
    BASE.Logger.debug('-------第一次查询storage-------{}', storage)
    if (storage.wdtDocNum == null) {
        const poHead = {
            provider_no: "NBGYS",
            warehouse_no: input.warehouseCode,
            outer_no: input.docNum,
            is_use_outer_no: 1,
            is_check: 1,
            contact: input.contacts,
            telno: input.phone,
            receive_address: input.regionName2 + input.regionName + input.regionName1 + input.addressDetail,
            remark: storage.remark
        }
        const detailsList = []
        if (storageLineList != null && storageLineList.length > 0) {
            for (let i = 0; i < storageLineList.length; i++) {
                const storageLine = storageLineList[i];
                const detail = {
                    spec_no: storageLine.itemSkuCode,
                    num: storageLine.quantity,
                    price: 0,
                    remark: storageLine.remark
                }
                detailsList.push(detail)
            }
        }
        poHead.details_list = detailsList
        const createPoParam = {}
        createPoParam.purchase_info = CORE.JSON.stringify(poHead)
        createPoParam.keyCode = storage.docNum
        // 调用zosc-second-service获取参数
        BASE.Logger.debug('-------createPoParam-------{}', createPoParam)
        //let createPoParamRes = BASE.FeignClient.selectClient(secondServiceId)
        //    .doPost(buildParamsPath, createPoParam);
        //BASE.Logger.debug('-------createPoParamRes-------{}', createPoParamRes)
        //createPoParamRes = CORE.JSON.parse(createPoParamRes);
        //if (createPoParamRes.sign != null) {
        //    const param = {
        //        bodyParamMap: createPoParamRes
        //    }
        // 调用旺店通创建采购单接口
        //BASE.Logger.debug('-------调用旺店通创建采购订单接口参数-------{}', createPoParam)
        //let createWdtRes = BASE.FeignClient.selectClient(serverId)
        //    .doPost(createPoPath, param);
        let createWdtRes = BASE.FeignClient.selectClient(secondServiceId)
            .doPost(createPoPath, createPoParam);
        createWdtRes = CORE.JSON.parse(createWdtRes);
        BASE.Logger.debug("-------CREATE PO RES-------{}", createWdtRes)
        const payloadRes = CORE.JSON.parse(createWdtRes.message);
        if (payloadRes.code == 0) {
            // 更新创建采购单状态
            storage.wdtDocNum = storage.docNum
            storage.syncStatus = null
            storage.syncMsg = null
            H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
        } else {
            if (payloadRes.code == 7010) {
                // 已经存在采购入库单, 采购单号为外部单号, 更新采购单状态
                storage.wdtDocNum = storage.docNum
                storage.syncStatus = null
                storage.syncMsg = null
                H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
            } else {
                storage.syncStatus = '失败'
                storage.syncMsg = payloadRes.message
                H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
                return payloadRes.message
            }
        }
        //}
    }
    // 创建采购入库单
    storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
        "docId": input.docId
    });
    const firstSplit = storage.wdtDocNum.split(';')
    if (firstSplit.length == 1 && firstSplit[0] == storage.docNum) {
        const purchaseInfo = {
            purchase_no: storage.docNum,
            outer_no: storage.docNum,
            is_create_batch: 0,
            is_check: 1,
            warehouse_no: input.warehouseCode,
            remark: storage.remark
        }
        const detailsList = []
        if (storageLineList != null && storageLineList.length > 0) {
            for (let j = 0; j < storageLineList.length; j++) {
                const storageLine = storageLineList[j];
                const detail = {
                    spec_no: storageLine.itemSkuCode,
                    stockin_num: storageLine.quantity,
                    batch_no: storageLine.lotNum,
                    remark: storageLine.remark
                }
                if (storageLine.lotId != null && storageLine.lotId.length > 0) {
                    const lot = H0.ModelerHelper.selectOne(lotModeler, tenantId, {
                        lotId: storageLine.lotId,
                        organizationId: storage.organizationId
                    });
                    if (lot != null) {
                        detail.production_date = lot.activeTime
                    }
                }
                detailsList.push(detail)
            }
        }
        purchaseInfo.details_list = detailsList
        const createStockInParam = {}
        createStockInParam.purchase_info = CORE.JSON.stringify(purchaseInfo)
        createStockInParam.keyCode = storage.docNum
        // 调用zosc-second-service获取参数
        BASE.Logger.debug('-------createStockInParam-------{}', createStockInParam)
        //let createStockInParamRes = BASE.FeignClient.selectClient(secondServiceId)
        //    .doPost(buildParamsPath, createStockInParam);
        //BASE.Logger.debug('-------createStockInParamRes-------{}', createStockInParamRes)
        //createStockInParamRes = CORE.JSON.parse(createStockInParamRes)
        //if (createStockInParamRes.sign != null) {
        //    const param = {
        //        bodyParamMap: createStockInParamRes
        //    }
        // 调用旺店通创建采购入库单接口
        //let createWdtStockInRes = BASE.FeignClient.selectClient(serverId)
        //    .doPost(createPoStockInPath, param);
        let createWdtStockInRes = BASE.FeignClient.selectClient(secondServiceId)
            .doPost(createPoStockInPath, createStockInParam);
        createWdtStockInRes = CORE.JSON.parse(createWdtStockInRes);
        BASE.Logger.debug("-------CREATE WDT STOCK IN RES-------{}", createWdtStockInRes)
        const payloadRes = CORE.JSON.parse(createWdtStockInRes.message)
        if (payloadRes.code == 0) {
            // 更新创建采购入库单号
            storage.wdtDocNum = storage.wdtDocNum + ';' + payloadRes.stockin_no
            storage.syncStatus = null
            storage.syncMsg = null
            H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
        } else {
            if (payloadRes.code == 2470) {
                // 采购入库单已经存在, 查询采购入库单, 并更新信息
                const queryPOStockInParam = {
                    stockin_outer_no: storage.docNum
                }
                BASE.Logger.debug('-------queryPOStockInParam-------{}', queryPOStockInParam)
                let queryPOStockInRes = BASE.FeignClient.selectClient(secondServiceId)
                    .doPost(buildParamsPath, queryPOStockInParam);
                BASE.Logger.debug('-------queryPOStockInRes-------{}', queryPOStockInRes)
                queryPOStockInRes = CORE.JSON.parse(queryPOStockInRes)
                if (createStockInParamRes.sign != null) {
                    const queryParam = {
                        bodyParamMap: queryPOStockInRes
                    }
                    let queryStockInRes = BASE.FeignClient.selectClient(serverId)
                        .doPost(queryPoStockInPath, queryParam);
                    queryStockInRes = CORE.JSON.parse(queryStockInRes);
                    BASE.Logger.debug("-------queryStockInRes-------{}", queryStockInRes)
                    const poStockInPayloadRes = CORE.JSON.parse(queryStockInRes.payload)
                    if (poStockInPayloadRes.code == 0) {
                        const stockIn = poStockInPayloadRes.stockin_list[0];
                        storage.wdtDocNum = storage.wdtDocNum + ';' + stockIn.stockin_no
                        storage.syncStatus = null
                        storage.syncMsg = null
                        H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
                    }
                }
            } else {
                storage.syncStatus = '失败'
                storage.syncMsg = payloadRes.message
                storage.docStatusCode = 'PUSH_FAIL'
                H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
                return payloadRes.message
            }
        }
        //}
    }
    // 调取标准接口【直接转移】生成库存事务
    storage = H0.ModelerHelper.selectOne(storageModeler, tenantId, {
        "docId": input.docId
    });
    const secondSplit = storage.wdtDocNum.split(';')
    if (secondSplit.length == 2) {
        const transferPath = "/v1/" + tenantId + "/stocks/direct-transfer"
        if (codeValueMap.get(storage.invBusinessReasonId) == null) {
            const codeValue = H0.ModelerHelper.selectOne(codeValueModeler, tenantId, {
                "businessCodeValueId": storage.invBusinessReasonId
            });
            codeValueMap.set(codeValue.businessCodeValueId, codeValue)
        }
        const transferParamList = []
        if (storageLineList != null && storageLineList.length > 0) {
            for (let k = 0; k < storageLineList.length; k++) {
                const storageLine = storageLineList[k];
                const transferParam = {
                    organizationCode: input.organizationCode,
                    toOrganizationCode: input.organizationCode,
                    itemCode: storageLine.itemCode,
                    itemSkuCode: storageLine.itemSkuCode,
                    txUomQty: storageLine.quantity,
                    txUomName: storageLine.uomName,
                    warehouseCode: input.targetWarehouseCode,
                    toWarehouseCode: input.warehouseCode,
                    lotNumber: storageLine.lotNum,
                    remark: storage.docNum,
                    locatorCode: sourcelocator.locatorCode,
                    toLocatorCode: locator.locatorCode,
                    executeTime: getDateTimeStr(),
                    qcRaesonCode: codeValueMap.get(storage.invBusinessReasonId).valueCode,
                    qcRaesonDesc: codeValueMap.get(storage.invBusinessReasonId).valueDesc
                }
                transferParamList.push(transferParam)
                storageLine.executeQty = storageLine.quantity
            }
        }
        if (transferParamList.length > 0) {
            let transferRes = H0.FeignClient.selectClient('zosc-open-api').doPost(transferPath, transferParamList);
            transferRes = CORE.JSON.parse(transferRes);
            if (transferRes.failed) {
                BASE.Logger.error("直接转移失败[" + transferRes.message + "]")
                storage.syncStatus = '失败'
                storage.docStatusCode = 'EXECUTE_FAIL'
                storage.syncMsg = transferRes.message
                H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
                return transferRes.message;
            } else {
                // 更新委外单据状态为 已完成
                storage.docStatusCode = 'PUSH_SUCCESS'
                storage.syncStatus = null
                storage.syncMsg = null
                H0.ModelerHelper.updateByPrimaryKey(storageModeler, tenantId, storage, true)
                // 更新执行数量
                H0.ModelerHelper.batchUpdateByPrimaryKey(storageLineModeler, tenantId, storageLineList)
            }
        }
    }
}


/**
 * 获取yyyy-MM-dd HH:mm:ss 字符串格式
 * @returns {string}
 */
function getDateTimeStr() {
    const dateString = getLocalTime(8).toLocaleDateString();
    const timeString = getLocalTime(8).toLocaleTimeString();
    return dateString + " " + timeString
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