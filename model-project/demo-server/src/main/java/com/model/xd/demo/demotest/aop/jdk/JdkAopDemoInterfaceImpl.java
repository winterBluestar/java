package com.model.xd.demo.demotest.aop.jdk;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class JdkAopDemoInterfaceImpl implements JdkAopDemoInterface{

    private static final Logger logger = LoggerFactory.getLogger(JdkAopDemoInterfaceImpl.class);

    @Override
    public void printMessage() {
        System.out.println("被代理类打印信息：AopDemoClass");
        logger.debug("打印被代理类日志");
    }
}
