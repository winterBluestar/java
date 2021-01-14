package com.model.xd.common.response;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageInfoResp<T> implements Serializable {

    private static final long serialVersionUID = 4359709211352400087L;

    //当前页,默认为 1
    private Integer currentPage = 1;

    //每页条数,默认为 20
    private Integer pageSize = 20;

    //总页数
    private Integer totalPages;

    //总条数
    private Long rows;

    //对象详情
    private List<T> data;

    //是否存在下一页 0-不存在 1-存在
    private Integer isMore;

    public PageInfoResp() {
    }

    public PageInfoResp(Integer currentPage, Integer pageSize, Integer totalPages, Long rows, List<T> data) {
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalPages = totalPages;
        this.rows = rows;
        this.data = data;
        this.isMore = currentPage >= totalPages ? 0 : 1;
    }
}
