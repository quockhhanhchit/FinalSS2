-- ============================================================
-- Consolidated migrations for one-shot MySQL import
-- Generated from budgetfit.sql + migrations 002..011
-- ============================================================
USE `budgetfit_db`;

SET @BF_OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `auth_provider` VARCHAR(20) NOT NULL DEFAULT 'local' AFTER `refresh_token_hash`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `google_id` VARCHAR(255) NULL AFTER `auth_provider`;

SET @bf_sql = IF (
  EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND INDEX_NAME = 'unique_google_id'
  ),
  'SELECT 1',
  'ALTER TABLE `users` ADD UNIQUE KEY `unique_google_id` (`google_id`)'
);
PREPARE bf_stmt FROM @bf_sql;
EXECUTE bf_stmt;
DEALLOCATE PREPARE bf_stmt;

ALTER TABLE `user_profiles`
  MODIFY COLUMN `budget_style` ENUM('saving', 'normal', 'premium') DEFAULT 'normal';

CREATE TABLE IF NOT EXISTS `meal_library` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meal_name` VARCHAR(150) NOT NULL,
  `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  `budget_tier` ENUM('saving', 'normal', 'premium') DEFAULT NULL,
  `goal_type` ENUM('lose', 'maintain', 'gain') DEFAULT NULL,
  `calories` INT NOT NULL DEFAULT 0,
  `estimated_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meal_library_filter` (`goal_type`, `budget_tier`, `meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `meals`
  ADD COLUMN IF NOT EXISTS `meal_library_id` INT NULL AFTER `plan_day_id`;

SET @bf_sql = IF (
  EXISTS (
    SELECT 1
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'meals'
      AND CONSTRAINT_NAME = 'fk_meals_library'
  ),
  'SELECT 1',
  'ALTER TABLE `meals` ADD CONSTRAINT `fk_meals_library` FOREIGN KEY (`meal_library_id`) REFERENCES `meal_library`(`id`) ON DELETE SET NULL'
);
PREPARE bf_stmt FROM @bf_sql;
EXECUTE bf_stmt;
DEALLOCATE PREPARE bf_stmt;

CREATE TABLE IF NOT EXISTS `workout_library` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `workout_type` ENUM('cardio', 'strength', 'hiit', 'rest') NOT NULL,
  `gender_target` ENUM('male', 'female', 'both') DEFAULT 'both',
  `location` ENUM('gym', 'home') DEFAULT NULL,
  `workout_name` VARCHAR(150) NOT NULL,
  `primary_focus` VARCHAR(150) DEFAULT NULL,
  `equipment` VARCHAR(150) DEFAULT NULL,
  `difficulty` ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  `suggested_volume` VARCHAR(100) DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workout_library_filter` (`workout_type`, `gender_target`, `location`, `difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `workouts`
  ADD COLUMN IF NOT EXISTS `workout_library_id` INT NULL AFTER `plan_day_id`;

SET @bf_sql = IF (
  EXISTS (
    SELECT 1
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'workouts'
      AND CONSTRAINT_NAME = 'fk_workouts_library'
  ),
  'SELECT 1',
  'ALTER TABLE `workouts` ADD CONSTRAINT `fk_workouts_library` FOREIGN KEY (`workout_library_id`) REFERENCES `workout_library`(`id`) ON DELETE SET NULL'
);
PREPARE bf_stmt FROM @bf_sql;
EXECUTE bf_stmt;
DEALLOCATE PREPARE bf_stmt;

ALTER TABLE `plan_days`
  ADD COLUMN IF NOT EXISTS `actual_cost` DECIMAL(10,2) DEFAULT NULL AFTER `planned_cost`;

CREATE TABLE IF NOT EXISTS `user_badges` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `badge_name` VARCHAR(100) NOT NULL,
  `earned_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_badge` (`user_id`, `badge_name`),
  KEY `idx_user_badges_user_id` (`user_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `plans`
  ADD COLUMN IF NOT EXISTS `continuation_declined_after_day` INT DEFAULT NULL AFTER `status`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `password_reset_token_hash` VARCHAR(255) NULL AFTER `google_id`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `password_reset_expires_at` DATETIME NULL AFTER `password_reset_token_hash`;

ALTER TABLE `reward_vouchers`
  ADD COLUMN IF NOT EXISTS `weekly_quantity` INT DEFAULT NULL AFTER `available_quantity`;

UPDATE `reward_vouchers`
SET `weekly_quantity` = `available_quantity`
WHERE `weekly_quantity` IS NULL;

CREATE TABLE IF NOT EXISTS `ai_chat_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `role` ENUM('user', 'assistant') NOT NULL,
  `message_text` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_chat_messages_user_created` (`user_id`, `created_at`),
  CONSTRAINT `fk_ai_chat_messages_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ai_usage_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `usage_type` ENUM('chat', 'weekly_summary') NOT NULL DEFAULT 'chat',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_usage_logs_user_created` (`user_id`, `created_at`),
  CONSTRAINT `fk_ai_usage_logs_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `notification_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `body` TEXT NOT NULL,
  `week_key` VARCHAR(20) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_notification_week` (`user_id`, `notification_type`, `week_key`),
  KEY `idx_user_notifications_user_created` (`user_id`, `created_at`),
  CONSTRAINT `fk_user_notifications_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `reward_vouchers`
  (`brand`, `discount_label`, `image_url`, `points_required`, `available_quantity`, `weekly_quantity`, `is_active`)
SELECT 'Shopee', '50,000 VND',
       'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
       500, 5, 5, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM `reward_vouchers`
  WHERE `brand` = 'Shopee' AND `discount_label` = '50,000 VND'
);

INSERT INTO `reward_vouchers`
  (`brand`, `discount_label`, `image_url`, `points_required`, `available_quantity`, `weekly_quantity`, `is_active`)
SELECT 'Grab Food', '30,000 VND',
       'https://images.unsplash.com/photo-1661257711676-79a0fc533569?w=400',
       300, 3, 3, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM `reward_vouchers`
  WHERE `brand` = 'Grab Food' AND `discount_label` = '30,000 VND'
);

INSERT INTO `reward_vouchers`
  (`brand`, `discount_label`, `image_url`, `points_required`, `available_quantity`, `weekly_quantity`, `is_active`)
SELECT 'The Coffee House', '25,000 VND',
       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
       250, 10, 10, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM `reward_vouchers`
  WHERE `brand` = 'The Coffee House' AND `discount_label` = '25,000 VND'
);

INSERT INTO `reward_vouchers`
  (`brand`, `discount_label`, `image_url`, `points_required`, `available_quantity`, `weekly_quantity`, `is_active`)
SELECT 'Decathlon', '100,000 VND',
       'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400',
       1000, 2, 2, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM `reward_vouchers`
  WHERE `brand` = 'Decathlon' AND `discount_label` = '100,000 VND'
);

SET FOREIGN_KEY_CHECKS = @BF_OLD_FOREIGN_KEY_CHECKS;
