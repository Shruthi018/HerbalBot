package com.example.herbalChatbot.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.*;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "UserTable")
public class User {
    @Id
    @GeneratedValue
    private long id;
    @Email
    private String email;
    private String password;
}
