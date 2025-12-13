# meet-io

A full-stack video conferencing application built with a monorepo structure.

## 📁 Project Structure

```
meet-io/
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Node.js + TypeScript backend (Express)
├── package.json     # Root package with workspace configuration
├── tsconfig.json    # Root TypeScript configuration
└── ...config files
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Install dependencies for all workspaces:
```bash
npm install
```

## 🐳 Docker Infrastructure

This project uses Docker Compose to manage development services:

### Services

- **MongoDB** (port 27017) - Primary database
- **Redis** (port 6379) - Caching and session storage
- **LiveKit Server** (ports 7880, 7881) - Video conferencing infrastructure

### Starting the Stack

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Service Details

#### MongoDB
- **URL**: `mongodb://admin:admin123@localhost:27017/meet-io?authSource=admin`
- **Default credentials**: admin/admin123
- **Database**: meet-io
- **Data persistence**: Stored in Docker volume `mongodb_data`

#### Redis
- **URL**: `redis://localhost:6379`
- **Persistence**: Enabled with append-only file (AOF)
- **Data persistence**: Stored in Docker volume `redis_data`

#### LiveKit Server
- **HTTP URL**: `http://localhost:7880`
- **WebSocket URL**: `ws://localhost:7880`
- **API Key**: `devkey`
- **API Secret**: `devsecret`
- **Config**: See `livekit.yaml` for detailed configuration

> [!WARNING]
> The development credentials are for **local development only**. Never use these in production!

### Environment Variables

Copy the example environment file and customize as needed:
```bash
# For server workspace
cp .env.example server/.env
```

### Verifying Services

```bash
# Check all services are running
docker-compose ps

# Test MongoDB connection
docker exec -it meet-io-mongodb mongosh -u admin -p admin123

# Test Redis connection
docker exec -it meet-io-redis redis-cli ping
# Should return: PONG

# Check LiveKit server
curl http://localhost:7880
```

### Development

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Client only (runs on http://localhost:5173)
npm run dev:client

# Server only (runs on http://localhost:5000)
npm run dev:server
```

### Build

Build both workspaces:
```bash
npm run build
```

## 🛠️ Technology Stack

### Client
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS

### Server
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Dev Tool**: tsx (TypeScript execution)

## 📦 Workspaces

This project uses npm workspaces to manage the monorepo:

- **client**: Frontend application
- **server**: Backend API server

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Run both client and server in development mode
- `npm run dev:client` - Run only the client
- `npm run dev:server` - Run only the server
- `npm run build` - Build both workspaces
- `npm run lint` - Lint all TypeScript files
- `npm run format` - Format code with Prettier

### Client Workspace
```bash
cd client
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Server Workspace
```bash
cd server
npm run dev        # Start server with hot reload
npm run build      # Compile TypeScript
npm start          # Run compiled JavaScript
```

## 📝 TypeScript Configuration

The project uses TypeScript project references for better type-checking across workspaces:

- **Root tsconfig.json**: References both client and server
- **Client tsconfig.app.json**: Configured for React with Vite
- **Server tsconfig.json**: Configured for Node.js with CommonJS

## 🔍 Code Quality

- **ESLint**: TypeScript linting configuration
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled

## 📋 Essential Dependencies

### Root DevDependencies
- `concurrently` - Run multiple commands concurrently
- `typescript` - TypeScript compiler
- `eslint` - Linting utility
- `prettier` - Code formatter
- `@typescript-eslint/*` - TypeScript ESLint plugins

## 🌐 Environment Variables

### Server
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
```

## 📄 License

ISC
