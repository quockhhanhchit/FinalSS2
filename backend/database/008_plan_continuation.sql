ALTER TABLE plans
ADD COLUMN continuation_declined_after_day INT DEFAULT NULL AFTER status;
