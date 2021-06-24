package com.model.xd.demo.demotest.design.JDKDynamic;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName JDKDynamicProxyTest
 * @Description: TODO
 * @Date 2021/6/23 11:28
 */
public class JDKDynamicProxyTest {

    public static void main(String[] args) {

        //bob被代理之前
        Person bob = new Bob();

        System.out.println("bob被代理之前执行: ");

        bob.doSomething();

        System.out.println("===============分割线====================");

        //bob被代理之后
        System.out.println("bob被代理之后执行: ");

        Person newPerson = new JDKDynamicProxy(new Bob()).getTarget();

        newPerson.doSomething();
    }
}
