package com.model.xd.demo.service;

import com.model.xd.common.dto.req.DemoInfoReq;
import com.model.xd.common.dto.req.DemoQueryReq;
import com.model.xd.common.dto.resp.DemoInfoResp;
import com.model.xd.common.response.PageInfoResp;

import javax.servlet.http.HttpServletResponse;

public interface DemoService {
    Integer insertOrUpdateDemoInfo(DemoInfoReq req);

    DemoInfoResp queryDemoInfo(String demoId);

    PageInfoResp<DemoInfoResp> queryPageDemoInfo(DemoQueryReq req);

    String export(DemoQueryReq req, HttpServletResponse response) throws Exception;

    String desktopExport(HttpServletResponse response) throws Exception;

    String usualExportDemoInfo(DemoQueryReq req, HttpServletResponse response);
}
