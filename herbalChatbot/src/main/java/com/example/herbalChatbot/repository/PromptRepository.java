package com.example.herbalChatbot.repository;

import com.example.herbalChatbot.models.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {
}
