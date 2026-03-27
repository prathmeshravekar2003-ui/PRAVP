package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.BatchRequest;
import com.pravp.backend.dto.BatchResponse;
import com.pravp.backend.service.BatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/batches")
@Tag(name = "Batch Management", description = "Endpoints for managing student batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new batch")
    public ResponseEntity<ApiResponse<BatchResponse>> createBatch(
            @Valid @RequestBody BatchRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                batchService.createBatch(request, auth.getName()),
                "Batch created successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get all batches")
    public ResponseEntity<ApiResponse<List<BatchResponse>>> getAllBatches() {
        return ResponseEntity.ok(ApiResponse.success(batchService.getAllBatches(), "Batches fetched successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get batch details")
    public ResponseEntity<ApiResponse<BatchResponse>> getBatchById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getBatchById(id), "Batch fetched successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a batch")
    public ResponseEntity<ApiResponse<BatchResponse>> updateBatch(
            @PathVariable String id,
            @Valid @RequestBody BatchRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success(batchService.updateBatch(id, request), "Batch updated successfully"));
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get all students in a batch")
    public ResponseEntity<ApiResponse<List<com.pravp.backend.dto.UserDTO>>> getBatchStudents(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getBatchStudents(id), "Batch students fetched successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a batch")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable String id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Batch deleted successfully"));
    }

    @PostMapping("/{id}/students")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a student to a batch by email")
    public ResponseEntity<ApiResponse<BatchResponse>> addStudent(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        return ResponseEntity.ok(ApiResponse.success(batchService.addStudent(id, email), "Student added to batch"));
    }

    @DeleteMapping("/{id}/students/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove a student from a batch")
    public ResponseEntity<ApiResponse<BatchResponse>> removeStudent(
            @PathVariable String id,
            @PathVariable String email) {
        return ResponseEntity
                .ok(ApiResponse.success(batchService.removeStudent(id, email), "Student removed from batch"));
    }
}
