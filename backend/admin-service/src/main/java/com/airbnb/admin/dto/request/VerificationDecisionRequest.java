package com.airbnb.admin.dto.request;

import lombok.Data;

@Data
public class VerificationDecisionRequest {
    private String notificationId;
    private String note;
}
