package com.model.xd.demo.demotest.annotation;

import lombok.Data;

@Data
@FruitName(value = "苹果类")
@FruitColor(color = FruitColor.Color.YELLOW)
public class AppleDemo {

    @FruitName(value = "苹果")
    private String name;
    @FruitColor(color = FruitColor.Color.RED)
    private String color;
}
