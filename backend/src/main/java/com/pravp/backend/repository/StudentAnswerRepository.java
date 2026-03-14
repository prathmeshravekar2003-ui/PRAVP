package com.pravp.backend.repository;

import com.pravp.backend.model.StudentAnswer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface StudentAnswerRepository extends MongoRepository<StudentAnswer, String> {
    List<StudentAnswer> findByStudentExamId(String studentExamId);

    Optional<StudentAnswer> findByStudentExamIdAndQuestionId(String studentExamId, String questionId);

    void deleteByStudentExamId(String studentExamId);
}
