<!-- bmad:context -->
<!-- Verified 2026-09-02 against 3547490. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## capstone-src

Web platform supporting the Chilean **Modelo de Prevención del Delito** (Leyes 20.393 / 21.595), built as an APT capstone for Ingeniería en Informática at Duoc UC. Better-T-Stack monorepo on Bun + Turborepo: React + TanStack Router (`apps/web`), Hono + tRPC (`apps/server`, `packages/api`), Drizzle over SQLite/Turso (`packages/db`), Better-Auth (`packages/auth`), shared shadcn/ui (`packages/ui`), Biome for lint and format. Only the generated auth scaffold exists so far; the domain engine is unbuilt. Planning artifacts live under `_bmad-output/`.

## Policy

- Never run `git commit` or `git push` without asking first.
- Read `_bmad-output/brainstorming/brainstorm-plataforma-mpd-2026-08-29/scope-contract.md` before proposing or accepting any feature. It is a pre-committed cut line; widening it is a conscious written amendment, not a judgement call. Canal de denuncias, real ERP integration, ML detection and multi-source enrichment are cut — raise them only as *trabajo futuro*.
- Never hand-edit `apps/web/src/routeTree.gen.ts`; the TanStack Router vite plugin regenerates it on dev and build.

## Where things are

- Scope and design decisions: `_bmad-output/brainstorming/brainstorm-plataforma-mpd-2026-08-29/` — `scope-contract.md` (the cut line), `brainstorm-intent.md` (architecture and design axioms), `build-order.md` (phase plan).
- tRPC procedures: `packages/api/src/routers/index.ts`; procedure builders in `packages/api/src/index.ts`; HTTP wiring in `apps/server/src/index.ts`.
- Drizzle tables: `packages/db/src/schema/`, re-exported from its `index.ts`; migrations land in `packages/db/src/migrations/`.
- Web routes are file-based under `apps/web/src/routes/`.

## Running and verifying

- No test runner is configured. Verify with `bun run check-types` and `bun run check`, and do not describe a change as tested.
- `bun run check` rewrites files — it is `biome check --write .`, not a read-only check.
- `check-types` in `apps/web` runs a full `vite build` first and is slow; while iterating, typecheck one workspace with `bunx turbo run check-types -F server`.
- Server env vars live in `apps/server/.env`, which `packages/db/drizzle.config.ts` loads by relative path — `db:push`, `db:generate` and `db:migrate` fail confusingly when `DATABASE_URL` is set anywhere else.
- `bun run db:local` shells out to `turso dev`, which needs the Turso CLI installed separately.

## Conventions that differ from defaults

- Code, comments, commit messages and documentation are written in English. Business and domain terminology stays in Spanish and is never translated or anglicised, accents included: Control, Señal, Evento, Alerta, Caso, Delito, Proveedor, Denuncia, compra, pago, encargado de cumplimiento. This holds in schema columns, tRPC procedure names and UI copy alike.
- Keep comments short and precise; explain why, not what.
- The scorer returns `{ score, breakdown[] }`, never a bare number — each breakdown entry names the señal, whether it fired, its weight and its contribution. Explainability is a hard requirement, not a feature; encode it in the return type so no path can bypass it.
- Controles are declarative data consumed by one engine, never hardcoded per-control logic. Adding a delito is configuration, not new code.
- Shared dependency versions go in the root `package.json` `workspaces.catalog` and are referenced as `"catalog:"` from each workspace; do not write a version literal.
- Subpath imports of workspace packages need the full file name — `@capstone-src/api/routers/index`, not `@capstone-src/api/routers`; the exports map is `./*` to `./src/*.ts`.

<!-- /bmad:context -->
