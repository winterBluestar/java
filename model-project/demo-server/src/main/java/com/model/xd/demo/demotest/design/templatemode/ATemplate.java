package com.model.xd.demo.demotest.design.templatemode;

/**
 * @Author winterBluestar
 * @Description java
 * @ClassName ATemplate
 * @Description: TODO
 * @Date 2021/6/16 16:44
 */
public class ATemplate extends AClass {
    public void B(){
        System.out.println("ATemplate要做的事儿...");
    }

    @Override
    public void run() {
        System.out.println("重写AClass为ATemplate要做的事儿..");
    }
}
