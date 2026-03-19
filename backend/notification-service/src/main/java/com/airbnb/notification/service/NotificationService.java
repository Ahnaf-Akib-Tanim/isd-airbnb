package com.airbnb.notification.service;

import com.airbnb.notification.dto.request.SendEmailRequest;
import com.airbnb.notification.dto.response.NotificationResponse;
import com.airbnb.notification.model.NotificationRecord;
import com.airbnb.notification.repository.NotificationRecordRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRecordRepository notificationRecordRepository;

    @Value("${notification.email.from}")
    private String fromAddress;

    @Value("${notification.email.from-name}")
    private String fromName;

    public NotificationResponse sendEmail(SendEmailRequest request) {
        NotificationRecord record = NotificationRecord.builder()
                .to(request.getTo())
                .subject(request.getSubject())
                .textBody(request.getTextBody())
                .htmlBody(request.getHtmlBody())
                .type(request.getType())
                .status("PENDING")
                .build();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setFrom(fromAddress, fromName);

            String htmlBody = StringUtils.hasText(request.getHtmlBody())
                    ? request.getHtmlBody()
                    : "<p>" + safeText(request.getTextBody()) + "</p>";

            helper.setText(safeText(request.getTextBody()), htmlBody);
            mailSender.send(message);

            record.setStatus("SENT");
            record.setSentAt(LocalDateTime.now());
            notificationRecordRepository.save(record);

            return NotificationResponse.builder()
                    .success(true)
                    .message("Email sent successfully.")
                    .notificationId(record.getNotificationId())
                    .build();
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", request.getTo(), ex.getMessage());
            record.setStatus("FAILED");
            record.setErrorMessage(ex.getMessage());
            notificationRecordRepository.save(record);

            return NotificationResponse.builder()
                    .success(false)
                    .message("Failed to send email.")
                    .notificationId(record.getNotificationId())
                    .build();
        }
    }

    private String safeText(String text) {
        return StringUtils.hasText(text) ? text : "";
    }
}
