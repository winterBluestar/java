package com.model.xd.demo.demotest.annotation;

import java.lang.annotation.*;

@Target({ElementType.FIELD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FruitColor {

    public enum Color {RED, GREEN, YELLOW}

    Color color() default Color.RED;
}
