package com.example.herbalChatbot.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "herb_feedback")
public class HerbFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "score")
    private Double score;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "category")
    private String category;

    @Column(name = "feedback_text", nullable = false) // This is the main feedback text
    private String feedbackText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}