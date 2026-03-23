package com.airbnb.admin.client;

import com.airbnb.admin.dto.request.UpdateNotificationStatusRequest;
import com.airbnb.admin.dto.response.NotificationRecordResponse;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class NotificationServiceClient {

    private final WebClient.Builder webClientBuilder = WebClient.builder();

    @Value("${services.notification-service.url:http://localhost:8087}")
    private String notificationServiceUrl;

    public List<NotificationRecordResponse> getPendingVerificationNotifications() {
        NotificationRecordResponse[] response = webClientBuilder.build()
                .get()
                .uri(notificationServiceUrl + "/api/notifications/type/ACCOUNT_VERIFICATION_REQUEST?status=OPEN")
                .retrieve()
                .bodyToMono(NotificationRecordResponse[].class)
                .block();

        return response == null ? List.of() : Arrays.asList(response);
    }

    public void updateNotificationStatus(String notificationId, String status, String note) {
        webClientBuilder.build()
                .put()
                .uri(notificationServiceUrl + "/api/notifications/" + notificationId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(UpdateNotificationStatusRequest.builder()
                        .status(status)
                        .resolutionNote(note)
                        .build())
                .retrieve()
                .toBodilessEntity()
                .block();
    }
}
