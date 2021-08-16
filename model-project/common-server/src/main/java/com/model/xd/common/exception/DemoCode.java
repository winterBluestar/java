package com.model.xd.common.exception;

/**
 * @Description: 异常枚举
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: DemoCode
 * @date:2021/8/16 17:25
 */
public enum DemoCode {
    SUCCESS(200,"成功"),
    BAD_REQUEST(400,"未知请求"),
    UNAUTHORIZED(401,"未通过身份验证"),
    FORBIDDEN(403,"没有权限"),
    NOT_FOUND(404,"资源不存在"),
    METHOD_NOT_ALLOWED(405,"请求方法权限不够"),
    GONE(410,"资源已转移"),
    UNSUPPORTED_MEDIA_TYPE(415,"不支持的数据类型"),
    UNSUPPORTED_ENTITY(422,"无法处理的附件"),
    TOO_MANY_REQUESTS(429,"请求次数过多"),
    INTERNAL_SERVER_ERROR(500,"服务器异常");


    private final int code;

    private final String msg;

    DemoCode(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public int getCode() {
        return this.code;
    }

    public String getMsg() {
        return this.msg;
    }
}
