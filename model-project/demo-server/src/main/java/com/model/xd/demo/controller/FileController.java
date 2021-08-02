package com.model.xd.demo.controller;

import com.model.xd.common.dto.req.WordFileReq;
import com.model.xd.common.response.ResponseResult;
import com.model.xd.common.util.ResponseResultUtil;
import com.model.xd.demo.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: IntelliJ IDEA
 * @ClassName: FileController
 * @date:2021/7/30 16:33
 */
@RestController
@RequestMapping("/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping(value = "/get/word/file")
    private ResponseResult<String> getWordFile(@RequestBody WordFileReq req, HttpServletRequest request, HttpServletResponse response){
        return ResponseResultUtil.success(fileService.getWordFile(req, request, response));
    }
}
