package com.example.herbalChatbot.controller;

import com.example.herbalChatbot.models.HerbFeedback;
import com.example.herbalChatbot.repository.HerbFeedbackRepository;
import com.example.herbalChatbot.service.FeedbackFuzzyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final HerbFeedbackRepository feedbackRepository;
    private final FeedbackFuzzyService feedbackFuzzyService;

    public FeedbackController(HerbFeedbackRepository feedbackRepository,
                              FeedbackFuzzyService feedbackFuzzyService) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackFuzzyService = feedbackFuzzyService;
    }

    // --- User submits feedback ---
    @PostMapping
    public ResponseEntity<HerbFeedback> addFeedback(@RequestBody HerbFeedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        feedbackFuzzyService.saveFeedbackWithScore(feedback);
        HerbFeedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(saved);
    }

    // --- Admin requests fuzzy-scored view ---
    @GetMapping("/scores")
    public ResponseEntity<Map<String, Double>> getFeedbackScores(@RequestParam Long projectId) {
        List<HerbFeedback> feedbacks = feedbackRepository.findByProjectId(projectId);
        Map<String, Double> scores = feedbackFuzzyService.calculateScores(feedbacks);
        return ResponseEntity.ok(scores);
    }

    // --- Get detailed fuzzy analysis ---
    @GetMapping("/fuzzy-analysis")
    public ResponseEntity<Map<String, Object>> getFuzzyAnalysis(@RequestParam Long projectId) {
        List<HerbFeedback> feedbacks = feedbackRepository.findByProjectId(projectId);
        Map<String, Object> analysis = feedbackFuzzyService.calculateDetailedFuzzyAnalysis(feedbacks);
        return ResponseEntity.ok(analysis);
    }

    // --- Get all feedback with parsed data ---
    @GetMapping("/all")
    public ResponseEntity<List<HerbFeedback>> getAllFeedback(@RequestParam Long projectId) {
        List<HerbFeedback> feedbacks = feedbackRepository.findByProjectId(projectId);
        return ResponseEntity.ok(feedbacks);
    }

    // --- Get all feedback from all projects ---
    @GetMapping("/all-projects")
    public ResponseEntity<List<HerbFeedback>> getAllProjectsFeedback() {
        List<HerbFeedback> allFeedbacks = feedbackRepository.findAll();
        return ResponseEntity.ok(allFeedbacks);
    }
}