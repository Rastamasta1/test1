# Server & Routing

The HTTP server is built with Express.

## Entry points

- `src/app.js` — exports `createApp()` which builds the Express application, registers JSON/body parsing, mounts routes, and attaches 404 + error handlers.
- `src/server.js` — creates the app and starts listening on `config.port`. Handles graceful shutdown on `SIGTERM`/`SIGINT`.

## Start

```bash
node src/server.js
```

## Routes

| Method | Path | Description |
|---|---|---|
| GET | /health | Liveness/health info |
| GET | /api/portfolios | List portfolios (requires `x-user-id` header) |
| POST | /api/portfolios | Create a portfolio |
| GET | /api/portfolios/:id | Get a portfolio by id |
| GET | /api/portfolios/:id/holdings | List holdings for a portfolio |
| GET | /api/portfolios/:id/valuation | Compute valuation/PnL for a portfolio |

## Middleware

`src/middleware/errorHandler.js` provides `notFound` (404 JSON) and `errorHandler` (JSON error responses; includes stack trace outside production).

## Dependencies

Requires `express`:

```bash
npm install express
```
