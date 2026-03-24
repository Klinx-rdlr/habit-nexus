# CLAUDE.md — HabitMap Microservices Project Specification

## Project overview

HabitMap is a microservices-based habit tracker with social accountability. Users create habits, check them off daily, maintain streaks, join accountability groups, and compete on leaderboards. Built with NestJS (TypeScript) microservices and a Next.js frontend.

This is a portfolio project by a CS intern targeting Cloud Developer / DevOps roles. The architecture is intentionally complex — 5 independent NestJS services communicating via REST and async events — to demonstrate real-world microservices patterns. Infrastructure and deployment (Docker, Terraform, Kubernetes, CI/CD) will be added in a separate phase after the application is complete.

---

## Tech stack

### Backend (per service)
- **Framework**: NestJS 10+ (TypeScript)
- **ORM**: Prisma (type-safe, schema-per-service)
- **Database**: PostgreSQL 15+ (separate schema per service)
- **Cache**: Redis 7+ (shared instance, namespaced keys per service)
- **Auth**: JWT (access + refresh tokens) via @nestjs/jwt + bcrypt
- **Validation**: class-validator + class-transformer (NestJS pipes)
- **API docs**: @nestjs/swagger (OpenAPI per service)
- **Message broker**: RabbitMQ (via @nestjs/microservices) or SQS
- **HTTP client**: @nestjs/axios for inter-service REST calls
- **Testing**: Jest + supertest
- **Config**: @nestjs/config (loads from .env)

