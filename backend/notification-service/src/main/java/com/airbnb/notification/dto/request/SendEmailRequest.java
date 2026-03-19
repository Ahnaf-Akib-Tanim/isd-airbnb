package com.airbnb.notification.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendEmailRequest {
    @NotBlank
    @Email
    private String to;

    @NotBlank
    private String subject;

    private String textBody;
    private String htmlBody;
    private String type;
}
