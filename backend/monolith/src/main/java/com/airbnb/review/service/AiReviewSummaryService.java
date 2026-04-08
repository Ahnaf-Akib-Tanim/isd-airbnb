package com.airbnb.review.service;

import com.airbnb.review.model.Review;
import com.airbnb.review.model.ReviewSummary;
import com.airbnb.review.repository.ReviewSummaryRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiReviewSummaryService {

    private final ReviewSummaryRepository reviewSummaryRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openrouter.api-key:}")
    private String openRouterApiKey;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String MODEL = "openrouter/free";

    /**
     * Asynchronously generate or update an AI summary for a host's reviews.
     */
    @Async
    public void generateSummaryAsync(String hostId, List<Review> reviews) {
        try {
            String summary = callOpenRouter(reviews);
            if (summary != null && !summary.isBlank()) {
                saveSummary(hostId, summary, reviews.size());
            }
        } catch (Exception e) {
            log.error("Failed to generate AI review summary for host {}: {}", hostId, e.getMessage());
        }
    }

    /**
     * Get the cached AI summary for a host.
     */
    public ReviewSummary getSummary(String hostId) {
        return reviewSummaryRepository.findByHostId(hostId).orElse(null);
    }

    private String callOpenRouter(List<Review> reviews) {
        if (openRouterApiKey == null || openRouterApiKey.isBlank()) {
            log.warn("OpenRouter API key not configured, skipping AI summary generation");
            return null;
        }

        // Build the review texts for the prompt
        String reviewTexts = reviews.stream()
                .filter(r -> r.getReviewText() != null && !r.getReviewText().isBlank())
                .map(r -> {
                    String stars = r.getOverallRating() != null
                            ? String.format("%.1f/5", r.getOverallRating()) : "N/A";
                    return String.format("- [%s stars] %s", stars, r.getReviewText());
                })
                .collect(Collectors.joining("\n"));

        if (reviewTexts.isBlank()) {
            return null;
        }

        String systemPrompt = "You are a helpful assistant that summarizes guest reviews for an Airbnb-style property. "
                + "Write a concise, warm, and professional summary of the reviews in 2-8 lines. "
                + "Highlight the key positives and any recurring concerns. "
                + "Use a friendly tone as if writing for potential guests browsing the listing. "
                + "Do NOT use markdown formatting, bullet points, or headers - just plain flowing text in paragraph form.";

        String userPrompt = "Here are the guest reviews for this property:\n\n" + reviewTexts
                + "\n\nPlease write a concise summary (2-8 lines) of what guests are saying about this place.";

        // Build request body
        Map<String, Object> requestBody = Map.of(
                "model", MODEL,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "max_tokens", 300,
                "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openRouterApiKey);
        headers.set("HTTP-Referer", "http://localhost:3000");
        headers.set("X-Title", "Airbnb Review Summary");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    OPENROUTER_URL, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List<Map> choices = (List<Map>) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
        } catch (Exception e) {
            log.error("OpenRouter API call failed: {}", e.getMessage());
        }

        return null;
    }

    private void saveSummary(String hostId, String summary, int reviewCount) {
        ReviewSummary existing = reviewSummaryRepository.findByHostId(hostId).orElse(null);

        if (existing != null) {
            existing.setSummary(summary);
            existing.setReviewCount(reviewCount);
            existing.setUpdatedAt(LocalDateTime.now());
            reviewSummaryRepository.save(existing);
        } else {
            ReviewSummary newSummary = ReviewSummary.builder()
                    .hostId(hostId)
                    .summary(summary)
                    .reviewCount(reviewCount)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            reviewSummaryRepository.save(newSummary);
        }

        log.info("AI review summary saved for host {} ({} reviews)", hostId, reviewCount);
    }
}
