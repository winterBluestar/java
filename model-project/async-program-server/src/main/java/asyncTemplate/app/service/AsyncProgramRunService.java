package asyncTemplate.app.service;

import com.model.xd.common.dto.req.program.AsyncProgramExecuteRequestDTO;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/26
 */
public interface AsyncProgramRunService {
    /**
     * 异步程序执行
     * @param asyncProgramExecuteRequestDTO 执行参数
     * @return 返回结果
     */
    boolean asyncProgramExecute(AsyncProgramExecuteRequestDTO asyncProgramExecuteRequestDTO);
}
