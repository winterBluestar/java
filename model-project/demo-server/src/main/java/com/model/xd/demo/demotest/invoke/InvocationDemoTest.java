package com.model.xd.demo.demotest.invoke;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName InvocationDemoTest
 * @Description: TODO
 * @Date 2021/4/23 16:24
 */
public class InvocationDemoTest {

    public static void main(String[] args) {
        InvocationTestReq testReq = new InvocationTestReq();

        DemoInvocationHandler invocationHandler = new DemoInvocationHandler(testReq);

    }
}
