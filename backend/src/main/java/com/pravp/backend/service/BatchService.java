package com.pravp.backend.service;

import com.pravp.backend.dto.BatchRequest;
import com.pravp.backend.dto.BatchResponse;
import com.pravp.backend.model.Batch;
import com.pravp.backend.model.User;
import com.pravp.backend.repository.BatchRepository;
import com.pravp.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchService {

    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BatchService(BatchRepository batchRepository, UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public BatchResponse createBatch(BatchRequest request, String adminId) {
        Batch batch = new Batch();
        batch.setName(request.getName());
        batch.setDescription(request.getDescription());
        batch.setCreatedBy(adminId);
        if (request.getStudentEmails() != null) {
            batch.setStudentEmails(request.getStudentEmails());
        }
        return mapToResponse(batchRepository.save(batch));
    }

    public BatchResponse updateBatch(String id, BatchRequest request) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        batch.setName(request.getName());
        batch.setDescription(request.getDescription());
        if (request.getStudentEmails() != null) {
            batch.setStudentEmails(request.getStudentEmails());
        }
        return mapToResponse(batchRepository.save(batch));
    }

    public void deleteBatch(String id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        // Clear batch info for students
        List<User> students = userRepository.findAll().stream()
                .filter(u -> id.equals(u.getBatchId()))
                .collect(Collectors.toList());
        for (User student : students) {
            student.setBatchId(null);
            student.setBatchName(null);
            userRepository.save(student);
        }

        batchRepository.deleteById(id);
        broadcastStudentUpdate();
    }

    public List<BatchResponse> getAllBatches() {
        return batchRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BatchResponse getBatchById(String id) {
        return batchRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
    }

    public List<com.pravp.backend.dto.UserDTO> getBatchStudents(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        return userRepository.findByEmailIn(batch.getStudentEmails()).stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    private com.pravp.backend.dto.UserDTO convertToUserDTO(User user) {
        return new com.pravp.backend.dto.UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.isEnabled());
    }

    public BatchResponse addStudent(String batchId, String studentEmail) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getBatchId() != null && !student.getBatchId().equals(batchId)) {
            throw new RuntimeException("Student is already in another batch: " + student.getBatchName());
        }

        if (!batch.getStudentEmails().contains(studentEmail)) {
            batch.getStudentEmails().add(studentEmail);
            batchRepository.save(batch);

            student.setBatchId(batchId);
            student.setBatchName(batch.getName());
            userRepository.save(student);

            broadcastStudentUpdate();
        }
        return mapToResponse(batch);
    }

    public BatchResponse removeStudent(String batchId, String studentEmail) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (batch.getStudentEmails().remove(studentEmail)) {
            batchRepository.save(batch);

            userRepository.findByEmail(studentEmail).ifPresent(student -> {
                student.setBatchId(null);
                student.setBatchName(null);
                userRepository.save(student);
            });

            broadcastStudentUpdate();
        }
        return mapToResponse(batch);
    }

    private void broadcastStudentUpdate() {
        messagingTemplate.convertAndSend("/topic/available-students", "updated");
    }

    public List<String> getBatchIdsForStudent(String studentEmail) {
        return batchRepository.findByStudentEmailsContaining(studentEmail)
                .stream()
                .map(Batch::getId)
                .collect(Collectors.toList());
    }

    private BatchResponse mapToResponse(Batch batch) {
        BatchResponse res = new BatchResponse();
        res.setId(batch.getId());
        res.setName(batch.getName());
        res.setDescription(batch.getDescription());
        res.setCreatedBy(batch.getCreatedBy());
        res.setStudentEmails(batch.getStudentEmails());
        res.setCreatedAt(batch.getCreatedAt());
        return res;
    }
}
