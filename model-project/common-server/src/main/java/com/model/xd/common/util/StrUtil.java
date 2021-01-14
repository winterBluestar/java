package com.model.xd.common.util;

import java.util.UUID;

public class StrUtil {
    public static String uuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
