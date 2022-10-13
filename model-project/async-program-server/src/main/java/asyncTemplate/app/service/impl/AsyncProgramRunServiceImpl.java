package asyncTemplate.app.service.impl;

import asyncTemplate.app.service.AsyncProgramRunService;
import asyncTemplate.register.TemplateRegister;
import com.model.xd.common.dto.req.program.AsyncProgramExecuteRequestDTO;
import com.model.xd.common.exception.DemoRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/26
 */
@Service
public class AsyncProgramRunServiceImpl implements AsyncProgramRunService {

    private final Logger logger = LoggerFactory.getLogger(AsyncProgramRunServiceImpl.class);

    @Override
    public boolean asyncProgramExecute(AsyncProgramExecuteRequestDTO asyncProgramExecuteRequestDTO) {
        if (asyncProgramExecuteRequestDTO == null && asyncProgramExecuteRequestDTO.getTemplateCode() == null) {
            throw new DemoRuntimeException("异步程序编码不能为空，请确认后重试！");
        }

        boolean isExist = TemplateRegister.validTemplateIsExist(asyncProgramExecuteRequestDTO.getTemplateCode());
        if (isExist) {
            logger.debug("程序存在，可继续执行。。。");
        } else {
            logger.debug("程序不存在，需确认重试！");
        }
        return isExist;
    }
}
