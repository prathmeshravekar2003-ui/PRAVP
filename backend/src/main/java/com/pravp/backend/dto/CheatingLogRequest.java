package com.pravp.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CheatingLogRequest {
    @NotBlank
    private String examId;
    @NotBlank
    private String eventType;
    private String severity;
    private String details;

    public CheatingLogRequest() {
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
