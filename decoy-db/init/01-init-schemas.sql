-- Connect to the target system application database
\c decoy_portal_db;

-- Explicitly ensure table layouts exist safely and idempotently
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (Optional) If you want to add tracking indexes or structural changes later, 
-- you can append them cleanly here.