package com.model.xd.demo.mapper;

import com.model.xd.common.mybatis.CommonBaseMapper;
import com.model.xd.demo.controller.vo.User;
import org.springframework.stereotype.Repository;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
@Repository
public interface UserMapper extends CommonBaseMapper<User> {
}
