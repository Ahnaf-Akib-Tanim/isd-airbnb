package com.airbnb.booking.service;

import com.airbnb.booking.client.NotificationClient;
import com.airbnb.booking.dto.CreateNotificationRequest;
import com.airbnb.booking.model.Booking;
import com.airbnb.booking.model.BookingStatus;
import com.airbnb.booking.model.PaymentStatus;
import com.airbnb.booking.repository.BookingRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationClient notificationClient;

    public Booking createBooking(Booking booking) {
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        booking.setStatus(BookingStatus.PENDING);
        if (booking.getPaymentStatus() == null) {
            booking.setPaymentStatus(PaymentStatus.PENDING);
        }
        Booking saved = bookingRepository.save(booking);

        // Notify Admin
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientRole("ADMIN")
                .title("New Booking Request")
                .message(
                    "Guest " + booking.getGuestId() +
                    " requested to book host " + booking.getHostId() +
                    " from " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    " — Property: " + (booking.getPropertyName() != null ? booking.getPropertyName() : "N/A") +
                    " | Total: $" + booking.getTotalPrice() +
                    (booking.getPaymentStatus() == PaymentStatus.PAY_LATER ? " [PAY LATER]" : "")
                )
                .type("BOOKING_REQUEST")
                .actionTargetUserId(saved.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Host about new booking request
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getHostId())
                .title("New Booking Request")
                .message(
                    "You have a new booking request from guest " + booking.getGuestId() +
                    " for " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    ". Booking total: $" + booking.getTotalPrice()
                )
                .type("BOOKING_REQUEST")
                .actionTargetUserId(saved.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Guest that booking was created
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getGuestId())
                .title("Booking Request Submitted")
                .message(
                    "Your booking request for " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    " has been submitted and is awaiting admin approval."
                )
                .type("BOOKING_REQUEST")
                .actionTargetUserId(saved.getId())
                .status("UNREAD")
                .build()
        );

        return saved;
    }

    public Booking getBooking(String id) {
        return bookingRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByGuest(String guestId) {
        return bookingRepository.findByGuestId(guestId);
    }

    public List<Booking> getBookingsByHost(String hostId) {
        return bookingRepository.findByHostId(hostId);
    }

    public Booking confirmBooking(String id) {
        Booking booking = getBooking(id);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        String payNote = booking.getPaymentStatus() == PaymentStatus.PAY_LATER
            ? " You have chosen to pay later before check-in." : " Your payment has been processed.";

        // Notify Guest
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getGuestId())
                .title("Booking Confirmed! ✅")
                .message(
                    "Your booking for " + booking.getPropertyName() +
                    " from " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    " has been confirmed by admin!" + payNote
                )
                .type("BOOKING_CONFIRMED")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Host
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getHostId())
                .title("Reservation Confirmed")
                .message(
                    "A reservation for your property " + booking.getPropertyName() +
                    " from " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    " has been confirmed. Total: $" + booking.getTotalPrice()
                )
                .type("HOST_RESERVATION")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        return saved;
    }

    public Booking cancelBooking(String id, String cancellationReason) {
        Booking booking = getBooking(id);
        booking.setStatus(BookingStatus.CANCELLED);
        if (cancellationReason != null && !cancellationReason.isBlank()) {
            booking.setCancellationReason(cancellationReason);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify Guest
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getGuestId())
                .title("Booking Cancelled")
                .message(
                    "Your booking for " + booking.getPropertyName() +
                    " from " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    " has been cancelled." +
                    (cancellationReason != null ? " Reason: " + cancellationReason : "")
                )
                .type("BOOKING_CANCELLED")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Host
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getHostId())
                .title("Booking Cancelled")
                .message(
                    "A booking for your property " + booking.getPropertyName() +
                    " from " + booking.getCheckInDate() +
                    " to " + booking.getCheckOutDate() +
                    " has been cancelled." +
                    (cancellationReason != null ? " Reason: " + cancellationReason : "")
                )
                .type("BOOKING_CANCELLED")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        return saved;
    }

    public Booking updateBookingStatus(String id, BookingStatus status) {
        Booking booking = getBooking(id);
        booking.setStatus(status);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        String statusLabel = status.name().replace("_", " ");

        // Notify Guest
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getGuestId())
                .title("Booking " + statusLabel)
                .message(
                    "Your booking for " + booking.getPropertyName() +
                    " from " + booking.getCheckInDate() +
                    " has been updated to: " + statusLabel
                )
                .type("BOOKING_" + status.name())
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Host
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getHostId())
                .title("Booking " + statusLabel)
                .message(
                    "A booking for your property " + booking.getPropertyName() +
                    " from " + booking.getCheckInDate() +
                    " has been updated to: " + statusLabel
                )
                .type("BOOKING_" + status.name())
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        return saved;
    }

    public Booking refundBooking(String id, String reason) {
        Booking booking = getBooking(id);

        // Calculate refund based on cancellation policy
        BigDecimal refundAmount = calculateRefundAmount(booking);
        booking.setStatus(BookingStatus.REFUNDED);
        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        booking.setRefundAmount(refundAmount);
        if (reason != null && !reason.isBlank()) {
            booking.setCancellationReason(reason);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify Guest
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getGuestId())
                .title("Refund Processed 💸")
                .message(
                    "Your refund of $" + refundAmount +
                    " for the booking at " + booking.getPropertyName() +
                    " (" + booking.getCheckInDate() + " to " + booking.getCheckOutDate() + ")" +
                    " has been processed by admin."
                )
                .type("BOOKING_REFUNDED")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Host
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getHostId())
                .title("Booking Refunded")
                .message(
                    "A booking for your property " + booking.getPropertyName() +
                    " (" + booking.getCheckInDate() + " to " + booking.getCheckOutDate() + ")" +
                    " has been refunded to the guest."
                )
                .type("BOOKING_REFUNDED")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        return saved;
    }

    public Booking issuePayout(String id) {
        Booking booking = getBooking(id);
        if (booking.isPayoutIssued()) {
            throw new RuntimeException("Payout already issued for this booking");
        }

        double payoutPct = booking.getPayoutPercentage() != null ? booking.getPayoutPercentage() : 80.0;
        BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal payoutAmount = totalPrice.multiply(BigDecimal.valueOf(payoutPct / 100))
            .setScale(2, RoundingMode.HALF_UP);

        booking.setPayoutIssued(true);
        booking.setPayoutAmount(payoutAmount);
        booking.setPayoutPercentage(payoutPct);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify Host of payout
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientUserId(booking.getHostId())
                .title("Payout Received 💰")
                .message(
                    "You have received a payout of $" + payoutAmount +
                    " (" + (int) payoutPct + "% of $" + totalPrice + ")" +
                    " for the completed booking at " + booking.getPropertyName() +
                    " (" + booking.getCheckInDate() + " to " + booking.getCheckOutDate() + ")."
                )
                .type("HOST_PAYOUT")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        // Notify Admin of payout issuance
        notificationClient.sendNotification(
            CreateNotificationRequest.builder()
                .recipientRole("ADMIN")
                .title("Payout Issued")
                .message(
                    "Payout of $" + payoutAmount + " issued to host " + booking.getHostId() +
                    " for booking #" + booking.getId().substring(0, 8)
                )
                .type("ADMIN_PAYOUT")
                .actionTargetUserId(booking.getId())
                .status("UNREAD")
                .build()
        );

        return saved;
    }

    public Booking updatePaymentStatus(String id, PaymentStatus status) {
        Booking booking = getBooking(id);
        booking.setPaymentStatus(status);
        booking.setUpdatedAt(LocalDateTime.now());

        if (status == PaymentStatus.COMPLETED) {
            // Notify guest that payment was approved
            notificationClient.sendNotification(
                CreateNotificationRequest.builder()
                    .recipientUserId(booking.getGuestId())
                    .title("Payment Approved ✅")
                    .message(
                        "Your payment of $" + booking.getTotalPrice() +
                        " for booking at " + booking.getPropertyName() +
                        " has been approved by admin."
                    )
                    .type("PAYMENT_APPROVED")
                    .actionTargetUserId(booking.getId())
                    .status("UNREAD")
                    .build()
            );

            // Notify host that guest payment is complete
            notificationClient.sendNotification(
                CreateNotificationRequest.builder()
                    .recipientUserId(booking.getHostId())
                    .title("Guest Payment Confirmed")
                    .message(
                        "The guest has completed payment of $" + booking.getTotalPrice() +
                        " for booking at " + booking.getPropertyName() + "."
                    )
                    .type("PAYMENT_APPROVED")
                    .actionTargetUserId(booking.getId())
                    .status("UNREAD")
                    .build()
            );
        }

        return bookingRepository.save(booking);
    }

    private BigDecimal calculateRefundAmount(Booking booking) {
        if (booking.getTotalPrice() == null) return BigDecimal.ZERO;

        String policy = booking.getCancellationPolicy() != null ? booking.getCancellationPolicy() : "MODERATE";
        long daysUntilCheckIn = 0;
        if (booking.getCheckInDate() != null) {
            daysUntilCheckIn = java.time.temporal.ChronoUnit.DAYS.between(
                java.time.LocalDate.now(), booking.getCheckInDate()
            );
        }

        double refundPercent = switch (policy) {
            case "FLEXIBLE" -> daysUntilCheckIn >= 1 ? 100 : 50;
            case "STRICT" -> daysUntilCheckIn >= 7 ? 50 : 0;
            default -> // MODERATE
                daysUntilCheckIn >= 5 ? 100 : (daysUntilCheckIn >= 1 ? 50 : 0);
        };

        return booking.getTotalPrice()
            .multiply(BigDecimal.valueOf(refundPercent / 100))
            .setScale(2, RoundingMode.HALF_UP);
    }
}
