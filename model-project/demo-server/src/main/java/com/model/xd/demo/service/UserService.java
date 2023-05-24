package com.model.xd.demo.service;

import com.model.xd.demo.controller.vo.User;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
public interface UserService {
    User login(User user);

    User loginOut(User user);
}
