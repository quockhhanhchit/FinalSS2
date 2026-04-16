ALTER TABLE plan_days
ADD COLUMN actual_cost DECIMAL(10,2) DEFAULT NULL AFTER planned_cost;

CREATE TABLE IF NOT EXISTS user_badges (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_user_badge (user_id, badge_name),
  KEY idx_user_badges_user_id (user_id),
  CONSTRAINT user_badges_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
