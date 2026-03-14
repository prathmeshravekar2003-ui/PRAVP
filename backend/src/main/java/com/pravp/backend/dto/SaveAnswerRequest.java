package com.pravp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SaveAnswerRequest {
    @NotBlank
    private String studentExamId;
    @NotBlank
    private String questionId;
    @NotNull
    private Integer selectedOptionIndex;

    public SaveAnswerRequest() {
    }

    public String getStudentExamId() {
        return studentExamId;
    }

    public void setStudentExamId(String studentExamId) {
        this.studentExamId = studentExamId;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Integer getSelectedOptionIndex() {
        return selectedOptionIndex;
    }

    public void setSelectedOptionIndex(Integer selectedOptionIndex) {
        this.selectedOptionIndex = selectedOptionIndex;
    }
}
