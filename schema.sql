-- Guestbook messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Allow anyone to read all messages
drop policy if exists "Public can read messages" on public.messages;
create policy "Public can read messages"
  on public.messages
  for select
  using (true);

-- Allow anyone to insert a new message
drop policy if exists "Public can insert messages" on public.messages;
create policy "Public can insert messages"
  on public.messages
  for insert
  with check (true);

-- Index to speed up newest-first ordering
create index if not exists messages_created_at_idx
  on public.messages (created_at desc);
