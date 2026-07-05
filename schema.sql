-- Feedback wall table
create table if not exists feedback (
  id bigint generated always as identity primary key,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on feedback (created_at desc);

-- Enable Row Level Security and allow public read/insert for this demo app
alter table feedback enable row level security;

create policy "Allow public read access" on feedback
  for select using (true);

create policy "Allow public insert access" on feedback
  for insert with check (true);
