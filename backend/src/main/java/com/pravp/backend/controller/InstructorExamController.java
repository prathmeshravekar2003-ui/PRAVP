package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.StudentExamAttemptDTO;
import com.pravp.backend.model.CheatingLog;
import com.pravp.backend.model.StudentExam;
import com.pravp.backend.service.InstructorExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/instructor/attempts")
@PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
@Tag(name = "Instructor Exam Attempts", description = "Endpoints for instructors to review cheating alerts and reconduct exams")
public class InstructorExamController {

    private final InstructorExamService instructorExamService;

    public InstructorExamController(InstructorExamService instructorExamService) {
        this.instructorExamService = instructorExamService;
    }

    @GetMapping("/exam/{examId}")
    @Operation(summary = "Get all student attempts for a specific exam")
    public ResponseEntity<ApiResponse<List<StudentExamAttemptDTO>>> getAttemptsByExam(@PathVariable String examId) {
        return ResponseEntity.ok(ApiResponse.success(
                instructorExamService.getAttemptsByExam(examId),
                "Student attempts fetched successfully"
        ));
    }

    @GetMapping("/{studentId}/{examId}/alerts")
    @Operation(summary = "Get detailed cheating alerts for a student's attempt")
    public ResponseEntity<ApiResponse<List<CheatingLog>>> getCheatingAlerts(
            @PathVariable String studentId, @PathVariable String examId) {
        return ResponseEntity.ok(ApiResponse.success(
                instructorExamService.getCheatingAlerts(studentId, examId),
                "Cheating alerts fetched successfully"
        ));
    }

    @PostMapping("/{studentExamId}/approve")
    @Operation(summary = "Approve a student attempt")
    public ResponseEntity<ApiResponse<Void>> approveAttempt(@PathVariable String studentExamId) {
        instructorExamService.approveAttempt(studentExamId);
        return ResponseEntity.ok(ApiResponse.success(null, "Attempt approved successfully"));
    }

    @PostMapping("/{studentExamId}/flag")
    @Operation(summary = "Flag a student attempt as suspicious")
    public ResponseEntity<ApiResponse<Void>> flagAttempt(@PathVariable String studentExamId) {
        instructorExamService.flagAttempt(studentExamId);
        return ResponseEntity.ok(ApiResponse.success(null, "Attempt flagged as suspicious"));
    }

    @PostMapping("/{studentExamId}/reconduct")
    @Operation(summary = "Reconduct an exam for a student")
    public ResponseEntity<ApiResponse<Void>> reconductExam(
            @PathVariable String studentExamId,
            Authentication auth,
            @RequestBody Map<String, String> requestBody) {

        String reason = requestBody.getOrDefault("reason", "Instructor triggered reconduct");
        // We use auth.getName() or get the user object if necessary to fetch the ID.
        // auth.getName() might be email or username, assuming it's mapping properly.
        instructorExamService.reconductExam(studentExamId, auth.getName(), reason);

        return ResponseEntity.ok(ApiResponse.success(null, "Exam scheduled for reconduct"));
    }

    @GetMapping("/{studentExamId}/performance")
    @Operation(summary = "Get detailed performance report for a student's attempt")
    public ResponseEntity<ApiResponse<com.pravp.backend.dto.DetailedResultDTO>> getPerformanceReport(
            @PathVariable String studentExamId) {
        return ResponseEntity.ok(ApiResponse.success(
                instructorExamService.getStudentPerformanceReport(studentExamId),
                "Performance report fetched successfully"
        ));
    }

    @GetMapping("/exam/{examId}/export")
    @Operation(summary = "Export all results for an exam to Excel")
    public ResponseEntity<byte[]> exportResults(@PathVariable String examId) throws java.io.IOException {
        byte[] excelContent = instructorExamService.exportResultsToExcel(examId);
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=results_" + examId + ".xlsx")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelContent);
    }
}
