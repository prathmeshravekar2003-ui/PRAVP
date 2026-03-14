package com.pravp.backend.dto;

import java.time.LocalDateTime;

public class StudentExamAttemptDTO {
    private String id;
    private String studentId;
    private String studentName;
    private String examId;
    private LocalDateTime startTime;
    private String status;
    private Boolean isSuspicious;
    private long alertCount;

    public StudentExamAttemptDTO() {
    }

    public StudentExamAttemptDTO(String id, String studentId, String studentName, String examId, 
                                LocalDateTime startTime, String status, Boolean isSuspicious, long alertCount) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.examId = examId;
        this.startTime = startTime;
        this.status = status;
        this.isSuspicious = isSuspicious;
        this.alertCount = alertCount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsSuspicious() {
        return isSuspicious;
    }

    public void setIsSuspicious(Boolean isSuspicious) {
        this.isSuspicious = isSuspicious;
    }

    public long getAlertCount() {
        return alertCount;
    }

    public void setAlertCount(long alertCount) {
        this.alertCount = alertCount;
    }
}
