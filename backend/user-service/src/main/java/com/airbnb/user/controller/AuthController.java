package com.airbnb.user.controller;

import com.airbnb.user.dto.request.LoginRequest;
import com.airbnb.user.dto.request.RegisterRequest;
import com.airbnb.user.dto.response.AuthResponse;
import com.airbnb.user.dto.response.VerificationResponse;
import com.airbnb.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<VerificationResponse> verifyEmail(
        @RequestParam String token
    ) {
        return ResponseEntity.ok(userService.verifyEmail(token));
    }
}
