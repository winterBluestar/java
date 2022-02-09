package com.model.xd.demo.thread;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.Callable;

@Slf4j
public class BeakDownHandler implements Callable<String> {

    public String timeSleep;

    public BeakDownHandler(String timeSleep) {

        this.timeSleep = timeSleep;
    }



    @Override
    public String call() throws Exception {

        Thread.currentThread().sleep(Integer.valueOf(timeSleep)*1000);

        System.out.println(Thread.currentThread().getName() + "沉睡: " + timeSleep + "秒");

        return timeSleep;
    }
}
