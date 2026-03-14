package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.CheatingLogRequest;
import com.pravp.backend.model.CheatingLog;
import com.pravp.backend.model.StudentExam;
import com.pravp.backend.model.Role;
import com.pravp.backend.model.User;
import com.pravp.backend.service.MonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/monitor")
@Tag(name = "Exam Monitoring", description = "Endpoints for anti-cheating and dashboard")
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @PostMapping("/log")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Log an anti-cheating event (Frontend triggered)")
    public ResponseEntity<ApiResponse<Void>> logEvent(@Valid @RequestBody CheatingLogRequest request,
            @AuthenticationPrincipal User user) {
        monitoringService.logCheatingEvent(request, user.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Event logged"));
    }

    @GetMapping("/exams")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "View active exam sessions")
    public ResponseEntity<ApiResponse<List<StudentExam>>> getActiveExams(@AuthenticationPrincipal User user) {
        String instructorId = user.getRole() == Role.ADMIN ? null : user.getId();
        return ResponseEntity
                .ok(ApiResponse.success(monitoringService.getActiveExams(instructorId),
                        "Active exams fetched successfully"));
    }

    @GetMapping("/exam/{examId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "View students participating in a specific exam")
    public ResponseEntity<ApiResponse<List<StudentExam>>> getStudents(@PathVariable String examId) {
        return ResponseEntity
                .ok(ApiResponse.success(monitoringService.getStudentsByExam(examId), "Students fetched successfully"));
    }

    @GetMapping("/exam/{examId}/cheating")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "View cheating logs for an exam")
    public ResponseEntity<ApiResponse<List<CheatingLog>>> getCheatingLogs(@PathVariable String examId) {
        return ResponseEntity
                .ok(ApiResponse.success(monitoringService.getCheatingLogsByExam(examId), "Logs fetched successfully"));
    }

    @GetMapping("/exam/{examId}/student/{studentId}/cheating-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get cheating count for a specific student in an exam")
    public ResponseEntity<ApiResponse<Long>> getCheatingCount(@PathVariable String examId,
            @PathVariable String studentId) {
        return ResponseEntity.ok(ApiResponse.success(monitoringService.getCheatingCount(studentId, examId),
                "Count fetched successfully"));
    }

    @GetMapping("/cheating/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "View most recent cheating logs across all exams")
    public ResponseEntity<ApiResponse<List<CheatingLog>>> getRecentLogs(@AuthenticationPrincipal User user) {
        String instructorId = user.getRole() == Role.ADMIN ? null : user.getId();
        return ResponseEntity
                .ok(ApiResponse.success(monitoringService.getRecentCheatingLogs(50, instructorId),
                        "Recent logs fetched successfully"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get high-level monitoring statistics")
    public ResponseEntity<ApiResponse<com.pravp.backend.dto.MonitoringStatsDTO>> getStats(@AuthenticationPrincipal User user) {
        String instructorId = user.getRole() == Role.ADMIN ? null : user.getId();
        return ResponseEntity.ok(ApiResponse.success(monitoringService.getStats(instructorId), "Stats fetched successfully"));
    }
}
