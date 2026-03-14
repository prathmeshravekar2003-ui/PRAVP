package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.QuestionRequest;
import com.pravp.backend.dto.QuestionResponse;
import com.pravp.backend.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@Tag(name = "Question Bank", description = "Endpoints for managing question bank")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Add a new question to the bank (Admin/Instructor only)")
    public ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(@Valid @RequestBody QuestionRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success(questionService.addQuestion(request), "Question added successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get questions for an exam (paginated)")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestions(
            @RequestParam String examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestionsByExam(examId, pageable),
                "Questions fetched successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable String id) {
        return ResponseEntity
                .ok(ApiResponse.success(questionService.getQuestionById(id), "Question fetched successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Update question (Admin/Instructor only)")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success(questionService.updateQuestion(id, request), "Question updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Delete question (Admin/Instructor only)")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Question deleted successfully"));
    }

    @GetMapping("/exam/{examId}/random")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    @Operation(summary = "Get randomized questions for an exam")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getRandomizedQuestions(@PathVariable String examId) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getRandomizedQuestions(examId),
                "Randomized questions fetched successfully"));
    }
}
