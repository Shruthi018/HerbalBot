package com.example.herbalChatbot.repository;

import com.example.herbalChatbot.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // You can add custom queries later if needed, e.g.:
    // List<Project> findByOwnerId(Long ownerId);
}
