package com.model.xd.demo.demotest.annotation;

public class AnnotationTest {
    public static void main(String[] args) {
        AppleDemo apple = (AppleDemo) FruitUtils.getFruitInfo(AppleDemo.class);
        System.out.println(apple != null ? apple : "没有返回对象");
    }
}
