package com.model.xd.demo.demotest.huawei;

/**
 * @author xudong.chen@zone-cloud.com 2023/3/15
 */
public class QiShuiPingTest {
    public static void main(String[] args) {
        int[] nArr = {3, 10, 81, 0};
        for (int i = 0; i < nArr.length - 1; i++) {
            int n = nArr[i];
            int result = getPing(n);
            System.out.println("总共可以购买: " + result + " 瓶!");
            System.out.println("===================================");
        }
    }

    public static int getPing(int n) {
        // 首先计算能买多少瓶
        int a = n / 3;
        int b = n % 3;
        int result = getOtherNum(a, b);
        return result;
    }

    public static int getOtherNum(int a, int b) {
        if (a == b && a == 0) {
            return 0;
        }
        int tem = a;
        // 再计算买了的瓶数和剩下的瓶数能买多少瓶
        int c = a + b;
        while (c >= 3) {
            a = c / 3;
            b = c % 3;
            tem = tem + a;
            c = a + b;
        }
        if (a == 2 || b == 2 || c == 2) {
            tem = tem + 1;
        }
        return tem;
    }
}
