package com.pravp.backend.service;

import com.pravp.backend.dto.QuestionRequest;
import com.pravp.backend.dto.QuestionResponse;
import com.pravp.backend.model.Question;
import com.pravp.backend.model.Exam;
import com.pravp.backend.model.StudentExam;
import com.pravp.backend.repository.QuestionRepository;
import com.pravp.backend.repository.ExamRepository;
import com.pravp.backend.repository.StudentExamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final StudentExamRepository studentExamRepository;

    public QuestionService(QuestionRepository questionRepository, ExamRepository examRepository, StudentExamRepository studentExamRepository) {
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
        this.studentExamRepository = studentExamRepository;
    }

    public QuestionResponse addQuestion(QuestionRequest request) {
        Question question = new Question();
        mapRequestToModel(request, question);
        return mapModelToResponse(questionRepository.save(question));
    }

    public QuestionResponse updateQuestion(String id, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        mapRequestToModel(request, question);
        return mapModelToResponse(questionRepository.save(question));
    }

    public void deleteQuestion(String id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    public Page<QuestionResponse> getQuestionsByExam(String examId, Pageable pageable) {
        return questionRepository.findByExamId(Objects.requireNonNull(examId), Objects.requireNonNull(pageable))
                .map(this::mapModelToResponse);
    }

    public QuestionResponse getQuestionById(String id) {
        return questionRepository.findById(id)
                .map(this::mapModelToResponse)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public List<QuestionResponse> getRandomizedQuestions(String examId) {
        List<Question> questions = questionRepository.findByExamId(examId);
        Collections.shuffle(questions);
        
        // Check if there is a limit on questions per student
        Integer limit = examRepository.findById(examId)
                .map(Exam::getQuestionsPerStudent)
                .orElse(0);
        
        if (limit != null && limit > 0 && limit < questions.size()) {
            questions = questions.subList(0, limit);
        }
        
        return questions.stream()
                .map(this::mapModelToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionResponse> getQuestionsForAttempt(String studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam session not found"));
        
        List<String> questionIds = studentExam.getQuestionIds();
        
        // Fetch questions maintaining the order stored in StudentExam
        return questionIds.stream()
                .map(id -> questionRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(this::mapModelToResponse)
                .collect(Collectors.toList());
    }

    private void mapRequestToModel(QuestionRequest request, Question question) {
        question.setExamId(request.getExamId());
        question.setQuestionText(request.getQuestionText());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setMarks(request.getMarks());
        question.setDifficultyLevel(request.getDifficultyLevel());
        question.setType(request.getType() != null ? request.getType() : com.pravp.backend.model.QuestionType.MCQ);
        question.setTemplateCode(request.getTemplateCode());
        question.setTestCases(request.getTestCases());
    }

    private QuestionResponse mapModelToResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setExamId(question.getExamId());
        response.setQuestionText(question.getQuestionText());
        response.setOptions(question.getOptions());
        response.setCorrectAnswer(question.getCorrectAnswer());
        response.setMarks(question.getMarks());
        response.setDifficultyLevel(question.getDifficultyLevel());
        response.setCreatedAt(question.getCreatedAt());
        response.setType(question.getType());
        response.setTemplateCode(question.getTemplateCode());
        response.setTestCases(question.getTestCases());
        return response;
    }
}
