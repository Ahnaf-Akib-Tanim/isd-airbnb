package com.airbnb.admin.dto.response;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class NotificationRecordResponse {
    private String notificationId;
    private String recipientUserId;
    private String recipientRole;
    private String title;
    private String message;
    private String type;
    private String actionTargetUserId;
    private String status;
    private String resolutionNote;
    private LocalDateTime readAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
}
