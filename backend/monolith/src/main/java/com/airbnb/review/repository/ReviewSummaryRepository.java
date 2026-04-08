package com.airbnb.review.repository;

import com.airbnb.review.model.ReviewSummary;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewSummaryRepository extends MongoRepository<ReviewSummary, String> {
    Optional<ReviewSummary> findByHostId(String hostId);
}
