package com.airbnb.admin.service;

import com.airbnb.admin.client.NotificationServiceClient;
import com.airbnb.admin.client.UserServiceClient;
import com.airbnb.admin.dto.response.NotificationRecordResponse;
import com.airbnb.admin.dto.response.UserProfileResponse;
import com.airbnb.admin.dto.response.VerificationActionResponse;
import com.airbnb.admin.dto.response.VerificationRequestSummaryResponse;
import com.airbnb.admin.dto.response.VerificationResponse;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminVerificationService {

    private static final Logger log = LoggerFactory.getLogger(
        AdminVerificationService.class
    );

    private final NotificationServiceClient notificationServiceClient;
    private final UserServiceClient userServiceClient;

    public List<
        VerificationRequestSummaryResponse
    > getPendingVerificationRequests(String authorizationHeader) {
        List<VerificationRequestSummaryResponse> notificationBackedRequests =
            fetchNotificationBackedPendingRequests(authorizationHeader)
                .stream()
                .toList();

        Map<String, VerificationRequestSummaryResponse> mergedRequests =
            notificationBackedRequests
                .stream()
                .collect(
                    java.util.stream.Collectors.toMap(
                        VerificationRequestSummaryResponse::getUserId,
                        Function.identity(),
                        (existing, replacement) -> existing
                    )
                );

        fetchPendingUsersWithoutNotifications(authorizationHeader)
            .stream()
            .forEach(profile ->
                mergedRequests.putIfAbsent(
                    profile.getUserId(),
                    mapPendingUserWithoutNotification(profile)
                )
            );

        return mergedRequests
            .values()
            .stream()
            .sorted(
                Comparator.comparing(
                    this::requestSortDate,
                    Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed()
            )
            .toList();
    }

    public VerificationActionResponse approveVerification(
        String userId,
        String authorizationHeader,
        String notificationId,
        String note
    ) {
        VerificationResponse verificationResponse =
            userServiceClient.approveVerification(
                userId,
                authorizationHeader,
                note
            );
        if (notificationId != null && !notificationId.isBlank()) {
            notificationServiceClient.updateNotificationStatus(
                notificationId,
                "APPROVED",
                note
            );
        }
        UserProfileResponse profile = userServiceClient.getUserProfile(
            userId,
            authorizationHeader
        );
        return VerificationActionResponse.builder()
            .success(verificationResponse.isSuccess())
            .message(verificationResponse.getMessage())
            .userId(userId)
            .notificationId(notificationId)
            .verificationStatus(profile.getVerificationStatus())
            .build();
    }

    public VerificationActionResponse rejectVerification(
        String userId,
        String authorizationHeader,
        String notificationId,
        String note
    ) {
        VerificationResponse verificationResponse =
            userServiceClient.rejectVerification(
                userId,
                authorizationHeader,
                note
            );
        if (notificationId != null && !notificationId.isBlank()) {
            notificationServiceClient.updateNotificationStatus(
                notificationId,
                "REJECTED",
                note
            );
        }
        UserProfileResponse profile = userServiceClient.getUserProfile(
            userId,
            authorizationHeader
        );
        return VerificationActionResponse.builder()
            .success(verificationResponse.isSuccess())
            .message(verificationResponse.getMessage())
            .userId(userId)
            .notificationId(notificationId)
            .verificationStatus(profile.getVerificationStatus())
            .build();
    }

    public List<UserProfileResponse> getAllUsers(String authorizationHeader) {
        return userServiceClient.getAllUsers(authorizationHeader);
    }

    private VerificationRequestSummaryResponse mapToSummary(
        NotificationRecordResponse notification,
        String authorizationHeader
    ) {
        UserProfileResponse profile;
        try {
            profile = userServiceClient.getUserProfile(
                notification.getActionTargetUserId(),
                authorizationHeader
            );
        } catch (Exception exception) {
            log.warn(
                "Skipping notification {} because profile {} could not be loaded",
                notification.getNotificationId(),
                notification.getActionTargetUserId(),
                exception
            );
            return null;
        }

        if (
            !"PENDING".equals(profile.getVerificationStatus()) ||
            profile.isEmailVerified()
        ) {
            return null;
        }

        return VerificationRequestSummaryResponse.builder()
            .notificationId(notification.getNotificationId())
            .notificationStatus(notification.getStatus())
            .userId(profile.getUserId())
            .firstName(profile.getFirstName())
            .lastName(profile.getLastName())
            .email(profile.getEmail())
            .role(profile.getRole())
            .verificationStatus(profile.getVerificationStatus())
            .emailVerified(profile.isEmailVerified())
            .canBook(profile.isCanBook())
            .canHost(profile.isCanHost())
            .profileImage(profile.getProfileImage())
            .street(profile.getStreet())
            .area(profile.getArea())
            .village(profile.getVillage())
            .district(profile.getDistrict())
            .division(profile.getDivision())
            .city(profile.getCity())
            .country(profile.getCountry())
            .zipCode(profile.getZipCode())
            .latitude(profile.getLatitude())
            .longitude(profile.getLongitude())
            .hostDisplayName(profile.getHostDisplayName())
            .hostAbout(profile.getHostAbout())
            .preferredCheckInTime(profile.getPreferredCheckInTime())
            .preferredCheckOutTime(profile.getPreferredCheckOutTime())
            .responseTimeHours(profile.getResponseTimeHours())
            .houseRules(profile.getHouseRules())
            .propertyTypesOffered(profile.getPropertyTypesOffered())
            .offeringHighlights(profile.getOfferingHighlights())
            .hostPortfolioImages(profile.getHostPortfolioImages())
            .verificationRequestedAt(profile.getVerificationRequestedAt())
            .notificationCreatedAt(notification.getCreatedAt())
            .notificationMessage(notification.getMessage())
            .build();
    }

    private VerificationRequestSummaryResponse mapPendingUserWithoutNotification(
        UserProfileResponse profile
    ) {
        return VerificationRequestSummaryResponse.builder()
            .notificationId(null)
            .notificationStatus("OPEN")
            .userId(profile.getUserId())
            .firstName(profile.getFirstName())
            .lastName(profile.getLastName())
            .email(profile.getEmail())
            .role(profile.getRole())
            .verificationStatus(profile.getVerificationStatus())
            .emailVerified(profile.isEmailVerified())
            .canBook(profile.isCanBook())
            .canHost(profile.isCanHost())
            .profileImage(profile.getProfileImage())
            .street(profile.getStreet())
            .area(profile.getArea())
            .village(profile.getVillage())
            .district(profile.getDistrict())
            .division(profile.getDivision())
            .city(profile.getCity())
            .country(profile.getCountry())
            .zipCode(profile.getZipCode())
            .latitude(profile.getLatitude())
            .longitude(profile.getLongitude())
            .hostDisplayName(profile.getHostDisplayName())
            .hostAbout(profile.getHostAbout())
            .preferredCheckInTime(profile.getPreferredCheckInTime())
            .preferredCheckOutTime(profile.getPreferredCheckOutTime())
            .responseTimeHours(profile.getResponseTimeHours())
            .houseRules(profile.getHouseRules())
            .propertyTypesOffered(profile.getPropertyTypesOffered())
            .offeringHighlights(profile.getOfferingHighlights())
            .hostPortfolioImages(profile.getHostPortfolioImages())
            .verificationRequestedAt(profile.getVerificationRequestedAt())
            .notificationCreatedAt(profile.getVerificationRequestedAt())
            .notificationMessage(
                "Pending verification request recovered from user profile state."
            )
            .build();
    }

    private java.time.LocalDateTime requestSortDate(
        VerificationRequestSummaryResponse request
    ) {
        return request.getNotificationCreatedAt() != null
            ? request.getNotificationCreatedAt()
            : request.getVerificationRequestedAt();
    }

    private List<
        VerificationRequestSummaryResponse
    > fetchNotificationBackedPendingRequests(String authorizationHeader) {
        try {
            return notificationServiceClient
                .getPendingVerificationNotifications()
                .stream()
                .map(notification ->
                    mapToSummary(notification, authorizationHeader)
                )
                .filter(Objects::nonNull)
                .toList();
        } catch (Exception exception) {
            log.error(
                "Failed to load notification-backed verification requests",
                exception
            );
            return List.of();
        }
    }

    private List<UserProfileResponse> fetchPendingUsersWithoutNotifications(
        String authorizationHeader
    ) {
        try {
            return userServiceClient
                .getAllUsers(authorizationHeader)
                .stream()
                .filter(
                    profile ->
                        "PENDING".equals(profile.getVerificationStatus()) &&
                        !profile.isEmailVerified()
                )
                .toList();
        } catch (Exception exception) {
            log.error(
                "Failed to load pending users from user-service",
                exception
            );
            return List.of();
        }
    }
}
