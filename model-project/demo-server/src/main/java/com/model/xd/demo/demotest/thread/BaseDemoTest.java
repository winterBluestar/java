package com.model.xd.demo.demotest.thread;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName BaseDemoTest
 * @Description: TODO
 * @Date 2021/4/20 9:43
 */
public class BaseDemoTest {
    public static volatile int race = 0;

    public static void increase() {
        race++;
    }

    public static void main(String[] args) {
        Thread[] threads = new Thread[20];

        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(new Runnable() {
                @Override
                public void run() {
                    for (int j = 0; j < 10000; j++) {
                        increase();
                    }
                    System.out.println(Thread.currentThread() + "=====" + race);
                }
            });

            threads[i].start();

            System.out.println(Thread.currentThread() + "," + i + "=========" + threads[i].toString() + "=====race: " + race);
        }

        System.out.println("main-thread: "+Thread.currentThread() + "==================" + race);
    }
}
