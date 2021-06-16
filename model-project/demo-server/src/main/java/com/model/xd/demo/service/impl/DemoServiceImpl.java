package com.model.xd.demo.service.impl;


import com.alibaba.excel.EasyExcel;
import java.lang.reflect.InvocationHandler;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.support.ExcelTypeEnum;
import com.alibaba.excel.write.builder.ExcelWriterSheetBuilder;
import com.alibaba.excel.write.metadata.WriteTable;
import com.alibaba.excel.write.metadata.WriteWorkbook;
import com.github.pagehelper.PageHelper;
import com.model.xd.common.dto.req.DemoInfoReq;
import com.model.xd.common.dto.req.DemoQueryReq;
import com.model.xd.common.dto.resp.DemoInfoResp;
import com.model.xd.common.response.PageInfoResp;
import com.model.xd.common.util.FileUtil;
import com.model.xd.common.util.PageUtils;
import com.model.xd.demo.mapper.DemoMapper;
import com.model.xd.demo.service.DemoService;
import com.model.xd.common.util.StrUtil;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.RequestBody;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.util.*;


@Service
public class DemoServiceImpl implements DemoService {

    @Autowired
    private DemoMapper demoMapper;

    /**
     * 新增或修改demoInfo
     *
     * @param req
     * @return
     */
    @Override
    public Integer insertOrUpdateDemoInfo(DemoInfoReq req) {
        if (StringUtils.isBlank(req.getDemoId())) {
            //新增
            req.setDemoId(StrUtil.uuid());
        } else {
            //修改
            demoMapper.deleteDemoInfoById(req.getDemoId());
        }
        return demoMapper.insertOrUpdateDemoInfo(req);
    }

    /**
     * 查询所有demoInfo
     *
     * @param demoId
     * @return
     */
    @Override
    public DemoInfoResp queryDemoInfo(String demoId) {
        return demoMapper.queryDemoInfo(demoId);
    }

    /**
     * 分页查询demoInfo
     *
     * @param req
     * @return
     */
    @Override
    public PageInfoResp<DemoInfoResp> queryPageDemoInfo(DemoQueryReq req) {
        PageHelper.startPage(req.getCurrentPage(), req.getPageSize());
        List<DemoInfoResp> respList = demoMapper.queryDemoPageInfo(req);
        if (!CollectionUtils.isEmpty(respList)) {
            return PageUtils.initPageInfoResp(respList);
        }
        return new PageInfoResp<DemoInfoResp>(req.getCurrentPage(), req.getPageSize(), 0, 0L, new ArrayList<DemoInfoResp>());
    }

    /**
     * 导出动态表格
     *
     * @param req
     * @return
     */
    @Override
    public String export(@RequestBody DemoQueryReq req, HttpServletResponse response) throws Exception {
        PageInfoResp<DemoInfoResp> pageInfoResp = queryPageDemoInfo(req);
        List<DemoInfoResp> respList = pageInfoResp.getData();

        if (CollectionUtils.isEmpty(respList)) {
            return null;
        }

        String fileName = FileUtil.getPath() + "dynamicWrite" + System.currentTimeMillis() + ".xlsx";
        FileOutputStream fileOutputStream = new FileOutputStream(fileName);

//        EasyExcel.write(fileName).head(head()).sheet("demo导出模板").doWrite(respList);

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("demo信息");
        XSSFRow topRow = sheet.createRow(0);
        List<String> headList = head();
        for (int i = 0; i < headList.size(); i++) {
            topRow.createCell(i).setCellValue(headList.get(i));
        }

        HashMap<String, List<DemoInfoResp>> listMap = new HashMap<String, List<DemoInfoResp>>();
        for (String head : headList) {
            listMap.put(head, respList);
        }

        Set<Map.Entry<String, List<DemoInfoResp>>> entrySet = listMap.entrySet();

        Integer i = 1;
        for (Map.Entry<String, List<DemoInfoResp>> entry : entrySet) {
            XSSFRow currentRow = sheet.createRow(i);
            for (int j = 0; j < headList.size(); j++) {
                if (headList.get(j).equals(entry.getKey())) {
                    currentRow.createCell(j).setCellValue(entry.getValue().get(0).demoName);
                }
            }
            i++;
        }

        workbook.write(fileOutputStream);
        fileOutputStream.close();

//        setHeader(response, workbook);

        return null;

    }

