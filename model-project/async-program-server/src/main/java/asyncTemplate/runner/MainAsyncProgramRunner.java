package asyncTemplate.runner;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/19
 */
public class MainAsyncProgramRunner implements Runnable {

    private static final Logger LOGGER = LoggerFactory.getLogger(MainAsyncProgramRunner.class);



    @Override
    public void run() {
        LOGGER.debug("mainAsyncProgramRunner正在执行----->>>线程id: {}, 线程名: {}", Thread.currentThread().getId(),
                        Thread.currentThread().getName());
    }
}
