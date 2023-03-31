package com.model.xd.demo.demotest.aop.jdk;

public class JdkAopTestClass {

    public static void main(String[] args) {
        JdkAopDemoInterface o = (JdkAopDemoInterface) new JdkAopProxyClass().returnProxy(new JdkAopDemoInterfaceImpl());
        o.printMessage();
    }
}
