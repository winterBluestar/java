package com.model.xd.common.dto.req.program;

import lombok.Data;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/26
 */
@Data
public class AsyncProgramExecuteRequestDTO {

    private String templateCode;

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }
}
