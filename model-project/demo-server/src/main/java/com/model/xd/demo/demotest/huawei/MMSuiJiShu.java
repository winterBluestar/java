package com.model.xd.demo.demotest.huawei;

import java.util.Arrays;
import java.util.Scanner;
import java.util.TreeSet;

/**
 * @author xudong.chen@zone-cloud.com 2023/3/15
 */
public class MMSuiJiShu {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextInt()) {
            int n = sc.nextInt();
            TreeSet<Integer> set = new TreeSet<>();
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) {
                    set.add(sc.nextInt()); // 保证添加的数字有序且不重复
                }
            }
            // 打印(迭代器来输出)
            for (Integer integer : set) {
                System.out.println(integer);
            }
        }
    }
}
