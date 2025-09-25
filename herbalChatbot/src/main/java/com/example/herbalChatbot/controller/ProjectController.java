package com.example.herbalChatbot.controller;

import com.example.herbalChatbot.models.Project;
import com.example.herbalChatbot.models.Prompt;
import com.example.herbalChatbot.models.User;
import com.example.herbalChatbot.repository.ProjectRepository;
import com.example.herbalChatbot.repository.PromptRepository;
import com.example.herbalChatbot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final PromptRepository promptRepository;
    private final UserRepository userRepository;

    // Create a new project for the logged-in user
    @PostMapping
//    @GetMapping
    public ResponseEntity<Project> createProject(@RequestBody Map<String, Object> body, Principal principal) {
        String projectName = (String) body.get("name");

        // Find user by email (principal.getName() returns the authenticated username)
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Project project = Project.builder()
                .name(projectName)
                .owner(userOpt.get())
                .build();

        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    // Add a prompt under a given project
    @PostMapping("/{projectId}/prompts")
//    @GetMapping("/{projectId}/prompts")
    public ResponseEntity<Prompt> addPrompt(@PathVariable Long projectId,
                                            @RequestBody Map<String, String> body,
                                            Principal principal) {
        String promptText = body.get("promptText");
        String role = body.getOrDefault("role", "user");

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = projectOpt.get();
        // Optional: check that the project belongs to the logged-in user
        if (!project.getOwner().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).build();
        }

        Prompt prompt = Prompt.builder()
                .promptText(promptText)
                .role(role)
                .project(project)
                .build();

        Prompt saved = promptRepository.save(prompt);
        return ResponseEntity.ok(saved);
    }
}
