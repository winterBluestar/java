package com.model.xd.common.mybatis;

/**
 * @author xudong.chen@zone-cloud.com 2023/5/18
 */
public interface CommonBaseMapper<T> {

    T selectOne(T t);
}
