package com.model.xd.common.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/19
 */
@Documented
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelProperty {

    /**
     * 字段名
     * 
     * @return
     */
    String value() default "";

    /**
     * 表格列索引
     * 
     * @return
     */
    int index() default -1;
}
