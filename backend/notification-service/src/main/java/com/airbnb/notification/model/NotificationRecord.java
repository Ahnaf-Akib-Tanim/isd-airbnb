package com.airbnb.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRecord {

    @Id
    private String id;

    @Builder.Default
    private String notificationId = UUID.randomUUID().toString();

    private String to;
    private String subject;
    private String textBody;
    private String htmlBody;
    private String type;
    private String status;
    private String errorMessage;
    private LocalDateTime sentAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
