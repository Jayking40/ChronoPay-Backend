# chronopay-backend

API backend for **ChronoPay** — time tokenization and scheduling marketplace on Stellar.

## What's in this repo

- **Express** API with TypeScript
- Health and stub API routes (e.g. `/api/v1/slots`)
- Ready for Stellar Horizon integration, token service, and scheduling logic

## Prerequisites

- Node.js 20+
- npm
- Docker 20.10+ (optional, for containerized development)
- Docker Compose 2.0+ (optional, for containerized development)

## Setup

```bash
# Clone the repo (or use your fork)
git clone <repo-url>
cd chronopay-backend

# Setup (choose one):

## Option 1: Local Development (requires Node.js 20+)
npm install
npm run build
npm test
npm run dev    # Start dev server with hot reload

## Option 2: Docker Development (requires Docker)
# Copy environment file
cp .env.example .env

# Using helper script
./scripts/docker-health.sh start

# Or using docker-compose directly
docker-compose up -d --build

# View logs
docker-compose logs -f

# Run tests in container
./scripts/docker-health.sh test
```

## Scripts

| Script   | Description                    |
|----------|--------------------------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production server         |
| `npm run dev`   | Run dev server with tsx watch  |
| `npm test`      | Run Jest tests                 |
| `./scripts/docker-health.sh start` | Start Docker services    |
| `./scripts/docker-health.sh stop`  | Stop Docker services     |
| `./scripts/docker-health.sh status`| Check service status     |

## Docker Setup

### Quick Start

```bash
# 1. Setup environment
cp .env.example .env

# 2. Start services
./scripts/docker-health.sh start

# 3. Verify health
./scripts/docker-health.sh status
```

### Docker Commands

| Command | Description |
|---------|-------------|
| `./scripts/docker-health.sh start` | Build and start all services |
| `./scripts/docker-health.sh stop` | Stop all services |
| `./scripts/docker-health.sh restart` | Restart services |
| `./scripts/docker-health.sh logs` | View service logs |
| `./scripts/docker-health.sh status` | Check service status |
| `./scripts/docker-health.sh test` | Run tests in container |
| `./scripts/docker-health.sh clean` | Clean up containers and volumes |

### Docker Compose Files

- `docker-compose.yml` — Base configuration with production settings
- `docker-compose.override.yml` — Local development overrides (auto-loaded)
- `docker-compose.prod.yml` — Additional production optimizations

### Environment Variables

See `.env.example` for all available configuration options:

- `NODE_ENV` — Environment mode (development/production)
- `PORT` — API server port (default: 3001)
- `LOG_LEVEL` — Logging level (debug/info/warn/error)
- `DOCKER_CPU_LIMIT` — Container CPU limit
- `DOCKER_MEMORY_LIMIT` — Container memory limit

### Production Deployment

```bash
# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Security Features

- Non-root container user
- Read-only root filesystem
- Resource limits (CPU/memory)
- Security options (no-new-privileges)
- Health checks
- Multi-stage builds for minimal attack surface

## API (stub)

- `GET /health` — Health check; returns `{ status: "ok", service: "chronopay-backend" }`
- `GET /api/v1/slots` — List time slots (currently returns empty array)

## Contributing

1. Fork the repo and create a branch from `main`.
2. Install deps and run tests: `npm install && npm test`.
3. Make changes; keep the build passing: `npm run build`.
4. Open a pull request. CI must pass (install, build, test).

## CI/CD

On every push and pull request to `main`, GitHub Actions runs:

- **Install**: `npm ci`
- **Build**: `npm run build`
- **Tests**: `npm test`

## License

MIT
