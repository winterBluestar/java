package com.model.xd.demo.controller.dto;

import lombok.Data;

import java.util.List;

@Data
public class User {

    private String name;
    private int age;
    private List<String> hobbies;
}
