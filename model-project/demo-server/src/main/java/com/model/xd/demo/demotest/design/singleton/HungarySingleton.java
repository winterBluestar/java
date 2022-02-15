package com.model.xd.demo.demotest.design.singleton;

public class HungarySingleton {

    private static HungarySingleton singleton = new HungarySingleton();

    private HungarySingleton(){}


    public static HungarySingleton getInstance() {

        return singleton;
    }

}
