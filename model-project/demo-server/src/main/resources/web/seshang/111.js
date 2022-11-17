function process(input) {
    BASE.Logger.debug('-----------input-----------{}', input)
    const tenantId = CORE.CurrentContext.getTenantId();
    const serverId = "hzero-interface";
    const secondServerId = "zosc-second-service";
    const aaModeler = 'zopo_aa';
    const aaLineModeler = 'zopo_aa_line';
    const poLineModeler = 'zopo_po_line';
    const itemSkuModeler = 'zpdt_item_sku';
    const supplierModeler = "zopo_supplier";
    const warehouseModeler = "zpfm_warehouse";
    const warehouseAddressModeler = "zpfm_warehouse_address";
    const userModeler = 'SYS_USER';
    const regionModeler = 'zpfm_region';
    const itemSkuMap = new Map();
    const supplierMap = new Map();
    const warehouseMap = new Map();
    const userMap = new Map();
    const path = "/v2/rest/invoke?namespace=" + CORE.CurrentContext.getTenantNum() + "&serverCode=ZCUS.SS.WDT_INTERFACE&interfaceCode=purchaseOrderPush";
    const bulidParamsPath = "/v1/" + tenantId + "/ss-wdt/bulid-wdt-params";
    const confirmFlag = input.confirmFlag
    if (confirmFlag == null) {
        confirmFlag == 0
    }
    var returnAaArray = new Array();
    for (var i = 0; i < input.aaIds.length; i++) {
        const value = input.aaIds[i]
        const aaParamMap = {
            "aaId": value.aaId
        };
        const aa = H0.ModelerHelper.selectOne(aaModeler, tenantId, aaParamMap);
        if (aa == null) {
            if (confirmFlag == 1) {
                return
            } else {
                H0.ExceptionHelper.throwCommonException("数据不存在")
            }
        }
        if (aa.cooperateStatus != 'CONFIRMED' && confirmFlag != 1) {
            H0.ExceptionHelper.throwCommonException("要货预约单[" + aa.aaCode + "]协同状态不为已确认，不允许同步旺店通")
        }
        if (aa.closeStatus != 'OPEN') {
            if (confirmFlag == 1) {
                return
            } else {
                H0.ExceptionHelper.throwCommonException("要货预约单[" + aa.aaCode + "]关闭状态不为已打开，不允许同步旺店通")
            }
        }
        if (aa.attributeTinyint1 == 1) {
            if (confirmFlag == 1) {
                return
            } else {
                H0.ExceptionHelper.throwCommonException("要货预约单[" + aa.aaCode + "]已同步旺店通，不允许再次同步")
            }
        }
        let wdtParam = {}
        const purchaseInfo = {}
        if (supplierMap.has(aa.supplierId)) {
            purchaseInfo.provider_no = supplierMap.get(aa.supplierId);
        } else {
            const supplier = H0.ModelerHelper.selectOne(supplierModeler, tenantId, {
                "supplierId": aa.supplierId
            });
            if (supplier != null) {
                purchaseInfo.provider_no = supplier.supplierCode;
                supplierMap.set(aa.supplierId, supplier.supplierCode);
            }
        }
        if (warehouseMap.has(aa.warehouseId)) {
            purchaseInfo.warehouse_no = warehouseMap.get(aa.warehouseId).warehouseCode;
            purchaseInfo.receive_address = warehouseMap.get(aa.warehouseId).address;
        } else {
            const warehouse = H0.ModelerHelper.selectOne(warehouseModeler, tenantId, {
                "warehouseId": aa.warehouseId
            });
            if (warehouse != null) {
                purchaseInfo.warehouse_no = warehouse.warehouseCode;
                const warehouseAddresss = H0.ModelerHelper.selectList(warehouseAddressModeler, tenantId, {
                    "sourceId": aa.warehouseId
                });
                if (warehouseAddresss != null && warehouseAddresss.length > 0) {
                    var address = '';
                    const warehouseAddress = warehouseAddresss[0]
                    if (warehouseAddress.provinceRegionId != null) {
                        const province = H0.ModelerHelper.selectOne(regionModeler, 0, {"regionId": warehouseAddress.provinceRegionId});
                        address += province.regionName
                    }
                    if (warehouseAddress.cityRegionId != null) {
                        const city = H0.ModelerHelper.selectOne(regionModeler, 0, {"regionId": warehouseAddress.cityRegionId});
                        address += city.regionName
                    }
                    if (warehouseAddress.districtRegionId != null) {
                        const district = H0.ModelerHelper.selectOne(regionModeler, 0, {"regionId": warehouseAddress.districtRegionId});
                        address += district.regionName
                    }
                    address += warehouseAddress.addressDetail
                    purchaseInfo.receive_address = address
                    warehouse.address = address
                }
                warehouseMap.set(aa.warehouseId, warehouse);
            }
        }
        if (aa.ownerId != null) {
            if (userMap.has(aa.ownerId)) {
                purchaseInfo.purchase_name = userMap.get(aa.ownerId);
            } else {
                const user = H0.ModelerHelper.selectOne(userModeler, tenantId, {
                    "id": aa.ownerId
                });
                if (user != null) {
                    purchaseInfo.purchase_name = user.realName;
                    userMap.set(aa.ownerId, user.realName);
                }
            }
        }
        purchaseInfo.purchase_name = 'lx';
        purchaseInfo.outer_no = aa.aaCode
        purchaseInfo.is_use_outer_no = 1
        purchaseInfo.is_check = 1
        purchaseInfo.contact = aa.consignee
        purchaseInfo.telno = aa.consigneeMobile
        var remark = ''
        if (aa.remark != null && aa.remark != '') {
            remark = '内部备注：' + aa.remark
        }
        if (aa.collaborationRemark != null && aa.collaborationRemark != '') {
            if (remark != null && remark != '') {
                remark += ';'
            }
            remark += '协同备注：' + aa.collaborationRemark
        }
        purchaseInfo.remark = remark
        var demandDate
        var detailsArray = new Array();
        const aaLines = H0.ModelerHelper.selectList(aaLineModeler, tenantId, {
            "aaId": aa.aaId
        });
        if (aaLines != null && aaLines.length > 0) {
            aaLines.forEach(function(line, index2) {
                if (demandDate == null) {
                    demandDate = line.demandDate
                } else {
                    if (demandDate > line.demandDate) {
                        demandDate = line.demandDate
                    }
                }
                var detail = {}
                if (itemSkuMap.has(line.itemSkuId)) {
                    detail.spec_no = itemSkuMap.get(line.itemSkuId);
                } else {
                    const itemSku = H0.ModelerHelper.selectOne(itemSkuModeler, tenantId, {
                        "itemSkuId": line.itemSkuId
                    });
                    if (itemSku != null) {
                        detail.spec_no = itemSku.itemSkuCode;
                        itemSkuMap.set(line.itemSkuId, itemSku.itemSkuCode);
                    }
                }
                detail.num = line.appointmentQty
                const poLine = H0.ModelerHelper.selectOne(poLineModeler, tenantId, {
                    "poLineId": line.poLineId
                });
                if (poLine != null) {
                    detail.price = poLine.exTaxPrice
                    detail.tax = poLine.taxRate
                    detail.tax_price = poLine.price
                }
                detailsArray.push(detail)
            })
        }
        purchaseInfo.expect_arrive_time = demandDate
        purchaseInfo.details_list = detailsArray
        wdtParam.purchase_info = CORE.JSON.stringify(purchaseInfo)
        BASE.Logger.debug("-------wdtParam-------{}", wdtParam)
        // 组装参数
        var paramsRes = BASE.FeignClient.selectClient(secondServerId)
            .doPost(bulidParamsPath, wdtParam);
        BASE.Logger.debug("-------paramsRes-------{}", paramsRes)
        paramsRes = CORE.JSON.parse(paramsRes);
        var updateAaArray = new Array();
        if (paramsRes.sign != null) {
            const param = {
                bodyParamMap: paramsRes
            }
            var res = BASE.FeignClient.selectClient(serverId)
                .doPost(path, param);
            res = CORE.JSON.parse(res);
            BASE.Logger.debug("-------WDT RES-------{}", res)
            var wdtRes = CORE.JSON.parse(res.payload);
            if (wdtRes.code != 0) {
                BASE.Logger.error('同步要货预约单[{}]失败:{}', aa.aaCode, wdtRes.message)
                if (confirmFlag == 1) {
                    aa.attributeTinyint1 = 0
                    aa.attributeString1 = wdtRes.message
                } else {
                    H0.ExceptionHelper.throwCommonException("同步要货预约单[" + aa.aaCode + "]失败：" + wdtRes.message)
                }
            } else {
                aa.attributeTinyint1 = 1
                aa.attributeString1 = wdtRes.message
            }
        } else {
            if (confirmFlag == 1) {
                aa.attributeTinyint1 = 0
                aa.attributeString1 = '接口参数组装失败'
            } else {
                H0.ExceptionHelper.throwCommonException("接口参数组装失败")
            }
        }
        if (confirmFlag == 1) {
            returnAaArray.push(aa)
        } else {
            updateAaArray.push(aa)
            H0.ModelerHelper.batchUpdateByPrimaryKey(aaModeler, tenantId, updateAaArray)
        }
    }
    // 因为事务原因不保存返回给API个性化去保存
    if (confirmFlag == 1) {
        return returnAaArray
    }
}