package asyncTemplate.init;

import com.alibaba.fastjson.JSONObject;
import com.model.xd.common.annotation.DemoHandler;
import asyncTemplate.template.AbstractAsyncTemplate;
import asyncTemplate.register.TemplateRegister;
import com.model.xd.common.util.ApplicationContextUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Map;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/19
 */
@Order(0)
@Component
public class AsyncTemplateInit implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(CommandLineRunner.class);

    @Override
    public void run(String... args) throws Exception {
        Map<String, Object> asyncBeanMap =
                        ApplicationContextUtils.getApplicationContext().getBeansWithAnnotation(DemoHandler.class);
        LOGGER.debug("异步执行的程序有: {}", JSONObject.toJSONString(asyncBeanMap));
        if (!CollectionUtils.isEmpty(asyncBeanMap)) {
            asyncBeanMap.entrySet().forEach(asyncBean -> {
                TemplateRegister.addTemplate(asyncBean.getKey(), (AbstractAsyncTemplate) asyncBean.getValue());
            });
        }
    }
}
