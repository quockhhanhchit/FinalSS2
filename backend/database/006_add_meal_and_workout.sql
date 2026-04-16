ALTER TABLE user_profiles
MODIFY COLUMN budget_style ENUM('saving', 'normal', 'premium') DEFAULT 'normal';

CREATE TABLE IF NOT EXISTS meal_library (
  id INT NOT NULL AUTO_INCREMENT,
  meal_name VARCHAR(150) NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  budget_tier ENUM('saving', 'normal', 'premium') DEFAULT NULL ,
  goal_type ENUM('lose', 'maintain', 'gain') DEFAULT NULL,
  calories INT NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_meal_library_filter (goal_type, budget_tier, meal_type)
);

ALTER TABLE meals
ADD COLUMN meal_library_id INT NULL AFTER plan_day_id,
ADD CONSTRAINT fk_meals_library
  FOREIGN KEY (meal_library_id) REFERENCES meal_library(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS workout_library (
  id INT NOT NULL AUTO_INCREMENT,
  workout_type ENUM('cardio', 'strength', 'hiit', 'rest') NOT NULL,
  gender_target ENUM('male', 'female', 'both') DEFAULT 'both',
  location ENUM('gym', 'home') DEFAULT NULL,
  workout_name VARCHAR(150) NOT NULL,
  primary_focus VARCHAR(150) DEFAULT NULL,
  equipment VARCHAR(150) DEFAULT NULL,
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  suggested_volume VARCHAR(100) DEFAULT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_workout_library_filter (workout_type, gender_target, location, difficulty)
);

ALTER TABLE workouts
ADD COLUMN workout_library_id INT NULL AFTER plan_day_id,
ADD CONSTRAINT fk_workouts_library
  FOREIGN KEY (workout_library_id) REFERENCES workout_library(id) ON DELETE SET NULL;