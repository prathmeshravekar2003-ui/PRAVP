package com.pravp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

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
    private LocalDateTime createdAt = LocalDateTime.now();

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
}
