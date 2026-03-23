package com.airbnb.booking.client;

import com.airbnb.booking.dto.CreateNotificationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NotificationClient {

    private final WebClient webClient;

    public NotificationClient(@Value("${NOTIFICATION_SERVICE_URL:http://notification-service:8087}") String notificationServiceUrl) {
        this.webClient = WebClient.builder()
            .baseUrl(notificationServiceUrl)
            .build();
    }

    public void sendNotification(CreateNotificationRequest request) {
        webClient.post()
            .uri("/api/notifications/internal")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Void.class)
            .subscribe(
                null,
                error -> log.error("Failed to send notification: {}", error.getMessage())
            );
    }
}
