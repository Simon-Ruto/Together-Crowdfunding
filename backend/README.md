Together - Backend

This is a minimal Express + MongoDB backend for the Together crowdfunding MVP.

Setup
- Copy `.env.example` to `.env` and update values.
- Install dependencies: `npm install`
- Run dev: `npm run dev`

Uploads
- Uploaded files are stored in `uploads/` in this backend folder.

Stripe
- Set `STRIPE_SECRET` to your test/live secret in `.env`.
- Set `STRIPE_WEBHOOK_SECRET` if you plan to use webhooks (recommended). The webhook endpoint is mounted at `/webhooks/stripe` and expects signed events.

Notes
- For development you can use the Stripe CLI to forward webhooks to your local server and obtain the webhook signing secret.

