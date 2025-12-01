-- Migration to update quiz tracking from boolean to counter
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS quizzes_taken_today integer DEFAULT 0;

-- Optional: migrate existing data if needed, but since it's daily, we can just start fresh or assume 0/1 based on boolean
-- UPDATE profiles SET quizzes_taken_today = 1 WHERE quiz_taken = true;

-- We can keep quiz_taken for backward compatibility or drop it. 
-- For this update, we will ignore it in the code.
-- ALTER TABLE profiles DROP COLUMN IF EXISTS quiz_taken;
