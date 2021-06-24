package com.model.xd.demo.demotest.reflect;

import java.lang.reflect.Method;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName ReflectPersonrTest
 * @Description: TODO
 * @Date 2021/6/23 16:46
 */
public class ReflectPersonTest {
    public static void main(String[] args) {

        ReflectPerson person = new ReflectPerson();

        person.setCode("didi");
        person.setName("张三");
        person.setAge(12);

        System.out.println(person.toString());


        System.out.println("================分割线=================");


        try {
            Class clazz = Class.forName("com.model.xd.demo.demotest.reflect.ReflectPerson");

            ReflectPerson user = (ReflectPerson) clazz.newInstance();

            Method setName = clazz.getDeclaredMethod("setName", String.class);

            setName.invoke(user,"张三");

            System.out.println("用户名称: "+user.getName());

            Method getname = clazz.getDeclaredMethod("getName");

            String name = (String) getname.invoke(user);

            System.out.println(name);


        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
