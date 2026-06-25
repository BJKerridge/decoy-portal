package com.decoy.datalayer;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;

public class Main {
    public static void main(String[] args) {
        // Read environment variables passed by docker-compose
        String dbUrl = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPassword = System.getenv("DB_PASSWORD");

        System.out.println("DECOY-DataLayer Initialized. Starting 10-second test insertion loop...");

        // Safety verification
        if (dbUrl == null || dbUser == null || dbPassword == null) {
            System.err.println("CRITICAL ERROR: Missing Database Environment Configuration variables!");
            return;
        }

        int trackingId = 1;

        while (true) {
            String insertSql = "INSERT INTO test_table (message) VALUES (?);";
            
            try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                 PreparedStatement pstmt = conn.prepareStatement(insertSql)) {
                
                String logMessage = "DECOY telemetry heart-beat batch #" + trackingId + " generated at " + LocalDateTime.now();
                pstmt.setString(1, logMessage);
                pstmt.executeUpdate();

                // This stdout string is what Grafana Loki will intercept and visualize
                System.out.println("SUCCESS: [DataLayer] Successfully committed record #" + trackingId + " to decoy-db.");
                trackingId++;

            } catch (SQLException e) {
                System.err.println("DATABASE ERROR: Failed to write test telemetry execution packet: " + e.getMessage());
            }

            // Sleep for 10 seconds
            try {
                Thread.sleep(10000);
            } catch (InterruptedException ie) {
                System.out.println("System execution loop interrupted. Exiting gracefully.");
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}