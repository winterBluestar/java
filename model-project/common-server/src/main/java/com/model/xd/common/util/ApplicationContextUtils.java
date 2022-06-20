package com.model.xd.common.util;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName ApplicationGetBeanFactory
 * @Description: TODO
 * @Date 2021/7/7 9:44
 */
@Slf4j
@Component
@Data
public class ApplicationContextUtils implements ApplicationContextAware {

    public static ApplicationContext applicationContext;


    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
