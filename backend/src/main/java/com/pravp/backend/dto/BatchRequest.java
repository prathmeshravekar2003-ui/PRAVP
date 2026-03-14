package com.pravp.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class BatchRequest {

    @NotBlank(message = "Batch name is required")
    private String name;

    private String description;

    private List<String> studentEmails;

    public BatchRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getStudentEmails() {
        return studentEmails;
    }

    public void setStudentEmails(List<String> studentEmails) {
        this.studentEmails = studentEmails;
    }
}
