package com.airbnb.review.service;

import com.airbnb.review.model.Review;
import com.airbnb.review.model.ReviewStatus;
import com.airbnb.review.repository.ReviewRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public Review createReview(Review review) {
        // Check if review already exists for this booking
        if (reviewRepository.existsByBookingId(review.getBookingId())) {
            throw new RuntimeException("Review already exists for this booking");
        }

        review.setStatus(ReviewStatus.APPROVED); // Auto-approve for now
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        review.setHelpfulCount(0);
        
        return reviewRepository.save(review);
    }

    public Review getReview(String id) {
        return reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public List<Review> getReviewsByHost(String hostId) {
        return reviewRepository.findByHostIdAndStatus(hostId, ReviewStatus.APPROVED);
    }

    public List<Review> getReviewsByGuest(String guestId) {
        return reviewRepository.findByGuestId(guestId);
    }

    public List<Review> getReviewsByProperty(String propertyId) {
        return reviewRepository.findByPropertyIdAndStatus(propertyId, ReviewStatus.APPROVED);
    }

    public Review addHostResponse(String reviewId, String response) {
        Review review = getReview(reviewId);
        review.setHostResponse(response);
        review.setHostResponseDate(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public Review markHelpful(String reviewId, String userId) {
        Review review = getReview(reviewId);
        if (!review.getHelpfulByUserIds().contains(userId)) {
            review.getHelpfulByUserIds().add(userId);
            review.setHelpfulCount(review.getHelpfulByUserIds().size());
            review.setUpdatedAt(LocalDateTime.now());
            return reviewRepository.save(review);
        }
        return review;
    }

    public List<Review> getPendingReviews() {
        return reviewRepository.findByStatus(ReviewStatus.PENDING);
    }

    public Review approveReview(String reviewId) {
        Review review = getReview(reviewId);
        review.setStatus(ReviewStatus.APPROVED);
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public Review rejectReview(String reviewId) {
        Review review = getReview(reviewId);
        review.setStatus(ReviewStatus.REJECTED);
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }
}
