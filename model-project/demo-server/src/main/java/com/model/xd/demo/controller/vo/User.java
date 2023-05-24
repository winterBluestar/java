package com.model.xd.demo.controller.vo;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import org.springframework.util.DigestUtils;

import java.util.ArrayList;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
@Data
@TableName(value = "user")
public class User {

    private String account;
    private String password;
    private String accessToken;
    private ArrayList<String> roles;

    public String md5Password() {
        String password = this.password;
        if (password != null) {
            return DigestUtils.md5DigestAsHex(password.getBytes());
        }
        return null;
    }
}
