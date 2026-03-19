package com.airbnb.notification.controller;

import com.airbnb.notification.dto.request.SendEmailRequest;
import com.airbnb.notification.dto.response.NotificationResponse;
import com.airbnb.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/email")
    public ResponseEntity<NotificationResponse> sendEmail(@Valid @RequestBody SendEmailRequest request) {
        NotificationResponse response = notificationService.sendEmail(request);
        return ResponseEntity.ok(response);
    }
}
