# Nexora App — AGENTS.md

## Stack

Angular 21 standalone, Tailwind CSS 4, Apollo GraphQL, Supabase auth. Vitest (not Karma) for tests. Node 22, npm 11.

## Critical setup

- **`.env` required** before `npm start`/`npm run build`. The `pre*` scripts run `scripts/sync-runtime-config.mjs` which generates `src/environments/environment.generated.ts` from env vars. Missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` **fails the build**.
- `.env` template is `.env.example` — needs `API_BASE_URL`, `GRAPHQL_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Generated env files (`environment.generated.*`) are gitignored. Must be regenerated per env.

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm start` (runs sync:environment first) |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Test | `npm test` (or `npx vitest` for single file) |
| Format | `npx prettier --write` (no script defined) |
| Sync envs only | `npm run sync:environment` |

## ESLint rules (flat config v10)

- `max-lines`: error, max **200**, skip blank/comment lines
- `@typescript-eslint/no-explicit-any`: **error**
- `@typescript-eslint/no-unused-vars`: warn, ignores `_`-prefixed args
- Component selector: `app` prefix, kebab-case
- Directive selector: `app` prefix, camelCase

## Style conventions (source: `GEMINI.md`)

- **Triada required:** Every component gets `.ts` + `.html` + `.css` in its own directory
- Every `.css` must start with `:host { display: block; }`
- Use `@if`/`@for`/`@switch` — never `*ngIf`/`*ngFor`
- Use Signals (`signal`, `computed`) for reactivity — not RxJS Subjects for local state
- All components/pipes/directives are `standalone: true`
- Interfaces in `interfaces/`, mock data in `mocks/`, never inline in `.ts`
- Design: Editorial Dark Mode, accent `#df3432`

## Architecture

- **Entrypoint:** `src/main.ts` → `bootstrapApplication(App, appConfig)`
- **Routing:** `src/app/app.routes.ts` — lazy-loaded features, auth guard (`authGuard`), role guard (`roleGuard` for ADMIN/OFFICIAL)
- **API layer:** Apollo GraphQL via `apollo-angular` + `@apollo/client`. Auth token injected via `setContext` link in `app.config.ts`
- **Auth:** Supabase via `@supabase/supabase-js`. Tokens managed in `AuthSession` service, refreshed via `SupabaseAuthService`
- **Key features:** `features/` (auth, feed, home, profile, management, help, not-found), `layout/` (main-layout, auth-layout), `core/` (services, guards, interceptors, tokens, config), `shared/` (components, directives, pipes)
- **Path alias:** `@app/*` → `src/app/*`

## Docker

- Dockerfile builds with `node:22-alpine`, serves with `nginx:1.27-alpine`
- nginx proxies `/api/`, `/graphql`, `/graphiql`, `/v3/api-docs` to backend at `core:8080`
- All other routes serve SPA `index.html`

## Test quirks

- `test-setup.ts` mocks `IntersectionObserver`, `WebSocket`, and `@supabase/supabase-js` globally
- Vitest config: jsdom environment, `vitest/globals`, path alias `@app` → `./src/app`
- CI runs `npm test -- --watch=false` after build

## Submodule workflow

This repo is a git submodule of a parent workspace. Changes must be committed here first, then the parent workspace updates the submodule pointer.

## Reference

- `GEMINI.md` — full coding standards (source of truth for `.cursorrules`)
- `.cursorrules` — condensed version of standards for AI tools
