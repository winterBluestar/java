package com.model.xd.common.advice;

import com.model.xd.common.exception.DemoRuntimeException;
import com.model.xd.common.exception.message.CodeMessage;
import com.model.xd.common.response.ResponseResult;
import com.model.xd.common.util.ResponseResultUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.NoHandlerFoundException;


/**
 * @Description: 异常拦截处理
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: GlobalExceptionHandler
 * @date:2021/8/16 17:00
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ResponseBody
    @ExceptionHandler(value = Exception.class)
    public ResponseResult defaultErrorHandler(Exception e) {

        log.error("global error, ", e);
        ResponseResult result = ResponseResultUtil.fail();
        result.setMessage(e.getMessage());

        if (e instanceof NoHandlerFoundException) {
            result.setCode(404);
        } else if (e instanceof MethodArgumentNotValidException) {
            MethodArgumentNotValidException ex = (MethodArgumentNotValidException) e;
            //message里面不需要写字段名
            //String msg = ex.getBindingResult().getFieldError().getField() +
            //        ex.getBindingResult().getFieldError().getDefaultMessage();
            String msg = ex.getBindingResult().getFieldError().getDefaultMessage();
            return ResponseResultUtil.fail(CodeMessage.BIND_ERROR.fillArgs(msg));
        } else if (e instanceof BindException) {
            BindException ex = (BindException) e;
            //message里面不需要写字段名
            //String msg = ex.getBindingResult().getFieldError().getField() +
            //        ex.getBindingResult().getFieldError().getDefaultMessage();
            String msg = ex.getBindingResult().getFieldError().getDefaultMessage();
            return ResponseResultUtil.fail(CodeMessage.BIND_ERROR.fillArgs(msg));
        } else if (e instanceof DemoRuntimeException) {
            DemoRuntimeException ee = (DemoRuntimeException) e;
            result.setCode(ee.getCode());
            result.setMessage(ee.getMessage());
        } else {
            result.setCode(500);
            result.setMessage(e.getMessage());
        }
        return result;
    }
}
