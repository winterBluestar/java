package com.model.xd.demo.leetCode;

import java.util.ArrayList;

/**
 * @author xudong.chen@zone-cloud.com 2022/10/24
 */
public class Demo1 {
    public static void main(String[] args) {
        ArrayList<Integer> arraylist = new ArrayList<>();
        arraylist.add(0);
        arraylist.add(1);
        arraylist.add(2);
        arraylist.add(3);
        arraylist.add(4);

        arraylist.remove(1);

        System.out.println(arraylist);
        System.out.println(arraylist.get(0));
        System.out.println(arraylist.get(1));
        System.out.println(arraylist.get(2));
        System.out.println(arraylist.get(3));

        Integer one = 1;
        System.out.println("1".equals(one));
    }
}
