# HabitMap

A microservices-based habit tracker with social accountability. Users create habits, check them off daily, maintain streaks, join accountability groups, and compete on leaderboards.

Built with 5 independent NestJS services communicating via REST and async events, backed by a Next.js frontend.

## Features

- **Habit Management** — Create daily or custom-schedule habits, check off completions, track streaks
- **Streak Engine** — Timezone-aware streak calculation with longest-streak tracking and milestone detection
- **Heatmap Calendar** — GitHub-style contribution heatmap for each habit
- **Accountability Groups** — Create or join groups via invite codes, see member activity
- **Leaderboards** — Rank group members by current streak, longest streak, or completion rate
- **Real-time Notifications** — Streak milestones, broken streaks, and group events via RabbitMQ
- **Daily Streak Checker** — Cron worker detects broken streaks across timezones every hour

## Architecture

See [docs/architecture.md](docs/architecture.md) for Mermaid diagrams showing service topology, auth flow, and the streak notification pipeline.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | NestJS 10+ (TypeScript) |
| ORM | Prisma 5+ |
| Database | PostgreSQL 15 (separate DB per service) |
| Cache | Redis 7 (shared instance, namespaced per service) |
| Message Broker | RabbitMQ 3 |
| Auth | JWT (access + refresh tokens), bcrypt |
| Frontend | Next.js 14 (App Router, SSR) |
| Styling | Tailwind CSS 3 |
| Server State | TanStack Query (React Query) 5 |
| API Docs | Swagger / OpenAPI per service |

## Prerequisites

- **Node.js** 20+
- **Docker Desktop** (for PostgreSQL, Redis, RabbitMQ)
- **npm** 9+ (workspace support)

## Quickstart

Clone and run in 5 minutes:

```bash
# 1. Clone the repo
git clone https://github.com/your-username/habitmap.git
cd habitmap

# 2. Copy environment files
cp services/gateway/.env.example services/gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/habit-service/.env.example services/habit-service/.env
cp services/group-service/.env.example services/group-service/.env
cp services/notification-service/.env.example services/notification-service/.env

# 3. Start everything
docker compose up --build

# 4. Open the app
# Frontend:       http://localhost:4000
# API Gateway:    http://localhost:3000
# RabbitMQ UI:    http://localhost:15672 (guest/guest)
```

### Local development (without Docker for services)

```bash
# Start infra only
docker compose up db redis rabbitmq -d

# Install dependencies
npm install

# Run Prisma migrations for each service
npm run prisma:migrate --workspace=services/auth-service
npm run prisma:migrate --workspace=services/habit-service
npm run prisma:migrate --workspace=services/group-service
npm run prisma:migrate --workspace=services/notification-service

# Seed demo data (optional)
npx ts-node scripts/seed.ts

# Start services in separate terminals
npm run dev:auth
npm run dev:habit
npm run dev:group
npm run dev:notification
npm run dev:gateway
npm run dev:frontend
```

## Environment Variables

### Gateway (port 3000)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `AUTH_SERVICE_URL` | `http://localhost:3001` | Auth service base URL |
| `HABIT_SERVICE_URL` | `http://localhost:3002` | Habit service base URL |
| `GROUP_SERVICE_URL` | `http://localhost:3003` | Group service base URL |
| `NOTIFICATION_SERVICE_URL` | `http://localhost:3004` | Notification service base URL |
| `JWT_SECRET` | — | JWT signing secret (must match auth-service) |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection (rate limiting) |

### Auth Service (port 3001)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRY` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token TTL |
| `REDIS_URL` | `redis://localhost:6379/1` | Redis connection |
| `INTERNAL_KEY` | — | Shared key for inter-service calls |

### Habit Service (port 3002)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3002` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379/2` | Redis connection |
| `RABBITMQ_URL` | `amqp://localhost:5672` | RabbitMQ connection |
| `INTERNAL_KEY` | — | Shared key for inter-service calls |

