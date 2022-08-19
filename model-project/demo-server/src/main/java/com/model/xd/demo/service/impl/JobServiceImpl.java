package com.model.xd.demo.service.impl;

import com.model.xd.demo.job.MyJob;
import lombok.extern.slf4j.Slf4j;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.SchedulerException;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.stereotype.Service;

/**
 * @author xudong.chen@zone-cloud.com 2022/6/21
 */
@Service
@Slf4j
public class JobServiceImpl {

    public void testJob() throws SchedulerException {
        // 构建jobDetail
        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put("one", "1");
        jobDataMap.put("two", "2");
        jobDataMap.put("three", "3");
        jobDataMap.put("four", "4");
        JobDetail jobDetail =
                        JobBuilder.newJob(MyJob.class).withIdentity("我的测试", "测试组1").setJobData(jobDataMap).build();

        CronScheduleBuilder cronScheduleBuilder = CronScheduleBuilder.cronSchedule("");

        StdSchedulerFactory stdSchedulerFactory = new StdSchedulerFactory();

    }
}
