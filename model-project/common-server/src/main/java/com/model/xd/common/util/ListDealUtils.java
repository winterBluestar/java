package com.model.xd.common.util;

import com.google.common.collect.Lists;
import org.apache.poi.ss.formula.functions.T;

import java.util.ArrayList;
import java.util.List;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: ListDealUtils
 * @date:2021/8/5 11:26
 */
public class ListDealUtils {

    /**
     * 根据设定的长度分割集合
     *
     * @param paramList
     * @return
     */
    public static List<List<Object>> splitList(List<Object> paramList) {

        List<List<Object>> respList = Lists.newArrayList();

        for (int i = 0; i < paramList.size(); i = i + 2) {

            if (i + 2 > paramList.size()) {

                respList.add(paramList.subList(i, paramList.size()));
            } else {

                respList.add(paramList.subList(i, i + 2));
            }
        }

        return respList;
    }

    public static void main(String[] args) {

        List<Object> paramList = Lists.newArrayList();

//        paramList.add("1");
//        paramList.add("2");
//        paramList.add("3");
//        paramList.add("4");
//        paramList.add("5");
//        paramList.add("6");
//        paramList.add("7");
//        paramList.add("8");
//        paramList.add("9");

        paramList.add(new User("张三1", 21));
        paramList.add(new User("张三2", 22));
        paramList.add(new User("张三3", 23));
        paramList.add(new User("张三4", 24));
        paramList.add(new User("张三5", 25));
        paramList.add(new User("张三6", 26));
        paramList.add(new User("张三7", 27));
//        paramList.add(new User("张三8", 28));

        List<List<Object>> splitList = splitList(paramList);

        for (List<Object> objects : splitList) {
            System.out.println(objects);
        }
    }

    static class User {
        private String name;

        private Integer age;

        public User() {
        }

        public User(String name, Integer age) {
            this.name = name;
            this.age = age;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        @Override
        public String toString() {
            return "User{" +
                    "name='" + name + '\'' +
                    ", age=" + age +
                    '}';
        }
    }
}
