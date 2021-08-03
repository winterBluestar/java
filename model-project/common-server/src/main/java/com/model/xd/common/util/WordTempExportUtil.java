package com.model.xd.common.util;

import cn.afterturn.easypoi.word.WordExportUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.util.Assert;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: WordTempExportUtil
 * @date:2021/8/3 10:19
 */
@Slf4j
public class WordTempExportUtil {

    private static final String DOC_SUFFIX = ".docx";

    /**
     * 导出Word模板
     * <p>第一步生成替换后的Word文档，只支持docx</p>
     * <p>第二部下载生成的文件</p>
     * 模板变量格式： {{foo}} （注意是中文的花括号）
     *
     * @param templatePath
     * @param fileName
     * @param params
     * @param respList
     * @param request
     * @param response
     */
    public static void exportWord(String templatePath, String fileName, Map<String, Object> params, List<Object> respList,
                                  HttpServletRequest request, HttpServletResponse response) {

        Assert.notNull(templatePath, "模板路径不能为空");

        Assert.notNull(fileName, "导出的文件名不能为空");

        Assert.isTrue(fileName.endsWith(DOC_SUFFIX), "Word文档导出使用docx格式");

        try {
            XWPFDocument doc = WordExportUtil.exportWord07(templatePath, params);

            response.reset();

            response.setContentType("application/force-download");

            String userAgent = request.getHeader("user-agent").toLowerCase();

            if (userAgent.contains("msie") || userAgent.contains("like gecko")) {
                fileName = URLEncoder.encode(fileName, "UTF-8");
            } else {
                fileName = new String(fileName.getBytes("utf-8"), "ISO-8859-1");
            }

            response.addHeader("Content-Disposition", "attachment;fileName=" + fileName);

            ServletOutputStream os = response.getOutputStream();

            doc.write(os);

            os.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
