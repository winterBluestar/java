package com.model.xd.demo.controller;

import com.model.xd.common.dto.req.DemoInfoReq;
import com.model.xd.common.dto.req.DemoQueryReq;
import com.model.xd.common.dto.resp.DemoInfoResp;
import com.model.xd.common.response.PageInfoResp;
import com.model.xd.common.response.ResponseResult;
import com.model.xd.common.util.ResponseResultUtil;
import com.model.xd.demo.service.DemoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/demo")
public class DemoController {

    @Autowired
    private DemoService demoService;

    @GetMapping(value = "/hello")
    public ResponseResult<String> sayHello() {
        return ResponseResultUtil.success("hello-world");
    }

    @PostMapping(value = "/insert-update")
    public ResponseResult insertOrUpdateDemoInfo(@RequestBody DemoInfoReq req) {
        Integer i = demoService.insertOrUpdateDemoInfo(req);
        if (i == 1) {
            return ResponseResultUtil.success();
        } else {
            return ResponseResultUtil.fail();
        }
    }

    @PostMapping(value = "/query")
    public ResponseResult<DemoInfoResp> queryDemoInfo(@RequestBody DemoQueryReq req) {
        return ResponseResultUtil.success(demoService.queryDemoInfo(req.getDemoId()));
    }

    @PostMapping(value = "/query/page")
    public ResponseResult<PageInfoResp<DemoInfoResp>> queryPageDemoInfo(@RequestBody DemoQueryReq req) {
        return ResponseResultUtil.success(demoService.queryPageDemoInfo(req));
    }

    /**
     * 动态导出
     *
     * @param req
     * @param response
     * @return
     * @throws Exception
     */
    @PostMapping(value = "/export")
    public ResponseResult exportDemoInfo(@RequestBody DemoQueryReq req, HttpServletResponse response) throws Exception {
        return ResponseResultUtil.success(demoService.export(req, response));
    }

    /**
     * 直接在浏览器下载导出的文件
     *
     * @param response
     * @return
     * @throws Exception
     */
    @GetMapping(value = "/desktop-export")
    public ResponseResult exportDesktopDemoInfo(HttpServletResponse response) throws Exception {
        return ResponseResultUtil.success(demoService.desktopExport(response));
    }

    /**
     * 常规导出
     *
     * @param req
     * @param response
     * @return
     * @throws Exception
     */
    @PostMapping(value = "/usual-export")
    public ResponseResult usualExportDemoInfo(@RequestBody DemoQueryReq req, HttpServletResponse response) throws Exception {
        return ResponseResultUtil.success(demoService.usualExportDemoInfo(req, response));
    }
}
