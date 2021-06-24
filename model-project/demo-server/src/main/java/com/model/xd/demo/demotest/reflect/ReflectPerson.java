package com.model.xd.demo.demotest.reflect;

import lombok.Data;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName ReflectPerson
 * @Description: TODO
 * @Date 2021/6/23 16:45
 */
@Data
public class ReflectPerson {

    private String name;

    private String code;

    private Integer age;

    public ReflectPerson() {
    }

    public ReflectPerson(String name, String code, Integer age) {
        this.name = name;
        this.code = code;
        this.age = age;
    }


}
