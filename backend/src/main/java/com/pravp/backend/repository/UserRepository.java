package com.pravp.backend.repository;

import com.pravp.backend.model.Role;
import com.pravp.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<User> findByRole(Role role, Pageable pageable);

    List<User> findByRole(Role role);

    Page<User> findByNameContainingIgnoreCaseAndRole(String name, Role role, Pageable pageable);

    List<User> findByRoleAndBatchIdIsNull(Role role);
}
