package com.model.xd.common.util;

import com.model.xd.common.response.ResponseResult;

public class ResponseResultUtil {

    public static ResponseResult success() {
        return new ResponseResult().success();
    }

    public static<T> ResponseResult<T> success(T data) {
        return new ResponseResult().success(data);
    }

    public static ResponseResult fail() {
        return new ResponseResult().fail();
    }

    public static ResponseResult fail(Integer code, String message) {
        return new ResponseResult().fail(code, message);
    }
}
