-- Add referred_by to profiles to track who referred this user
alter table profiles 
add column if not exists referred_by uuid references profiles(id);
