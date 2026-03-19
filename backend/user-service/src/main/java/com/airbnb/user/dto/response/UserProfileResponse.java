package com.airbnb.user.dto.response;

import com.airbnb.user.model.enums.Role;
import com.airbnb.user.model.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileResponse {
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profileImage;
    private String bio;
    private Role role;
    private UserStatus status;
    private boolean emailVerified;

    // Address
    private String street;
    private String city;
    private String country;
    private String zipCode;

    // Host info
    private boolean superhost;
    private Integer totalListings;
    private Double averageRating;
    private Double responseRate;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
