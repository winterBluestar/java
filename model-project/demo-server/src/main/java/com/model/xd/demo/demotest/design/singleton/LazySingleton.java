package com.model.xd.demo.demotest.design.singleton;

public class LazySingleton {
    // 1. 最简化饿汉式单例, 但是线程安全
//    private static LazySingleton singleton;
//
//    private LazySingleton(){}
//
//    public static LazySingleton getInstance() {
//
//        if (singleton == null) {
//
//            singleton = new LazySingleton();
//        }
//
//        return singleton;
//    }


    // 2. 加锁之后的懒汉式单例, 实现线程安全, 但是影响性能, 因为在调用方法的时候就把锁加上了
//    private static LazySingleton singleton;
//
//    private LazySingleton(){}
//
//    public static synchronized LazySingleton getInstance() {
//
//        if (singleton == null) {
//
//            singleton = new LazySingleton();
//        }
//
//        return singleton;
//    }

    // 3. 使用同步代码块加锁之后的懒汉式单例, 比2版本好, 不需要调用方法就开始加锁,
    // 但是由于volatile关键字可能会屏蔽掉虚拟机中一些必要的代码优化，所以运行效率并不是很高
//    private volatile static LazySingleton singleton;
//
//    private LazySingleton(){}
//
//    public static LazySingleton getInstance() {
//
//        if (singleton == null) {
//
//            synchronized (LazySingleton.class) {
//
//                if (singleton == null) {
//
//                    singleton = new LazySingleton();
//                }
//            }
//        }
//
//        return singleton;
//    }

    // 4. 通过静态内部类来实现
    private LazySingleton(){}

    // 使用一个内部类来维护单例
    private static class LazySingletonFactory{
        private static LazySingleton singleton = new LazySingleton();
    }

    // 获取实例
    public static LazySingleton getInstance() {
        return LazySingletonFactory.singleton;
    }

    // 如果该对象被用于序列化，可以保证对象在序列化前后保持一致
    public Object readResolve(){
        return getInstance();
    }
}
