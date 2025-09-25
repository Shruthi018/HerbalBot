package com.example.herbalChatbot.service;

import com.example.herbalChatbot.models.Herb;
import com.example.herbalChatbot.repository.HerbRepository;
import org.apache.commons.text.similarity.CosineSimilarity;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HerbalMlService {

    private final HerbRepository herbRepository;
    private List<Herb> herbs;
    private CosineSimilarity cosine;

    public HerbalMlService(HerbRepository herbRepository) {
        this.herbRepository = herbRepository;
        this.cosine = new CosineSimilarity();
    }

    @PostConstruct
    public void init() {
        herbs = herbRepository.findAll();
        System.out.println("✅ Loaded " + herbs.size() + " herbs from DB");
    }

    public List<Herb> predictHerbs(String symptom) {
        if (symptom == null || symptom.isEmpty()) return Collections.emptyList();

        symptom = symptom.toLowerCase();

        // Step 1: Exact matches
        final String inputSymptom = symptom.toLowerCase();

        List<Herb> exactMatches = herbs.stream()
                .filter(h -> h.getSymptom() != null && h.getSymptom().equalsIgnoreCase(inputSymptom))
                .collect(Collectors.toList());


        if (!exactMatches.isEmpty()) {
            return exactMatches;
        }

        // Step 2: Similarity matches
        Map<CharSequence, Integer> inputVector = toVector(symptom);
        List<Herb> similar = new ArrayList<>();

        for (Herb h : herbs) {
            if (h.getSymptom() != null) {
                Map<CharSequence, Integer> dbVector = toVector(h.getSymptom().toLowerCase());
                double score = cosine.cosineSimilarity(inputVector, dbVector);
                if (score > 0.3) { // threshold
                    similar.add(h);
                }
            }
        }
        return similar;
    }

    // Convert text into word frequency vector
    // Convert text into word frequency vector
    private Map<CharSequence, Integer> toVector(String text) {
        Map<CharSequence, Integer> vector = new HashMap<>();
        for (String word : text.split("\\s+")) {
            vector.put(word, vector.getOrDefault(word, 0) + 1);
        }
        return vector;
    }

}
