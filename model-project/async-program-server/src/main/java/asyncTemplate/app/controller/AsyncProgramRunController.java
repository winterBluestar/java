package asyncTemplate.app.controller;

import asyncTemplate.app.service.AsyncProgramRunService;

import com.model.xd.common.dto.req.program.AsyncProgramExecuteRequestDTO;
import com.model.xd.common.response.ResponseResult;
import com.model.xd.common.util.ResponseResultUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author xudong.chen@zone-cloud.com 2022/8/26
 */
@RestController
@RequestMapping(value = "/async-program")
public class AsyncProgramRunController {

    @Autowired
    private AsyncProgramRunService asyncProgramRunService;

    @PostMapping("/execute")
    public ResponseResult<Boolean> asyncProgramExecute(
                    @RequestBody AsyncProgramExecuteRequestDTO asyncProgramExecuteRequestDTO) {
        return ResponseResultUtil.success(asyncProgramRunService.asyncProgramExecute(asyncProgramExecuteRequestDTO));
    }
}
