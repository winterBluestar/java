package com.model.xd.common.util;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.model.xd.common.response.PageInfoResp;
import org.springframework.util.CollectionUtils;

import java.util.List;

public class PageUtils {

    /**
     * data是数据库查询结果, 如果已经经过类型转换, 使用下面一个方法
     *
     * @param data
     * @param <T>
     * @return
     */
    public static <T> PageInfoResp<T> initPageInfoResp(List<T> data) {
        if (isEmptyList(data)) return new PageInfoResp<T>();
        PageInfo<T> pageInfo = new PageInfo<>(data);
        return new PageInfoResp<T>(pageInfo.getPageNum(), pageInfo.getPageSize(), pageInfo.getPages(), pageInfo.getTotal(), data);
    }

    public static <T> PageInfoResp<T> initPageInfoResp(List<T> data, Page page) {
        if (isEmptyList(data)) return new PageInfoResp<T>();
        PageInfo<T> pageInfo = new PageInfo<>(page);
        return new PageInfoResp<T>(pageInfo.getPageNum(), pageInfo.getPageSize(), pageInfo.getPages(), pageInfo.getTotal(), data);
    }

    /**
     * 已经经过类型转换
     *
     * @param pageInfo
     * @param <T>
     * @return
     */
    public static <T> PageInfoResp<T> initPageInfoResp(PageInfo<T> pageInfo) {
        if (isEmptyList(pageInfo.getList())) return new PageInfoResp<T>();
        return new PageInfoResp<T>(pageInfo.getPageNum(), pageInfo.getPageSize(), pageInfo.getPages(), pageInfo.getTotal(), pageInfo.getList());
    }

    /**
     * 判断是否为空集合
     *
     * @param data
     * @param <T>
     * @return
     */
    private static <T> boolean isEmptyList(List<T> data) {
        if (CollectionUtils.isEmpty(data)) {
            return true;
        }
        return false;
    }

    /**
     * 自定义分页
     *
     * @param currentPage
     * @param pageSize
     * @param list
     * @param <T>
     * @return
     */
    public static <T> PageInfo<T> buildPageInfo(Integer currentPage, Integer pageSize, List<T> list) {
        PageInfo<T> pageInfo = new PageInfo<>();
        pageInfo.setPageNum(currentPage <= 0 ? 1 : currentPage);
        pageInfo.setPageSize(pageSize);
        pageInfo.setTotal(list.size());
        //总页数
        Long pages = pageInfo.getTotal() % pageInfo.getPageSize() > 0 ? pageInfo.getTotal() / pageInfo.getPageSize() + 1 : pageInfo.getTotal() / pageInfo.getPageSize();
        pageInfo.setPages(Math.toIntExact(pages));

        if (pageInfo.getPageNum() > pageInfo.getPages()) {
            //当前页大于总页数
            pageInfo.setPageNum(pageInfo.getPages());
        } else if (pageInfo.getPageNum() < pageInfo.getPages()) {
            //当前页小于总页数
            pageInfo.setList(list.subList((pageInfo.getPageNum() - 1) * pageInfo.getPageSize(), pageInfo.getPageNum() * pageInfo.getPageSize() - 1));
        } else {
            //当前页等于总页数
            pageInfo.setList(list.subList((pageInfo.getPageNum() - 1) * pageInfo.getPageSize(), list.size() - 1));
        }
        return pageInfo;
    }

    public static void clear(Page page) {
        PageHelper.clearPage();
    }

    public static void clear() {
        PageHelper.clearPage();
    }

    //不适用pageHelper分页时
    public static Integer getOffSet(Integer currentPage, Integer pageSize) {
        return pageSize * (currentPage - 1);
    }

    public static Integer getTotalPage(Long rows, Integer pageSize) {
        return Math.toIntExact(rows % pageSize == 0 ? rows / pageSize : rows / pageSize + 1);
    }
}