### Group Service (port 3003)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3003` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `AUTH_SERVICE_URL` | `http://localhost:3001` | Auth service (username lookups) |
| `HABIT_SERVICE_URL` | `http://localhost:3002` | Habit service (leaderboard data) |
| `REDIS_URL` | `redis://localhost:6379/3` | Redis connection |

### Notification Service (port 3004)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3004` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `HABIT_SERVICE_URL` | `http://localhost:3002` | Habit service (streak checks) |
| `AUTH_SERVICE_URL` | `http://localhost:3001` | Auth service (user lookups) |
| `GROUP_SERVICE_URL` | `http://localhost:3003` | Group service |
| `REDIS_URL` | `redis://localhost:6379/4` | Redis connection |
| `RABBITMQ_URL` | `amqp://localhost:5672` | RabbitMQ connection |
| `INTERNAL_KEY` | — | Shared key for inter-service calls |

## API Overview

All client requests go through the **API Gateway** on port `3000` under the `/api/v1` prefix.

| Service | Direct Port | Swagger UI | Prefix |
|---------|------------|------------|--------|
| Gateway | 3000 | [localhost:3000/api/docs](http://localhost:3000/api/docs) | `/api/v1` |
| Auth | 3001 | [localhost:3001/api/docs](http://localhost:3001/api/docs) | `/` |
| Habit | 3002 | [localhost:3002/api/docs](http://localhost:3002/api/docs) | `/` |
| Group | 3003 | [localhost:3003/api/docs](http://localhost:3003/api/docs) | `/` |
| Notification | 3004 | [localhost:3004/api/docs](http://localhost:3004/api/docs) | `/` |

### Key endpoints (via gateway)

```
POST   /api/v1/auth/register         Register a new user
POST   /api/v1/auth/login            Login, receive JWT tokens
POST   /api/v1/auth/refresh          Refresh access token

GET    /api/v1/habits                List my habits
GET    /api/v1/habits/today          Today's habits with completion status
POST   /api/v1/habits                Create a habit
POST   /api/v1/habits/:id/complete   Check off a habit
GET    /api/v1/habits/:id/stats      Streak stats + heatmap data

POST   /api/v1/groups                Create a group
POST   /api/v1/groups/join           Join via invite code
GET    /api/v1/groups/:id/leaderboard  View leaderboard

GET    /api/v1/notifications         List notifications
GET    /api/v1/notifications/count   Unread count
```

## Running Tests

```bash
# Run all tests for a service
npm test --workspace=services/auth-service
npm test --workspace=services/habit-service
npm test --workspace=services/group-service
npm test --workspace=services/notification-service

# Streak engine unit tests (critical path)
npx jest --workspace=services/habit-service -- streaks.service.spec
```

### Test coverage by service

| Service | Tests |
|---------|-------|
| Auth | `auth.service.spec.ts`, `users.service.spec.ts` |
| Habit | `habits.service.spec.ts`, `completions.service.spec.ts`, `streaks.service.spec.ts` |
| Group | `groups.service.spec.ts` |
| Notification | `notifications.service.spec.ts`, `daily-checker.worker.spec.ts` |

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(habit-service): add heatmap data endpoint
fix(gateway): handle downstream timeout gracefully
test(streaks): cover custom schedule edge cases
docs: add architecture diagram
chore: update docker-compose healthchecks
```

Scopes: `gateway`, `auth-service`, `habit-service`, `group-service`, `notification-service`, `frontend`, `shared`

## Project Structure

```
habitmap/
├── services/
│   ├── gateway/              # API Gateway — JWT validation, rate limiting, proxying
│   ├── auth-service/         # Auth & User Management — registration, login, JWT
│   ├── habit-service/        # Habits, Completions, Streaks — core domain logic
│   ├── group-service/        # Groups, Members, Invites, Leaderboard
│   └── notification-service/ # Notifications, Event Consumer, Daily Checker
├── frontend/                 # Next.js 14 App Router frontend
├── shared/                   # Shared TypeScript types (npm workspace)
├── scripts/                  # Database init and seed scripts
├── docs/                     # Architecture diagrams and documentation
└── docker-compose.yml        # Local development: all services + infrastructure
```

## License

MIT
