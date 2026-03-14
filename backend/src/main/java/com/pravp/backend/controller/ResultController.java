package com.pravp.backend.controller;

import com.pravp.backend.dto.ApiResponse;
import com.pravp.backend.dto.DetailedResultDTO;
import com.pravp.backend.model.Result;
import com.pravp.backend.repository.ResultRepository;
import com.pravp.backend.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.pravp.backend.dto.ResultResponse;
import com.pravp.backend.repository.ExamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/results")
@Tag(name = "Result Evaluation", description = "Endpoints for viewing exam results")
public class ResultController {
    private static final Logger logger = LoggerFactory.getLogger(ResultController.class);

    private final ResultRepository resultRepository;
    private final EvaluationService evaluationService;
    private final ExamRepository examRepository;

    public ResultController(ResultRepository resultRepository, EvaluationService evaluationService,
            ExamRepository examRepository) {
        this.resultRepository = resultRepository;
        this.evaluationService = evaluationService;
        this.examRepository = examRepository;
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR') or #studentId == authentication.name")
    @Operation(summary = "Get results for a specific student")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getStudentResults(@PathVariable String studentId) {
        List<Result> results = resultRepository.findByStudentId(studentId);

        List<ResultResponse> responses = results.stream().map(result -> {
            ResultResponse res = new ResultResponse();
            res.setId(result.getId());
            res.setStudentId(result.getStudentId());
            res.setExamId(result.getExamId());
            res.setStudentExamId(result.getStudentExamId());
            res.setScore(result.getScore());
            res.setTotalMarks(result.getTotalMarks());
            res.setPercentage(result.getPercentage());
            res.setSubmittedAt(result.getSubmittedAt());

            // Fetch exam title
            examRepository.findById(result.getExamId())
                    .ifPresent(exam -> res.setExamTitle(exam.getTitle()));

            return res;
        }).collect(Collectors.toList());

        return ResponseEntity
                .ok(ApiResponse.success(responses, "Results fetched successfully"));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get results for a specific exam")
    public ResponseEntity<ApiResponse<List<Result>>> getExamResults(@PathVariable String examId) {
        return ResponseEntity
                .ok(ApiResponse.success(resultRepository.findByExamId(examId), "Results fetched successfully"));
    }

    @GetMapping("/detailed/{resultId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR') or @resultRepository.findById(#resultId).orElse(new com.pravp.backend.model.Result()).getStudentId() == authentication.name")
    @Operation(summary = "Get detailed results (questions/answers) for a specific result ID")
    public ResponseEntity<ApiResponse<DetailedResultDTO>> getDetailedResult(
            @PathVariable("resultId") String resultId) {
        logger.info("Fetching detailed result for resultId: {}", resultId);
        try {
            DetailedResultDTO result = evaluationService.getDetailedResult(resultId);
            return ResponseEntity.ok(ApiResponse.success(result, "Detailed result fetched successfully"));
        } catch (Exception e) {
            logger.error("Error fetching detailed result: ", e);
            throw e;
        }
    }
}
