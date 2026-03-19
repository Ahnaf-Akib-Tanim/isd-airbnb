package com.airbnb.user.service;

import com.airbnb.user.dto.request.SendEmailNotificationRequest;
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

    public void sendVerificationEmail(
        String to,
        String subject,
        String textBody,
        String htmlBody
    ) {
        SendEmailNotificationRequest request =
            SendEmailNotificationRequest.builder()
                .to(to)
                .subject(subject)
                .textBody(textBody)
                .htmlBody(htmlBody)
                .type("EMAIL_VERIFICATION")
                .build();

        try {
            webClientBuilder
                .build()
                .post()
                .uri(notificationServiceUrl + "/api/notifications/email")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .toBodilessEntity()
                .block();
        } catch (Exception ex) {
            log.warn(
                "Failed to dispatch verification email to {}: {}",
                to,
                ex.getMessage()
            );
        }
    }
}
