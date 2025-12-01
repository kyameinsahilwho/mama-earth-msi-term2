-- Garden Feature Schema

create table if not exists user_plants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text,
  seed text not null, -- Random string to determine phenotype
  stage integer default 1, -- 1: Sprout, 2: Seedling, 3: Vegetative, 4: Budding, 5: Flowering
  water_count integer default 0, -- Number of times watered in current stage
  max_water_for_stage integer default 5, -- Water needed to reach next stage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add trigger for updated_at
create trigger trg_user_plants_updated_at
before update on user_plants
for each row
execute function set_updated_at();
