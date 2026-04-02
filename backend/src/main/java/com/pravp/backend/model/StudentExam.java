package com.pravp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "student_exams")
public class StudentExam {
    @Id
    private String id;
    private String studentId;
    private String examId;
    private Instant startTime;
    private Instant endTime;
    private String status; // STARTED, SUBMITTED, AUTO_SUBMITTED
    private Boolean isSuspicious = false;
    private List<String> questionIds = new ArrayList<>();

    public StudentExam() {
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

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public Instant getStartTime() {
        return startTime;
    }
    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }
    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
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

    public List<String> getQuestionIds() {
        return questionIds;
    }

    public void setQuestionIds(List<String> questionIds) {
        this.questionIds = questionIds;
    }
}
