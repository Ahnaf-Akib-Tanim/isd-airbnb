package com.airbnb.user.controller;

import com.airbnb.user.dto.request.ChangePasswordRequest;
import com.airbnb.user.dto.request.UpdateProfileRequest;
import com.airbnb.user.dto.response.UserProfileResponse;
import com.airbnb.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getProfileByUserId(userId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/admin/{userId}/suspend")
    public ResponseEntity<String> suspendUser(@PathVariable String userId) {
        userService.suspendUser(userId);
        return ResponseEntity.ok("User suspended successfully");
    }

    @PutMapping("/admin/{userId}/activate")
    public ResponseEntity<String> activateUser(@PathVariable String userId) {
        userService.activateUser(userId);
        return ResponseEntity.ok("User activated successfully");
    }
}
