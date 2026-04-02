package com.pravp.backend.dto;

import com.pravp.backend.model.Exam;
import com.pravp.backend.model.ExamStatus;

import java.time.LocalDateTime;
import java.util.List;

public class ExamResponse {

    private String id;
    private String title;
    private String description;
    private Integer duration;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalMarks;
    private ExamStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<Exam.Question> questions;
    private Exam.AntiCheatConfig antiCheatConfig;
    private List<String> batchIds;
    private List<String> studentEmails;
    private Integer questionsPerStudent;

    public ExamResponse() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public ExamStatus getStatus() {
        return status;
    }

    public void setStatus(ExamStatus status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Exam.Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Exam.Question> questions) {
        this.questions = questions;
    }

    public Exam.AntiCheatConfig getAntiCheatConfig() {
        return antiCheatConfig;
    }

    public void setAntiCheatConfig(Exam.AntiCheatConfig antiCheatConfig) {
        this.antiCheatConfig = antiCheatConfig;
    }

    public List<String> getBatchIds() {
        return batchIds;
    }

    public void setBatchIds(List<String> batchIds) {
        this.batchIds = batchIds;
    }

    public List<String> getStudentEmails() {
        return studentEmails;
    }

    public void setStudentEmails(List<String> studentEmails) {
        this.studentEmails = studentEmails;
    }

    public Integer getQuestionsPerStudent() {
        return questionsPerStudent;
    }

    public void setQuestionsPerStudent(Integer questionsPerStudent) {
        this.questionsPerStudent = questionsPerStudent;
    }
}
