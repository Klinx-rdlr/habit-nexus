# HabitMap Architecture

## System Overview

HabitMap is composed of 5 NestJS microservices, a Next.js frontend, and shared infrastructure (PostgreSQL, Redis, RabbitMQ). Each service owns its own database and communicates via REST (synchronous) or RabbitMQ events (asynchronous).

## Service Topology

```mermaid
graph TB
    subgraph Client
        FE[Next.js Frontend<br/>:4000]
    end

    subgraph API Layer
        GW[API Gateway<br/>:3000<br/>JWT validation · rate limiting]
    end

    subgraph Services
        AUTH[Auth Service<br/>:3001]
        HABIT[Habit Service<br/>:3002]
        GROUP[Group Service<br/>:3003]
        NOTIF[Notification Service<br/>:3004]
    end

    subgraph Infrastructure
        PG[(PostgreSQL 15)]
        REDIS[(Redis 7)]
        RMQ[RabbitMQ 3]
    end

    subgraph Databases
        DB_AUTH[habitmap_auth<br/>users]
        DB_HABIT[habitmap_habits<br/>habits · completions · habit_schedule]
        DB_GROUP[habitmap_groups<br/>groups · group_members · group_invites]
        DB_NOTIF[habitmap_notifications<br/>notifications]
    end

    FE -->|HTTP /api/v1/*| GW

    GW -->|"/auth/* · /users/*"| AUTH
    GW -->|"/habits/*"| HABIT
    GW -->|"/groups/*"| GROUP
    GW -->|"/notifications/*"| NOTIF

    GROUP -.->|"GET /users/batch?ids="| AUTH
    GROUP -.->|"GET /habits/user/:userId"| HABIT
    NOTIF -.->|"GET /habits/user/:userId"| HABIT
    NOTIF -.->|"GET /users/batch?ids="| AUTH

    HABIT -->|publish| RMQ
    GROUP -->|publish| RMQ
    RMQ -->|consume| NOTIF

    AUTH --- DB_AUTH
    HABIT --- DB_HABIT
    GROUP --- DB_GROUP
    NOTIF --- DB_NOTIF

    PG --- DB_AUTH
    PG --- DB_HABIT
    PG --- DB_GROUP
    PG --- DB_NOTIF

    AUTH --- REDIS
    HABIT --- REDIS
    GROUP --- REDIS
    NOTIF --- REDIS
    GW --- REDIS

    style FE fill:#0ea5e9,color:#fff
    style GW fill:#8b5cf6,color:#fff
    style AUTH fill:#f59e0b,color:#fff
    style HABIT fill:#10b981,color:#fff
    style GROUP fill:#ec4899,color:#fff
    style NOTIF fill:#ef4444,color:#fff
    style RMQ fill:#ff6600,color:#fff
    style REDIS fill:#dc2626,color:#fff
    style PG fill:#336791,color:#fff
```

### Arrow Legend

| Style | Meaning |
|-------|---------|
| Solid | Synchronous REST call (gateway → service) |
| Dashed | Internal service-to-service REST call (uses `x-internal-key` header) |
| Through RabbitMQ | Asynchronous event (publish → queue → consume) |

### Event Types via RabbitMQ

| Event | Publisher | Consumer | Trigger |
|-------|-----------|----------|---------|
| `habit.completed` | Habit Service | Notification Service | User checks off a habit |
| `streak.milestone` | Habit Service | Notification Service | Streak hits 7, 30, 60, or 100 |
| `streak.broken` | Habit Service | Notification Service | Daily checker detects missed day |
| `member.joined` | Group Service | Notification Service | User joins a group via invite |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant GW as Gateway :3000
    participant AUTH as Auth Service :3001
    participant SVC as Downstream Service

    Note over FE,AUTH: Registration / Login
    FE->>GW: POST /api/v1/auth/login<br/>{email, password}
    GW->>AUTH: POST /auth/login<br/>{email, password}
    AUTH->>AUTH: Validate credentials<br/>bcrypt.compare()
    AUTH-->>GW: {accessToken, refreshToken, user}
    GW-->>FE: {accessToken, refreshToken, user}

    Note over FE,SVC: Authenticated Request
    FE->>GW: GET /api/v1/habits<br/>Authorization: Bearer <accessToken>
    GW->>GW: JwtAuthGuard validates token<br/>extracts userId + timezone
    GW->>SVC: GET /habits<br/>x-user-id: <userId><br/>x-user-timezone: Asia/Manila
    SVC-->>GW: {habits: [...]}
    GW-->>FE: {habits: [...]}

    Note over FE,AUTH: Token Refresh
    FE->>GW: POST /api/v1/auth/refresh<br/>{refreshToken}
    GW->>AUTH: POST /auth/refresh<br/>{refreshToken}
    AUTH->>AUTH: Verify refresh token<br/>Issue new pair
    AUTH-->>GW: {accessToken, refreshToken}
    GW-->>FE: {accessToken, refreshToken}
