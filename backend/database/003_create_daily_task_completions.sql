CREATE TABLE IF NOT EXISTS daily_task_completions (
  id INT NOT NULL AUTO_INCREMENT,
  plan_day_id INT NOT NULL,
  task_type ENUM('meal', 'workout', 'sleep', 'water') NOT NULL,
  task_ref_id VARCHAR(50) DEFAULT NULL,
  is_completed TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_task_completion (plan_day_id, task_type, task_ref_id),
  CONSTRAINT daily_task_completions_ibfk_1
    FOREIGN KEY (plan_day_id) REFERENCES plan_days (id) ON DELETE CASCADE
);
