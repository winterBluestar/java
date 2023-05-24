package com.model.xd.demo.service.impl;

import com.model.xd.common.exception.DemoRuntimeException;
import com.model.xd.common.util.StrUtil;
import com.model.xd.demo.controller.vo.User;
import com.model.xd.demo.mapper.UserMapper;
import com.model.xd.demo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public User login(User user) {
        User userQueryReq = new User();
        userQueryReq.setAccount(user.getAccount());
        userQueryReq.setPassword(user.md5Password());
        // 校验账号密码
        User userQueryRes = userMapper.selectOne(userQueryReq);
        if (userQueryRes != null) {
            // 生成accessToken
            String accessToken = StrUtil.uuid();
            // 将accessToken存入Redis缓存
            redisTemplate.opsForValue().set(user.getAccount(), accessToken, 120, TimeUnit.MINUTES);
            // 返回user信息给客户端
            return userQueryRes;
        } else {
            throw new DemoRuntimeException("登录用户不存在, 请重试!");
        }
    }

    @Override
    public User loginOut(User user) {
        return null;
    }
}
