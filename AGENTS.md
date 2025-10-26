# Repository Guidelines

## Project Structure & Module Organization

Work in `apps/web` for the Next.js app. Routing, layouts, and API handlers live under `apps/web/src/app`; keep route handlers thin and delegate to services in `apps/web/src/services`. Shared UI primitives sit in `apps/web/src/components/ui`, while feature compositions belong in `apps/web/src/components`. Persisted schema definitions stay in `apps/web/src/db`. Tests reside beneath `apps/web/tests` split into `unit`, `integration`, and `contract`. Avoid editing generated SQL inside `apps/web/drizzle`.

## Build, Test, and Development Commands

- Run `pnpm dev` at the root to launch all workspaces in watch mode.
- Use `pnpm -F @portfolio/web dev` when iterating only on the web app.
- Validate builds with `pnpm build`, and lint using `pnpm lint`.
- Execute the full Vitest suite via `pnpm test`, or target the web package with `pnpm -F @portfolio/web test:run`.
- Database migrations are managed with `pnpm -w db:generate` followed by `pnpm -w db:migrate`.

## Coding Style & Naming Conventions

Favor pure functions, explicit return types, and named exports. Store shared types in `@/types`; validate all external inputs with Zod before service calls. Follow the shadcn/Tailwind pattern for UI, using the `cn` helper for class merging. Keep files focused, named in kebab-case, and avoid default parameters—prefer structured argument objects. Log through `apps/web/src/lib/logger.ts` and handle errors with utilities under `apps/web/src/lib`.

## Testing Guidelines

All new or modified logic requires Vitest coverage. Name test files with the `.test.ts` suffix inside the appropriate `unit`, `integration`, or `contract` directory. Tests run in a Node environment; keep them deterministic and free of shared state. Add regression tests when fixing bugs and confirm suites pass before pushing.

## Commit & Pull Request Guidelines

Write clear, action-oriented commit messages in the present tense (e.g., "Add project list service"). For PRs, link relevant issues, summarize the user-facing impact, and note migrations or new scripts. Ensure lint, build, and test commands succeed locally, and include screenshots or logs for UI or API changes when helpful.

## Security & Configuration Tips

Never commit secrets. Use helpers in `apps/web/src/lib` for auth, CSRF, and error handling. Run migrations through the provided scripts and avoid editing generated Drizzle artifacts directly.
