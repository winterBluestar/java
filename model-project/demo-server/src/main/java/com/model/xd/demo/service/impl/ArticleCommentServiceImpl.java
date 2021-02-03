package com.model.xd.demo.service.impl;

import com.model.xd.common.dto.req.ArticleCommentReq;
import com.model.xd.common.dto.req.ArticleQueryReq;
import com.model.xd.common.dto.resp.ArticleAllCommentResp;
import com.model.xd.common.dto.resp.ArticleCommentInfo;
import com.model.xd.common.util.StrUtil;
import com.model.xd.demo.mapper.ArticleCommentMapper;
import com.model.xd.demo.service.ArticleCommentService;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleCommentServiceImpl implements ArticleCommentService {

    @Autowired
    private ArticleCommentMapper articleCommentMapper;

    /**
     * 新增评论
     *
     * @param req
     * @return
     */
    @Override
    @Transactional(rollbackFor = Throwable.class)
    public Integer articleCommentReply(ArticleCommentReq req) {
        if (StringUtils.isBlank(req.getCommentId())) {
            req.setCommentId(StrUtil.uuid());
        }

        if (req.getIsContent() == 1) {
            //评论
            if (StringUtils.isBlank(req.getContentId())) {
                req.setContentId(StrUtil.uuid());
            }
        } else {
            //回复
            if (StringUtils.isBlank(req.getReplyId())) {
                req.setReplyId(StrUtil.uuid());
            }
        }
        return articleCommentMapper.articleCommentReply(req);
    }

    /**
     * 查询文章评论
     *
     * @param req
     * @return
     */
    @Override
    public List<ArticleAllCommentResp> queryCommentReply(ArticleQueryReq req) {
        //查询谋篇文章下所有评论
        List<ArticleAllCommentResp> allFirstCommentRespList = articleCommentMapper.queryAllCommentInfo(req);
        List<ArticleCommentInfo> AllSecondCommentList = articleCommentMapper.querySecondComment(req);

        //筛选出一级评论
        List<ArticleAllCommentResp> firstCommentList = allFirstCommentRespList.stream().filter(p -> StringUtils.isBlank(p.getReplyId())).collect(Collectors.toList());

        //筛选出二级评论并添加到一级评论下
        firstCommentList.stream().forEach(p -> {
            List<ArticleCommentInfo> secondCommentList = AllSecondCommentList.stream().filter(comment -> comment.getContentId().equals(p.getContentId())).collect(Collectors.toList());
            List<ArticleCommentInfo> sortSecondCommentList = secondCommentList.stream().sorted(Comparator.comparing(ArticleCommentInfo::getCommentTime)).collect(Collectors.toList());
            p.setSecondCommentInfoList(sortSecondCommentList);
        });

        //返回评论
        return firstCommentList;
    }
}
