package com.pravp.backend.service;

import com.pravp.backend.dto.ProfileUpdateRequest;
import com.pravp.backend.dto.UserDTO;
import com.pravp.backend.model.Role;
import com.pravp.backend.model.User;
import com.pravp.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<UserDTO> getAllUsers(String name, Role role, Pageable pageable) {
        Page<User> userPage;
        if (name != null && role != null) {
            userPage = userRepository.findByNameContainingIgnoreCaseAndRole(name, role, pageable);
        } else if (name != null) {
            userPage = userRepository.findByNameContainingIgnoreCase(name, pageable);
        } else if (role != null) {
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        return userPage.map(this::convertToDTO);
    }

    public Page<UserDTO> getStudents(String name, Pageable pageable) {
        if (name != null) {
            return userRepository.findByNameContainingIgnoreCaseAndRole(name, Role.STUDENT, pageable)
                    .map(this::convertToDTO);
        }
        return userRepository.findByRole(Role.STUDENT, pageable)
                .map(this::convertToDTO);
    }

    public UserDTO getUserById(String id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public List<UserDTO> getAvailableStudents() {
        return userRepository.findByRoleAndBatchIdIsNull(Role.STUDENT)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getInstructors() {
        return userRepository.findByRole(Role.INSTRUCTOR)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUserRole(String id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return convertToDTO(userRepository.save(user));
    }

    public UserDTO updateProfile(String id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(request.getName());
        return convertToDTO(userRepository.save(user));
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.isEnabled());
    }
}
