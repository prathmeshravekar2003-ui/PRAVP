package com.pravp.backend.dto;

import java.util.List;

public class QuestionResultDTO {
    private String questionText;
    private List<String> options;
    private Integer selectedOptionIndex;
    private Integer correctOptionIndex;
    private Boolean isCorrect;
    private Integer marks;
    private com.pravp.backend.model.QuestionType type;
    private String codeAnswer;

    public QuestionResultDTO() {}

    public QuestionResultDTO(String questionText, List<String> options, Integer selectedOptionIndex, Integer correctOptionIndex, Boolean isCorrect, Integer marks, com.pravp.backend.model.QuestionType type, String codeAnswer) {
        this.questionText = questionText;
        this.options = options;
        this.selectedOptionIndex = selectedOptionIndex;
        this.correctOptionIndex = correctOptionIndex;
        this.isCorrect = isCorrect;
        this.marks = marks;
        this.type = type;
        this.codeAnswer = codeAnswer;
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

    public Integer getSelectedOptionIndex() {
        return selectedOptionIndex;
    }

    public void setSelectedOptionIndex(Integer selectedOptionIndex) {
        this.selectedOptionIndex = selectedOptionIndex;
    }

    public Integer getCorrectOptionIndex() {
        return correctOptionIndex;
    }

    public void setCorrectOptionIndex(Integer correctOptionIndex) {
        this.correctOptionIndex = correctOptionIndex;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public com.pravp.backend.model.QuestionType getType() {
        return type;
    }

    public void setType(com.pravp.backend.model.QuestionType type) {
        this.type = type;
    }

    public String getCodeAnswer() {
        return codeAnswer;
    }

    public void setCodeAnswer(String codeAnswer) {
        this.codeAnswer = codeAnswer;
    }
}
