package com.model.xd.common.dto.req;

import lombok.Data;

import java.io.Serializable;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName ArticleQueryReq
 * @Date 2021/1/21 15:56
 */
@Data
public class WordFileReq implements Serializable {
    private static final long serialVersionUID = 4359709211352400087L;

    //部门
    private String deptName;

    //公司
    private String company;

    //员工
    private String people;

    //电话
    private String phone;
}