### Frontend
- **Framework**: Next.js 14+ (App Router, SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP client**: axios with interceptors for JWT refresh
- **State**: React Context + useReducer for auth; React Query (TanStack Query) for server state
- **Charts**: Custom SVG heatmap component or react-calendar-heatmap

---

## Monorepo structure

```
habitmap/
├── services/
│   ├── gateway/                    # API Gateway (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-auth.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   └── current-user.decorator.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── logging.interceptor.ts
│   │   │   │   └── filters/
│   │   │   │       └── http-exception.filter.ts
│   │   │   ├── proxy/
│   │   │   │   ├── auth-proxy.controller.ts
│   │   │   │   ├── habit-proxy.controller.ts
│   │   │   │   ├── group-proxy.controller.ts
│   │   │   │   └── notification-proxy.controller.ts
│   │   │   └── config/
│   │   │       └── services.config.ts    # URLs of downstream services
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── auth-service/               # Auth & User Management
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── register.dto.ts
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── auth-response.dto.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── update-user.dto.ts
│   │   │   │       └── user-response.dto.ts
│   │   │   └── health/
│   │   │       └── health.controller.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Only users table
│   │   ├── test/
│   │   │   ├── auth.e2e-spec.ts
│   │   │   └── users.e2e-spec.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── habit-service/              # Habits, Completions, Streaks
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── habits/
│   │   │   │   ├── habits.module.ts
│   │   │   │   ├── habits.controller.ts
│   │   │   │   ├── habits.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-habit.dto.ts
│   │   │   │       ├── update-habit.dto.ts
│   │   │   │       └── habit-response.dto.ts
│   │   │   ├── completions/
│   │   │   │   ├── completions.module.ts
│   │   │   │   ├── completions.controller.ts
│   │   │   │   ├── completions.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-completion.dto.ts
│   │   │   │       └── completion-response.dto.ts
│   │   │   ├── streaks/
│   │   │   │   ├── streaks.module.ts
│   │   │   │   ├── streaks.service.ts   # THE critical service
│   │   │   │   └── streaks.spec.ts      # THE critical test file
│   │   │   ├── events/
│   │   │   │   ├── events.module.ts
│   │   │   │   └── events.service.ts    # Publishes to RabbitMQ/SQS
│   │   │   └── health/
│   │   │       └── health.controller.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma         # habits, completions, habit_schedule
│   │   ├── test/
│   │   │   ├── habits.e2e-spec.ts
│   │   │   ├── completions.e2e-spec.ts
│   │   │   └── streaks.unit-spec.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── group-service/              # Groups, Members, Invites, Leaderboard
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── groups/
│   │   │   │   ├── groups.module.ts
│   │   │   │   ├── groups.controller.ts
│   │   │   │   ├── groups.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-group.dto.ts
│   │   │   │       └── group-response.dto.ts
│   │   │   ├── members/
│   │   │   │   ├── members.module.ts
│   │   │   │   ├── members.controller.ts
│   │   │   │   └── members.service.ts
│   │   │   ├── invites/
│   │   │   │   ├── invites.module.ts
│   │   │   │   ├── invites.controller.ts
│   │   │   │   └── invites.service.ts
│   │   │   ├── leaderboard/
│   │   │   │   ├── leaderboard.module.ts
│   │   │   │   ├── leaderboard.controller.ts
│   │   │   │   └── leaderboard.service.ts  # Calls habit-service for streak data
│   │   │   ├── clients/
│   │   │   │   ├── auth-client.module.ts    # HTTP client to auth-service
│   │   │   │   ├── auth-client.service.ts
│   │   │   │   ├── habit-client.module.ts   # HTTP client to habit-service
│   │   │   │   └── habit-client.service.ts
│   │   │   └── health/
│   │   │       └── health.controller.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma         # groups, group_members, group_invites
│   │   ├── test/
│   │   │   ├── groups.e2e-spec.ts
│   │   │   └── leaderboard.e2e-spec.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── notification-service/       # Notifications + Event Consumer
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── notifications/
│       │   │   ├── notifications.module.ts
│       │   │   ├── notifications.controller.ts
│       │   │   ├── notifications.service.ts
│       │   │   └── dto/
│       │   │       └── notification-response.dto.ts
│       │   ├── consumers/
│       │   │   ├── consumers.module.ts
│       │   │   └── event.consumer.ts     # Listens to RabbitMQ/SQS events
│       │   ├── workers/
│       │   │   ├── workers.module.ts
│       │   │   └── daily-checker.worker.ts  # Cron: checks broken streaks
│       │   └── health/
│       │       └── health.controller.ts
│       ├── prisma/
│       │   └── schema.prisma         # notifications only
│       ├── Dockerfile
│       ├── package.json
│       └── .env.example
│
├── frontend/                       # Next.js App
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Redirects to /today
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx      # Sidebar + header shell
│   │   │   │   ├── today/page.tsx
│   │   │   │   ├── habits/
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx     # Habit detail
│   │   │   │   │       └── edit/page.tsx
│   │   │   │   ├── groups/
│   │   │   │   │   ├── page.tsx         # My groups list
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   ├── join/page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx     # Group dashboard
│   │   │   │   │       └── leaderboard/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts       # axios instance
│   │   │   │   ├── auth.ts
│   │   │   │   ├── habits.ts
│   │   │   │   ├── groups.ts
│   │   │   │   └── notifications.ts
│   │   │   └── utils/
│   │   │       ├── dates.ts
│   │   │       └── streaks.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── habits/
│   │   │   │   ├── HabitCard.tsx
│   │   │   │   ├── HeatmapCalendar.tsx
│   │   │   │   ├── StreakBadge.tsx
│   │   │   │   ├── ProgressRing.tsx
│   │   │   │   └── HabitForm.tsx
│   │   │   ├── groups/
│   │   │   │   ├── MemberCard.tsx
│   │   │   │   ├── LeaderboardTable.tsx
│   │   │   │   └── InviteLink.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useHabits.ts
│   │       └── useGroups.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── shared/                         # Shared TypeScript types (npm workspace)
│   ├── types/
│   │   ├── user.ts
│   │   ├── habit.ts
│   │   ├── group.ts
│   │   ├── notification.ts
│   │   └── events.ts              # Event payload types for message broker
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/
│   └── init-databases.sql          # Creates per-service databases
│
├── docker-compose.yml              # Local dev: all services + deps
├── package.json                    # Root workspace config
├── .gitignore
└── README.md
```

---

## Service boundaries and data ownership

### Auth Service (port 3001)
**Owns**: users table
**Prisma schema**:
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String   @unique
  passwordHash String   @map("password_hash")
  timezone     String   @default("Asia/Manila")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("users")
}
```
**Endpoints**:
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
GET    /users/me
PATCH  /users/me
PATCH  /users/me/password
GET    /users/:id                  # Internal: called by other services
GET    /users/batch                # Internal: get multiple users by IDs
GET    /health
```

