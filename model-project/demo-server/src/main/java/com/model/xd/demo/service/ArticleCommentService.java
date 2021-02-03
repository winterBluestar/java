package com.model.xd.demo.service;

import com.model.xd.common.dto.req.ArticleCommentReq;
import com.model.xd.common.dto.req.ArticleQueryReq;
import com.model.xd.common.dto.resp.ArticleAllCommentResp;

import java.util.List;

public interface ArticleCommentService {

    Integer articleCommentReply(ArticleCommentReq req);

    List<ArticleAllCommentResp> queryCommentReply(ArticleQueryReq req);
}
