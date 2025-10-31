package com.example.herbalChatbot.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prompts")
@Data  @NoArgsConstructor @AllArgsConstructor @Builder
public class Prompt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 10000)
    private String promptText;

    private String role; // e.g., "system" / "user"

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}
