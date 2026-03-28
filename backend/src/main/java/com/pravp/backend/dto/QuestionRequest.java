package com.pravp.backend.dto;

import com.pravp.backend.model.DifficultyLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class QuestionRequest {

    private String examId;

    @NotBlank(message = "Question text is required")
    private String questionText;

    private List<String> options;
    private Integer correctAnswer;

    @NotNull(message = "Marks are required")
    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks;

    private DifficultyLevel difficultyLevel;
    private com.pravp.backend.model.QuestionType type;
    private String templateCode;
    private List<com.pravp.backend.model.Question.TestCase> testCases;

    public QuestionRequest() {
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
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

    public Integer getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(Integer correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public com.pravp.backend.model.QuestionType getType() {
        return type;
    }

    public void setType(com.pravp.backend.model.QuestionType type) {
        this.type = type;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }

    public List<com.pravp.backend.model.Question.TestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<com.pravp.backend.model.Question.TestCase> testCases) {
        this.testCases = testCases;
    }
}
