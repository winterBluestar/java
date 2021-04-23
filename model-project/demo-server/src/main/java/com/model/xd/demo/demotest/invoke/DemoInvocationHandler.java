package com.model.xd.demo.demotest.invoke;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName DemoInvocationHandler
 * @Description: TODO
 * @Date 2021/4/23 16:18
 */
public class DemoInvocationHandler implements InvocationHandler {

    private final Object target;

    public DemoInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

        System.out.println("beforeMethod: "+method.getName());

        Object invoke = method.invoke(target, args);

        System.out.println("afterMethod: "+method.getName());

        return invoke;
    }
}
