
# Backend — Together

This folder contains the Express + MongoDB backend for the Together crowdfunding MVP.

## Quick setup

1. Copy the example environment file and edit it with your values:

```powershell
cd backend
copy .env.example .env
# open .env and set MONGO_URI, JWT_SECRET, STRIPE_SECRET, etc.
```

2. Install and run in development:

```powershell
npm install
npm run dev     # uses nodemon (development)
```

## Important environment variables

See `backend/.env.example` for full list. Key variables:

- `MONGO_URI` — MongoDB connection string (use Atlas for remote DB)
- `PORT` — server port (default: 5000)
- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRY` — token expiry (e.g. `24h`)
- `STRIPE_SECRET` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret (required to verify Stripe events)
- `CLIENT_URL` — frontend origin for CORS

## Uploads

- User-uploaded files (avatars, project images) are stored in `backend/uploads/` by default.
- The repository `.gitignore` ignores upload contents to avoid committing user data. Add a `.gitkeep` if you need the folder tracked.

## Stripe webhooks (development)

- The webhook endpoint is mounted at `/webhooks/stripe` (or similar in routes). When testing locally use:

```bash
stripe listen --forward-to localhost:5000/webhooks/stripe
```

After `stripe listen` runs, copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in your `.env`.

## Notes and tips

- Make sure CORS is configured to allow your frontend URL (see `CLIENT_URL`).
- If you migrated from a local MongoDB to Atlas, ensure your network access and database user are configured in the Atlas dashboard.
- Check `backend/src/index.js` for server and middleware configuration (helmet, CORS, static file serving).

If you'd like, I can add a short troubleshooting section or example `.env` file mapping to this README.

