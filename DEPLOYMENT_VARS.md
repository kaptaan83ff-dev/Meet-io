# Deployment Environment Variables

When deploying to Render (Backend) and Vercel (Frontend), you must check and configure these variables in their respective dashboards.

## Backend (Render)
Add these in the **Environment** tab of your Render service:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `MONGO_URI` | Connection string for MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing tokens | `some-very-long-random-string` |
| `CLIENT_URL` | URL of your deployed Frontend | `https://meet-io.vercel.app` |
| `LIVEKIT_URL` | LiveKit WebSocket URL | `wss://...` |
| `LIVEKIT_API_KEY` | LiveKit API Key | `API...` |
| `LIVEKIT_API_SECRET` | LiveKit Secret | `Secret...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `....apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `Ov23...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | `678a...` |
| `SMTP_HOST` | Email Server Host | `smtp.gmail.com` |
| `SMTP_PORT` | Email Server Port | `587` |
| `SMTP_USER` | Email User | `user@gmail.com` |
| `SMTP_PASS` | Email App Password | `abcd efgh ...` |

## Frontend (Vercel)
Add these in the **Settings > Environment Variables** section of your Vercel project:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_URL` | URL of your deployed Backend | `https://meet-io-server.onrender.com/api` |

> **Note:** In `client/vercel.json`, you may also need to update the proxy destination if you rely on `/api` rewrites, but using `VITE_API_URL` directly in code is cleaner.
