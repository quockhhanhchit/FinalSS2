ALTER TABLE users
ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
ADD COLUMN google_id VARCHAR(255) NULL,
ADD UNIQUE KEY unique_google_id (google_id);
