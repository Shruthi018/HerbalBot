package com.example.herbalChatbot.repository;

import com.example.herbalChatbot.models.Herb;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HerbRepository extends JpaRepository<Herb, Long> {
//    List<Herb> findBySymptomContainingIgnoreCase(String symptom);
}

