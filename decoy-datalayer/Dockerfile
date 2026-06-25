# --- Build Stage ---
FROM gradle:8.7-jdk21-alpine AS builder
WORKDIR /app

# Copy configuration files first to cache dependency layers cleanly
COPY build.gradle.kts settings.gradle.kts ./
RUN gradle dependencies --no-daemon || true

# Copy source code and run a full build (which now triggers installDist)
COPY src ./src
RUN gradle build -x test --no-daemon

# --- Run Stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Using a wildcard match handles any variation of the install folder name safely
COPY --from=builder /app/build/install/* ./

EXPOSE 8080

# Execute the start script natively from the unpacked bin directory
ENTRYPOINT ["./bin/decoy-datalayer"]