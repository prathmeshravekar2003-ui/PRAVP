package com.pravp.backend.repository;

import com.pravp.backend.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {
    Page<Question> findByExamId(String examId, Pageable pageable);

    List<Question> findByExamId(String examId);
}
