package com.model.xd.demo.demotest.design.factorymode.easyFactory;

import com.model.xd.demo.demotest.design.common.Car;
import com.model.xd.demo.demotest.design.common.CarEnum;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName CarFactoryTest
 * @Description: TODO
 * @Date 2021/6/16 15:52
 */
public class CarFactoryTest {
    public static void main(String[] args) {
        CarFactory carFactory = new CarFactory();

        Car car = carFactory.getCar(CarEnum.ACar.name());

        car.run();

        System.out.println("================================");

        Car bCar = carFactory.getCar(CarEnum.BCar.name());

        bCar.run();
    }
}
