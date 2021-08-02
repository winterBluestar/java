package com.model.xd.demo.service;

import com.model.xd.common.dto.req.WordFileReq;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: FileService
 * @date:2021/7/30 16:34
 */
public interface FileService {
    String getWordFile(WordFileReq req, HttpServletRequest request, HttpServletResponse response);
}
