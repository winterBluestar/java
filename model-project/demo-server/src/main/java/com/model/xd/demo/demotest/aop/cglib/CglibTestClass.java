package com.model.xd.demo.demotest.aop.cglib;

public class CglibTestClass {
    public static void main(String[] args) {
        CglibAopProxyClass cglibAopProxyClass = new CglibAopProxyClass();
        CglibAopDemoTargetClass proxyClassInstance = (CglibAopDemoTargetClass) cglibAopProxyClass.getInstance(new CglibAopDemoTargetClass());
        proxyClassInstance.printCglibMessage();
    }
}
