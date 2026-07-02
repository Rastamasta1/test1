-- Tasks table for personal task manager
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists tasks_done_idx on tasks (done);
create index if not exists tasks_due_date_idx on tasks (due_date);
create index if not exists tasks_priority_idx on tasks (priority);

-- Enable Row Level Security with open policies for demo use
alter table tasks enable row level security;

drop policy if exists "Public read access" on tasks;
create policy "Public read access" on tasks for select using (true);

drop policy if exists "Public insert access" on tasks;
create policy "Public insert access" on tasks for insert with check (true);

drop policy if exists "Public update access" on tasks;
create policy "Public update access" on tasks for update using (true) with check (true);

drop policy if exists "Public delete access" on tasks;
create policy "Public delete access" on tasks for delete using (true);
