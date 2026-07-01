-- Messages table for guestbook-style app
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Allow anyone to read messages
create policy "Public read access" on messages
  for select using (true);

-- Allow anyone to insert messages
create policy "Public insert access" on messages
  for insert with check (true);
