package com.example.herbalChatbot.service;

import com.example.herbalChatbot.models.Herb;
import com.example.herbalChatbot.repository.HerbRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HerbalMlService {

    private final HerbRepository herbRepository;
    private List<Herb> herbs;
    private Map<String, Double> idfScores;
    private Map<Long, Map<String, Double>> herbVectors; // herbId → TF-IDF vector

    public HerbalMlService(HerbRepository herbRepository) {
        this.herbRepository = herbRepository;
    }

    @PostConstruct
    public void init() {
        herbs = herbRepository.findAll();
        System.out.println("✅ Loaded " + herbs.size() + " herbs from DB");

        // Build vocabulary & IDF
        List<List<String>> docs = herbs.stream()
                .map(h -> tokenize(h.getSymptom()))
                .collect(Collectors.toList());

        idfScores = computeIdf(docs);

        // Build TF-IDF vectors for herbs
        herbVectors = new HashMap<>();
        for (Herb h : herbs) {
            List<String> tokens = tokenize(h.getSymptom());
            Map<String, Double> tfidf = computeTfidf(tokens, idfScores);
            herbVectors.put(h.getId(), tfidf);
        }
    }

    public List<Herb> predictHerbs(String symptom) {
        if (symptom == null || symptom.isEmpty()) return Collections.emptyList();

        List<String> inputTokens = tokenize(symptom);
        Map<String, Double> inputVec = computeTfidf(inputTokens, idfScores);

        return herbs.stream()
                .map(h -> new AbstractMap.SimpleEntry<>(h, cosineSimilarity(inputVec, herbVectors.get(h.getId()))))
                .filter(e -> e.getValue() > 0.3)
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    // --- Helpers ---
    private List<String> tokenize(String text) {
        if (text == null) return Collections.emptyList();
        return Arrays.stream(text.toLowerCase().split("\\s+"))
                .filter(w -> w.length() > 2) // skip very short words
                .collect(Collectors.toList());
    }

    private Map<String, Double> computeIdf(List<List<String>> docs) {
        Map<String, Integer> df = new HashMap<>();
        int totalDocs = docs.size();

        for (List<String> doc : docs) {
            Set<String> uniqueWords = new HashSet<>(doc);
            for (String word : uniqueWords) {
                df.put(word, df.getOrDefault(word, 0) + 1);
            }
        }

        Map<String, Double> idf = new HashMap<>();
        for (Map.Entry<String, Integer> e : df.entrySet()) {
            idf.put(e.getKey(), Math.log((double) totalDocs / (1 + e.getValue())));
        }
        return idf;
    }

    private Map<String, Double> computeTfidf(List<String> tokens, Map<String, Double> idf) {
        Map<String, Integer> tf = new HashMap<>();
        for (String word : tokens) {
            tf.put(word, tf.getOrDefault(word, 0) + 1);
        }
        int maxFreq = tf.values().stream().max(Integer::compareTo).orElse(1);

        Map<String, Double> tfidf = new HashMap<>();
        for (Map.Entry<String, Integer> e : tf.entrySet()) {
            double tfNorm = 0.5 + 0.5 * e.getValue() / maxFreq;
            double idfVal = idf.getOrDefault(e.getKey(), 0.0);
            tfidf.put(e.getKey(), tfNorm * idfVal);
        }
        return tfidf;
    }

    private double cosineSimilarity(Map<String, Double> v1, Map<String, Double> v2) {
        if (v1 == null || v2 == null) return 0.0;

        Set<String> allKeys = new HashSet<>(v1.keySet());
        allKeys.addAll(v2.keySet());

        double dot = 0.0, norm1 = 0.0, norm2 = 0.0;
        for (String key : allKeys) {
            double x = v1.getOrDefault(key, 0.0);
            double y = v2.getOrDefault(key, 0.0);
            dot += x * y;
            norm1 += x * x;
            norm2 += y * y;
        }
        return norm1 == 0 || norm2 == 0 ? 0.0 : dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}

//package com.example.herbalChatbot.service;
//
//import com.example.herbalChatbot.models.Herb;
//import com.example.herbalChatbot.repository.HerbRepository;
//import org.apache.commons.text.similarity.CosineSimilarity;
//import org.springframework.stereotype.Service;
//
//import jakarta.annotation.PostConstruct;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class HerbalMlService {
//
//    private final HerbRepository herbRepository;
//    private List<Herb> herbs;
//    private CosineSimilarity cosine;
//
//    public HerbalMlService(HerbRepository herbRepository) {
//        this.herbRepository = herbRepository;
//        this.cosine = new CosineSimilarity();
//    }
//
//    @PostConstruct
//    public void init() {
//        herbs = herbRepository.findAll();
//        System.out.println("✅ Loaded " + herbs.size() + " herbs from DB");
//    }
//
//    public List<Herb> predictHerbs(String symptom) {
//        if (symptom == null || symptom.isEmpty()) return Collections.emptyList();
//
//        symptom = symptom.toLowerCase();
//
//        // Step 1: Exact matches
//        final String inputSymptom = symptom.toLowerCase();
//
//        List<Herb> exactMatches = herbs.stream()
//                .filter(h -> h.getSymptom() != null && h.getSymptom().equalsIgnoreCase(inputSymptom))
//                .collect(Collectors.toList());
//
//
//        if (!exactMatches.isEmpty()) {
//            return exactMatches;
//        }
//
//        // Step 2: Similarity matches
//        Map<CharSequence, Integer> inputVector = toVector(symptom);
//        List<Herb> similar = new ArrayList<>();
//
//        for (Herb h : herbs) {
//            if (h.getSymptom() != null) {
//                Map<CharSequence, Integer> dbVector = toVector(h.getSymptom().toLowerCase());
//                double score = cosine.cosineSimilarity(inputVector, dbVector);
//                if (score > 0.3) { // threshold
//                    similar.add(h);
//                }
//            }
//        }
//        return similar;
//    }
//
//    // Convert text into word frequency vector
//    private Map<CharSequence, Integer> toVector(String text) {
//        Map<CharSequence, Integer> vector = new HashMap<>();
//        for (String word : text.split("\\s+")) {
//            vector.put(word, vector.getOrDefault(word, 0) + 1);
//        }
//        return vector;
//    }
//
//}
