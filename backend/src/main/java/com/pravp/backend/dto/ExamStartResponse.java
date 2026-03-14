package com.pravp.backend.dto;

import java.time.Instant;

public class ExamStartResponse {
    private String studentExamId;
    private Instant startTime;
    private Instant endTime;

    public ExamStartResponse(String studentExamId, Instant startTime, Instant endTime) {
        this.studentExamId = studentExamId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getStudentExamId() {
        return studentExamId;
    }

    public Instant getStartTime() {
        return startTime;
    }
    public Instant getEndTime() {
        return endTime;
    }
}
