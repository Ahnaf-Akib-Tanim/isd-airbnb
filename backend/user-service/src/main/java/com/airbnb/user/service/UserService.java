package com.airbnb.user.service;

import com.airbnb.user.dto.request.LoginRequest;
import com.airbnb.user.dto.request.RegisterRequest;
import com.airbnb.user.dto.request.UpdateProfileRequest;
import com.airbnb.user.dto.response.AuthResponse;
import com.airbnb.user.dto.response.UserProfileResponse;
import com.airbnb.user.exception.InvalidCredentialsException;
import com.airbnb.user.exception.UserAlreadyExistsException;
import com.airbnb.user.exception.UserNotFoundException;
import com.airbnb.user.model.User;
import com.airbnb.user.model.enums.Role;
import com.airbnb.user.model.enums.UserStatus;
import com.airbnb.user.repository.UserRepository;
import com.airbnb.user.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ─────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                "An account with email " + request.getEmail() + " already exists."
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : Role.GUEST)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} [{}]", saved.getEmail(), saved.getRole());

        String token = jwtUtil.generateToken(saved.getUserId(), saved.getEmail(), saved.getRole());

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getUserId())
                .email(saved.getEmail())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .role(saved.getRole())
                .message("Welcome to ISD Airbnb! Registration successful.")
                .build();
    }

    // ─────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new InvalidCredentialsException(
                "Your account has been suspended. Please contact support."
            );
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
                .message("Login successful. Welcome back, " + user.getFirstName() + "!")
                .build();
    }

    // ─────────────────────────────────────────────
    // GET PROFILE by email (from JWT principal)
    // ─────────────────────────────────────────────
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        return mapToProfileResponse(user);
    }

    // ─────────────────────────────────────────────
    // GET PROFILE by userId (for inter-service calls)
    // ─────────────────────────────────────────────
    public UserProfileResponse getProfileByUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return mapToProfileResponse(user);
    }

    // ─────────────────────────────────────────────
    // UPDATE PROFILE
    // ─────────────────────────────────────────────
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        if (request.getFirstName()    != null) user.setFirstName(request.getFirstName());
        if (request.getLastName()     != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber()  != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getBio()          != null) user.setBio(request.getBio());
        if (request.getStreet()       != null) user.setStreet(request.getStreet());
        if (request.getCity()         != null) user.setCity(request.getCity());
        if (request.getCountry()      != null) user.setCountry(request.getCountry());
        if (request.getZipCode()      != null) user.setZipCode(request.getZipCode());

        User updated = userRepository.save(user);
        log.info("Profile updated for: {}", email);
        return mapToProfileResponse(updated);
    }

    // ─────────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // ADMIN — GET ALL USERS
    // ─────────────────────────────────────────────
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // ADMIN — SUSPEND USER
    // ─────────────────────────────────────────────
    public void suspendUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
        log.info("User suspended: {}", userId);
    }

    // ─────────────────────────────────────────────
    // ADMIN — ACTIVATE USER
    // ─────────────────────────────────────────────
    public void activateUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User activated: {}", userId);
    }

    // ─────────────────────────────────────────────
    // MAPPER
    // ─────────────────────────────────────────────
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
                .street(user.getStreet())
                .city(user.getCity())
                .country(user.getCountry())
                .zipCode(user.getZipCode())
                .superhost(user.isSuperhost())
                .totalListings(user.getTotalListings())
                .averageRating(user.getAverageRating())
                .responseRate(user.getResponseRate())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