### Habit Service (port 3002)
**Owns**: habits, completions, habit_schedule tables
**Prisma schema**:
```prisma
model Habit {
  id              String       @id @default(uuid())
  userId          String       @map("user_id")
  name            String       @db.VarChar(100)
  description     String?
  color           String       @default("#6366f1") @db.VarChar(7)
  frequencyType   String       @map("frequency_type") @db.VarChar(20)
  targetCount     Int          @default(1) @map("target_count")
  currentStreak   Int          @default(0) @map("current_streak")
  longestStreak   Int          @default(0) @map("longest_streak")
  streakStartDate DateTime?    @map("streak_start_date") @db.Date
  isArchived      Boolean      @default(false) @map("is_archived")
  createdAt       DateTime     @default(now()) @map("created_at")
  completions     Completion[]
  schedule        HabitSchedule[]

  @@index([userId, isArchived])
  @@map("habits")
}

model Completion {
  id            String   @id @default(uuid())
  habitId       String   @map("habit_id")
  completedDate DateTime @map("completed_date") @db.Date
  note          String?
  createdAt     DateTime @default(now()) @map("created_at")
  habit         Habit    @relation(fields: [habitId], references: [id])

  @@unique([habitId, completedDate])
  @@index([habitId, completedDate(sort: Desc)])
  @@map("completions")
}

model HabitSchedule {
  id        String @id @default(uuid())
  habitId   String @map("habit_id")
  dayOfWeek Int    @map("day_of_week")
  habit     Habit  @relation(fields: [habitId], references: [id])

  @@unique([habitId, dayOfWeek])
  @@map("habit_schedule")
}
```
**Endpoints**:
```
POST   /habits                     — Create habit
GET    /habits                     — List my habits (?archived=false)
GET    /habits/today               — Today's habits with completion status
GET    /habits/:id                 — Habit detail with streak info
PATCH  /habits/:id                 — Update habit
DELETE /habits/:id                 — Archive habit
POST   /habits/:id/complete        — Check off (body: { date?, note? })
DELETE /habits/:id/complete/:date  — Undo completion
GET    /habits/:id/completions     — Completion history (?from=&to=)
GET    /habits/:id/stats           — Streak stats + heatmap data
GET    /habits/user/:userId        — Internal: get habits for a user (for leaderboard)
GET    /health
```
**Publishes events**: `streak.broken`, `streak.milestone`, `habit.completed`

### Group Service (port 3003)
**Owns**: groups, group_members, group_invites tables
**Prisma schema**:
```prisma
model Group {
  id          String        @id @default(uuid())
  createdBy   String        @map("created_by")
  name        String        @db.VarChar(100)
  description String?
  inviteCode  String        @unique @map("invite_code") @db.VarChar(20)
  createdAt   DateTime      @default(now()) @map("created_at")
  members     GroupMember[]
  invites     GroupInvite[]

  @@map("groups")
}

model GroupMember {
  id       String   @id @default(uuid())
  groupId  String   @map("group_id")
  userId   String   @map("user_id")
  role     String   @default("member") @db.VarChar(20)
  joinedAt DateTime @default(now()) @map("joined_at")
  group    Group    @relation(fields: [groupId], references: [id])

  @@unique([groupId, userId])
  @@map("group_members")
}

model GroupInvite {
  id        String   @id @default(uuid())
  groupId   String   @map("group_id")
  code      String   @unique @db.VarChar(20)
  expiresAt DateTime @map("expires_at")
  isUsed    Boolean  @default(false) @map("is_used")
  group     Group    @relation(fields: [groupId], references: [id])

  @@map("group_invites")
}
```
**Endpoints**:
```
POST   /groups                     — Create group
GET    /groups                     — List my groups
GET    /groups/:id                 — Group detail with members
POST   /groups/:id/invite          — Generate invite
POST   /groups/join                — Join via code
DELETE /groups/:id/members/:userId — Remove member (admin only)
GET    /groups/:id/leaderboard     — Aggregated leaderboard
GET    /health
```
**Calls**: auth-service (get usernames), habit-service (get streaks for leaderboard)
**Publishes events**: `member.joined`, `member.removed`

### Notification Service (port 3004)
**Owns**: notifications table
**Prisma schema**:
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      String   @db.VarChar(50)
  message   String
  isRead    Boolean  @default(false) @map("is_read")
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, isRead, createdAt(sort: Desc)])
  @@map("notifications")
}
```
**Endpoints**:
```
GET    /notifications              — List my notifications (?unread=true)
PATCH  /notifications/:id/read     — Mark as read
POST   /notifications/read-all     — Mark all as read
GET    /notifications/count        — Unread count
GET    /health
```
**Consumes events**: `streak.broken`, `streak.milestone`, `habit.completed`, `member.joined`

### API Gateway (port 3000)
**Owns**: no database
**Responsibilities**:
- JWT validation (verifies tokens issued by auth-service)
- Rate limiting (via @nestjs/throttler)
- Request proxying to downstream services
- Adds `x-user-id` and `x-user-timezone` headers to proxied requests
- Global exception handling and logging
- Swagger aggregation (optional: combine all service specs)

---

## Inter-service communication patterns

### Synchronous (REST)
- Gateway → all services (proxied client requests)
- Group service → Auth service: `GET /users/batch?ids=uuid1,uuid2` (get usernames for group dashboard)
- Group service → Habit service: `GET /habits/user/:userId` (get streak data for leaderboard)
- Notification daily worker → Habit service: `GET /habits/user/:userId` (check streak status)

### Asynchronous (Events via RabbitMQ)
Event payloads defined in `shared/types/events.ts`:

```typescript
export interface StreakBrokenEvent {
  type: 'streak.broken';
  userId: string;
  habitId: string;
  habitName: string;
  previousStreak: number;
  occurredAt: string;
}

