ALTER TABLE users
ADD COLUMN password_reset_token_hash VARCHAR(255) NULL AFTER refresh_token_hash,
ADD COLUMN password_reset_expires_at DATETIME NULL AFTER password_reset_token_hash;
