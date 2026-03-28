package com.pravp.backend.service;

import com.pravp.backend.dto.DetailedResultDTO;
import com.pravp.backend.dto.QuestionResultDTO;
import com.pravp.backend.model.*;
import com.pravp.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EvaluationService {
    private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);

    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;
    private final StudentExamRepository studentExamRepository;
    private final CExecutionService cExecutionService;

    public EvaluationService(QuestionRepository questionRepository,
            StudentAnswerRepository studentAnswerRepository,
            ResultRepository resultRepository,
            ExamRepository examRepository,
            StudentExamRepository studentExamRepository,
            CExecutionService cExecutionService) {
        this.questionRepository = questionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
        this.studentExamRepository = studentExamRepository;
        this.cExecutionService = cExecutionService;
    }

    public synchronized Result evaluateExam(StudentExam studentExam) {
        // Prevent concurrent evaluations from duplicate API requests
        java.util.Optional<Result> existingResult = resultRepository.findByStudentExamId(studentExam.getId());
        if (existingResult.isPresent()) {
            return existingResult.get();
        }

        List<Question> questions = questionRepository.findByExamId(studentExam.getExamId());
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExamId(studentExam.getId());

        Map<String, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int totalScore = 0;
        int totalPossibleMarks = questions.stream().mapToInt(Question::getMarks).sum();

        for (StudentAnswer answer : answers) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question != null) {
                boolean isCorrect = false;
                if (question.getType() == QuestionType.CODE) {
                    isCorrect = evaluateCodeQuestion(question, answer.getCodeAnswer());
                } else {
                    // Default to MCQ
                    isCorrect = question.getCorrectAnswer() != null && 
                                question.getCorrectAnswer().equals(answer.getSelectedOptionIndex());
                }
                
                answer.setIsCorrect(isCorrect);
                studentAnswerRepository.save(answer);

                if (isCorrect) {
                    totalScore += question.getMarks();
                }
            }
        }

        Result result = new Result();
        result.setStudentId(studentExam.getStudentId());
        result.setExamId(studentExam.getExamId());
        result.setStudentExamId(studentExam.getId());
        result.setScore(totalScore);
        result.setTotalMarks(totalPossibleMarks);
        result.setPercentage((double) totalScore / totalPossibleMarks * 100);
        result.setSubmittedAt(LocalDateTime.now());

        return resultRepository.save(result);
    }

    public DetailedResultDTO getDetailedResult(String resultId) {
        logger.info("Service: Fetching detailed result for resultId: {}", resultId);

        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        String examId = result.getExamId();
        String studentId = result.getStudentId();
        String studentExamId = result.getStudentExamId();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        StudentExam studentExam;
        if (studentExamId != null) {
            studentExam = studentExamRepository.findById(studentExamId)
                    .orElseThrow(() -> new RuntimeException("Student exam attempt not found"));
        } else {
            // Fallback for older results without studentExamId
            logger.warn("Result {} missing studentExamId, falling back to matching attempt", resultId);
            List<StudentExam> attempts = studentExamRepository.findByStudentIdAndExamId(studentId, examId);
            if (attempts.isEmpty()) {
                throw new RuntimeException("No attempt found for result " + resultId);
            }

            // Sort by startTime descending to get newest first
            attempts.sort((a, b) -> b.getStartTime().compareTo(a.getStartTime()));

            // Try to find one that is SUBMITTED and matches result score if possible
            studentExam = attempts.stream()
                    .filter(a -> "SUBMITTED".equals(a.getStatus()) || "AUTO_SUBMITTED".equals(a.getStatus()))
                    .findFirst()
                    .orElse(attempts.get(0));

            logger.info("Matched result {} to attempt {} (Status: {})", resultId, studentExam.getId(),
                    studentExam.getStatus());
        }

        List<Question> questions = questionRepository.findByExamId(examId);
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExamId(studentExam.getId());

        logger.info("Found {} questions and {} answers for attempt {}", questions.size(), answers.size(),
                studentExam.getId());

        // Use merge function to handle potential duplicate answers for same question
        Map<String, StudentAnswer> answerMap = answers.stream()
                .collect(Collectors.toMap(StudentAnswer::getQuestionId, a -> a, (a1, a2) -> a1));

        List<QuestionResultDTO> questionResults = new ArrayList<>();
        int totalScore = 0;
        int totalPossibleMarks = 0;

        for (Question q : questions) {
            StudentAnswer sa = answerMap.get(q.getId());
            Integer selectedIndex = (sa != null) ? sa.getSelectedOptionIndex() : null;
            Boolean isCorrect = (sa != null) ? sa.getIsCorrect() : false;

            questionResults.add(new QuestionResultDTO(
                    q.getQuestionText(),
                    q.getOptions(),
                    selectedIndex,
                    q.getCorrectAnswer(),
                    isCorrect,
                    q.getMarks(),
                    q.getType(),
                    (sa != null) ? sa.getCodeAnswer() : null));

            totalPossibleMarks += q.getMarks();
            if (isCorrect != null && isCorrect) {
                totalScore += q.getMarks();
            }
        }

        return new DetailedResultDTO(exam.getTitle(), questionResults, totalScore, totalPossibleMarks);
    }

    public void deleteResultByStudentExamId(String studentExamId) {
        resultRepository.deleteByStudentExamId(studentExamId);
    }

    private boolean evaluateCodeQuestion(Question question, String code) {
        if (code == null || code.isEmpty() || question.getTestCases() == null) {
            return false;
        }

        try {
            for (Question.TestCase testCase : question.getTestCases()) {
                String actualOutput = cExecutionService.runCCode(code, testCase.getInput());
                String expectedOutput = testCase.getExpectedOutput() != null ? testCase.getExpectedOutput().trim() : "";
                
                if (!expectedOutput.equals(actualOutput.trim())) {
                    return false; // Failed one test case
                }
            }
            return true; // All test cases passed
        } catch (Exception e) {
            logger.error("Error evaluating code question: {}", e.getMessage());
            return false;
        }
    }
}
