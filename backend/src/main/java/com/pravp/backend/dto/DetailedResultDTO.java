package com.pravp.backend.dto;

import java.util.List;

public class DetailedResultDTO {
    private String examTitle;
    private List<QuestionResultDTO> questions;
    private Integer totalScore;
    private Integer totalMarks;

    public DetailedResultDTO() {}

    public DetailedResultDTO(String examTitle, List<QuestionResultDTO> questions, Integer totalScore, Integer totalMarks) {
        this.examTitle = examTitle;
        this.questions = questions;
        this.totalScore = totalScore;
        this.totalMarks = totalMarks;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public List<QuestionResultDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResultDTO> questions) {
        this.questions = questions;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
}
