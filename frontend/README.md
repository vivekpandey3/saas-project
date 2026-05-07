# Workspace Frontend

React + Vite frontend for a multi-tenant workspace SaaS app.

## Tech Stack

- React + Vite
- Tailwind CSS v4
- React Router
- Axios
- Zustand
- Framer Motion
- React Hot Toast

## Setup

1. Copy `.env.example` to `.env`
2. Set API URL:
   - `VITE_API_URL=http://localhost:5000/api`
   - `VITE_SOCKET_URL=http://localhost:5000`
3. Run:
   - `npm install`
   - `npm run dev`

## UI/UX Features

- Modern SaaS-style responsive layout
- Collapsible animated sidebar (desktop) + slide-over mobile sidebar
- Sticky top navbar with workspace context, dark mode, notifications button, and quick search placeholder
- Page transitions (fade + slide) using Framer Motion
- Modal animations (scale + fade) for task creation flow
- Micro-interactions on buttons and task cards
- Improved skeleton loaders and toast notifications

## Product Features

- JWT-based auth flow (login/register/logout)
- Protected route architecture
- Multi-workspace switcher
- Task management (create/list/update/delete)
- Realtime Kanban updates (Socket.io)
- Online workspace presence indicator
- Notification bell dropdown with unread count
- Notifications for task assignment and member join events
- Team members list
- Workspace activity timeline
- Dark mode toggle with persisted state

## Folder Structure

```text
src/
  api/                # axios client + interceptors
  components/
    layout/           # dashboard shell
    ui/               # reusable primitives (button/card/input/modal/skeleton)
  hooks/              # app bootstrap hooks
  pages/              # route pages
  store/              # zustand stores
  App.jsx             # route tree + page transitions
  main.jsx            # app bootstrap + providers
```

## Build

- `npm run build` creates a production build in `dist/`.
