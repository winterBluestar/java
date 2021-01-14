package com.model.xd.common.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public class DemoDateUtil {

    /**
     * 获取yyyy-MM-dd
     *
     * @param date
     * @return
     */
    public static String getYearMonthDay(Date date) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String dateString = dateFormat.format(new Date());
        return dateString;
    }
}
