package com.model.xd.demo.demotest.reflect;

import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;


/**
 * @author xudong.chen@zone-cloud.com 2023/3/4
 */
public class ReflectReplacePersonNameTest {
    public static void main(String[] args) throws NoSuchFieldException, IllegalAccessException {
        ReflectPerson reflectPerson = new ReflectPerson("张三","zhangsan",10);
        System.out.println(reflectPerson.toString());
        Field name = reflectPerson.getClass().getDeclaredField("name");
        // 设置对象字段为可访问
        name.setAccessible(true);
        name.set(reflectPerson, "李四");
//        ReflectionUtils.setField(name,reflectPerson,"李四");
        System.out.println(reflectPerson);
    }
}
