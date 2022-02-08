package com.model.xd.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName WebMvcConfigurer
 * @Description: TODO
 * @Date 2021/6/26 16:30
 */
@Configuration
public class WebMvcConfigurer extends WebMvcConfigurationSupport {

    /**
     * 重写增加自定义拦截器的注册，某一个拦截器需要先注册进来，才能工作
     * @param registry
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/**");

        super.addInterceptors(registry);
    }
}
