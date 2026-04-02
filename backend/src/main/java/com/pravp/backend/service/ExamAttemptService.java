package com.pravp.backend.service;

import com.pravp.backend.dto.ExamStartResponse;
import com.pravp.backend.dto.SaveAnswerRequest;
import com.pravp.backend.model.*;
import com.pravp.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.stream.Collectors;

import java.time.Instant;
import java.time.Duration;
import java.util.Optional;

@Service
public class ExamAttemptService {

    private final StudentExamRepository studentExamRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ExamRepository examRepository;
    private final EvaluationService evaluationService;
    private final QuestionRepository questionRepository;

    public ExamAttemptService(StudentExamRepository studentExamRepository,
            StudentAnswerRepository studentAnswerRepository,
            ExamRepository examRepository,
            EvaluationService evaluationService,
            QuestionRepository questionRepository) {
        this.studentExamRepository = studentExamRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.examRepository = examRepository;
        this.evaluationService = evaluationService;
        this.questionRepository = questionRepository;
    }

    public ExamStartResponse startExam(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        java.util.List<StudentExam> existing = studentExamRepository.findByStudentIdAndExamId(studentId, examId);
        if (!existing.isEmpty()) {
            StudentExam se = existing.stream()
                    .filter(a -> "STARTED".equals(a.getStatus()))
                    .findFirst()
                    .orElse(existing.get(0));

            if ("STARTED".equals(se.getStatus())) {
                // Resume existing started attempt
                return new ExamStartResponse(se.getId(), se.getStartTime(), se.getEndTime());
            } else {
                // Already submitted
                throw new RuntimeException("You have already completed this exam and cannot take it again.");
            }
        }

        StudentExam studentExam = new StudentExam();
        studentExam.setStudentId(studentId);
        studentExam.setExamId(examId);
        studentExam.setStartTime(Instant.now());
        studentExam.setEndTime(Instant.now().plus(java.time.Duration.ofMinutes(exam.getDuration())));
        studentExam.setStatus("STARTED");

        // --- RANDOMIZATION LOGIC ---
        java.util.List<Question> allQuestions = questionRepository.findByExamId(examId);
        java.util.Collections.shuffle(allQuestions);

        Integer limit = exam.getQuestionsPerStudent();
        if (limit != null && limit > 0 && limit < allQuestions.size()) {
            allQuestions = allQuestions.subList(0, limit);
        }

        java.util.List<String> assignedQuestionIds = allQuestions.stream()
                .map(Question::getId)
                .collect(Collectors.toList());
        studentExam.setQuestionIds(assignedQuestionIds);
        // ---------------------------

        StudentExam saved = studentExamRepository.save(studentExam);
        return new ExamStartResponse(saved.getId(), saved.getStartTime(), saved.getEndTime());
    }

    public void saveAnswer(SaveAnswerRequest request) {
        StudentExam studentExam = studentExamRepository.findById(request.getStudentExamId())
                .orElseThrow(() -> new RuntimeException("Student exam session not found"));

        if (!studentExam.getStatus().equals("STARTED")) {
            throw new RuntimeException("Cannot save answer for a finished exam");
        }

        if (Instant.now().isAfter(studentExam.getEndTime())) {
            submitExam(studentExam.getId(), "AUTO_SUBMITTED");
            throw new RuntimeException("Exam time expired and automatically submitted");
        }

        StudentAnswer answer = studentAnswerRepository
                .findByStudentExamIdAndQuestionId(request.getStudentExamId(), request.getQuestionId())
                .orElse(new StudentAnswer());

        answer.setStudentExamId(request.getStudentExamId());
        answer.setQuestionId(request.getQuestionId());
        answer.setSelectedOptionIndex(request.getSelectedOptionIndex());
        answer.setCodeAnswer(request.getCodeAnswer());

        studentAnswerRepository.save(answer);
    }

    public Result submitExam(String studentExamId, String status) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam session not found"));

        if (!studentExam.getStatus().equals("STARTED")) {
            // Already submitted by a concurrent request, so return the existing result.
            return evaluationService.evaluateExam(studentExam);
        }

        studentExam.setStatus(status);
        studentExamRepository.save(studentExam);

        return evaluationService.evaluateExam(studentExam);
    }

    public void deleteExamAttempt(String studentExamId) {
        studentAnswerRepository.deleteByStudentExamId(studentExamId);
        evaluationService.deleteResultByStudentExamId(studentExamId);
        studentExamRepository.deleteById(studentExamId);
    }
}
