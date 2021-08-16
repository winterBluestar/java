package com.model.xd.common.exception;


/**
 * @Description: 基础抽象异常, 其他业务异常继承此异常
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: DemoRuntimeException
 * @date:2021/8/16 17:22
 */
public class DemoRuntimeException extends DemoAbstractException {

    /**
     * 默认异常信息构造器
     */
    public DemoRuntimeException() {
        super();
    }

    /**
     * 自定义异常信息构造器
     *
     * @param msg
     */
    public DemoRuntimeException(String msg) {
        super(msg);
    }

    public DemoRuntimeException(DemoCode demoCode) {
        super(demoCode.getCode(), demoCode.getMsg());
    }

    /**
     * 自定义异常码和信息构造器
     *
     * @param code
     * @param msg
     */
    public DemoRuntimeException(int code, String msg) {
        super(code, msg);
    }
}
