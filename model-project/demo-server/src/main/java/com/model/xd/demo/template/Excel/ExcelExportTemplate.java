package com.model.xd.demo.template.Excel;

import com.model.xd.common.annotation.ExcelProperty;
import com.model.xd.common.exception.DemoRuntimeException;
import org.apache.commons.lang.ArrayUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.util.CollectionUtils;

import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.List;

/**
 * @author xudong.chen@zone-cloud.com 2023/7/12
 * @desc excel导出组装
 */
public class ExcelExportTemplate {

    /**
     * 组装并下载Excel到指定目录
     * 
     * @param workbook 工作簿
     * @param sheetName sheet名
     * @param fileName 文件名
     * @param list 数据集合
     */
    public static <T> void assembleAndDownloadExcel2Dic(Workbook workbook, String sheetName, String fileName,
                    List<T> list) {
        // 创建sheet页
        Sheet sheet = workbook.createSheet(sheetName);
        CollectionUtils.isEmpty(list);
        if (fileName == null) {
            throw new DemoRuntimeException("文件名不能为空");
        }
        FileOutputStream fileOutputStream = null;
        try {
            for (int i = 0; i < list.size(); i++) {
                // 创建行
                Row row = sheet.createRow(i);
                // 通过反射获取字段信息
                T t = list.get(i);
                Field[] declaredFields = t.getClass().getDeclaredFields();
                if (ArrayUtils.isNotEmpty(declaredFields)) {
                    for (Field declaredField : declaredFields) {
                        // 获取Excel导出字段注释信息
                        ExcelProperty excelAnnotation = declaredField.getAnnotation(ExcelProperty.class);
                        if (excelAnnotation != null) {
                            int index = excelAnnotation.index();
                            if (index > -1) {
                                // 创建Excel单元格并填充数据
                                Cell cell = row.createCell(index);
                                declaredField.setAccessible(true);
                                // todo 不同数据类型的数据需要做转换再填充到单元格
                                cell.setCellValue(String.valueOf(declaredField.get(t)));
                            }
                        }
                    }
                }
            }
            // 创建文件输出流并将流写入到文件中
            fileOutputStream = new FileOutputStream(fileName);
            workbook.write(fileOutputStream);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                // 关闭文件流和工作簿
                assert fileOutputStream != null;
                fileOutputStream.close();
                workbook.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
