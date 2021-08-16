package com.model.xd.demo.demotest.bean;

import org.springframework.beans.factory.xml.XmlBeanFactory;
import org.springframework.core.io.ClassPathResource;

/**
 * @Description:
 * @Author: winterBluestar
 * @ProjectName: model-project
 * @ClassName: BeanFactoryTestDemo
 * @date:2021/8/4 18:22
 */
public class BeanFactoryTestDemo {

    public void beanTest (){

        XmlBeanFactory xmlBeanFactory = new XmlBeanFactory(new ClassPathResource("templates/beanFactoryDemo.xml"));

        Object bean = xmlBeanFactory.getBean("");
 
    }

}
