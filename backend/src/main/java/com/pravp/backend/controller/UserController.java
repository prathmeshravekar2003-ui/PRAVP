package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.ProfileUpdateRequest;
import com.pravp.backend.dto.RoleUpdateRequest;
import com.pravp.backend.dto.UserDTO;
import com.pravp.backend.model.Role;
import com.pravp.backend.model.User;
import com.pravp.backend.service.UserService;
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

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "Endpoints for managing users (Admin/Instructor only)")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get all users (Admin) or students (Instructor)")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserDTO> users;

        if (currentUser.getRole() == Role.ADMIN) {
            users = userService.getAllUsers(name, role, pageable);
        } else {
            // Instructor can only view students
            users = userService.getStudents(name, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(users, "Users fetched successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID (Admin only)")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id), "User fetched successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change user role (Admin only)")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserRole(id, request.getRole()),
                "User role updated successfully"));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(currentUser.getId(), request),
                "Profile updated successfully"));
    }

    @GetMapping("/available-students")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get students not assigned to any batch")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAvailableStudents() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAvailableStudents(), "Available students fetched"));
    }

    @GetMapping("/instructors")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users with Role.INSTRUCTOR (Admin only)")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getInstructors() {
        return ResponseEntity.ok(ApiResponse.success(userService.getInstructors(), "Instructors fetched successfully"));
    }
}
