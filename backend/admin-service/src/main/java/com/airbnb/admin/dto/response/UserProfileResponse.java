package com.airbnb.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class UserProfileResponse {

    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profileImage;
    private String bio;
    private String role;
    private String status;
    private boolean emailVerified;
    private String verificationStatus;
    private LocalDateTime verificationRequestedAt;
    private LocalDateTime verifiedAt;
    private boolean canBook;
    private boolean canHost;
    private String street;
    private String area;
    private String village;
    private String district;
    private String division;
    private String city;
    private String country;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    private String hostDisplayName;
    private String hostAbout;
    private LocalDateTime hostingSince;
    private String preferredCheckInTime;
    private String preferredCheckOutTime;
    private Integer responseTimeHours;
    private String houseRules;
    private List<String> propertyTypesOffered;
    private List<String> offeringHighlights;
    private List<String> hostPortfolioImages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
