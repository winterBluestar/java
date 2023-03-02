package com.model.xd.demo.sort;

import java.util.Arrays;

/**
 * @author xudong.chen@zone-cloud.com 2023/3/2
 */
public class SortDemo {
    public static void main(String[] args) {
        // 冒泡排序
        int[] arrays1 = {3, 33, 23, 43, 11, 2, 35, 76, 22, 46, 6, 7, 8, 19, 50, 43};
        bubbleSortMethod(arrays1);
        System.out.println("数组冒泡排序: " + Arrays.toString(arrays1));

        // 选择排序
        int[] arrays2 = {3, 33, 23, 43, 11, 2, 35, 76, 22, 46, 6, 7, 8, 19, 50, 43};
        selectionSortMethod(arrays2);
        System.out.println("数组选择排序: " + Arrays.toString(arrays2));

        // 快速排序
        int[] arrays3 = {3, 33, 23, 43, 11, 2, 35, 76, 22, 46, 6, 7, 8, 19, 50, 43};
        quickSortMethod(arrays3);
        System.out.println("数组快速排序: " + Arrays.toString(arrays3));
    }

    /**
     * 快速排序
     * 
     * @param arrays
     */
    private static void quickSortMethod(int[] arrays) {
        quickSortMethod(arrays, 0, arrays.length - 1);
    }

    private static void quickSortMethod(int[] arrays, int left, int right) {
        // System.out.println("最上层递归开始left: " + left + ", right: " + right);
        if (arrays == null || left >= right || arrays.length <= 0) {
            return;
        }
        int mid = partition(arrays, left, right);
        // System.out.println("left新一轮递归开始的mid值: " + mid + ",left: " + left + ", right: " + right);
        //quickSortMethod(arrays, left, mid);
        // System.out.println("right新一轮递归开始的mid值: " + mid + ",left: " + left + ", right: " + right);
        quickSortMethod(arrays, mid + 1, right);
    }

    private static int partition(int[] arrays, int left, int right) {
        int tempNum = arrays[left];
        while (left < right) {
            // System.out.println("==========前========");
            // System.out.println("0 arrays: " + Arrays.toString(arrays));
            // System.out.println("1 left: " + left + ", right: " + right + ", tempNum: " + tempNum);
            while (tempNum <= arrays[right] && left < right) {
                --right;
            }
            // System.out.println("2 left: " + left + ", right: " + right + ", tempNum: " + tempNum);
            if (left < right) {
                arrays[left] = arrays[right];
                ++left;
            }
            // System.out.println("3 left: " + left + ", right: " + right + ", tempNum: " + tempNum);
            while (tempNum >= arrays[left] && left < right) {
                ++left;
            }
            // System.out.println("4 left: " + left + ", right: " + right + ", tempNum: " + tempNum);
            if (left < right) {
                arrays[right] = arrays[left];
                --right;
            }
            // System.out.println("5 left: " + left + ", right: " + right + ", tempNum: " + tempNum);
            // System.out.println("1 arrays: " + Arrays.toString(arrays));
        }
        arrays[left] = tempNum;
        // ystem.out.println("每次递归结束的mid值: " + left);
        // ystem.out.println("2 arrays: " + Arrays.toString(arrays));
        // ystem.out.println("==========后========" + "\n");
        return left;
    }

    /**
     * 选择排序
     * 
     * @param arrays
     */
    private static void selectionSortMethod(int[] arrays) {
        if (arrays == null || arrays.length <= 0) {
            return;
        }
        for (int i = 0; i < arrays.length; i++) {
            for (int j = i + 1; j < arrays.length; j++) {
                if (arrays[i] > arrays[j]) {
                    int tempNum = arrays[j];
                    arrays[j] = arrays[i];
                    arrays[i] = tempNum;
                }
            }
        }
    }

    /**
     * 冒泡排序
     * 
     * @param arrays
     * @return
     */
    private static void bubbleSortMethod(int[] arrays) {
        if (arrays == null || arrays.length <= 0) {
            return;
        }
        for (int j = 0; j < arrays.length; j++) {
            for (int i = 0; i < arrays.length - j; i++) {
                int tempNum;
                if (i + 1 < arrays.length - j) {
                    int element = arrays[i];
                    int nextElement = arrays[i + 1];
                    if (element > nextElement) {
                        tempNum = nextElement;
                        arrays[i + 1] = element;
                        arrays[i] = tempNum;
                    }
                }
            }
        }
    }
}
