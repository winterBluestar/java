package com.model.xd.demo.demotest.design.singleton;

public class SingletonDemo {

    public static void main(String[] args) {

        // 饿汉式单例
        HungarySingleton hungarySingleton = HungarySingleton.getInstance();

        // 懒汉式单例
        LazySingleton lazySingleton = LazySingleton.getInstance();
    }

}
