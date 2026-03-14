package com.pravp.backend.dto;

import com.pravp.backend.model.Role;
import jakarta.validation.constraints.NotNull;

public class RoleUpdateRequest {
    @NotNull(message = "Role is required")
    private Role role;

    public RoleUpdateRequest() {
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
