package com.model.xd.demo.template.Excel;

import com.model.xd.common.annotation.ExcelProperty;
import jdk.nashorn.internal.objects.annotations.Constructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.ArrayList;
import java.util.List;

/**
 * @author xudong.chen@zone-cloud.com 2023/7/12
 */
public class ExcelExportTest {

    public static void main(String[] args) {
        Workbook workbook = new XSSFWorkbook();
        List<ExcelDemo> excelDemoList = new ArrayList<>();
        ExcelDemo excelDemo = new ExcelDemo("张三", "男", "20", "湖南长沙");
        ExcelDemo excelDemo1 = new ExcelDemo("李四", "女", "21", "湖南常德");
        ExcelDemo excelDemo2 = new ExcelDemo("王五", "未知", "22", "湖南湘潭");
        ExcelDemo excelDemo3 = new ExcelDemo("姓名", "性别", "年龄", "地址");
        excelDemoList.add(excelDemo);
        excelDemoList.add(excelDemo1);
        excelDemoList.add(excelDemo2);
        excelDemoList.add(0,excelDemo3);
        String fileName = "model-project/demo-server/src/main/resources/files/测试下载excel.xlsx";
        ExcelExportTemplate.assembleAndDownloadExcel2Dic(workbook, "测试sheet页", fileName, excelDemoList);
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExcelDemo {
        @ExcelProperty(index = 0)
        private String name;
        @ExcelProperty(index = 1)
        private String sex;
        @ExcelProperty(index = 2)
        private String age;
        @ExcelProperty(index = 3)
        private String address;
    }
}
