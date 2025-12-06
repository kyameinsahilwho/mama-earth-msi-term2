-- 7) Feedback table
create table if not exists feedback (
  id serial primary key,
  profile_id uuid references profiles(id) on delete set null,
  product_name text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);
