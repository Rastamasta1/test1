# Portfolio & Asset Schema

Migration: `supabase/migrations/0001_portfolio_assets_schema.sql`

## Tables

### assets
Shared reference data for tradable instruments.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| symbol | text | ticker, unique with exchange |
| name | text | display name |
| asset_class | enum | equity, etf, crypto, bond, cash, commodity, fund, other |
| currency | char(3) | default USD |
| exchange | text | nullable |
| isin | text | nullable |
| metadata | jsonb | extra fields |

### portfolios
User-owned containers.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users, cascade delete |
| name | text | |
| base_currency | char(3) | default USD |
| is_archived | boolean | |

### holdings
Current net position per asset per portfolio (unique pair).
| Column | Type | Notes |
|---|---|---|
| portfolio_id | uuid | FK portfolios |
| asset_id | uuid | FK assets |
| quantity | numeric(24,8) | |
| avg_cost | numeric(24,8) | |

### transactions
Immutable activity ledger.
| Column | Type | Notes |
|---|---|---|
| type | enum | buy, sell, dividend, deposit, withdrawal, fee, split |
| quantity / price / fees | numeric(24,8) | |
| executed_at | timestamptz | |

## Security
RLS enabled. Assets are read-only public reference data; portfolios/holdings/transactions are scoped to the owning user via `auth.uid()`.

## Notes
Holdings can be derived from transactions but are persisted for fast reads and updated by application logic or future triggers.
