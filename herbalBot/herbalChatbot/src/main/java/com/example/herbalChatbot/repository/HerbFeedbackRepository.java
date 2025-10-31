package com.example.herbalChatbot.repository;

import com.example.herbalChatbot.models.HerbFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HerbFeedbackRepository extends JpaRepository<HerbFeedback, Long> {

    // Fetch all feedbacks for a specific project
    List<HerbFeedback> findByProjectId(Long projectId);
}
