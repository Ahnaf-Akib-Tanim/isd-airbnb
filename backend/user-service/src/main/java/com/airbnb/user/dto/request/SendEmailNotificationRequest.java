package com.airbnb.user.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SendEmailNotificationRequest {
    private String to;
    private String subject;
    private String textBody;
    private String htmlBody;
    private String type;
}
