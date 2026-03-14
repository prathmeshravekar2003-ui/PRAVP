package com.pravp.backend.repository;

import com.pravp.backend.model.Batch;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BatchRepository extends MongoRepository<Batch, String> {
    List<Batch> findByStudentEmailsContaining(String email);
}
