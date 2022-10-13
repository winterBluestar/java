package com.model.xd.demo.leetCode;

import java.util.Scanner;

/**
 * @author xudong.chen@zone-cloud.com 2022/10/13
 * @remark 求n!的值
 */
public class SumN {
    // n! ， sum=n!+(n+1)!+(n+2)!+...+m!,n,m 值由键盘输入 , 要求调用函数。
    //
    public static void main(String[] args) {
        Scanner scn = new Scanner(System.in);
        System.out.println("输入n:");
        int n = scn.nextInt();
        Scanner scm = new Scanner(System.in);
        System.out.println("输入m:");
        int m = scm.nextInt();
        Integer sum = sumFun(n, m);
        System.out.println("求出结果: " + sum);
    }

    private static Integer sumFun(int n, int m) {
        int c = n - m;
        if (c > 0) {
            System.out.println("m值不能比n小!");
        } else {
            Integer sum = 0;
            if (n == m) {
                Integer sumI = 1;
                for (int i = 1; i <= n; i++) {
                    sumI = sumI * i;
                }
                sum = sum + sumI;
                sum = sum * 2;
            } else {
                for (int i = n; i <= m; i++) {
                    Integer sumJ = 1;
                    for (int j = 1; j <= i; j++) {
                        sumJ = sumJ * j;
                    }
                    sum = sum + sumJ;
                }
            }
            return sum;
        }
        return null;
    }
}
