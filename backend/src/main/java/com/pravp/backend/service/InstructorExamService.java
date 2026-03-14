package com.pravp.backend.service;

import com.pravp.backend.dto.StudentExamAttemptDTO;
import com.pravp.backend.model.CheatingLog;
import com.pravp.backend.model.Exam;
import com.pravp.backend.model.ReconductLog;
import com.pravp.backend.model.StudentExam;
import com.pravp.backend.model.User;
import com.pravp.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InstructorExamService {

    private final StudentExamRepository studentExamRepository;
    private final CheatingLogRepository cheatingLogRepository;
    private final ExamAttemptService examAttemptService;
    private final ExamRepository examRepository;
    private final ReconductLogRepository reconductLogRepository;
    private final UserRepository userRepository;
    private final ResultRepository resultRepository;
    private final EvaluationService evaluationService;
    private final ExcelExportService excelExportService;

    public InstructorExamService(StudentExamRepository studentExamRepository,
                                 CheatingLogRepository cheatingLogRepository,
                                 ExamAttemptService examAttemptService,
                                 ExamRepository examRepository,
                                 ReconductLogRepository reconductLogRepository,
                                 UserRepository userRepository,
                                 ResultRepository resultRepository,
                                 EvaluationService evaluationService,
                                 ExcelExportService excelExportService) {
        this.studentExamRepository = studentExamRepository;
        this.cheatingLogRepository = cheatingLogRepository;
        this.examAttemptService = examAttemptService;
        this.examRepository = examRepository;
        this.reconductLogRepository = reconductLogRepository;
        this.userRepository = userRepository;
        this.resultRepository = resultRepository;
        this.evaluationService = evaluationService;
        this.excelExportService = excelExportService;
    }

    public List<StudentExamAttemptDTO> getAttemptsByExam(String examId) {
        List<StudentExam> attempts = studentExamRepository.findAll().stream()
                .filter(se -> examId.equals(se.getExamId()))
                .toList();

        return attempts.stream().map(se -> {
            String studentName = userRepository.findByEmail(se.getStudentId())
                    .map(User::getName)
                    .orElse(se.getStudentId()); // Fallback to email if name not found
            
            long alertCount = cheatingLogRepository.countByStudentIdAndExamId(se.getStudentId(), se.getExamId());

            return new StudentExamAttemptDTO(
                    se.getId(),
                    se.getStudentId(),
                    studentName,
                    se.getExamId(),
                    se.getStartTime(),
                    se.getStatus(),
                    se.getIsSuspicious(),
                    alertCount
            );
        }).toList();
    }

    public List<CheatingLog> getCheatingAlerts(String studentId, String examId) {
        return cheatingLogRepository.findByStudentIdAndExamId(studentId, examId);
    }

    public void approveAttempt(String studentExamId) {
        StudentExam se = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        se.setIsSuspicious(false);
        studentExamRepository.save(se);
    }

    public void flagAttempt(String studentExamId) {
        StudentExam se = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        se.setIsSuspicious(true);
        studentExamRepository.save(se);
    }

    public void reconductExam(String studentExamId, String instructorId, String reason) {
        StudentExam se = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Delete previous attempt & result & answers
        examAttemptService.deleteExamAttempt(studentExamId);

        // Record reconduct log
        ReconductLog log = new ReconductLog(instructorId, se.getStudentId(), se.getExamId(), reason, LocalDateTime.now());
        reconductLogRepository.save(log);
    }

    public com.pravp.backend.dto.DetailedResultDTO getStudentPerformanceReport(String studentExamId) {
        com.pravp.backend.model.Result result = resultRepository.findByStudentExamId(studentExamId)
                .orElseThrow(() -> new RuntimeException("No result found for this exam attempt"));
        
        return evaluationService.getDetailedResult(result.getId());
    }

    public byte[] exportResultsToExcel(String examId) throws java.io.IOException {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        List<com.pravp.backend.model.Result> results = resultRepository.findByExamId(examId);
        
        List<com.pravp.backend.dto.StudentResultExportDTO> exportData = results.stream().map(r -> {
            String studentName = userRepository.findByEmail(r.getStudentId())
                    .map(User::getName)
                    .orElse(r.getStudentId());
            
            return new com.pravp.backend.dto.StudentResultExportDTO(
                    r.getStudentId(),
                    studentName,
                    r.getScore(),
                    r.getTotalMarks(),
                    r.getPercentage()
            );
        }).toList();

        return excelExportService.exportExamResults(exam.getTitle(), exportData);
    }
}
