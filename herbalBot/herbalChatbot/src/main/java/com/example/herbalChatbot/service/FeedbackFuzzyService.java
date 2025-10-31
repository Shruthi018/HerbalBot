package com.example.herbalChatbot.service;

import com.example.herbalChatbot.models.HerbFeedback;
import com.example.herbalChatbot.repository.HerbFeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FeedbackFuzzyService {

    private final HerbFeedbackRepository feedbackRepository;

    // Positive and negative words lists
    private final List<String> positiveWords = Arrays.asList(
            "good", "helpful", "effective", "excellent", "nice", "best", "amazing",
            "love", "fantastic", "great", "beneficial", "useful", "outstanding",
            "perfect", "wonderful", "pleasant", "satisfying", "valuable","precise"
    );

    private final List<String> negativeWords = Arrays.asList(
            "bad", "ineffective", "poor", "worse", "problem", "hate", "terrible",
            "awful", "disappointing", "unhelpful", "useless", "harmful", "worst",
            "painful", "annoying", "frustrating", "unpleasant", "dreadful"
    );

    public FeedbackFuzzyService(HerbFeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    // Parse feedback text to extract rating and category if present
    public void parseFeedbackComponents(HerbFeedback feedback) {
        String feedbackText = feedback.getFeedbackText();
        if (feedbackText == null || feedbackText.isBlank()) {
            feedback.setRating(null);
            feedback.setCategory("general");
            return;
        }

        // Pattern to match: "Rating: X/5, Category: category_name, Feedback: actual_feedback"
        Pattern pattern = Pattern.compile("Rating:\\s*(\\d)/5,\\s*Category:\\s*(\\w+),\\s*Feedback:\\s*(.*)");
        Matcher matcher = pattern.matcher(feedbackText);

        if (matcher.find()) {
            // Extract rating (convert to Integer)
            String ratingStr = matcher.group(1);
            try {
                feedback.setRating(Integer.parseInt(ratingStr));
            } catch (NumberFormatException e) {
                feedback.setRating(null);
            }

            // Extract category
            feedback.setCategory(matcher.group(2));

            // Extract clean feedback text
            String cleanFeedbackText = matcher.group(3).trim();
            if (!cleanFeedbackText.isEmpty()) {
                feedback.setFeedbackText(cleanFeedbackText);
            }
        } else {
            // If pattern doesn't match, set defaults
            feedback.setRating(null);
            feedback.setCategory("general");
        }
    }

    // Calculate raw sentiment score based on feedback text
    public double calculateRawSentiment(String feedbackText) {
        if (feedbackText == null || feedbackText.isBlank()) return 0.0;

        String text = feedbackText.toLowerCase();
        int positiveCount = 0;
        int negativeCount = 0;

        // Count positive words
        for (String word : positiveWords) {
            if (text.contains(word)) positiveCount++;
        }

        // Count negative words
        for (String word : negativeWords) {
            if (text.contains(word)) negativeCount++;
        }

        // Calculate raw sentiment (-1 to +1 range)
        double rawScore = 0.0;
        int totalWords = positiveCount + negativeCount;

        if (totalWords > 0) {
            rawScore = (double)(positiveCount - negativeCount) / totalWords;
        }

        return rawScore;
    }

    // Fuzzy membership functions for negative, neutral, and positive
    public Map<String, Double> calculateFuzzyMembership(double rawScore) {
        Map<String, Double> membership = new HashMap<>();

        // Negative membership function (triangular: -1, -0.5, 0)
        membership.put("negative", negativeMembership(rawScore));

        // Neutral membership function (triangular: -0.5, 0, 0.5)
        membership.put("neutral", neutralMembership(rawScore));

        // Positive membership function (triangular: 0, 0.5, 1)
        membership.put("positive", positiveMembership(rawScore));

        return membership;
    }

    // Negative membership function (0 to 0.3 range in output)
    private double negativeMembership(double x) {
        // Triangular function: -1, -0.5, 0
        if (x <= -1.0) return 1.0;
        if (x >= 0.0) return 0.0;
        if (x <= -0.5) return 1.0 - (x + 1.0) * 2.0; // -1 to -0.5
        return (0.0 - x) * 2.0; // -0.5 to 0
    }

    // Neutral membership function (0.4 to 0.6 range in output)
    private double neutralMembership(double x) {
        // Triangular function: -0.5, 0, 0.5
        if (x <= -0.5 || x >= 0.5) return 0.0;
        if (x <= 0.0) return (x + 0.5) * 2.0; // -0.5 to 0
        return (0.5 - x) * 2.0; // 0 to 0.5
    }

    // Positive membership function (0.7 to 1.0 range in output)
    private double positiveMembership(double x) {
        // Triangular function: 0, 0.5, 1
        if (x <= 0.0) return 0.0;
        if (x >= 1.0) return 1.0;
        if (x <= 0.5) return x * 2.0; // 0 to 0.5
        return 1.0 - (x - 0.5) * 2.0; // 0.5 to 1
    }

    // Defuzzify to get final score in 0-1 range with your specified categories
    public double defuzzify(Map<String, Double> membership) {
        // Use centroid method with your specified ranges:
        // Negative: centroid at 0.15 (range 0-0.3)
        // Neutral: centroid at 0.5 (range 0.4-0.6)
        // Positive: centroid at 0.85 (range 0.7-1.0)

        double numerator =
                membership.get("negative") * 0.15 +
                        membership.get("neutral") * 0.5 +
                        membership.get("positive") * 0.85;

        double denominator =
                membership.get("negative") +
                        membership.get("neutral") +
                        membership.get("positive");

        // Avoid division by zero
        if (denominator == 0) return 0.5; // Default to neutral

        double defuzzified = numerator / denominator;

        // Ensure the result is within 0-1 range
        return Math.max(0.0, Math.min(1.0, defuzzified));
    }

    // Calculate final fuzzy score
    public double calculateScore(String feedbackText) {
        double rawScore = calculateRawSentiment(feedbackText);
        Map<String, Double> membership = calculateFuzzyMembership(rawScore);
        return defuzzify(membership);
    }

    // Get sentiment category based on defuzzified score
    public String getSentimentCategory(double score) {
        if (score <= 0.3) {
            return "negative";
        } else if (score <= 0.6) {
            return "neutral";
        } else {
            return "positive";
        }
    }

    // Calculate sentiment scores for a list of feedbacks
    public Map<String, Double> calculateScores(List<HerbFeedback> feedbacks) {
        Map<String, Double> result = new HashMap<>();
        for (HerbFeedback fb : feedbacks) {
            double score = calculateScore(fb.getFeedbackText());
            result.put(fb.getFeedbackText(), score);
        }
        return result;
    }

    // Calculate detailed fuzzy analysis for a list of feedbacks
    public Map<String, Object> calculateDetailedFuzzyAnalysis(List<HerbFeedback> feedbacks) {
        Map<String, Object> result = new HashMap<>();

        for (HerbFeedback fb : feedbacks) {
            double rawScore = calculateRawSentiment(fb.getFeedbackText());
            Map<String, Double> membership = calculateFuzzyMembership(rawScore);
            double finalScore = defuzzify(membership);
            String category = getSentimentCategory(finalScore);

            Map<String, Object> analysis = new HashMap<>();
            analysis.put("rawScore", rawScore);
            analysis.put("membership", membership);
            analysis.put("finalScore", finalScore);
            analysis.put("category", category);
            analysis.put("feedbackText", fb.getFeedbackText());

            result.put("feedback_" + fb.getId(), analysis);
        }
        return result;
    }

    public void saveFeedbackWithScore(HerbFeedback feedback) {
        // First parse the feedback components
        parseFeedbackComponents(feedback);

        // Calculate score based on feedback text
        double score = calculateScore(feedback.getFeedbackText());
        feedback.setScore(score);

        feedbackRepository.save(feedback);
    }
}