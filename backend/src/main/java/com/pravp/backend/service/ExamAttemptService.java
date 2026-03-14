package com.pravp.backend.service;

import com.pravp.backend.dto.ExamStartResponse;
import com.pravp.backend.dto.SaveAnswerRequest;
import com.pravp.backend.model.*;
import com.pravp.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ExamAttemptService {

    private final StudentExamRepository studentExamRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ExamRepository examRepository;
    private final EvaluationService evaluationService;

    public ExamAttemptService(StudentExamRepository studentExamRepository,
            StudentAnswerRepository studentAnswerRepository,
            ExamRepository examRepository,
            EvaluationService evaluationService) {
        this.studentExamRepository = studentExamRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.examRepository = examRepository;
        this.evaluationService = evaluationService;
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
        studentExam.setStartTime(LocalDateTime.now());
        studentExam.setEndTime(LocalDateTime.now().plusMinutes(exam.getDuration()));
        studentExam.setStatus("STARTED");

        StudentExam saved = studentExamRepository.save(studentExam);
        return new ExamStartResponse(saved.getId(), saved.getStartTime(), saved.getEndTime());
    }

    public void saveAnswer(SaveAnswerRequest request) {
        StudentExam studentExam = studentExamRepository.findById(request.getStudentExamId())
                .orElseThrow(() -> new RuntimeException("Student exam session not found"));

        if (!studentExam.getStatus().equals("STARTED")) {
            throw new RuntimeException("Cannot save answer for a finished exam");
        }

        if (LocalDateTime.now().isAfter(studentExam.getEndTime())) {
            submitExam(studentExam.getId(), "AUTO_SUBMITTED");
            throw new RuntimeException("Exam time expired and automatically submitted");
        }

        StudentAnswer answer = studentAnswerRepository
                .findByStudentExamIdAndQuestionId(request.getStudentExamId(), request.getQuestionId())
                .orElse(new StudentAnswer());

        answer.setStudentExamId(request.getStudentExamId());
        answer.setQuestionId(request.getQuestionId());
        answer.setSelectedOptionIndex(request.getSelectedOptionIndex());

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
