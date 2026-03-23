package com.airbnb.user.service;

import com.airbnb.user.dto.request.CreateNotificationRequest;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {

    private final WebClient.Builder webClientBuilder = WebClient.builder();

    @Value("${services.notification-service.url:http://localhost:8087}")
    private String notificationServiceUrl;

    public void createNotification(CreateNotificationRequest request) {
        try {
            webClientBuilder
                .build()
                .post()
                .uri(notificationServiceUrl + "/api/notifications/internal")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .toBodilessEntity()
                .timeout(Duration.ofSeconds(2))
                .block();
        } catch (Exception ex) {
            log.warn(
                "Failed to create notification [{}]: {}",
                request.getType(),
                ex.getMessage()
            );
        }
    }
}
