# Durian Smart Farm (ระบบบริหารจัดการสวนทุเรียนอัจฉริยะ)

A Thai-language smart farm management system for durian orchards. Includes a web dashboard, REST API, and Expo mobile app.

## Run & Operate

- **Start API server** — run the "API Server" workflow (port 5000)
- **Start web app** — run the "DurianFarm Web" workflow (port 8080, proxies `/api` → port 5000)
- Both workflows must be running for the full app to work
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Web**: React + Vite + shadcn/ui + Tailwind CSS (port 8080)
- **API**: Express 5 (port 5000)
- **DB**: PostgreSQL + Drizzle ORM (Replit-managed, `DATABASE_URL` injected automatically)
- **Mobile**: Expo React Native (`artifacts/durian-farm-mobile`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/durian-farm/` — React web app
- `artifacts/api-server/` — Express API server
- `artifacts/durian-farm-mobile/` — Expo mobile app
- `lib/db/src/schema/` — Drizzle DB schema (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks (do not edit manually)
- `lib/api-zod/` — generated Zod schemas (do not edit manually)

## Architecture decisions

- API calls from the web app use relative `/api/...` paths; Vite dev server proxies them to the API server on port 5000 (`API_PORT` env var, defaults to 5000)
- `DATABASE_URL` and other `PG*` vars are runtime-managed by Replit — do not set them manually
- `SESSION_SECRET` is stored as a Replit Secret
- The dev command for the API server does a full esbuild compile before starting (by design — no watch mode)

## Product

A management dashboard for durian farm owners (ภาษาไทย). Features: accounting (income/expense), plot management, fertilizer scheduling, AI analysis, weather forecast, task tracking, workers, inventory, equipment, and notifications.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API Server workflow doesn't use `waitForPort` (the build step + port check caused timeouts). The server IS running if you see "Server listening port: 5000" in its logs.
- Run `pnpm --filter @workspace/db run push` any time the Drizzle schema changes.
- Do not regenerate `lib/api-client-react/` or `lib/api-zod/` by hand — run the codegen script.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
