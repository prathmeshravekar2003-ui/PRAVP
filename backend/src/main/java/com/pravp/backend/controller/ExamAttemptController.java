package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.ExamStartResponse;
import com.pravp.backend.dto.QuestionResponse;
import com.pravp.backend.dto.SaveAnswerRequest;
import com.pravp.backend.model.Result;
import com.pravp.backend.service.ExamAttemptService;
import com.pravp.backend.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exam")
@Tag(name = "Exam Attempt", description = "Endpoints for students to attempt exams")
public class ExamAttemptController {

    private final ExamAttemptService attemptService;
    private final QuestionService questionService;

    public ExamAttemptController(ExamAttemptService attemptService, QuestionService questionService) {
        this.attemptService = attemptService;
        this.questionService = questionService;
    }

    @PostMapping("/start/{examId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start an exam session")
    public ResponseEntity<ApiResponse<ExamStartResponse>> startExam(@PathVariable String examId, Authentication auth) {
        return ResponseEntity
                .ok(ApiResponse.success(attemptService.startExam(examId, auth.getName()), "Exam session started"));
    }

    @GetMapping("/{examId}/questions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get randomized questions for the exam session")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getExamQuestions(@PathVariable String examId) {
        return ResponseEntity.ok(
                ApiResponse.success(questionService.getRandomizedQuestions(examId), "Questions fetched successfully"));
    }

    @PostMapping("/save-answer")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save or update a question answer")
    public ResponseEntity<ApiResponse<Void>> saveAnswer(@Valid @RequestBody SaveAnswerRequest request) {
        attemptService.saveAnswer(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Answer saved successfully"));
    }

    @PostMapping("/submit/{studentExamId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit the exam")
    public ResponseEntity<ApiResponse<Result>> submitExam(@PathVariable String studentExamId) {
        return ResponseEntity.ok(ApiResponse.success(attemptService.submitExam(studentExamId, "SUBMITTED"),
                "Exam submitted successfully"));
    }

    @DeleteMapping("/{studentExamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Delete an exam attempt by its ID")
    public ResponseEntity<ApiResponse<Void>> deleteExamAttempt(@PathVariable String studentExamId) {
        attemptService.deleteExamAttempt(studentExamId);
        return ResponseEntity.ok(ApiResponse.success(null, "Exam attempt deleted successfully."));
    }
}