export interface StreakMilestoneEvent {
  type: 'streak.milestone';
  userId: string;
  habitId: string;
  habitName: string;
  milestone: number; // 7, 30, 60, 100
  occurredAt: string;
}

export interface HabitCompletedEvent {
  type: 'habit.completed';
  userId: string;
  habitId: string;
  habitName: string;
  currentStreak: number;
  completedDate: string;
}

export interface MemberJoinedEvent {
  type: 'member.joined';
  groupId: string;
  groupName: string;
  userId: string;
  username: string;
}

export type HabitMapEvent =
  | StreakBrokenEvent
  | StreakMilestoneEvent
  | HabitCompletedEvent
  | MemberJoinedEvent;
```

### Authentication flow between services
1. Frontend sends JWT in `Authorization: Bearer <token>` header
2. Gateway validates JWT, extracts userId and timezone
3. Gateway proxies request to downstream service with headers: `x-user-id` and `x-user-timezone`
4. Downstream services trust these headers (only reachable via gateway internally)
5. Internal service-to-service calls use shared `x-internal-key` header

---

## Streak calculation algorithm

Lives in `services/habit-service/src/streaks/streaks.service.ts`.

```typescript
interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

function calculateStreak(
  frequencyType: string,
  scheduledDays: number[],
  completionDates: Set<string>,
  userTimezone: string,
): StreakResult {
  const today = getTodayInTimezone(userTimezone);
  const todayDate = parseDate(today);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (completionDates.has(today) && isScheduledDay(frequencyType, scheduledDays, todayDate)) {
    currentStreak = 1;
  }

  let checkDate = subtractDays(todayDate, 1);
  let streakActive = true;

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(checkDate);

    if (isScheduledDay(frequencyType, scheduledDays, checkDate)) {
      if (completionDates.has(dateStr)) {
        if (streakActive) currentStreak++;
        tempStreak++;
      } else {
        streakActive = false;
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    checkDate = subtractDays(checkDate, 1);
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  return { currentStreak, longestStreak };
}

function isScheduledDay(frequencyType: string, scheduledDays: number[], date: Date): boolean {
  if (frequencyType === 'daily') return true;
  if (frequencyType === 'custom') {
    return scheduledDays.includes(date.getDay() === 0 ? 6 : date.getDay() - 1);
  }
  return false;
}
```

### Edge cases to test
1. Timezone: user in Asia/Manila completes at 11:30 PM local
2. Today not over: missing today is NOT a broken streak
3. Custom schedule gaps: Tue/Thu are not misses for Mon/Wed/Fri habit
4. New habit with 0 completions: streak = 0
5. Undo completion that breaks a streak
6. Longest streak tracking across multiple periods

---

## Background worker

Lives in `services/notification-service/src/workers/daily-checker.worker.ts`.

```typescript
@Injectable()
export class DailyCheckerWorker {
  @Cron('0 * * * *') // Every hour, process users whose midnight just passed
  async checkStreaks() {
    // 1. Get timezones where it's currently midnight (00:00-00:59)
    // 2. For each user in those timezones:
    //    a. Call habit-service: GET /habits/user/:userId
    //    b. For each habit: was yesterday scheduled + not completed?
    //    c. If yes → publish streak.broken event
    //    d. Check milestones → publish streak.milestone
  }
}
```

---

## Docker Compose (local development)

```yaml
services:
  gateway:
    build: ./services/gateway
    ports: ["3000:3000"]
    environment:
      - AUTH_SERVICE_URL=http://auth-service:3001
      - HABIT_SERVICE_URL=http://habit-service:3002
      - GROUP_SERVICE_URL=http://group-service:3003
      - NOTIFICATION_SERVICE_URL=http://notification-service:3004
      - JWT_SECRET=dev-secret-change-in-prod
      - REDIS_URL=redis://redis:6379/0
    depends_on: [auth-service, habit-service, group-service, notification-service]

  auth-service:
    build: ./services/auth-service
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=postgresql://habitmap:habitmap@db:5432/habitmap_auth
      - JWT_SECRET=dev-secret-change-in-prod
      - REDIS_URL=redis://redis:6379/1
    depends_on: [db, redis]

  habit-service:
    build: ./services/habit-service
    ports: ["3002:3002"]
    environment:
      - DATABASE_URL=postgresql://habitmap:habitmap@db:5432/habitmap_habits
      - REDIS_URL=redis://redis:6379/2
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on: [db, redis, rabbitmq]

  group-service:
    build: ./services/group-service
    ports: ["3003:3003"]
    environment:
      - DATABASE_URL=postgresql://habitmap:habitmap@db:5432/habitmap_groups
      - AUTH_SERVICE_URL=http://auth-service:3001
      - HABIT_SERVICE_URL=http://habit-service:3002
      - REDIS_URL=redis://redis:6379/3
    depends_on: [db, redis, auth-service, habit-service]

  notification-service:
    build: ./services/notification-service
    ports: ["3004:3004"]
    environment:
      - DATABASE_URL=postgresql://habitmap:habitmap@db:5432/habitmap_notifications
      - HABIT_SERVICE_URL=http://habit-service:3002
      - AUTH_SERVICE_URL=http://auth-service:3001
      - REDIS_URL=redis://redis:6379/4
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on: [db, redis, rabbitmq]

  frontend:
    build: ./frontend
    ports: ["4000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=habitmap
      - POSTGRES_PASSWORD=habitmap
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  pgdata:
```

`scripts/init-databases.sql`:
```sql
CREATE DATABASE habitmap_auth;
CREATE DATABASE habitmap_habits;
CREATE DATABASE habitmap_groups;
CREATE DATABASE habitmap_notifications;
```

---

## Build order (3.5 weeks, 8hrs/day)

### Week 1: Backend services core
| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | Monorepo setup, shared types, Docker Compose, DB init | `docker compose up` boots all services + deps |
| 2 | Auth service: register, login, JWT, refresh | Auth works via Postman on port 3001 |
| 3 | Auth service: user CRUD + internal endpoints. Gateway: JWT guard + proxy | Register/login through gateway on port 3000 |
| 4 | Habit service: CRUD + schedule endpoints | Habit lifecycle works on port 3002 |
| 5 | Habit service: completions + streak engine + unit tests | Streak passes all edge case tests |

### Week 2: Backend advanced + events
| Day | Focus | Deliverable |
|-----|-------|-------------|
| 6 | Gateway: proxy all services, rate limiting, error handling | All services via single gateway |
| 7 | Group service: CRUD, invites, members | Groups work on port 3003 |
| 8 | Group service: leaderboard (cross-service calls) | Leaderboard aggregates from multiple services |
| 9 | RabbitMQ events: habit publishes, notification consumes | Events flow between services |
| 10 | Notification service: CRUD + daily checker worker | Full notification pipeline |

### Week 3: Frontend
| Day | Focus | Deliverable |
|-----|-------|-------------|
| 11 | Next.js setup, auth pages, layout, API client | Login/register in UI |
| 12 | Today dashboard + habit check-off + create habit | Core daily workflow e2e |
| 13 | Habit detail + heatmap calendar + stats | Rich habit detail |
| 14 | Groups UI: create, join, dashboard, leaderboard | Full group flow |
| 15 | Profile, settings, notifications, leaderboard | All pages built |

### Week 3.5: Polish
| Day | Focus | Deliverable |
|-----|-------|-------------|
| 16 | E2E tests, error handling, loading/empty states | Handles edge cases |
| 17 | UI polish, responsive, dark mode | Professional feel |
| 18 | README, architecture diagram, seed data, OpenAPI docs | Clone and run in 5 min |

---

## Coding conventions

### NestJS (all services)
- One module per domain concept
- Controllers are thin — delegate to services
- DTOs with class-validator for ALL request validation
- Response DTOs for consistent API shapes
- `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` on every endpoint
- Health endpoint on every service
- Environment variables via @nestjs/config
- Prisma service as injectable provider

### TypeScript
- Strict mode in all tsconfig.json
- No `any` — use `unknown` and narrow
- Shared types in the `shared/` workspace package
- Async/await everywhere

### Next.js
- App Router, server components by default
- TanStack Query for data fetching
- Loading skeletons via `loading.tsx`
- Error boundaries via `error.tsx`
- Optimistic updates for check-off
- Mobile-first responsive

### Git
- Conventional commits: `feat(habit-service):`, `fix(gateway):`
- Feature branches, squash merge

---

## Testing priorities

1. **Streak engine** (unit tests — most critical)
2. **Inter-service communication** (integration: gateway proxy, cross-service calls)
3. **Auth flow** (e2e: register → login → protected route → refresh)
4. **API contracts** (per service: correct shapes, validation errors)