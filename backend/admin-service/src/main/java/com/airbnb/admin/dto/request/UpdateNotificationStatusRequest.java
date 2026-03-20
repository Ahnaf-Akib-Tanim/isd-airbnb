package com.airbnb.admin.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateNotificationStatusRequest {
    private String status;
    private String resolutionNote;
}
