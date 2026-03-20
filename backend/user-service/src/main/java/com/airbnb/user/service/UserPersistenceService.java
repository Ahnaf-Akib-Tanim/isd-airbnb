package com.airbnb.user.service;

import com.airbnb.user.model.User;
import com.airbnb.user.model.enums.Role;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPersistenceService {

    public static final String LEGACY_USERS_COLLECTION = "users";
    public static final String GUESTS_COLLECTION = "guests";
    public static final String HOSTS_COLLECTION = "hosts";
    public static final String ADMINS_COLLECTION = "admins";

    private final MongoTemplate mongoTemplate;

    public User save(User user) {
        return mongoTemplate.save(user, getCollectionName(user.getRole()));
    }

    public Optional<User> findByEmail(String email) {
        Query query = Query.query(Criteria.where("email").is(email));
        return findFirst(query);
    }

    public Optional<User> findByUserId(String userId) {
        Query query = Query.query(Criteria.where("userId").is(userId));
        return findFirst(query);
    }

    public boolean existsByEmail(String email) {
        Query query = Query.query(Criteria.where("email").is(email));
        return mongoTemplate.exists(query, User.class, GUESTS_COLLECTION) ||
        mongoTemplate.exists(query, User.class, HOSTS_COLLECTION) ||
        mongoTemplate.exists(query, User.class, ADMINS_COLLECTION);
    }

    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        users.addAll(mongoTemplate.findAll(User.class, GUESTS_COLLECTION));
        users.addAll(mongoTemplate.findAll(User.class, HOSTS_COLLECTION));
        users.addAll(mongoTemplate.findAll(User.class, ADMINS_COLLECTION));
        return users;
    }

    public List<User> findAllLegacyUsers() {
        if (!mongoTemplate.collectionExists(LEGACY_USERS_COLLECTION)) {
            return List.of();
        }
        return mongoTemplate.findAll(User.class, LEGACY_USERS_COLLECTION);
    }

    public boolean legacyCollectionExists() {
        return mongoTemplate.collectionExists(LEGACY_USERS_COLLECTION);
    }

    public void dropLegacyUsersCollection() {
        if (legacyCollectionExists()) {
            mongoTemplate.dropCollection(LEGACY_USERS_COLLECTION);
        }
    }

    public String getCollectionName(Role role) {
        return switch (role) {
            case HOST -> HOSTS_COLLECTION;
            case ADMIN -> ADMINS_COLLECTION;
            case GUEST -> GUESTS_COLLECTION;
        };
    }

    private Optional<User> findFirst(Query query) {
        User admin = mongoTemplate.findOne(query, User.class, ADMINS_COLLECTION);
        if (admin != null) {
            return Optional.of(admin);
        }

        User host = mongoTemplate.findOne(query, User.class, HOSTS_COLLECTION);
        if (host != null) {
            return Optional.of(host);
        }

        User guest = mongoTemplate.findOne(query, User.class, GUESTS_COLLECTION);
        return Optional.ofNullable(guest);
    }
}
