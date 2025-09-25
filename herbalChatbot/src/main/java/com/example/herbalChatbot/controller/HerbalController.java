package com.example.herbalChatbot.controller;

import com.example.herbalChatbot.models.Herb;
import com.example.herbalChatbot.models.Project;
import com.example.herbalChatbot.models.Prompt;
import com.example.herbalChatbot.repository.ProjectRepository;
import com.example.herbalChatbot.repository.PromptRepository;
import com.example.herbalChatbot.service.HerbalMlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/herbs")
@RequiredArgsConstructor
public class HerbalController {

    private final HerbalMlService mlService;
    private final ProjectRepository projectRepository;
    private final PromptRepository promptRepository;

    @GetMapping("/recommend")
    public List<Herb> recommend(@RequestParam("projectId") Long projectId,
                                @RequestParam("symptom") String symptom) {

        // Find project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        // Save user input as a prompt
        Prompt userPrompt = Prompt.builder()
                .promptText(symptom)
                .role("user")
                .project(project)
                .build();
        promptRepository.save(userPrompt);

        // Get ML response
        List<Herb> herbs = mlService.predictHerbs(symptom);
        if (herbs == null) herbs = List.of();

        // Save system response as prompt
        Prompt systemPrompt = Prompt.builder()
                .promptText("Recommended herbs: " + herbs.stream()
                        .map(Herb::getCommonName)
                        .collect(Collectors.joining(", ")))
                .role("system")
                .project(project)
                .build();
        promptRepository.save(systemPrompt);

        return herbs;
    }
}


//@RestController
//@RequestMapping("herbs")
//public class HerbalController {
//
//    private final HerbalMlService mlService;
//
//    public HerbalController(HerbalMlService mlService) {
//        this.mlService = mlService;
//    }
//
//    @GetMapping("/recommend")
//    public List<Herb> recommend(@RequestParam("symptom") String symptom) {
//        return mlService.predictHerbs(symptom);
//    }
//}

