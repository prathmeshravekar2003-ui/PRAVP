package com.pravp.backend.repository;

import com.pravp.backend.model.StudentExam;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface StudentExamRepository extends MongoRepository<StudentExam, String> {
    List<StudentExam> findByStudentIdAndExamId(String studentId, String examId);
}
