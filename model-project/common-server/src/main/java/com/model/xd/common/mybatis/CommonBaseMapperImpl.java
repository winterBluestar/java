package com.model.xd.common.mybatis;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
public class CommonBaseMapperImpl implements CommonBaseMapper {

    @Autowired
    private BaseMapper commonBaseMapper;

    @Override
    public Object selectOne(Object o) {
        QueryWrapper<Object> objectQueryWrapper = new QueryWrapper<>(o);
        return commonBaseMapper.selectOne(objectQueryWrapper);
    }
}
