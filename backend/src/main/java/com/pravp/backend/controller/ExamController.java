package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.ExamRequest;
import com.pravp.backend.dto.ExamResponse;
import com.pravp.backend.model.Role;
import com.pravp.backend.model.User;
import com.pravp.backend.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exams")
@Tag(name = "Exam Management", description = "Endpoints for managing exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Create a new exam (Admin/Instructor only)")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @Valid @RequestBody ExamRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity
                .ok(ApiResponse.success(examService.createExam(request, user), "Exam created successfully"));
    }

    @PostMapping("/parse-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Parse exam questions from PDF")
    public ResponseEntity<ApiResponse<java.util.List<com.pravp.backend.model.Exam.Question>>> parsePdf(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(examService.parsePdfToQuestions(file), "PDF parsed successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    @Operation(summary = "List exams (Students see all published, Instructor sees own, Admin sees all)")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String instructorId,
            @AuthenticationPrincipal User user) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(examService.getExams(pageable, user, instructorId),
                "Exams fetched successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get exam details")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(examService.getExamById(id), "Exam fetched successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Update exam (Admin/Instructor only)")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable String id,
            @Valid @RequestBody ExamRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success(examService.updateExam(id, request, user), "Exam updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Delete exam (Admin/Instructor only)")
    public ResponseEntity<ApiResponse<Void>> deleteExam(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        examService.deleteExam(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Exam deleted successfully"));
    }
}
