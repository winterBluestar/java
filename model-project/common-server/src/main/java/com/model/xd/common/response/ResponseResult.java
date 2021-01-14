package com.model.xd.common.response;

import lombok.Data;

@Data
public class ResponseResult<T> {
    private Integer code;

    private String message;

    private T data;

    public ResponseResult() {
    }

    public ResponseResult(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public ResponseResult(T data) {
        this.data = data;
    }

    public ResponseResult(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public ResponseResult<T> success() {
        this.code = 1;
        this.message = "success";
        return new ResponseResult<>(this.code, this.message);
    }

    public ResponseResult<T> success(T data) {
        this.code = 1;
        this.message = "success";
        this.data = data;
        return new ResponseResult<>(this.code, this.message, this.data);
    }

    public ResponseResult fail() {
        this.code = -1;
        this.message = "fail";
        return new ResponseResult<>(this.code, this.message);
    }

    public ResponseResult fail(Integer code, String message) {
        this.code = code;
        this.message = message;
        return new ResponseResult<>(this.code, this.message);
    }
}
