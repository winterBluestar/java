package com.model.xd.common.dto.req;

import lombok.Data;

@Data
public class basePageProperty {

    public Integer currentPage = 1;

    public Integer pageSize = 20;
}
