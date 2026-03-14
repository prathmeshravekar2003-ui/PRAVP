package com.pravp.backend.repository;

import com.pravp.backend.model.ReconductLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReconductLogRepository extends MongoRepository<ReconductLog, String> {
    List<ReconductLog> findByExamId(String examId);
    List<ReconductLog> findByStudentId(String studentId);
}
