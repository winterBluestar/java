package com.model.xd.demo.demotest.annotation;

import com.model.xd.common.util.ApplicationContextUtils;
import org.springframework.context.ApplicationContext;

import java.lang.reflect.Field;
import java.util.Map;

public class FruitUtils {

    /**
     * 解析clazz对象
     * 获取注解上的值
     * 将值赋给属性字段
     *
     * @param clazz
     * @return
     * @throws IllegalAccessException
     * @throws InstantiationException
     */
    public static Object getFruitInfo(Class<?> clazz) {
        String strFruitName = " 水果名称：";
        String strFruitColor = " 水果颜色：";
        Object object = null;
        try {
            object = clazz.newInstance();
            // 判断类上是否包含注解xxx
            if (clazz.isAnnotationPresent(FruitName.class)) {
                FruitName annotation = clazz.getAnnotation(FruitName.class);
                System.out.println("这个类是关于水果：" + annotation.value() + "的类！");
            }
            if (clazz.isAnnotationPresent(FruitColor.class)) {
                FruitColor annotation = clazz.getAnnotation(FruitColor.class);
                System.out.println("这个类是关于水果颜色：" + annotation.color().name() + "的类！");
            }

            // 判断字段属性上是否包含注解xxx
            Field[] declaredFields = clazz.getDeclaredFields();
            if (declaredFields != null) {
                for (Field declaredField : declaredFields) {
                    if (declaredField.isAnnotationPresent(FruitName.class)) {
                        FruitName fruitName = declaredField.getAnnotation(FruitName.class);
                        declaredField.setAccessible(true);
                        declaredField.set(object, fruitName.value());
                        System.out.println(strFruitName + fruitName.value());
                    } else if (declaredField.isAnnotationPresent(FruitColor.class)) {
                        FruitColor fruitColor = declaredField.getAnnotation(FruitColor.class);
                        declaredField.setAccessible(true);
                        declaredField.set(object, fruitColor.color().name());
                        System.out.println(strFruitColor + fruitColor.color().name());
                    }
                }
            }
            return object;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return object;
    }

    public static Map<String, Object> getFruitNameBeans() {
        Map<String, Object> beansWithAnnotation = ApplicationContextUtils.getApplicationContext().getBeansWithAnnotation(FruitName.class);
        System.out.println("包含注解FruitName的bean有：" + beansWithAnnotation);
        return beansWithAnnotation;
    }
}
