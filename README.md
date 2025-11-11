
Together — Crowdfunding MVP

This repository contains a minimal MERN (MongoDB, Express, React, Node) stack implementation for a crowdfunding MVP called "Together".

This README covers:
- Project overview and implemented features
- Tech stack and repo layout
- Local setup for both backend and frontend (PowerShell-ready commands)
- Environment variables and `.env.example`
- Running, testing and deploying
- Contribution and contact information

## What this project is

Together is a simple crowdfunding platform prototype that allows users to register, create projects, upload images, and accept payments (Stripe integration). The workspace is separated into two folders:

- `backend/` — Express API, MongoDB models, authentication, file uploads, Stripe webhook endpoint
- `frontend/` — React (Vite) single-page app that consumes the backend API

## Features implemented

- User registration, login, JWT authentication
- User profiles with avatar upload
- Project creation and listing
- Project updates (backend model present)
- File upload handling (stored in `uploads/`)
- Stripe payment integration (payment routes + webhook endpoint)
- Basic CORS and security middleware

## Tech stack

- Backend: Node.js, Express, MongoDB (Mongoose), Multer (uploads), Stripe
- Frontend: React, Vite
- Dev tools: nodemon (backend dev), Vite dev server (frontend)

## Repo layout

```
/backend        # Express API
	|- src/
	|- package.json
	|- .env.example
	|- uploads/

/frontend       # React (Vite)
	|- src/
	|- package.json

README.md       # This file
.gitignore
```

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- A MongoDB instance (Atlas recommended for remote development)
- (Optional) Stripe account and CLI for testing webhooks

## Quick start (Windows PowerShell)

1. Clone the repo and open a PowerShell terminal:

```powershell
git clone <your-repo-url>
cd Together
```

2. Backend setup

```powershell
cd backend
copy .env.example .env           # create a local .env
# Edit .env to add your MongoDB URI, JWT secret and Stripe keys
npm install
npm run dev                      # starts dev server (nodemon)
```

3. Frontend setup (in a new PowerShell tab)

```powershell
cd frontend
npm install
npm run dev                      # starts Vite dev server (commonly on http://localhost:5173)
```

4. Visit the frontend in your browser (default http://localhost:5173). The frontend expects the backend API base URL at `http://localhost:5000/api` by default — you can change this in `frontend/src/api.js` or by setting `CLIENT_URL` in the backend `.env`.

## Environment variables

See `backend/.env.example` for a template. Important variables include:

- `MONGO_URI` — MongoDB connection string (Atlas URI recommended)
- `PORT` — backend server port (default: 5000)
- `JWT_SECRET` — secret used to sign JWT tokens
- `STRIPE_SECRET` — Stripe secret key for payments
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret when using Stripe webhooks
- `CLIENT_URL` — frontend origin (for CORS)

Never commit your `.env` with real secrets — add any local `.env` to `.gitignore` (already ignored).

## Stripe and webhooks (dev notes)

- The backend exposes a webhook endpoint (commonly `/webhooks/stripe`) — if you use the Stripe CLI, forward events to your local server and set `STRIPE_WEBHOOK_SECRET` in `.env`.
- For local development you can use `stripe listen --forward-to localhost:5000/webhooks/stripe`.

## Uploads

- Uploaded files are stored in `uploads/` directories. The repo `.gitignore` intentionally ignores the file contents but keeps the folder structure. If you need a placeholder, add a `.gitkeep` file.

## Common scripts

- Backend (from `/backend`):
	- `npm run dev` — start dev server with nodemon
	- `npm start` — start production server

- Frontend (from `/frontend`):
	- `npm run dev` — start Vite dev server
	- `npm run build` — create production build

## Pushing to GitHub (PowerShell)

1. Create a repo on GitHub (web UI) and copy the remote URL.

```powershell
git remote add origin <your-remote-url>
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

Important: verify `git status` before `git add .` to ensure no sensitive files (like a real `.env`) are included.

## Contributing

Contributions are welcome. Basic guidelines:

- Fork the repo, create a feature branch, and open a pull request.
- Keep changes small and focused. Add tests where applicable.

## License & Contact

This project does not include a license file by default. Add a `LICENSE` if you plan to open-source it.

For questions, reach out to the project owner or file an issue in the repository.

---

If you'd like, I can also:
- Add a small `CONTRIBUTING.md` with PR guidelines
- Expand the backend README with an example `.env` mapping (I will update `backend/README.md` now)
