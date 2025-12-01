-- Add referral_code to profiles
alter table profiles 
add column if not exists referral_code text unique;

-- Generate referral codes for existing users who don't have one
-- Using a simple random string generation strategy for backfill
update profiles 
set referral_code = upper(substring(md5(id::text || random()::text) from 1 for 8))
where referral_code is null;

-- Make it not null after backfill (optional, but good practice if we want to guarantee it)
-- alter table profiles alter column referral_code set not null;
