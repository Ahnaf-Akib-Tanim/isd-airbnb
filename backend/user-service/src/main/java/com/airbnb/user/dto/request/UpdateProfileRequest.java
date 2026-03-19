package com.airbnb.user.dto.request;

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
}
