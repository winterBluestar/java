package com.model.xd.demo.demotest.design.common;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName BCarFactory
 * @Description: TODO
 * @Date 2021/6/16 16:13
 */
public class BCarFactory implements CarFactory {
    @Override
    public Car getCar() {
        return new BCar();
    }
}
