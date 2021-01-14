package com.model.xd.common.dto.req;

import lombok.Data;

import java.io.Serializable;

@Data
public class DemoInfoReq implements Serializable {
    private static final long serialVersionUID = 4359709211352400087L;

    public String demoId;

    public String demoCode;

    public String demoName;

}
