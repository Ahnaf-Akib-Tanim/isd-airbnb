package com.airbnb.notification.repository;

import com.airbnb.notification.model.NotificationRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRecordRepository extends MongoRepository<NotificationRecord, String> {
}
