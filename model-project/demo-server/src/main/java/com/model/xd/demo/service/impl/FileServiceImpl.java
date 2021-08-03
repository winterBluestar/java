package com.model.xd.demo.service.impl;

import com.model.xd.common.dto.req.WordFileReq;
import com.model.xd.demo.mapper.FileMapper;
import com.model.xd.demo.service.FileService;
import org.apache.poi.POIXMLDocument;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: FileServiceImpl
 * @date:2021/7/30 16:34
 */
@Service
public class FileServiceImpl implements FileService {

    @Autowired
    private FileMapper fileMapper;

    /**
     * 下载Word文档
     * 将Word文档中需要替换的字符串替换掉
     * 不改变样式
     *
     * @param req
     * @param request
     * @param response
     * @return
     */
    @Override
    public String getWordFile(WordFileReq req, HttpServletRequest request, HttpServletResponse response) {

        String filePath;

//        filePath = FileServiceImpl.class.getClassLoader().getResource("").getPath().concat("templates/测试替换字符串文档.docx");

        try {
            filePath = ResourceUtils.getFile("classpath: templates/测试替换字符串文档.docx").getAbsolutePath();

            HashMap<String, String> paraMap = getParamMap();

            XWPFDocument wordFile = new XWPFDocument(POIXMLDocument.openPackage(filePath));

            Iterator<XWPFParagraph> paragraphsIterator = wordFile.getParagraphsIterator();

            while (paragraphsIterator.hasNext()) {

                XWPFParagraph paragraph = paragraphsIterator.next();

                List<XWPFRun> runs = paragraph.getRuns();

                for (int i = 0; i < runs.size(); i++) {

                    String positionString = runs.get(i).getText(runs.get(i).getTextPosition());

                    for (Map.Entry<String, String> entry : paraMap.entrySet()) {

                        if (entry.getKey().equals(positionString)) {

                            positionString = positionString.replace(entry.getKey(), entry.getValue());

                        } else if ("{".equals(positionString) || "}".equals(positionString)){

                            positionString = "";
                        }
                    }
                    runs.get(i).setText(positionString, 0);
                }
            }

            response.reset();

            String fileName = "测试替换字符串文档.docx";

            response.setHeader("Content-Disposition", "attachment;fileName=" + fileName);

            response.setContentType("application/vnd.ms-excel;charset=utf-8");

            ServletOutputStream os = response.getOutputStream();

            try {
                wordFile.write(os);
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                os.close();
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    private HashMap<String, String> getParamMap() {

        HashMap<String, String> paraMap = new HashMap<>();

        paraMap.put("deptName", "深圳宝安");

        paraMap.put("plotName", "壹方城三号");

        paraMap.put("plotCode", "长天科技有限");

        paraMap.put("people", "张麻子");

        paraMap.put("phone", "13578699879");

        return paraMap;
    }
}
