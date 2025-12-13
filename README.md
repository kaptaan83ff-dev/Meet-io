# Meet.io - Advanced Video Conferencing Platform

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Docker & Docker Compose

### Development Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meet-io
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   Copy `.env.example` to `.env` in both `client/` and `server/` directories (or root if using Docker Compose).
   ```bash
   cp .env.example .env
   ```
4. **Run Application (Docker)**
   ```bash
   docker-compose up --build
   ```
   The app will be available at:
   - Client: http://localhost:5173
   - Server: http://localhost:5000

## 🛠 Deployment

### Backend (Render)
This project includes a `render.yaml` for infrastructure-as-code deployment.
1. Connect you Render account to GitHub.
2. Select "New Blueprint Instance" and choose this repo.
3. Render will automatically detect the `server` service and `Dockerfile`.

### Frontend (Vercel)
1. Import the project into Vercel.
2. Select the `client` directory as the Root Directory.
3. Vercel will auto-detect Vite. Use default build settings.
4. Add environment variables in Vercel.

## 🧪 Testing
Run validatation locally:
```bash
npm run lint  # Check code quality
npm test      # Run tests
```
