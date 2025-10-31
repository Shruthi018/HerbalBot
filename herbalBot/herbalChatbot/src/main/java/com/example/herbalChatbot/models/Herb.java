package com.example.herbalChatbot.models;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "herbs")
@Data
public class Herb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "common_name")
    private String commonName;

    @Column(name = "botanical_name")
    private String botanicalName;

    private String symptom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "how_to_use", columnDefinition = "TEXT")
    private String howToUse;

    @Column(length = 1000)
    private String link;

}
