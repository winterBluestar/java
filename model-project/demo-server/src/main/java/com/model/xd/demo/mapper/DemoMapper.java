package com.model.xd.demo.mapper;


import com.model.xd.common.dto.req.DemoInfoReq;
import com.model.xd.common.dto.req.DemoQueryReq;
import com.model.xd.common.dto.resp.DemoInfoResp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DemoMapper {

    Integer deleteDemoInfoById(@Param("demoId") String demoId);

    Integer insertOrUpdateDemoInfo(@Param("req") DemoInfoReq req);

    DemoInfoResp queryDemoInfo(@Param("demoId") String demoId);

    List<DemoInfoResp> queryDemoPageInfo(@Param("req") DemoQueryReq req);
}
