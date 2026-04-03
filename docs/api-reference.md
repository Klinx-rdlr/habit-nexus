# HabitMap API Reference

All services expose interactive Swagger UI documentation. Start the services and visit the URLs below.

| Service | Swagger UI | Description |
|---------|-----------|-------------|
| **Gateway** | [localhost:3000/api/docs](http://localhost:3000/api/docs) | Aggregated client-facing API |
| **Auth Service** | [localhost:3001/api/docs](http://localhost:3001/api/docs) | Registration, login, JWT, user management |
| **Habit Service** | [localhost:3002/api/docs](http://localhost:3002/api/docs) | Habits, completions, streaks, stats |
| **Group Service** | [localhost:3003/api/docs](http://localhost:3003/api/docs) | Groups, members, invites, leaderboard |
| **Notification Service** | [localhost:3004/api/docs](http://localhost:3004/api/docs) | Notifications, unread counts |

## Authentication

All endpoints (except `/auth/register`, `/auth/login`, `/auth/refresh`, and `/health`) require a Bearer token.

```
Authorization: Bearer <accessToken>
```

Obtain tokens via `POST /api/v1/auth/login`. Refresh via `POST /api/v1/auth/refresh`.

## Gateway Routes (port 3000)

All routes are prefixed with `/api/v1`.

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login with email + password |
| `POST` | `/auth/refresh` | No | Refresh access token |

### Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | Yes | Get current user profile |
| `PATCH` | `/users/me` | Yes | Update profile (username, timezone) |
| `PATCH` | `/users/me/password` | Yes | Change password |

### Habits (`/api/v1/habits`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/habits` | Yes | Create a new habit |
| `GET` | `/habits` | Yes | List habits (`?archived=false`) |
| `GET` | `/habits/today` | Yes | Today's habits with completion status |
| `GET` | `/habits/:id` | Yes | Habit detail with streak info |
| `PATCH` | `/habits/:id` | Yes | Update habit |
| `DELETE` | `/habits/:id` | Yes | Archive habit |
| `POST` | `/habits/:id/complete` | Yes | Check off habit (`{date?, note?}`) |
| `DELETE` | `/habits/:id/complete/:date` | Yes | Undo completion |
| `GET` | `/habits/:id/completions` | Yes | Completion history (`?from=&to=`) |
| `GET` | `/habits/:id/stats` | Yes | Streak stats + heatmap data |

### Groups (`/api/v1/groups`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/groups` | Yes | Create a group |
| `GET` | `/groups` | Yes | List my groups |
| `POST` | `/groups/join` | Yes | Join via invite code |
| `GET` | `/groups/:id` | Yes | Group detail with members |
| `PATCH` | `/groups/:id` | Yes | Update group (admin) |
| `DELETE` | `/groups/:id` | Yes | Delete group (admin) |
| `POST` | `/groups/:id/invite` | Yes | Generate invite (admin) |
| `GET` | `/groups/:id/invite` | Yes | Get current invite code |
| `DELETE` | `/groups/:id/members/:userId` | Yes | Remove member (admin) |
| `GET` | `/groups/:id/leaderboard` | Yes | Leaderboard (`?rankBy=currentStreak`) |

### Notifications (`/api/v1/notifications`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/notifications` | Yes | List notifications (`?unread=true&page=1&limit=20`) |
| `GET` | `/notifications/count` | Yes | Unread count |
| `PATCH` | `/notifications/:id/read` | Yes | Mark as read |
| `POST` | `/notifications/read-all` | Yes | Mark all as read |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Gateway health check |

Each downstream service also exposes `GET /health` on its own port.

## Internal Endpoints

These are used for inter-service communication and are protected by the `x-internal-key` header. They are not exposed through the gateway.

### Auth Service (internal)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/:id` | Get user by ID |
| `GET` | `/users/batch?ids=id1,id2` | Get multiple users by IDs |

### Habit Service (internal)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/habits/user/:userId` | Get all habits for a user (leaderboard) |

## Event Payloads (RabbitMQ)

Queue: `habitmap_events`

### `habit.completed`

```json
{
  "type": "habit.completed",
  "userId": "uuid",
  "habitId": "uuid",
  "habitName": "Exercise",
  "currentStreak": 12,
  "completedDate": "2026-03-31"
}
```

### `streak.milestone`

```json
{
  "type": "streak.milestone",
  "userId": "uuid",
  "habitId": "uuid",
  "habitName": "Read 20 pages",
  "milestone": 30,
  "occurredAt": "2026-03-31T00:00:00Z"
}
```

### `streak.broken`

```json
{
  "type": "streak.broken",
  "userId": "uuid",
  "habitId": "uuid",
  "habitName": "Journal",
  "previousStreak": 60,
  "occurredAt": "2026-03-31T00:00:00Z"
}
```

### `member.joined`

```json
{
  "type": "member.joined",
  "groupId": "uuid",
  "groupName": "Accountability Squad",
  "userId": "uuid",
  "username": "bob"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["name must be shorter than 100 characters"]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error or bad request |
| `401` | Missing or invalid JWT |
| `403` | Forbidden (not group admin, not resource owner) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, already completed today) |
| `429` | Rate limited (100 requests/60s) |
| `500` | Internal server error |
