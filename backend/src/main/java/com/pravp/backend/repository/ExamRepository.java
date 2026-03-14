package com.pravp.backend.repository;

import com.pravp.backend.model.Exam;
import com.pravp.backend.model.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExamRepository extends MongoRepository<Exam, String> {
    Page<Exam> findByCreatedBy(String createdBy, Pageable pageable);

    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);

    java.util.List<Exam> findByStatus(ExamStatus status);
}
