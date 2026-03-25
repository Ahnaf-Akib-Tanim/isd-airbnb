# Docker Build Fix - Review Service

## Issue
The review-service Dockerfile was using an outdated base image (`openjdk:17-jdk-slim`) that's no longer available on Docker Hub.

## What Was Fixed

### 1. Updated Dockerfile
**File:** `backend/review-service/Dockerfile`

**Before:**
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/review-service-1.0.0.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**After:**
```dockerfile
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/review-service-1.0.0.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Changes:**
- ✅ Uses multi-stage build (same as other services)
- ✅ Uses `eclipse-temurin:21-jre-alpine` (available and maintained)
- ✅ Builds from source instead of requiring pre-built JAR
- ✅ Correct port (8089 instead of 8086)

### 2. Updated Environment Variables
**Files:** `.env` and `.env.example`

**Added:**
```env
MONGO_URI_REVIEWS=mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/reviewdb?retryWrites=true&w=majority&appName=cluster0
REVIEW_SERVICE_PORT=8089
```

## How to Build Now

### Option 1: Build and Start All Services
```bash
docker-compose up --build
```

### Option 2: Build Only Review Service
```bash
docker-compose build review-service
docker-compose up -d review-service
```

### Option 3: Clean Build (if issues persist)
```bash
# Stop all containers
docker-compose down

# Remove old images
docker rmi airbnbproject-review-service

# Rebuild
docker-compose up --build
```

## Verify It Works

### 1. Check Container Status
```bash
docker ps | grep review-service
```

Expected output:
```
review-service   Up X seconds   0.0.0.0:8089->8089/tcp
```

### 2. Check Logs
```bash
docker logs review-service
```

Expected output should include:
```
Started ReviewServiceApplication in X seconds
```

### 3. Test API
```bash
curl http://localhost:8089/api/reviews/health
```

Or through API Gateway:
```bash
curl http://localhost:8080/api/reviews/health
```

## Why This Happened

The `openjdk` Docker images were deprecated and moved to Eclipse Temurin. The old images are no longer maintained or available on Docker Hub.

**Deprecated:** `openjdk:17-jdk-slim`  
**Replacement:** `eclipse-temurin:21-jre-alpine`

## All Services Now Use Consistent Images

All backend services now use the same base images:
- **Build stage:** `maven:3.9.6-eclipse-temurin-21-alpine`
- **Runtime stage:** `eclipse-temurin:21-jre-alpine`

This ensures:
- ✅ Consistency across services
- ✅ Maintained and supported images
- ✅ Smaller image sizes (Alpine Linux)
- ✅ Better security updates

## Troubleshooting

### Issue: "MONGO_URI_REVIEWS variable is not set"
**Solution:** The .env file has been updated. If you still see this warning, restart Docker Compose:
```bash
docker-compose down
docker-compose up --build
```

### Issue: Port 8089 already in use
**Solution:** Check what's using the port:
```bash
netstat -ano | findstr :8089
```

Kill the process or change the port in .env:
```env
REVIEW_SERVICE_PORT=8090
```

### Issue: Build fails with Maven errors
**Solution:** Clean Maven cache and rebuild:
```bash
docker-compose build --no-cache review-service
```

### Issue: Container starts but crashes immediately
**Solution:** Check logs for errors:
```bash
docker logs review-service --tail 100
```

Common issues:
- MongoDB connection string incorrect
- Port conflict
- Missing dependencies

## Next Steps

After successful build:
1. ✅ Verify all services are running: `docker ps`
2. ✅ Check review-service logs: `docker logs review-service`
3. ✅ Test API endpoints
4. ✅ Run the seeder to populate reviews
5. ✅ Test frontend ReviewsSection component

## Summary

The review-service Dockerfile has been updated to use modern, maintained base images. The .env file now includes the required MongoDB URI and port configuration. You can now build and run the complete application with all services including the new review-service.
