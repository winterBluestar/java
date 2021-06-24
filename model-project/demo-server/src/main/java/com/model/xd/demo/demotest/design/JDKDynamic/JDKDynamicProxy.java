package com.model.xd.demo.demotest.design.JDKDynamic;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName JDKDynamicProxy
 * @Description: jdk动态代理模式
 * @Date 2021/6/23 11:21
 */
public class JDKDynamicProxy implements InvocationHandler {

    Person target;

    public JDKDynamicProxy (Person person) {
        this.target = person;
    }

    public Person getTarget(){
        return (Person) Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), this);
    }

    @Override
    public Person invoke(Object proxy, Method method, Object[] args) throws Throwable {

        //被代理前执行
        System.out.println("JDKDynamicProxy do someThing before!!");

        //被代理执行方法
        Person result = (Person) method.invoke(target, args);

        //被代理后执行方法
        System.out.println("JDKDynamicProxy do someThing after!!");

        return result;
    }
}
