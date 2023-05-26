package com.model.xd.demo.demotest.thread;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * @author xudong.chen 2023/5/23
 */
public class TestClass {

    public static void main(String[] args) {
        // 创建线程池
        ThreadPoolExecutor threadPoolExecutor =
                        new ThreadPoolExecutor(3, 5, 60, TimeUnit.SECONDS, new ArrayBlockingQueue<>(50));

        // 假设当前银行办理业务的客户为31人, 银行窗口为4个
        long start = System.currentTimeMillis();
        for (int i = 1; i <= 31; i++) {
            // 计算取余数
            int wb = i % 3;
            switch (wb) {
                case 0:
                    // 当余数为0时, 客户去1号窗口办理业务
                    threadPoolExecutor.execute(new BankTask(1, i));
                    break;
                case 1:
                    // 当余数为1时, 客户去2号窗口办理业务
                    threadPoolExecutor.execute(new BankTask(2, i));
                    break;
                case 2:
                    // 当余数为2时, 客户去3号窗口办理业务
                    threadPoolExecutor.execute(new BankTask(3, i));
                    break;
                default:
                    // 当余数不为上述值时, 客户去4号窗口办理业务
                    threadPoolExecutor.execute(new BankTask(4, i));
                    break;
            }
        }
        long end = System.currentTimeMillis();
        System.out.println("银行业务处理总共耗时: " + (end - start) + " ms");

    }

    public static class BankTask implements Runnable {

        private int windowNum;
        private int customerNum;

        public BankTask(int windowNum, int customerNum) {
            this.windowNum = windowNum;
            this.customerNum = customerNum;
        }

        public int getWindowNum() {
            return windowNum;
        }

        public void setWindowNum(int windowNum) {
            this.windowNum = windowNum;
        }

        public int getCustomerNum() {
            return customerNum;
        }

        public void setCustomerNum(int customerNum) {
            this.customerNum = customerNum;
        }

        @Override
        public void run() {
            try {
                StringBuffer sb = new StringBuffer();
                sb.append(this.getWindowNum()).append(this.getCustomerNum());
                System.out.println(
                                "=======窗口:　" + this.getWindowNum() + " 正在处理客户" + this.getCustomerNum() + "的业务=======");
                System.out.println("客户" + this.getCustomerNum() + "开始办理业务");
                Thread.sleep(2000);
                System.out.println(">>>>>>客户" + this.getCustomerNum() + "结束办理业务>>>>>>");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
