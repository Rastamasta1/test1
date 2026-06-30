-- Portfolio & Asset Database Schema
-- Track: DATA

set check_function_bodies = off;

-- ============================================================
-- ENUM TYPES
-- ============================================================
do $$ begin
  create type asset_class as enum ('equity', 'etf', 'crypto', 'bond', 'cash', 'commodity', 'fund', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'split');
exception when duplicate_object then null; end $$;

-- ============================================================
-- ASSETS (reference data, shared across portfolios)
-- ============================================================
create table if not exists public.assets (
  id           uuid primary key default gen_random_uuid(),
  symbol       text not null,
  name         text not null,
  asset_class  asset_class not null default 'equity',
  currency     char(3) not null default 'USD',
  exchange     text,
  isin         text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint assets_symbol_unique unique (symbol, exchange)
);

create index if not exists idx_assets_symbol on public.assets (symbol);
create index if not exists idx_assets_class on public.assets (asset_class);

-- ============================================================
-- PORTFOLIOS (owned by a user)
-- ============================================================
create table if not exists public.portfolios (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  base_currency char(3) not null default 'USD',
  is_archived   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_portfolios_user on public.portfolios (user_id);

-- ============================================================
-- HOLDINGS (current position of an asset in a portfolio)
-- ============================================================
create table if not exists public.holdings (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios(id) on delete cascade,
  asset_id      uuid not null references public.assets(id) on delete restrict,
  quantity      numeric(24,8) not null default 0,
  avg_cost      numeric(24,8) not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint holdings_portfolio_asset_unique unique (portfolio_id, asset_id)
);

create index if not exists idx_holdings_portfolio on public.holdings (portfolio_id);
create index if not exists idx_holdings_asset on public.holdings (asset_id);

-- ============================================================
-- TRANSACTIONS (immutable ledger of activity)
-- ============================================================
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios(id) on delete cascade,
  asset_id      uuid references public.assets(id) on delete restrict,
  type          transaction_type not null,
  quantity      numeric(24,8) not null default 0,
  price         numeric(24,8) not null default 0,
  fees          numeric(24,8) not null default 0,
  currency      char(3) not null default 'USD',
  notes         text,
  executed_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_transactions_portfolio on public.transactions (portfolio_id);
create index if not exists idx_transactions_asset on public.transactions (asset_id);
create index if not exists idx_transactions_executed_at on public.transactions (executed_at desc);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at before update on public.assets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_portfolios_updated_at on public.portfolios;
create trigger trg_portfolios_updated_at before update on public.portfolios
  for each row execute function public.set_updated_at();

drop trigger if exists trg_holdings_updated_at on public.holdings;
create trigger trg_holdings_updated_at before update on public.holdings
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.assets enable row level security;

-- Assets are public reference data: readable by all authenticated users
drop policy if exists assets_select on public.assets;
create policy assets_select on public.assets
  for select to authenticated using (true);

-- Portfolios: owner-only access
drop policy if exists portfolios_owner on public.portfolios;
create policy portfolios_owner on public.portfolios
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Holdings: access via owned portfolio
drop policy if exists holdings_owner on public.holdings;
create policy holdings_owner on public.holdings
  for all to authenticated
  using (exists (select 1 from public.portfolios p where p.id = holdings.portfolio_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.portfolios p where p.id = holdings.portfolio_id and p.user_id = auth.uid()));

-- Transactions: access via owned portfolio
drop policy if exists transactions_owner on public.transactions;
create policy transactions_owner on public.transactions
  for all to authenticated
  using (exists (select 1 from public.portfolios p where p.id = transactions.portfolio_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.portfolios p where p.id = transactions.portfolio_id and p.user_id = auth.uid()));
