package com.model.xd.demo.asyncProgram;

import com.model.xd.common.annotation.DemoHandler;
import asyncTemplate.template.AbstractAsyncTemplate;
import com.model.xd.common.dto.req.DemoInfoReq;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/19
 */
@DemoHandler("test")
@Component
@Order(0)
public class TestTemplate extends AbstractAsyncTemplate<DemoInfoReq> {

    public TestTemplate(){
        System.out.println("===============================测试order（0）==========================");
    }
}
