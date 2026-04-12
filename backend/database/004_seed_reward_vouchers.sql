CREATE TABLE IF NOT EXISTS reward_vouchers (
  id INT NOT NULL AUTO_INCREMENT,
  brand VARCHAR(100) NOT NULL,
  discount_label VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  points_required INT NOT NULL,
  available_quantity INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  voucher_id INT NOT NULL,
  points_spent INT NOT NULL,
  redeem_code VARCHAR(50) DEFAULT NULL,
  redeemed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY voucher_id (voucher_id),
  CONSTRAINT reward_redemptions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT reward_redemptions_ibfk_2 FOREIGN KEY (voucher_id) REFERENCES reward_vouchers (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('streak', 'weight', 'budget', 'complete', 'milestone', 'special') NOT NULL,
  level INT DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  earned TINYINT(1) DEFAULT 0,
  points_awarded INT DEFAULT 0,
  earned_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT user_achievements_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_notification_settings (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  daily_reminders TINYINT(1) DEFAULT 1,
  weight_tracking_reminders TINYINT(1) DEFAULT 1,
  budget_alerts TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY user_id (user_id),
  CONSTRAINT user_notification_settings_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

INSERT INTO reward_vouchers
  (brand, discount_label, image_url, points_required, available_quantity, is_active)
SELECT 'Shopee', '50,000 VND',
       'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
       500, 5, true
WHERE NOT EXISTS (SELECT 1 FROM reward_vouchers WHERE brand = 'Shopee' AND discount_label = '50,000 VND');

INSERT INTO reward_vouchers
  (brand, discount_label, image_url, points_required, available_quantity, is_active)
SELECT 'Grab Food', '30,000 VND',
       'https://images.unsplash.com/photo-1661257711676-79a0fc533569?w=400',
       300, 3, true
WHERE NOT EXISTS (SELECT 1 FROM reward_vouchers WHERE brand = 'Grab Food' AND discount_label = '30,000 VND');

INSERT INTO reward_vouchers
  (brand, discount_label, image_url, points_required, available_quantity, is_active)
SELECT 'The Coffee House', '25,000 VND',
       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
       250, 10, true
WHERE NOT EXISTS (SELECT 1 FROM reward_vouchers WHERE brand = 'The Coffee House' AND discount_label = '25,000 VND');

INSERT INTO reward_vouchers
  (brand, discount_label, image_url, points_required, available_quantity, is_active)
SELECT 'Decathlon', '100,000 VND',
       'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400',
       1000, 2, true
WHERE NOT EXISTS (SELECT 1 FROM reward_vouchers WHERE brand = 'Decathlon' AND discount_label = '100,000 VND');
