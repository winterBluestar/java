package com.model.xd.demo.demotest.design.common;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName ACarFactory
 * @Description: TODO
 * @Date 2021/6/16 16:12
 */
public class ACarFactory implements CarFactory {
    @Override
    public Car getCar() {
        return new ACar();
    }
}
