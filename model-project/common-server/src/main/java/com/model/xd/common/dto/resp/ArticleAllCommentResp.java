package com.model.xd.common.dto.resp;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * @author winterBluestar
 * @description java
 * @className ArticleAllCommentResp
 * @data 2021/1/15 11:10
 */
@Data
public class ArticleAllCommentResp implements Serializable {
    private static final long serialVersionUID = 4359709211352400087L;

    //评论id
    public String commentId;

    //文章id
    public String articleId;

    //评论内容id
    public String contentId;

    //回复内容id
    public String replyId;

    //用户名
    public String userName;

    //回复对象名
    public String replyUser;

    //评论内容
    public String content;

    //二级评论
    private List<ArticleCommentInfo> secondCommentInfoList;

    //评论时间
    @JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss", timezone = "GTM+8")
    public Date commentTime;

    //评论或者回复 1-评论 2-回复
    //public Integer isContent;
}
