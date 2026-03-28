package com.pravp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "questions")
public class Question {

    @Id
    private String id;
    private String examId;
    private String questionText;
    private List<String> options;
    private Integer correctAnswer; // Index of the correct option
    private Integer marks;
    private DifficultyLevel difficultyLevel;
    private QuestionType type = QuestionType.MCQ;
    private String templateCode;
    private List<TestCase> testCases;
    private LocalDateTime createdAt = LocalDateTime.now();

    public static class TestCase {
        private String input;
        private String expectedOutput;
        @JsonProperty("isPublic")
        private boolean isPublic;

        public TestCase() {}

        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }
        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
        @JsonProperty("isPublic")
        public boolean isPublic() { return isPublic; }
        
        @JsonProperty("isPublic")
        public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    }

    public Question() {
    }

    public Question(String id, String examId, String questionText, List<String> options, Integer correctAnswer,
            Integer marks, DifficultyLevel difficultyLevel) {
        this.id = id;
        this.examId = examId;
        this.questionText = questionText;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.marks = marks;
        this.difficultyLevel = difficultyLevel;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }

    public List<TestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<TestCase> testCases) {
        this.testCases = testCases;
    }
}
