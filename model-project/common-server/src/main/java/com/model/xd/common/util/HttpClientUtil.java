package com.model.xd.common.util;


import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import reactor.core.publisher.Mono;

import java.io.IOException;


/**
 * http请求
 *
 */
public class HttpClientUtil {

    @Autowired
    private LoadBalancerClientFactory loadBalancerClientFactory;

    public static String doGet(String url, String jwt) {
        CloseableHttpResponse response = null;
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpPost = new HttpGet(url);
            httpPost.setHeader("Connection", "Keep-Alive");
            httpPost.setHeader("Charset", "BaseConstants.DEFAULT_CHARSET");
            httpPost.setHeader("jwt_token", jwt);
            response = httpClient.execute(httpPost);
            if (response != null) {
                HttpEntity resEntity = response.getEntity();
                if (resEntity != null) {
                    String result = EntityUtils.toString(resEntity, "BaseConstants.DEFAULT_CHARSET");
                    return result;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (response != null) {
                try {
                    response.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return "exception";
    }


    public static String doPost(String url, String param, String jwt) {
        CloseableHttpResponse response = null;
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Connection", "Keep-Alive");
            httpPost.setHeader("Charset", "BaseConstants.DEFAULT_CHARSET");
            httpPost.setHeader("Content-Type", "application/json; charset=utf-8");
            httpPost.setHeader("jwt_token", jwt);
            httpPost.setEntity(new StringEntity(param, "BaseConstants.DEFAULT_CHARSET"));
            response = httpClient.execute(httpPost);
            if (response != null) {
                HttpEntity resEntity = response.getEntity();
                if (resEntity != null) {
                    String result = EntityUtils.toString(resEntity, "BaseConstants.DEFAULT_CHARSET");
                    return result;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (response != null) {
                try {
                    response.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return "exception";
    }

    /**
     * 获取负载均衡服务器IP端口
     * 
     * @param serviceName
     * @return
     */
    public ServiceInstance getServiceInstance(String serviceName) {
        return Mono.from(loadBalancerClientFactory.getInstance(serviceName).choose()).block().getServer();
    }

}
