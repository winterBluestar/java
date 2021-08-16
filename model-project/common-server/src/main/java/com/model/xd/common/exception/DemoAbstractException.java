package com.model.xd.common.exception;

import lombok.Data;

/**
 * @Description: 基础抽象异常, 其他业务异常继承此异常
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: DemoAbstracException
 * @date:2021/8/16 17:24
 */
@Data
public abstract class DemoAbstractException extends RuntimeException {

    private int code = DemoCode.INTERNAL_SERVER_ERROR.getCode();

    private String msg = DemoCode.INTERNAL_SERVER_ERROR.getMsg();

    public DemoAbstractException() {
    }

    public DemoAbstractException(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public DemoAbstractException(String message) {
        super(message);
    }
}
