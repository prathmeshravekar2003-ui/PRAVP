package com.pravp.backend.service;

import com.pravp.backend.model.Exam;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiParserService {

    public List<Exam.Question> parseQuestionsFromText(String text) {
        List<Exam.Question> questions = new ArrayList<>();

        System.out.println("Starting PDF Text Analysis...");

        // Normalize text
        text = text.replaceAll("\\r", "");

        // Broad Question Marker detection
        // Matches "1.", "Q1.", "Question 1:", "(1)", "1)" etc.
        // We look for these ANYWHERE, but we prioritize starts of lines in our split
        // logic
        Pattern qMarkerPattern = Pattern.compile("(?:^|\\n|\\r)\\s*(?:(?:Question|Q|q)\\s*)?(\\d+)[.\\)\\-:]\\s*");
        Matcher qMatcher = qMarkerPattern.matcher(text);

        List<Integer> qStarts = new ArrayList<>();
        while (qMatcher.find()) {
            qStarts.add(qMatcher.start());
        }

        System.out.println("Found " + qStarts.size() + " potential question markers.");

        if (qStarts.isEmpty()) {
            // Very aggressive fallback: any number followed by a dot and space at start of
            // line
            Pattern fallbackPattern = Pattern.compile("(?m)^(\\d+)\\.\\s+");
            qMatcher = fallbackPattern.matcher(text);
            while (qMatcher.find()) {
                qStarts.add(qMatcher.start());
            }
            System.out.println("Fallback search found " + qStarts.size() + " markers.");
        }

        for (int i = 0; i < qStarts.size(); i++) {
            int start = qStarts.get(i);
            int end = (i + 1 < qStarts.size()) ? qStarts.get(i + 1) : text.length();
            String chunk = text.substring(start, end).trim();

            System.out.println("Parsing Question Block " + (i + 1) + " (Length: " + chunk.length() + ")");
            Exam.Question question = parseChunk(chunk, i + 1);
            if (question != null && isValid(question)) {
                questions.add(question);
            } else {
                System.out.println("Question Block " + (i + 1) + " was rejected (Invalid or missed contents)");
            }
        }

        System.out.println("Final Result: " + questions.size() + " questions extracted successfully.");
        return questions;
    }

    private Exam.Question parseChunk(String chunk, int index) {
        try {
            Exam.Question question = new Exam.Question();
            question.setMarks(5);
            question.setCorrectOptionIndex(0);

            // 0. Strip leading question label (e.g., "1.", "Q1:") to avoid collision with
            // options 1-4
            Pattern firstQMarker = Pattern.compile("^\\s*(?:(?:Question|Q|q)\\s*)?\\d+[.\\)\\-:]\\s*",
                    Pattern.CASE_INSENSITIVE);
            Matcher m = firstQMarker.matcher(chunk);
            if (m.find()) {
                chunk = chunk.substring(m.end()).trim();
            }

            // 1. Extract Answer (Standalone line or inline at the end)
            Pattern ansPattern = Pattern.compile("(?i)(?:Correct\\s+)?Answer\\s*[:\\-=]\\s*([A-Da-d1-4])");
            Matcher ansMatcher = ansPattern.matcher(chunk);
            if (ansMatcher.find()) {
                String rawAnswer = ansMatcher.group(1).trim().toUpperCase();
                parseAnswer(rawAnswer, question);
                chunk = chunk.substring(0, ansMatcher.start()); // Clean chunk
            }

            // 2. Identify Options
            // Flexible marker: [A-D], A), A., (A)
            Pattern optPattern = Pattern.compile("(?i)\\s*[\\[\\(]?([A-Da-d1-4])[\\)\\]\\.]\\s+");
            Matcher optMatcher = optPattern.matcher(chunk);

            List<Integer> optStarts = new ArrayList<>();
            while (optMatcher.find()) {
                optStarts.add(optMatcher.start());
            }

            if (optStarts.isEmpty()) {
                System.out.println("  -> No options found in block " + index);
                return null;
            }

            // Question Text: Header until first option
            String qHeader = chunk.substring(0, optStarts.get(0)).trim();
            qHeader = qHeader.replaceAll("^(?m)\\s*(?:(?:Question|Q|q)\\s*)?\\d+[.\\)\\-:]\\s*", "").trim();
            question.setQuestionText(qHeader);

            List<String> options = new ArrayList<>();
            for (int k = 0; k < optStarts.size(); k++) {
                int oStart = optStarts.get(k);
                int oEnd = (k + 1 < optStarts.size()) ? optStarts.get(k + 1) : chunk.length();
                String optFull = chunk.substring(oStart, oEnd).trim();
                // Strip the marker
                String cleanedOpt = optFull.replaceAll("^(?i)[\\[\\(]?[A-Da-d1-4][\\)\\]\\.]\\s*", "").trim();
                if (!cleanedOpt.isEmpty()) {
                    options.add(cleanedOpt);
                }
            }
            question.setOptions(options);
            System.out.println("  -> Question extracted with " + options.size() + " options.");

            return question;
        } catch (Exception e) {
            System.out.println("  -> Exception parsing block " + index + ": " + e.getMessage());
            return null;
        }
    }

    private boolean isValid(Exam.Question q) {
        return q.getQuestionText() != null && !q.getQuestionText().isEmpty()
                && q.getOptions() != null && q.getOptions().size() >= 2;
    }

    private void parseAnswer(String ansText, Exam.Question q) {
        if (ansText == null || ansText.isEmpty())
            return;
        char first = ansText.toUpperCase().charAt(0);
        if (Character.isDigit(first)) {
            q.setCorrectOptionIndex(Character.getNumericValue(first) - 1);
        } else if (first >= 'A' && first <= 'D') {
            q.setCorrectOptionIndex(first - 'A');
        }
    }
}
