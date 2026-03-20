package com.airbnb.admin.dto.response;

import lombok.Data;

@Data
public class UserAccessResponse {
    private String userId;
    private String email;
    private String role;
    private String status;
    private boolean emailVerified;
    private String verificationStatus;
    private boolean canBook;
    private boolean canHost;
}
