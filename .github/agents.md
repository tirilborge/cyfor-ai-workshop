# Agents.md – Cyfor AI Workshop

## Project Overview

This is a monorepo for a fullstack workshop application consisting of an **API**, a **Web** frontend, and **Slides**. The app is a simple CRUD item list used as a teaching tool.

## Architecture

```
cyfor-ai-workshop/
├── api/          # Backend – Hono + Prisma + SQLite
├── web/          # Frontend – React + Vite + TailwindCSS
├── slides/       # Presentation slides
└── workshop-tasks/  # Workshop task descriptions (task-1 to task-4)
```

### API (`api/`)

- **Framework:** Hono with `@hono/zod-openapi` for type-safe, OpenAPI-documented routes
- **ORM:** Prisma with SQLite (`api/data/workshop.db`)
- **Entry point:** `api/src/index.ts` → creates the HTTP server
- **App/routes:** `api/src/app.ts` → all route definitions and handlers
- **Database client:** `api/src/db.ts`
- **Schema:** `api/prisma/schema.prisma` – single `Item` model (id, title, createdAt)
- **OpenAPI spec:** Exported to `api/openapi.json` via `api/scripts/export-openapi.ts`

#### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Root info |
| GET | `/health` | Health check |
| GET | `/items` | List all items (newest first) |
| POST | `/items` | Create a new item (body: `{ title }`) |
| DELETE | `/items/{id}` | Delete an item by ID |

### Web (`web/`)

- **Framework:** React 19 + Vite 8
- **Styling:** TailwindCSS 4
- **Data fetching:** TanStack React Query + Axios
- **API client generation:** Orval generates typed hooks from `api/openapi.json` into `web/src/api/generated/hooks.ts`
- **Custom Axios client:** `web/src/api/client.ts`
- **Entry point:** `web/src/main.tsx` → `web/src/App.tsx`

### Slides (`slides/`)

- Static HTML presentation (likely reveal.js)
- Contains Sopra Steria branding assets and diagrams about agents

## Key Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start API (port 3000) and Web (port 5173) concurrently |
| `npm run dev:api` | Start only the API |
| `npm run dev:web` | Start only the Web frontend |
| `npm run generate` | Regenerate Prisma client, OpenAPI spec, and Orval hooks |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | Type-check all workspaces |

## Code Conventions

- **Language:** TypeScript (ES modules, `"type": "module"`)
- **Node.js:** 20+
- **Package manager:** npm 10+ with npm workspaces
- **Validation:** Zod schemas define both runtime validation and OpenAPI documentation
- **API responses** use ISO 8601 datetime strings for dates
- **CORS:** Configured for `localhost:5173` and `localhost:4173` by default; customizable via `CORS_ORIGIN` env var
- **API port:** Default 3000, customizable via `API_PORT` env var

## Database

- SQLite file at `api/data/workshop.db` (auto-created on first run)
- Single model: `Item { id: Int, title: String, createdAt: DateTime }`
- Migrations in `api/prisma/migrations/`
- Inspect with `npx prisma studio --schema api/prisma/schema.prisma`

## Code Generation Pipeline

1. Prisma generates the typed database client from `schema.prisma`
2. `api/scripts/export-openapi.ts` exports the OpenAPI spec to `api/openapi.json`
3. Orval reads `api/openapi.json` and generates React Query hooks into `web/src/api/generated/hooks.ts`

**Always run `npm run generate` after changing API routes or the Prisma schema.**

## Guidelines for AI Agents

- When modifying API routes, update them in `api/src/app.ts` following the existing pattern: define a Zod schema, create a route with `createRoute()`, then implement the handler with `app.openapi()`.
- After API changes, run `npm run generate` to regenerate the OpenAPI spec and frontend hooks.
- After Prisma schema changes, run `npm run generate` and consider creating a migration with `npx prisma migrate dev --schema api/prisma/schema.prisma`.
- Frontend auto-generated files in `web/src/api/generated/` should **never** be edited manually.
- Keep the workshop simple — this is a teaching project, not production code.
