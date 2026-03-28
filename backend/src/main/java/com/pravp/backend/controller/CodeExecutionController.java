package com.pravp.backend.controller;

import com.pravp.backend.dto.CodeExecutionRequest;
import com.pravp.backend.dto.CodeExecutionResponse;
import com.pravp.backend.service.CExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exam")
@CrossOrigin(origins = "*") // In production, restrict this to your frontend URL
public class CodeExecutionController {

    private final CExecutionService cExecutionService;

    public CodeExecutionController(CExecutionService cExecutionService) {
        this.cExecutionService = cExecutionService;
    }

    @PostMapping("/run-code")
    public ResponseEntity<CodeExecutionResponse> runCode(@RequestBody CodeExecutionRequest request) {
        try {
            String output = cExecutionService.runCCode(request.getCode(), request.getInput());
            boolean success = !output.startsWith("COMPILATION_ERROR") && !output.startsWith("RUNTIME_ERROR");
            return ResponseEntity.ok(new CodeExecutionResponse(output, success));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new CodeExecutionResponse("Internal Server Error: " + e.getMessage(), false));
        }
    }
}
