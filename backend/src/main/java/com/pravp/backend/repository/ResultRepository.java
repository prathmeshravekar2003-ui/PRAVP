package com.pravp.backend.repository;

import com.pravp.backend.model.Result;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ResultRepository extends MongoRepository<Result, String> {
    List<Result> findByStudentId(String studentId);

    List<Result> findByExamId(String examId);

    Optional<Result> findByStudentExamId(String studentExamId);

    void deleteByStudentExamId(String studentExamId);
}
