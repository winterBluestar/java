package com.model.xd.demo.thread;

import java.util.concurrent.*;

public class ThreadDemoTest {

    public static void main(String[] args) {

        ThreadPoolExecutor corePool = new ThreadPoolExecutor(5,10,10, TimeUnit.SECONDS,new ArrayBlockingQueue<>(1000),new NamedThreadFactory("corePool"));

        Future<String> firstSleep = corePool.submit(new BeakDownHandler("15"));
        Future<String> secondSleep = corePool.submit(new BeakDownHandler("18"));
        Future<String> thirdSleep = corePool.submit(new BeakDownHandler("20"));

        System.out.println("是否先执行这个");

        try {
            String time = firstSleep.get(20, TimeUnit.SECONDS);
            System.out.println(time);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            String time = secondSleep.get(20, TimeUnit.SECONDS);
            System.out.println(time);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            String time = thirdSleep.get(20, TimeUnit.SECONDS);
            System.out.println(time);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}
