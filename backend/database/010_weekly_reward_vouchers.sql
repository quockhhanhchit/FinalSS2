ALTER TABLE reward_vouchers
ADD COLUMN weekly_quantity INT DEFAULT NULL AFTER available_quantity;

UPDATE reward_vouchers
SET weekly_quantity = available_quantity
WHERE weekly_quantity IS NULL;
