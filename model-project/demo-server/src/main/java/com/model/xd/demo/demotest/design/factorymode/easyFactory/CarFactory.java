package com.model.xd.demo.demotest.design.factorymode.easyFactory;

import com.model.xd.demo.demotest.design.common.ACar;
import com.model.xd.demo.demotest.design.common.BCar;
import com.model.xd.demo.demotest.design.common.Car;
import com.model.xd.demo.demotest.design.common.CarEnum;
import org.apache.commons.lang.StringUtils;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName CarFactory
 * @Description: TODO
 * @Date 2021/6/16 15:46
 */
public class CarFactory {
    private String carType;

    public CarFactory(String carType) {
        this.carType = carType;
    }

    public CarFactory() {

    }

    public String getCarType() {
        return carType;
    }

    public void setCarType(String carType) {
        this.carType = carType;
    }

    public Car getCar(String carType) {

        if (StringUtils.isBlank(carType)) return null;

        return carType.equals(CarEnum.ACar.name()) ? new ACar() : new BCar();
    }
}