    /**
     * 浏览器直接下载表格
     *
     * @param response
     * @return
     * @throws Exception
     */
    @Override
    public String desktopExport(HttpServletResponse response) throws Exception {
        DemoQueryReq req = new DemoQueryReq();
        PageInfoResp<DemoInfoResp> pageInfoResp = queryPageDemoInfo(req);
        List<DemoInfoResp> respList = pageInfoResp.getData();

        if (CollectionUtils.isEmpty(respList)) {
            return null;
        }

        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("demo信息");
        XSSFRow topRow = sheet.createRow(0);
        List<String> headList = head();
        for (int i = 0; i < headList.size(); i++) {
            topRow.createCell(i).setCellValue(headList.get(i));
        }

        HashMap<String, List<DemoInfoResp>> listMap = new HashMap<String, List<DemoInfoResp>>();
        for (String head : headList) {
            listMap.put(head, respList);
        }

        Set<Map.Entry<String, List<DemoInfoResp>>> entrySet = listMap.entrySet();

        Integer i = 1;
        for (Map.Entry<String, List<DemoInfoResp>> entry : entrySet) {
            XSSFRow currentRow = sheet.createRow(i);
            for (int j = 0; j < headList.size(); j++) {
                if (headList.get(j).equals(entry.getKey())) {
                    currentRow.createCell(j).setCellValue(entry.getValue().get(0).demoName);
                }
            }
            i++;
        }

        setHeader(response, workbook);

        return null;
    }

    /**
     * 导出表格设置header
     *
     * @param response
     * @param workbook
     * @throws IOException
     */
    private void setHeader(HttpServletResponse response, XSSFWorkbook workbook) throws IOException {
        OutputStream out = response.getOutputStream();
        try {
            String newFileName = "test" + ExcelTypeEnum.XLSX.getValue();
            response.setContentType("application/x-msdownload");
            response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(newFileName, "UTF-8"));
            workbook.write(out);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            out.close();
        }
    }

    /**
     * 常规导出
     *
     * @param req
     * @param response
     * @return
     */
    @Override
    public String usualExportDemoInfo(DemoQueryReq req, HttpServletResponse response) {
        PageInfoResp<DemoInfoResp> pageInfoResp = queryPageDemoInfo(req);
        List<DemoInfoResp> respList = pageInfoResp.getData();

        String fileName = FileUtil.getPath() + "sampleWrite" + System.currentTimeMillis() + ".xlsx";
        EasyExcel.write(fileName, DemoInfoResp.class).sheet("表1").doWrite(respList);


        WriteWorkbook workbook = new WriteWorkbook();


        return null;
    }

    private List<String> head() {
        List<List<String>> list = new ArrayList<List<String>>();
        List<String> head0 = new ArrayList<String>();
        head0.add("demoId");
        head0.add("demoCode");
        head0.add("时间");
        head0.add("间隔符");
        head0.add("demoName");
        list.add(head0);
        return head0;
    }

    /**
     * 集合深拷贝
     *
     * @param src
     * @param <T>
     * @return
     * @throws IOException
     * @throws ClassNotFoundException
     */
    public static <T> List<T> deepCopy(List<T> src) throws IOException, ClassNotFoundException {
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        ObjectOutputStream objectOut = new ObjectOutputStream(byteOut);
        objectOut.writeObject(src);
        ByteArrayInputStream byteInput = new ByteArrayInputStream(byteOut.toByteArray());
        ObjectInputStream objectInput = new ObjectInputStream(byteInput);
        return (List<T>) objectInput.readObject();
    }

    /**
     * 发送响应流方法
     *
     * @param response
     * @param fileName
     */
    public void setResponseHeader(HttpServletResponse response, String fileName) {
        try {
            try {
                fileName = new String(fileName.getBytes(), "ISO8859-1");
            } catch (UnsupportedEncodingException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            response.setContentType("application/octet-stream;charset=ISO8859-1");
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
            response.addHeader("Pargam", "no-cache");
            response.addHeader("Cache-Control", "no-cache");
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
