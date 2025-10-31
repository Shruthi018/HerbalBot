package com.example.herbalChatbot.repository;

import com.example.herbalChatbot.models.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {
    // Spring Data JPA will implement this automatically
    List<Prompt> findByProjectIdAndRole(Long projectId, String role);

}
