package com.airbnb.user.service;

import com.airbnb.user.dto.request.LoginRequest;
import com.airbnb.user.dto.request.RegisterRequest;
import com.airbnb.user.dto.request.UpdateProfileRequest;
import com.airbnb.user.dto.response.AuthResponse;
import com.airbnb.user.dto.response.UserProfileResponse;
import com.airbnb.user.dto.response.VerificationResponse;
import com.airbnb.user.exception.InvalidCredentialsException;
import com.airbnb.user.exception.UserAlreadyExistsException;
import com.airbnb.user.exception.UserNotFoundException;
import com.airbnb.user.model.EmailVerificationToken;
import com.airbnb.user.model.User;
import com.airbnb.user.model.enums.Role;
import com.airbnb.user.model.enums.UserStatus;
import com.airbnb.user.repository.EmailVerificationTokenRepository;
import com.airbnb.user.repository.UserRepository;
import com.airbnb.user.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final int VERIFICATION_TOKEN_HOURS = 24;

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationClient notificationClient;

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException(
                    "An account with email " + request.getEmail() + " already exists."
            );
        }

        validateRegistrationRequest(request);

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .profileImage(request.getProfileImage())
                .bio(request.getBio())
                .role(request.getRole() != null ? request.getRole() : Role.GUEST)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .hostDisplayName(blankToNull(request.getHostDisplayName()))
                .hostAbout(blankToNull(request.getHostAbout()))
                .hostingSince(parseLocalDateTimeOrNull(request.getHostingSince()))
                .preferredCheckInTime(blankToNull(request.getPreferredCheckInTime()))
                .preferredCheckOutTime(blankToNull(request.getPreferredCheckOutTime()))
                .responseTimeHours(request.getResponseTimeHours())
                .houseRules(blankToNull(request.getHouseRules()))
                .propertyTypesOffered(cleanList(request.getPropertyTypesOffered()))
                .offeringHighlights(cleanList(request.getOfferingHighlights()))
                .hostPortfolioImages(cleanList(request.getHostPortfolioImages()))
                .verificationEmailSentAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} [{}]", saved.getEmail(), saved.getRole());

        String token = jwtUtil.generateToken(saved.getUserId(), saved.getEmail(), saved.getRole());
        dispatchVerificationEmail(saved);

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getUserId())
                .email(saved.getEmail())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .role(saved.getRole())
                .profileImage(saved.getProfileImage())
                .emailVerified(saved.isEmailVerified())
                .message("Registration successful. Please verify your email address.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new InvalidCredentialsException("Your account has been suspended. Please contact support.");
        }

        if (user.getStatus() == UserStatus.DELETED) {
            throw new InvalidCredentialsException("Account not found.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole());
        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .emailVerified(user.isEmailVerified())
                .message(user.isEmailVerified()
                        ? "Login successful. Welcome back, " + user.getFirstName() + "!"
                        : "Login successful. Please verify your email to unlock future booking and hosting flows.")
                .build();
    }

    public VerificationResponse verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenHash(hashToken(token))
                .orElseThrow(() -> new InvalidCredentialsException("Verification link is invalid."));

        if (verificationToken.isUsed()) {
            return VerificationResponse.builder()
                    .success(true)
                    .message("Email address already verified.")
                    .build();
        }

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Verification link has expired. Please request a new one.");
        }

        User user = userRepository.findByUserId(verificationToken.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        verificationToken.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(verificationToken);

        return VerificationResponse.builder()
                .success(true)
                .message("Email verified successfully.")
                .build();
    }

    public VerificationResponse resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        if (user.isEmailVerified()) {
            return VerificationResponse.builder()
                    .success(true)
                    .message("Email is already verified.")
                    .build();
        }

        user.setVerificationEmailSentAt(LocalDateTime.now());
        userRepository.save(user);
        dispatchVerificationEmail(user);

        return VerificationResponse.builder()
                .success(true)
                .message("Verification email sent.")
                .build();
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        return mapToProfileResponse(user);
    }

    public UserProfileResponse getProfileByUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return mapToProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getStreet() != null) user.setStreet(request.getStreet());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getZipCode() != null) user.setZipCode(request.getZipCode());

        if (request.getHostDisplayName() != null) user.setHostDisplayName(blankToNull(request.getHostDisplayName()));
        if (request.getHostAbout() != null) user.setHostAbout(blankToNull(request.getHostAbout()));
        if (request.getHostingSince() != null) user.setHostingSince(parseLocalDateTimeOrNull(request.getHostingSince()));
        if (request.getPreferredCheckInTime() != null) user.setPreferredCheckInTime(blankToNull(request.getPreferredCheckInTime()));
        if (request.getPreferredCheckOutTime() != null) user.setPreferredCheckOutTime(blankToNull(request.getPreferredCheckOutTime()));
        if (request.getResponseTimeHours() != null) user.setResponseTimeHours(request.getResponseTimeHours());
        if (request.getHouseRules() != null) user.setHouseRules(blankToNull(request.getHouseRules()));
        if (request.getPropertyTypesOffered() != null) user.setPropertyTypesOffered(cleanList(request.getPropertyTypesOffered()));
        if (request.getOfferingHighlights() != null) user.setOfferingHighlights(cleanList(request.getOfferingHighlights()));
        if (request.getHostPortfolioImages() != null) user.setHostPortfolioImages(cleanList(request.getHostPortfolioImages()));

        validateHostProfile(user);

        User updated = userRepository.save(user);
        log.info("Profile updated for: {}", email);
        return mapToProfileResponse(updated);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for: {}", email);
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    public void suspendUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
        log.info("User suspended: {}", userId);
    }

    public void activateUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User activated: {}", userId);
    }

    private void validateRegistrationRequest(RegisterRequest request) {
        if (request.getRole() == Role.HOST) {
            requireField(request.getPhoneNumber(), "Phone number is required for hosts.");
            requireField(request.getProfileImage(), "Profile image is required for hosts.");
            requireField(request.getHostDisplayName(), "Host display name is required.");
            requireField(request.getHostAbout(), "Host introduction is required.");
            requireField(request.getPreferredCheckInTime(), "Preferred check-in time is required for hosts.");
            requireField(request.getPreferredCheckOutTime(), "Preferred check-out time is required for hosts.");
            requireField(request.getHouseRules(), "House rules are required for hosts.");

            if (cleanList(request.getPropertyTypesOffered()).isEmpty()) {
                throw new InvalidCredentialsException("Hosts must provide at least one property type.");
            }
            if (cleanList(request.getOfferingHighlights()).isEmpty()) {
                throw new InvalidCredentialsException("Hosts must provide at least one offering highlight.");
            }
            if (cleanList(request.getHostPortfolioImages()).isEmpty()) {
                throw new InvalidCredentialsException("Hosts must upload at least one room or hosting image.");
            }
        }
    }

    private void validateHostProfile(User user) {
        if (user.getRole() != Role.HOST) {
            return;
        }

        requireField(user.getPhoneNumber(), "Hosts must keep a phone number on file.");
        requireField(user.getProfileImage(), "Hosts must keep a profile image on file.");
        requireField(user.getHostDisplayName(), "Hosts must keep a host display name.");
        requireField(user.getHostAbout(), "Hosts must keep a host introduction.");
        requireField(user.getPreferredCheckInTime(), "Hosts must keep a preferred check-in time.");
        requireField(user.getPreferredCheckOutTime(), "Hosts must keep a preferred check-out time.");

        if (user.getPropertyTypesOffered() == null || user.getPropertyTypesOffered().isEmpty()) {
            throw new InvalidCredentialsException("Hosts must keep at least one property type.");
        }
        if (user.getOfferingHighlights() == null || user.getOfferingHighlights().isEmpty()) {
            throw new InvalidCredentialsException("Hosts must keep at least one offering highlight.");
        }
    }

    private void dispatchVerificationEmail(User user) {
        emailVerificationTokenRepository.deleteAll(emailVerificationTokenRepository.findByUserIdAndUsedFalse(user.getUserId()));

        String rawToken = generateRawToken();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .tokenHash(hashToken(rawToken))
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_HOURS))
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        String verificationLink = frontendBaseUrl + "/verify-email?token=" + rawToken;
        String textBody = "Hi " + user.getFirstName() + ",\n\n"
                + "Please verify your ISD Airbnb account by opening this link:\n"
                + verificationLink + "\n\n"
                + "This link will expire in 24 hours.";
        String htmlBody = "<p>Hi " + user.getFirstName() + ",</p>"
                + "<p>Please verify your ISD Airbnb account by clicking the link below:</p>"
                + "<p><a href=\"" + verificationLink + "\">Verify email</a></p>"
                + "<p>This link will expire in 24 hours.</p>";

        notificationClient.sendVerificationEmail(
                user.getEmail(),
                "Verify your ISD Airbnb account",
                textBody,
                htmlBody
        );
    }

    private String generateRawToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to hash verification token", ex);
        }
    }

    private void requireField(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new InvalidCredentialsException(message);
        }
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private List<String> cleanList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .toList();
    }

    private LocalDateTime parseLocalDateTimeOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return LocalDate.parse(value).atStartOfDay();
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .verificationEmailSentAt(user.getVerificationEmailSentAt())
                .street(user.getStreet())
                .city(user.getCity())
                .country(user.getCountry())
                .zipCode(user.getZipCode())
                .superhost(user.isSuperhost())
                .hostDisplayName(user.getHostDisplayName())
                .hostAbout(user.getHostAbout())
                .hostingSince(user.getHostingSince())
                .preferredCheckInTime(user.getPreferredCheckInTime())
                .preferredCheckOutTime(user.getPreferredCheckOutTime())
                .responseTimeHours(user.getResponseTimeHours())
                .houseRules(user.getHouseRules())
                .propertyTypesOffered(user.getPropertyTypesOffered())
                .offeringHighlights(user.getOfferingHighlights())
                .hostPortfolioImages(user.getHostPortfolioImages())
                .totalListings(user.getTotalListings())
                .averageRating(user.getAverageRating())
                .responseRate(user.getResponseRate())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
