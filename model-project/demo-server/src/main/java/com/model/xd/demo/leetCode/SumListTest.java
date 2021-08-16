package com.model.xd.demo.leetCode; 

import java.util.LinkedList;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: LeetCodeTest
 * @date:2021/8/12 11:40
 */
public class SumListTest {
    public static void main(String[] args) {

        LinkedList<Integer> l1 = new LinkedList<>();

        l1.add(9);
        l1.add(9);
        l1.add(9);
        l1.add(9);
        l1.add(9);
        l1.add(9);
        l1.add(9);

        LinkedList<Integer> l2 = new LinkedList<>();

        l2.add(9);
        l2.add(9);
        l2.add(9);
        l2.add(9);

        long before = System.currentTimeMillis();

        System.out.println(addTwoNumbers(l1, l2));

        long after = System.currentTimeMillis();

        System.out.println(after - before);

    }

    public static LinkedList<Integer> addTwoNumbers(LinkedList<Integer> l1, LinkedList<Integer> l2) {

        LinkedList<Integer> respLinkList = new LinkedList<>();

        if (l1.size() > l2.size()) {
            getSum(l1, l2, respLinkList);
        } else {
            getSum(l2, l1, respLinkList);
        }

        return respLinkList;
    }

    private static void getSum(LinkedList<Integer> l1, LinkedList<Integer> l2, LinkedList<Integer> respLinkList) {

        Integer temp = 0;

        for (int i = 0; i < l1.size(); i++) {

            Integer l2Num = 0;

            if (i + 1 > l2.size()) {
                l2Num = 0;
            } else {
                l2Num = l2.get(i);
            }

            Integer l1Num = l1.get(i);

            Integer sumNum = Math.addExact(Math.addExact(l1Num, l2Num), temp);

            if (sumNum >= 10) {
                respLinkList.add(i, Math.subtractExact(sumNum, 10));
                temp = 1;
            } else {
                respLinkList.add(i, sumNum);
                temp = 0;
            }
        }

        if (temp == 1) {
            respLinkList.add(1);
        }
    }
}
