package com.airbnb.user.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostedProperty {

    @Builder.Default
    private String propertyId = UUID.randomUUID().toString();

    private String propertyName;
    private String propertyType; // Apartment, Home, Hotel, Villa, etc.
    private String description;

    // Address
    private String street;
    private String area;
    private String district;
    private String city;
    private String country;

    // Details
    private Integer guestCapacity;
    private Integer bedCount;

    @Builder.Default
    private List<String> bedTypes = new ArrayList<>();

    private Double nightlyRateUsd;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private boolean payLaterAllowed = false;

    // Cancellation policy: FLEXIBLE, MODERATE, STRICT
    @Builder.Default
    private String cancellationPolicy = "MODERATE";
}
