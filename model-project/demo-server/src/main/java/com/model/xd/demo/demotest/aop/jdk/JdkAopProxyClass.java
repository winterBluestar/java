package com.model.xd.demo.demotest.aop.jdk;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class JdkAopProxyClass implements InvocationHandler {

    private Object target;

    public Object returnProxy(Object target) {
        this.target = target;
        return Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("代理类打印前置织入逻辑：JdkAopDemo1-before！");
        Object res = method.invoke(target, args);
        System.out.println("代理类打印后置织入逻辑：JdkAopDemo1-after！");
        return res;
    }
}
