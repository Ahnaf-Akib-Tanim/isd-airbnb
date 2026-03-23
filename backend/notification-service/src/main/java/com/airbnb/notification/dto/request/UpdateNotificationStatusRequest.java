package com.airbnb.notification.dto.request;

import lombok.Data;

@Data
public class UpdateNotificationStatusRequest {
    private String status;
    private String resolutionNote;
}
