package com.pravp.backend.repository;

import com.pravp.backend.model.CheatingLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CheatingLogRepository extends MongoRepository<CheatingLog, String> {
    List<CheatingLog> findByExamId(String examId);

    List<CheatingLog> findByStudentIdAndExamId(String studentId, String examId);

    long countByStudentIdAndExamId(String studentId, String examId);
}
