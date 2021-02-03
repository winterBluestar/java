package com.model.xd.demo.controller;


import com.model.xd.common.dto.req.ArticleCommentReq;
import com.model.xd.common.dto.req.ArticleQueryReq;
import com.model.xd.common.dto.resp.ArticleAllCommentResp;
import com.model.xd.common.dto.resp.ArticleCommentInfo;
import com.model.xd.common.response.ResponseResult;
import com.model.xd.common.util.ResponseResultUtil;
import com.model.xd.demo.service.ArticleCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/demo/article/comment")
@RestController
public class ArticleCommentController {

    @Autowired
    private ArticleCommentService articleCommentService;

    /**
     * 新增评论/回复
     *
     * @param req
     * @return
     */
    @PostMapping("/comment-reply")
    public ResponseResult articleCommentReply(@RequestBody ArticleCommentReq req) {
        return ResponseResultUtil.success(articleCommentService.articleCommentReply(req));
    }

    /**
     * 查询文章评论
     *
     * @param req
     * @return
     */
    @PostMapping("/query-comment")
    public ResponseResult<List<ArticleAllCommentResp>> queryCommentReply(@RequestBody ArticleQueryReq req) {
        return ResponseResultUtil.success(articleCommentService.queryCommentReply(req));
    }
}
