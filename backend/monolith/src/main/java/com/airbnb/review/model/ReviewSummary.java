package com.airbnb.review.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "review_summaries")
public class ReviewSummary {
    @Id
    private String id;

    @Indexed(unique = true)
    private String hostId;

    private String summary;
    private int reviewCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
