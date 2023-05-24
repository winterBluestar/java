package com.model.xd.demo.controller.user;

import com.model.xd.common.response.ResponseResult;
import com.model.xd.common.util.ResponseResultUtil;
import com.model.xd.demo.controller.vo.User;
import com.model.xd.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
@RestController
@RequestMapping(value = "/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/login")
    public ResponseResult<User> login(User user) {
        return ResponseResultUtil.success(userService.login(user));
    }

    @PostMapping(value = "/login-out")
    public ResponseResult<User> loginOut(User user) {
        return ResponseResultUtil.success(userService.loginOut(user));
    }
}
