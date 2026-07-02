-- Personal Finance Tracker schema

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null check (amount >= 0),
  category text not null check (category in ('salary','food','rent','transport','entertainment','other')),
  date date not null default current_date,
  note text default '',
  created_at timestamptz not null default now()
);

create index if not exists transactions_date_idx on transactions(date desc);
create index if not exists transactions_category_idx on transactions(category);

alter table transactions enable row level security;

drop policy if exists "public read" on transactions;
create policy "public read" on transactions for select using (true);

drop policy if exists "public insert" on transactions;
create policy "public insert" on transactions for insert with check (true);

drop policy if exists "public update" on transactions;
create policy "public update" on transactions for update using (true) with check (true);

drop policy if exists "public delete" on transactions;
create policy "public delete" on transactions for delete using (true);
