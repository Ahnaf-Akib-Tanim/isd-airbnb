package com.airbnb.user.model;

import com.airbnb.user.model.enums.Role;
import com.airbnb.user.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Builder.Default
    private String userId = UUID.randomUUID().toString();

    @Indexed(unique = true)
    private String email;

    private String password;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profileImage;
    private String bio;

    @Builder.Default
    private Role role = Role.GUEST;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Builder.Default
    private boolean emailVerified = false;

    private LocalDateTime verificationEmailSentAt;

    // Address
    private String street;
    private String city;
    private String country;
    private String zipCode;

    // Host-specific info
    @Builder.Default
    private boolean superhost = false;

    private String hostDisplayName;
    private String hostAbout;
    private LocalDateTime hostingSince;
    private String preferredCheckInTime;
    private String preferredCheckOutTime;
    private Integer responseTimeHours;
    private String houseRules;

    @Builder.Default
    private List<String> propertyTypesOffered = new ArrayList<>();

    @Builder.Default
    private List<String> offeringHighlights = new ArrayList<>();

    @Builder.Default
    private List<String> hostPortfolioImages = new ArrayList<>();

    private Integer totalListings;
    private Double averageRating;
    private Double responseRate;

    private LocalDateTime lastLoginAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
