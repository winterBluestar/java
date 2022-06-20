package com.model.xd.demo.thread;

import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import com.model.xd.common.dto.resp.DemoInfoResp;

import java.util.concurrent.Callable;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName DemoCallableThreadHandlerTest
 * @Description: TODO
 * @Date 2021/7/7 9:38
 */
public class DemoCallableThreadHandlerTest implements Callable<DemoInfoResp> {

    public String demoId;
    public String demoCode;
    public String demoName;
    public Long demoValue;

    public DemoCallableThreadHandlerTest(String demoId, String demoCode, String demoName, long demoValue) {
        this.demoId = demoId;
        this.demoCode = demoCode;
        this.demoName = demoName;
        this.demoValue = demoValue;
    }

    @Override
    public DemoInfoResp call() throws Exception {
        return null;
    }
}
