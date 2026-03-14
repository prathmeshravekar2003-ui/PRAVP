package com.pravp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exams")
public class Exam {

    @Id
    private String id;
    private String title;
    private String description;
    private Integer duration; // in minutes
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalMarks;
    private ExamStatus status = ExamStatus.DRAFT;
    private String createdBy;
    private LocalDateTime createdAt = LocalDateTime.now();
    private List<Question> questions;
    private AntiCheatConfig antiCheatConfig;
    // Empty list = no batch restriction (visible to all students)
    // Non-empty = only students in matching batches can see this exam
    private List<String> batchIds = new ArrayList<>();

    public Exam() {
    }

    public Exam(String id, String title, String description, Integer duration, LocalDateTime startTime,
            LocalDateTime endTime, Integer totalMarks, ExamStatus status, String createdBy,
            List<Question> questions, AntiCheatConfig antiCheatConfig) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.startTime = startTime;
        this.endTime = endTime;
        this.totalMarks = totalMarks;
        this.status = status;
        this.createdBy = createdBy;
        this.questions = questions;
        this.antiCheatConfig = antiCheatConfig;
    }

    public static class Question {
        private String questionText;
        private List<String> options;
        private Integer correctOptionIndex;
        private Integer marks;

        public Question() {
        }

        public Question(String questionText, List<String> options, Integer correctOptionIndex, Integer marks) {
            this.questionText = questionText;
            this.options = options;
            this.correctOptionIndex = correctOptionIndex;
            this.marks = marks;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public List<String> getOptions() {
            return options;
        }

        public void setOptions(List<String> options) {
            this.options = options;
        }

        public Integer getCorrectOptionIndex() {
            return correctOptionIndex;
        }

        public void setCorrectOptionIndex(Integer correctOptionIndex) {
            this.correctOptionIndex = correctOptionIndex;
        }

        public Integer getMarks() {
            return marks;
        }

        public void setMarks(Integer marks) {
            this.marks = marks;
        }
    }

    public static class AntiCheatConfig {
        private Boolean browserLock;
        private Boolean cameraRequired;
        private Boolean screenSharingRequired;
        private Boolean tabSwitchDetection;

        public AntiCheatConfig() {
        }

        public AntiCheatConfig(Boolean browserLock, Boolean cameraRequired, Boolean screenSharingRequired,
                Boolean tabSwitchDetection) {
            this.browserLock = browserLock;
            this.cameraRequired = cameraRequired;
            this.screenSharingRequired = screenSharingRequired;
            this.tabSwitchDetection = tabSwitchDetection;
        }

        public Boolean getBrowserLock() {
            return browserLock;
        }

        public void setBrowserLock(Boolean browserLock) {
            this.browserLock = browserLock;
        }

        public Boolean getCameraRequired() {
            return cameraRequired;
        }

        public void setCameraRequired(Boolean cameraRequired) {
            this.cameraRequired = cameraRequired;
        }

        public Boolean getScreenSharingRequired() {
            return screenSharingRequired;
        }

        public void setScreenSharingRequired(Boolean screenSharingRequired) {
            this.screenSharingRequired = screenSharingRequired;
        }

        public Boolean getTabSwitchDetection() {
            return tabSwitchDetection;
        }

        public void setTabSwitchDetection(Boolean tabSwitchDetection) {
            this.tabSwitchDetection = tabSwitchDetection;
        }
    }

    // Getters and Setters
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

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public AntiCheatConfig getAntiCheatConfig() {
        return antiCheatConfig;
    }

    public void setAntiCheatConfig(AntiCheatConfig antiCheatConfig) {
        this.antiCheatConfig = antiCheatConfig;
    }

    public List<String> getBatchIds() {
        return batchIds;
    }

    public void setBatchIds(List<String> batchIds) {
        this.batchIds = batchIds;
    }
}
