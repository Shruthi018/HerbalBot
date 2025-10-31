package com.example.herbalChatbot.repository;

import com.example.herbalChatbot.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// CRUD - Create Read Update Delete
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
