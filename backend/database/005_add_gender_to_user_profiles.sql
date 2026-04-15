ALTER TABLE user_profiles
ADD COLUMN gender ENUM('male', 'female', 'other') NOT NULL DEFAULT 'male' AFTER age;
