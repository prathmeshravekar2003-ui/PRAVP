package com.pravp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "anti_cheat_records")
public class AntiCheatRecord {

    @Id
    private String id;
    private String studentId;
    private String examId;
    private IncidentType incidentType;
    private String details;
    private LocalDateTime timestamp;
    private String screenshotUrl;

    public enum IncidentType {
        TAB_SWITCH,
        FACE_NOT_DETECTED,
        MULTIPLE_FACES_DETECTED,
        BROWSER_RESIZED,
        UNAUTHORIZED_DEVICE_DETECTED
    }

    public AntiCheatRecord() {
    }

    public AntiCheatRecord(String id, String studentId, String examId, IncidentType incidentType, String details,
            LocalDateTime timestamp, String screenshotUrl) {
        this.id = id;
        this.studentId = studentId;
        this.examId = examId;
        this.incidentType = incidentType;
        this.details = details;
        this.timestamp = timestamp;
        this.screenshotUrl = screenshotUrl;
    }

    // Getters and Setters
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

    public IncidentType getIncidentType() {
        return incidentType;
    }

    public void setIncidentType(IncidentType incidentType) {
        this.incidentType = incidentType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getScreenshotUrl() {
        return screenshotUrl;
    }

    public void setScreenshotUrl(String screenshotUrl) {
        this.screenshotUrl = screenshotUrl;
    }
}
