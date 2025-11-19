
Together — Crowdfunding MVP

**Status: ✅ Production Ready** — Ready to deploy to Render (backend) and Vercel (frontend)

This repository contains a fully production-ready MERN (MongoDB, Express, React, Node) stack implementation for a crowdfunding MVP called "Together".

This README covers:
- Project overview and implemented features
- Tech stack and repo layout
- Local setup for both backend and frontend (PowerShell-ready commands)
- Environment variables and `.env.example`
- Running, testing and deploying
- Contribution and contact information

## 📋 Documentation Index

**Getting Started:**
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** — Deploy in 15 minutes (quick reference)
- **[VERCEL_RENDER_SETUP.md](./VERCEL_RENDER_SETUP.md)** — Step-by-step deployment guide

**Deployment & Reference:**
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Troubleshooting & checklists
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** — Production status & what was fixed
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** — Technical improvements made
- **[PRODUCTION_DEPLOYMENT_COMPLETE.md](./PRODUCTION_DEPLOYMENT_COMPLETE.md)** — Complete summary

## What this project is

Together is a complete crowdfunding platform that allows users to register, create projects, upload images, and accept payments via Stripe. The workspace is separated into two folders:

- `backend/` — Express API with MongoDB, authentication, file uploads, Stripe webhooks
- `frontend/` — React (Vite) SPA that consumes the backend API

## Features implemented

- ✅ User registration, login, JWT authentication
- ✅ User profiles with avatar upload
- ✅ Project creation and listing
- ✅ Project updates
- ✅ File upload handling (stored in `uploads/`)
- ✅ Stripe payment integration (+ webhook verification)
- ✅ Input validation (email, password, username)
- ✅ Centralized error handling
- ✅ Environment validation
- ✅ Health check endpoint
- ✅ Security middleware (Helmet, CORS, rate limiting)

## Tech stack

- Backend: Node.js, Express, MongoDB (Mongoose), Multer (uploads), Stripe, JWT
- Frontend: React 18, Vite, React Router, Axios
- Dev tools: nodemon (backend dev), Vite dev server (frontend)
- Deployment: Render (backend), Vercel (frontend)

## Repo layout

```
/backend        # Express API
	|- src/
	|   |- index.js           # Server + middleware
	|   |- routes/            # API endpoints
	|   |- models/            # MongoDB schemas
	|   |- middleware/        # Auth, validation, errors
	|   └── uploads/          # File storage
	|- package.json
	|- .env.example
	├── render.yaml           # Render config
	└── test-api.js           # Health check

/frontend       # React (Vite)
	|- src/
	|   |- components/
	|   |- pages/
	|   |- api.js             # API client
	|   └── main.jsx
	|- package.json
	├── .env.example
	└── vercel.json           # Vercel config

README.md                 # This file
.gitignore               # Git exclusions
QUICK_DEPLOY.md          # Fast reference
VERCEL_RENDER_SETUP.md   # Step-by-step guide
DEPLOYMENT.md            # Troubleshooting
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

## Production Deployment

This project is ready to deploy on **Render** (backend) and **Vercel** (frontend). Follow these steps:

### Backend Deployment on Render

1. **Create a Render account** at https://render.com and connect your GitHub repo.

2. **Create a new Web Service:**
   - Choose your GitHub repo
   - Set the root directory to `backend/`
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`

3. **Configure environment variables** in Render dashboard:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long random string (min 32 chars, e.g., use `openssl rand -hex 32`)
   - `CLIENT_URL` = your Vercel frontend URL (e.g., `https://together.vercel.app`)
   - `STRIPE_SECRET` = your Stripe secret key (`sk_live_...` for production)
   - `STRIPE_WEBHOOK_SECRET` = your Stripe webhook secret
   - `PORT` = `5000`

4. **Optional**: Configure SMTP for password reset emails:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

5. **Test the deployment:**
   - Visit `https://your-service.onrender.com/health` — you should see `{"status":"healthy"}`
   - Check Render logs if there are issues

### Frontend Deployment on Vercel

1. **Create a Vercel account** at https://vercel.com and import your GitHub repo.

2. **Configure Vercel project:**
   - Root directory: `frontend/`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set environment variables** in Vercel dashboard:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://together-backend.onrender.com/api`)

4. **Deploy:**
   - Vercel will automatically deploy on every push to `main` (or your selected branch)
   - Your site will be live at `https://your-project.vercel.app`

### Connecting Frontend to Backend

After deployment:
1. Get your Render backend URL (e.g., `https://together-backend.onrender.com`)
2. Update Vercel env var `VITE_API_URL` to `https://together-backend.onrender.com/api`
3. Redeploy Vercel (it will auto-redeploy on env change, or manually trigger)

### Known Limitations & Workarounds

- **File uploads don't persist on Render:** Currently, uploaded files are stored in the `uploads/` directory, which is ephemeral on Render. For production, consider using cloud storage (AWS S3, Google Cloud Storage, or Cloudinary).
  - Quick fix: Update `backend/src/routes/users.js` and `backend/src/routes/projects.js` to upload to a cloud service instead of the local filesystem.

- **Cold starts on Render:** Free tier services may have a cold start delay. Upgrade to a paid plan for always-on service.

- **Stripe webhooks:** Ensure your Render URL is added to Stripe dashboard (Settings → Webhooks → Add endpoint). Use `https://your-service.onrender.com/webhooks/stripe`.

### Monitoring and Troubleshooting

- **Backend logs:** Check Render dashboard → Logs tab for errors
- **Frontend logs:** Check Vercel dashboard → Deployments → Logs
- **CORS errors:** Make sure `CLIENT_URL` in backend matches your Vercel frontend URL
- **MongoDB connection issues:** Verify IP whitelist in MongoDB Atlas dashboard includes Render's IP range (or allow all: `0.0.0.0/0`)
- **Stripe webhook failures:** Verify `STRIPE_WEBHOOK_SECRET` is set correctly in Render env vars

## Contributing

Contributions are welcome. Basic guidelines:

- Fork the repo, create a feature branch, and open a pull request.
- Keep changes small and focused. Add tests where applicable.

## License & Contact

This project does not include a license file by default. Add a `LICENSE` if you plan to open-source it.

For questions, reach out to the project owner or file an issue in the repository.
