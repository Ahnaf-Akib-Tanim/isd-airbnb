# ================================
# Stage 1: Build
# ================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ================================
# Stage 2: Runtime
# ================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add a non-root user for security
RUN addgroup -S airbnb && adduser -S airbnb -G airbnb

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership
RUN chown airbnb:airbnb app.jar

USER airbnb

EXPOSE 8086

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=docker", "app.jar"]
