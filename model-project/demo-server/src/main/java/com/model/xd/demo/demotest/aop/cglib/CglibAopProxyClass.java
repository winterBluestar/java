package com.model.xd.demo.demotest.aop.cglib;

import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

public class CglibAopProxyClass implements MethodInterceptor {

    private Object target;

    /**
     * 返回代理实例
     *
     * @param target
     * @return
     */
    public Object getInstance(Object target) {
        this.target = target;
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(this.target.getClass());
        enhancer.setCallback(this);
        return enhancer.create();
    }

    /**
     * 拦截目标方法织入逻辑
     *
     * @param o           target
     * @param method
     * @param objects     args
     * @param methodProxy
     * @return
     * @throws Throwable
     */
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("Cglib代理类前置增强：Cglib-before");
        Object result = methodProxy.invokeSuper(o, objects);
        System.out.println("Cglib代理类后置增强：Cglib-after");
        return result;
    }
}
