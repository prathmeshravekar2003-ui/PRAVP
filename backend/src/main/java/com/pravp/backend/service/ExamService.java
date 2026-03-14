package com.pravp.backend.service;

import com.pravp.backend.dto.ExamRequest;
import com.pravp.backend.dto.ExamResponse;
import com.pravp.backend.model.Exam;
import com.pravp.backend.model.ExamStatus;
import com.pravp.backend.model.Role;
import com.pravp.backend.model.User;
import com.pravp.backend.repository.ExamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final BatchService batchService;
    private final PdfProcessingService pdfProcessingService;
    private final AiParserService aiParserService;

    public ExamService(ExamRepository examRepository, BatchService batchService,
            PdfProcessingService pdfProcessingService, AiParserService aiParserService) {
        this.examRepository = examRepository;
        this.batchService = batchService;
        this.pdfProcessingService = pdfProcessingService;
        this.aiParserService = aiParserService;
    }

    public List<Exam.Question> parsePdfToQuestions(org.springframework.web.multipart.MultipartFile file) {
        try {
            String text = pdfProcessingService.extractTextFromPdf(file);
            return aiParserService.parseQuestionsFromText(text);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to process PDF: " + e.getMessage());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(value = "exams", allEntries = true)
    public ExamResponse createExam(ExamRequest request, User user) {
        Exam exam = new Exam();
        mapRequestToModel(request, exam);
        exam.setCreatedBy(user.getId());
        return mapModelToResponse(examRepository.save(exam));
    }

    public ExamResponse updateExam(String id, ExamRequest request, User user) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (!exam.getCreatedBy().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("You are not authorized to update this exam");
        }

        mapRequestToModel(request, exam);
        return mapModelToResponse(examRepository.save(exam));
    }

    public void deleteExam(String id, User user) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (!exam.getCreatedBy().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("You are not authorized to delete this exam");
        }

        examRepository.delete(exam);
    }

    public Page<ExamResponse> getExams(Pageable pageable, User user, String instructorId) {
        if (user.getRole() == Role.ADMIN) {
            if (instructorId != null && !instructorId.trim().isEmpty() && !"null".equalsIgnoreCase(instructorId)) {
                return examRepository.findByCreatedBy(instructorId, pageable).map(this::mapModelToResponse);
            }
            return examRepository.findAll(pageable).map(this::mapModelToResponse);
        } else if (user.getRole() == Role.INSTRUCTOR) {
            return examRepository.findByCreatedBy(user.getId(), pageable).map(this::mapModelToResponse);
        } else {
            // STUDENT: Only see published exams that are either unrestricted (no batches)
            // or assigned to one of their batches
            List<String> studentBatchIds = batchService.getBatchIdsForStudent(user.getEmail());
            List<Exam> allPublished = examRepository.findByStatus(ExamStatus.PUBLISHED);
            List<Exam> filtered = allPublished.stream()
                    .filter(exam -> exam.getBatchIds() == null
                            || exam.getBatchIds().isEmpty()
                            || exam.getBatchIds().stream().anyMatch(studentBatchIds::contains))
                    .collect(Collectors.toList());

            // Manual pagination
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), filtered.size());
            List<Exam> page = start >= filtered.size() ? List.of() : filtered.subList(start, end);
            return new PageImpl<>(page.stream().map(this::mapModelToResponse).collect(Collectors.toList()),
                    pageable, filtered.size());
        }
    }

    @org.springframework.cache.annotation.Cacheable(value = "exams", key = "#id")
    public ExamResponse getExamById(String id) {
        return examRepository.findById(id)
                .map(this::mapModelToResponse)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    private void mapRequestToModel(ExamRequest request, Exam exam) {
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setDuration(request.getDuration());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setTotalMarks(request.getTotalMarks());
        if (request.getStatus() != null) {
            exam.setStatus(request.getStatus());
        }
        exam.setQuestions(request.getQuestions());
        exam.setAntiCheatConfig(request.getAntiCheatConfig());
        if (request.getBatchIds() != null) {
            exam.setBatchIds(request.getBatchIds());
        }
    }

    private ExamResponse mapModelToResponse(Exam exam) {
        ExamResponse response = new ExamResponse();
        response.setId(exam.getId());
        response.setTitle(exam.getTitle());
        response.setDescription(exam.getDescription());
        response.setDuration(exam.getDuration());
        response.setStartTime(exam.getStartTime());
        response.setEndTime(exam.getEndTime());
        response.setTotalMarks(exam.getTotalMarks());
        response.setStatus(exam.getStatus());
        response.setCreatedBy(exam.getCreatedBy());
        response.setCreatedAt(exam.getCreatedAt());
        response.setQuestions(exam.getQuestions());
        response.setAntiCheatConfig(exam.getAntiCheatConfig());
        response.setBatchIds(exam.getBatchIds());
        return response;
    }
}
