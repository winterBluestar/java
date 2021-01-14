package com.model.xd.common.dto.resp;

import com.alibaba.excel.annotation.ExcelIgnore;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
public class DemoInfoResp implements Serializable {
    private static final long serialVersionUID = 4359709211352400087L;

    @ExcelProperty(value = "测试ID")
    public String demoId;

    @ExcelProperty(value = "测试编码")
    public String demoCode;

    @ExcelProperty(value = "测试名称")
    public String demoName;

    @ExcelIgnore
    public Long demoValue;
}
