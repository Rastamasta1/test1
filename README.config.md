# Configuration & Environment

## Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values in `.env`.
3. Install deps (requires `dotenv`):
   ```bash
   npm install dotenv
   ```

## Usage

```js
const config = require('./src/config');
console.log(config.port);
```

The loader validates required variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`) at startup and throws if any are missing.

## Variables

| Variable | Required | Default |
|---|---|---|
| NODE_ENV | no | development |
| PORT | no | 3000 |
| SUPABASE_URL | yes | - |
| SUPABASE_ANON_KEY | yes | - |
| SUPABASE_SERVICE_ROLE_KEY | no | '' |
| JWT_SECRET | yes | - |
| LOG_LEVEL | no | info |
