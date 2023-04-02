package com.model.xd.demo.demotest.aop.jdk;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class JdkAopProxyClass implements InvocationHandler {

    private Object target;

    /**
     * 返回代理实例
     *
     * @param target
     * @return
     */
    public Object returnProxy(Object target) {
        this.target = target;
        return Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), this);
    }


    /**
     * 在目标方法织入逻辑
     *
     * @param proxy  target
     * @param method
     * @param args
     * @return
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("代理类打印前置织入逻辑：JdkAopDemo1-before！");
        Object res = method.invoke(target, args);
        System.out.println("代理类打印后置织入逻辑：JdkAopDemo1-after！");
        return res;
    }
}