```

---

## Streak Broken Notification Pipeline

This sequence shows what happens when a user undoes a completion, potentially breaking a streak, and how the notification propagates.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant GW as Gateway
    participant HABIT as Habit Service
    participant RMQ as RabbitMQ
    participant NOTIF as Notification Service
    participant DB as notifications DB

    Note over FE,DB: Daily Checker (Cron - runs every hour)
    NOTIF->>NOTIF: @Cron('0 * * * *')<br/>Find timezones at midnight
    NOTIF->>HABIT: GET /habits/user/:userId<br/>(for each user in timezone)
    HABIT-->>NOTIF: {habits with streak data}
    NOTIF->>NOTIF: Check: was yesterday scheduled<br/>but not completed?

    alt Streak is broken
        NOTIF->>RMQ: Publish streak.broken<br/>{userId, habitId, habitName,<br/>previousStreak}
        RMQ->>NOTIF: Consume streak.broken
        NOTIF->>DB: INSERT notification<br/>type: 'streak_broken'<br/>message: "Your streak of 15 days<br/>for 'Exercise' was broken"
    end

    Note over FE,DB: Completion Undo Flow
    FE->>GW: DELETE /api/v1/habits/:id/complete/:date
    GW->>HABIT: DELETE /habits/:id/complete/:date<br/>x-user-id: <userId>
    HABIT->>HABIT: Delete completion record
    HABIT->>HABIT: Recalculate streak<br/>via StreaksService
    HABIT->>HABIT: Update habit.currentStreak<br/>and habit.longestStreak
    HABIT-->>GW: {updated habit with new streak}
    GW-->>FE: {updated habit}
```

---

## Service Responsibilities and Data Ownership

### API Gateway (port 3000)

**Owns**: No database

The gateway is the single entry point for all client requests. It validates JWTs issued by the auth service, applies rate limiting (100 requests/60s via `@nestjs/throttler`), and proxies requests to downstream services. It injects `x-user-id` and `x-user-timezone` headers so downstream services never need to parse JWTs themselves.

### Auth Service (port 3001)

**Owns**: `habitmap_auth` database — `users` table

Handles user registration, login, JWT issuance (access + refresh tokens), and user profile management. Exposes internal endpoints (`GET /users/:id`, `GET /users/batch`) for other services to resolve user IDs to usernames. Internal endpoints are protected by a shared `x-internal-key` header.

### Habit Service (port 3002)

**Owns**: `habitmap_habits` database — `habits`, `completions`, `habit_schedule` tables

The core domain service. Manages habit CRUD, daily completions, and the streak calculation engine. The streak algorithm is timezone-aware and supports both daily and custom (specific days of week) schedules. Publishes `habit.completed` and `streak.milestone` events to RabbitMQ when completions are recorded. Exposes `GET /habits/user/:userId` for the group service leaderboard and notification daily checker.

### Group Service (port 3003)

**Owns**: `habitmap_groups` database — `groups`, `group_members`, `group_invites` tables

Manages accountability groups, membership, and invite codes. The leaderboard endpoint aggregates data from both the auth service (usernames) and habit service (streak data) via synchronous REST calls. Publishes `member.joined` events when users join groups.

### Notification Service (port 3004)

**Owns**: `habitmap_notifications` database — `notifications` table

Consumes all events from RabbitMQ (`habit.completed`, `streak.milestone`, `streak.broken`, `member.joined`) and persists them as user-facing notifications. Runs a daily checker cron job every hour that identifies users whose midnight just passed, checks their habits for broken streaks, and creates notifications accordingly.

---

## Infrastructure

### PostgreSQL 15

Single PostgreSQL instance with 4 separate databases (created by `scripts/init-databases.sql`). Each service uses Prisma with its own schema and migrations, ensuring complete data isolation.

### Redis 7

Shared Redis instance with database-number namespacing:
- `db 0` — Gateway (rate limiting)
- `db 1` — Auth Service (refresh token blacklist)
- `db 2` — Habit Service (streak caching)
- `db 3` — Group Service (leaderboard caching)
- `db 4` — Notification Service (unread count caching)

### RabbitMQ 3

Single queue (`habitmap_events`) with durable messaging. The habit service and group service publish events; the notification service consumes them. Management UI available at `http://localhost:15672` (guest/guest).
