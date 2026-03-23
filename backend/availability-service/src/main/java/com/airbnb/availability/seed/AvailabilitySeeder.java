package com.airbnb.availability.seed;

import com.airbnb.availability.model.Availability;
import com.airbnb.availability.repository.AvailabilityRepository;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

@Component
@RequiredArgsConstructor
@Slf4j
public class AvailabilitySeeder implements CommandLineRunner {

    private final AvailabilityRepository availabilityRepository;

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    public void run(String... args) {
        if (availabilityRepository.count() > 0) {
            log.info("Availability data already exists. Skipping seed.");
            return;
        }

        log.info("Seeding availability data for existing hosts...");

        try {
            // 1. Connect to User DB to get hosts
            // Adjust the URI to point to userdb instead of availabilitydb
            String userDbName = "userdb";
            // Assuming URI format: mongodb+srv://.../availabilitydb?... or mongodb://.../availabilitydb
            // Simple replacement strategy (heuristic but effective for typical connection strings)
            String userUri = mongoUri.replace("/availabilitydb", "/" + userDbName);

            // Validate if replacement worked, fallback if needed or fail fast
            if (userUri.equals(mongoUri) && !mongoUri.contains(userDbName)) {
                log.warn("Could not automatically derive userdb URI from {}. Trying to connect to 'userdb' on same cluster.", mongoUri);
                // If URI didn't have DB name, it might default to 'test'. We can try appending or replacing known pattern.
                // But for now, let's assume standard format from .env.example
            }

            try (MongoClient mongoClient = MongoClients.create(userUri)) {
                MongoDatabase userDb = mongoClient.getDatabase(userDbName);
                MongoCollection<Document> usersCollection = userDb.getCollection("users");

                // Find all users with role "HOST"
                // Note: Enum 'HOST' is usually stored as string "HOST"
                List<Document> hosts = usersCollection.find(Filters.eq("role", "HOST"))
                        .into(new ArrayList<>());

                log.info("Found {} hosts to seed availability for.", hosts.size());

                if (hosts.isEmpty()) {
                    log.warn("No hosts found in userdb. Skipping availability seeding.");
                    return;
                }

                List<Availability> availabilities = new ArrayList<>();
                Random random = new Random();
                LocalDate today = LocalDate.now();

                for (Document host : hosts) {
                    String hostId = host.getString("_id"); // Assuming standard Mongo ID
                    // Fallback if _id is ObjectId, convert to string
                    if (hostId == null && host.get("_id") != null) {
                        hostId = host.get("_id").toString();
                    }

                    Double nightlyRate = host.getDouble("nightlyRateUsd");
                    BigDecimal basePrice = nightlyRate != null
                        ? BigDecimal.valueOf(nightlyRate)
                        : BigDecimal.valueOf(50 + random.nextInt(100));

                    // Generate availability for next 365 days
                    // Strategy: Create blocks of available days (e.g., 3-14 days) separated by booked/blocked days (1-5 days)
                    LocalDate currentDate = today;
                    LocalDate oneYearLater = today.plusDays(365);

                    while (currentDate.isBefore(oneYearLater)) {
                        // Decide if this block is available or not
                        boolean isAvailable = random.nextDouble() > 0.15; // 85% available chance

                        int blockLength = 1 + random.nextInt(isAvailable ? 14 : 5);
                        LocalDate blockEnd = currentDate.plusDays(blockLength).minusDays(1);

                        if (blockEnd.isAfter(oneYearLater)) {
                            blockEnd = oneYearLater;
                        }

                        // Create one entry for the whole block? Or day by day?
                        // User said "date range wise", implying we can store ranges.
                        // Our model supports ranges (startDate, endDate).

                        // Price variation
                        BigDecimal currentPrice = basePrice;
                        if (isAvailable) {
                            // Weekend or random variation
                            if (random.nextDouble() > 0.7) {
                                currentPrice = basePrice.multiply(BigDecimal.valueOf(1.1 + random.nextDouble() * 0.2)); // 10-30% higher
                            }
                        }

                        Availability availability = Availability.builder()
                                .hostId(hostId)
                                .startDate(currentDate)
                                .endDate(blockEnd)
                                .isAvailable(isAvailable)
                                .price(currentPrice)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                        availabilities.add(availability);

                        currentDate = blockEnd.plusDays(1);
                    }
                }

                // Save in batches
                if (!availabilities.isEmpty()) {
                    log.info("Saving {} availability records...", availabilities.size());
                    // Batch save if too many?
                    // For 60 hosts * ~50 records each = 3000 records. Safe to save all at once or in chunks.
                    availabilityRepository.saveAll(availabilities);
                    log.info("Availability seeding completed.");
                }
            }
        } catch (Exception e) {
            log.error("Failed to seed availability", e);
            throw e; // Rethrow to fail startup if critical, or just log
        }
    }
}
