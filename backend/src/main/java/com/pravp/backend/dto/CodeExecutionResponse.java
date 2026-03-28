package com.pravp.backend.dto;

public class CodeExecutionResponse {
    private String output;
    private boolean success;

    public CodeExecutionResponse() {}

    public CodeExecutionResponse(String output, boolean success) {
        this.output = output;
        this.success = success;
    }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}
