package com.model.xd.common.exception.message;

import lombok.Data;

@Data
public class CodeMessage {
    private int code;
    private String message;

    public CodeMessage(int code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 填充参数
     *
     * @param args
     * @return
     */
    public CodeMessage fillArgs(Object... args) {
        String message = String.format(this.message, args);
        return new CodeMessage(this.code, message);
    }

    public static final CodeMessage PARAM_NOT_MATCH = new CodeMessage(10001,"原因: %s");
    public static final CodeMessage BIND_ERROR = new CodeMessage(10002,"参数绑定异常: %s");
}
