-- Add coupon fields to user_plants
alter table user_plants 
add column if not exists coupon_code text,
add column if not exists coupon_value integer;
