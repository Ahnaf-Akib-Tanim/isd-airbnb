package com.airbnb.user.dto.request;

import java.util.List;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profileImage;
    private String bio;
    private String street;
    private String city;
    private String country;
    private String zipCode;
    private String hostDisplayName;
    private String hostAbout;
    private String hostingSince;
    private String preferredCheckInTime;
    private String preferredCheckOutTime;
    private Integer responseTimeHours;
    private String houseRules;
    private List<String> propertyTypesOffered;
    private List<String> offeringHighlights;
    private List<String> hostPortfolioImages;
}
