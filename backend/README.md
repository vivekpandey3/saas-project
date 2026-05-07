# Multi-Tenant Workspace Backend

This backend is built with Express + MongoDB for a Notion/Slack style company workspace app.

## 1) Setup

1. Copy `.env.example` to `.env`
2. Update values (`MONGO_URI`, `JWT_SECRET`)
3. Run:
   - `npm install`
   - `npm run dev`

## 2) Project Structure

```text
src/
  config/        # env + database connection
  controllers/   # business logic per module
  middleware/    # auth, workspace guard, validation, error handling
  models/        # mongoose schemas
  routes/        # API route groups
  services/      # shared app services (activity log)
  utils/         # helpers (jwt, custom error, async wrapper)
  validators/    # zod schemas
  app.js         # express app setup
  server.js      # database + server startup
```

## 3) Multi-Tenant Isolation Strategy

- Every user belongs to one or more workspaces.
- Every workspace keeps its own members and roles.
- Task and activity documents store `workspace` id.
- Protected APIs require `x-workspace-id` header (or fallback to `currentWorkspace`).
- Middleware blocks access when user is not a member of that workspace.

## 4) Auth Flow

- `POST /api/auth/register`
  - Creates user + hashes password
  - Creates first workspace for onboarding (user is admin)
  - Returns JWT token
- `POST /api/auth/login`
  - Verifies credentials
  - Returns JWT token
- `GET /api/auth/me`
  - Returns current user profile (protected)

## 5) Workspace APIs

- `GET /api/workspaces` -> list user workspaces
- `POST /api/workspaces` -> create another workspace
- `POST /api/workspaces/join` -> join via `workspaceId` or `inviteCode`
- `GET /api/workspaces/members` -> admin-only members list

## 6) Task + Team + Activity APIs

- `GET/POST /api/tasks`
- `PATCH/DELETE /api/tasks/:taskId`
- `GET /api/users/team`
- `GET /api/users/activity`

## 7) Realtime (Socket.io)

- Socket auth uses JWT token + workspace id via socket handshake auth.
- Members join workspace room: `workspace:<workspaceId>`.
- Task events emitted to workspace members:
  - `task:created`
  - `task:updated`
  - `task:deleted`
- Presence event emitted on connect/disconnect:
  - `presence:update` with `onlineCount`
- Notification event emitted to user room:
  - `notification:new`

## 8) API Notes For Frontend Integration

- Protected workspace routes depend on the `x-workspace-id` request header.
- Auth token should be sent as `Authorization: Bearer <token>`.
- Task status supports:
  - `todo`
  - `in_progress`
  - `done`
- Activity logs are returned sorted by latest first.
- Notification endpoints:
  - `GET /api/users/notifications`
  - `PATCH /api/users/notifications/:notificationId/read`
  - `PATCH /api/users/notifications/read-all`

## 9) Security & Validation

- Password hashing: `bcryptjs`
- JWT auth middleware
- Workspace membership guard
- Role guard (`admin`)
- Input validation with `zod`
- Central error handler with consistent JSON responses

## 10) Current Scope

- Auth
- Multi-tenant workspaces
- Team members
- Task CRUD
- Activity logs

Planned next backend extensions include realtime sockets, notifications, file uploads, and richer RBAC endpoints.
