package com.model.xd.demo.job;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * @author xudong.chen@zone-cloud.com 2022/6/21
 */
public class MyJob implements Job {
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        for (int i = 0; i < 50; i++) {
            System.out.println(context.getJobDetail().getJobDataMap().get("myTest"));
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
