-- Recipes table for the recipe collection app
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('breakfast','lunch','dinner','dessert','snack')),
  cook_time integer not null default 0,
  servings integer not null default 1,
  image_url text,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_category_idx on recipes (category);
create index if not exists recipes_created_at_idx on recipes (created_at desc);

-- Enable Row Level Security with open policies for this demo app
alter table recipes enable row level security;

drop policy if exists "Public read recipes" on recipes;
create policy "Public read recipes" on recipes for select using (true);

drop policy if exists "Public insert recipes" on recipes;
create policy "Public insert recipes" on recipes for insert with check (true);

drop policy if exists "Public update recipes" on recipes;
create policy "Public update recipes" on recipes for update using (true) with check (true);

drop policy if exists "Public delete recipes" on recipes;
create policy "Public delete recipes" on recipes for delete using (true);
