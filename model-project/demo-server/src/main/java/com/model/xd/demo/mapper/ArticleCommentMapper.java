package com.model.xd.demo.mapper;

import com.model.xd.common.dto.req.ArticleCommentReq;
import com.model.xd.common.dto.req.ArticleQueryReq;
import com.model.xd.common.dto.resp.ArticleAllCommentResp;
import com.model.xd.common.dto.resp.ArticleCommentInfo;
import com.model.xd.common.util.ResponseResultUtil;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArticleCommentMapper {

    Integer articleCommentReply(ArticleCommentReq req);

    List<ArticleAllCommentResp> queryAllCommentInfo(@Param("req") ArticleQueryReq req);

    List<ArticleCommentInfo> querySecondComment(@Param("req") ArticleQueryReq req);
}
