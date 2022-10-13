package asyncTemplate.register;

import asyncTemplate.template.AbstractAsyncTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/19
 */
public class TemplateRegister {

    private static final Logger logger = LoggerFactory.getLogger(TemplateRegister.class);
    private static final Map<String, AbstractAsyncTemplate> templateMap = new ConcurrentHashMap<>();

    public static void addTemplate(String templateCode, AbstractAsyncTemplate abstractAsyncTemplate) {
        if (templateCode != null) {
            templateMap.put(templateCode, abstractAsyncTemplate);
        }
    }

    public static boolean validTemplateIsExist(String templateCode) {
        AbstractAsyncTemplate asyncTemplate = templateMap.get(templateCode);
        return asyncTemplate != null ? true : false;
    }
}
