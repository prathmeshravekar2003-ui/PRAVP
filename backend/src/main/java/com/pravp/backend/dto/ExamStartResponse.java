package com.pravp.backend.dto;

import java.time.LocalDateTime;

public class ExamStartResponse {
    private String studentExamId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public ExamStartResponse(String studentExamId, LocalDateTime startTime, LocalDateTime endTime) {
        this.studentExamId = studentExamId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getStudentExamId() {
        return studentExamId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
}
