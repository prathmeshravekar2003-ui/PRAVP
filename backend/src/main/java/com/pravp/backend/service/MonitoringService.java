package com.pravp.backend.service;

import com.pravp.backend.dto.CheatingLogRequest;
import com.pravp.backend.model.CheatingLog;
import com.pravp.backend.model.StudentExam;
import com.pravp.backend.repository.CheatingLogRepository;
import com.pravp.backend.repository.ExamRepository;
import com.pravp.backend.repository.StudentExamRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MonitoringService {

    private final CheatingLogRepository cheatingLogRepository;
    private final StudentExamRepository studentExamRepository;
    private final ExamRepository examRepository;

    public MonitoringService(CheatingLogRepository cheatingLogRepository,
            StudentExamRepository studentExamRepository,
            ExamRepository examRepository) {
        this.cheatingLogRepository = cheatingLogRepository;
        this.studentExamRepository = studentExamRepository;
        this.examRepository = examRepository;
    }

    public void logCheatingEvent(CheatingLogRequest request, String studentId) {
        CheatingLog log = new CheatingLog();
        log.setStudentId(studentId);
        log.setExamId(request.getExamId());
        log.setEventType(request.getEventType());
        log.setEventTime(LocalDateTime.now());
        log.setSeverity(request.getSeverity() != null ? request.getSeverity() : "MEDIUM");
        log.setDetails(request.getDetails());
        cheatingLogRepository.save(log);
    }

    public List<StudentExam> getActiveExams(String instructorId) {
        List<StudentExam> active = studentExamRepository.findAll().stream()
                .filter(se -> se.getStatus().equals("STARTED"))
                .toList();

        if (instructorId == null) {
            return active;
        }

        // Filter by exams created by the instructor
        return active.stream()
                .filter(se -> {
                    return examRepository.findById(se.getExamId())
                            .map(ex -> ex.getCreatedBy().equals(instructorId))
                            .orElse(false);
                })
                .toList();
    }

    public List<StudentExam> getStudentsByExam(String examId) {
        return studentExamRepository.findAll().stream()
                .filter(se -> se.getExamId().equals(examId))
                .toList();
    }

    public List<CheatingLog> getCheatingLogsByExam(String examId) {
        return cheatingLogRepository.findByExamId(examId);
    }

    public long getCheatingCount(String studentId, String examId) {
        return cheatingLogRepository.countByStudentIdAndExamId(studentId, examId);
    }

    public List<CheatingLog> getRecentCheatingLogs(int limit, String instructorId) {
        List<CheatingLog> logs = cheatingLogRepository.findAll().stream()
                .sorted((a, b) -> b.getEventTime().compareTo(a.getEventTime()))
                .toList();

        if (instructorId != null) {
            logs = logs.stream()
                    .filter(log -> {
                        return examRepository.findById(log.getExamId())
                                .map(ex -> ex.getCreatedBy().equals(instructorId))
                                .orElse(false);
                    })
                    .toList();
        }

        return logs.stream().limit(limit).toList();
    }

    public com.pravp.backend.dto.MonitoringStatsDTO getStats(String instructorId) {
        long active = getActiveExams(instructorId).size();
        long alerts = cheatingLogRepository.count(); // Simplified for now
        
        // This is a bit simplified, but gives the idea
        return new com.pravp.backend.dto.MonitoringStatsDTO(
            150, // Dummy total users for now or inject userRepo
            active,
            alerts,
            active > 0 ? (double)alerts/active : 0
        );
    }
}
