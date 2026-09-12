# Stack and conventions

## Substrate

The existing **Better-T-Stack monorepo**, already standing and currently empty of domain code. No phase spends time on scaffolding, and no new framework is introduced.

| Location | Contents |
|---|---|
| `apps/web` | React + TanStack Router — upload, alert queue, alerta detail, ficha del control, authoring form |
| `apps/server` | Hono + tRPC — ingest, scoring, review and cierre procedures |
| `packages/db` | Drizzle ORM over SQLite/Turso — `evento`, `señal` (definition and fired instance), `control`, `alerta`, `caso` |
| `packages/auth` | Better-Auth — the named actor behind every review action and cierre |
| `packages/ui` | shared shadcn/ui components |
| `packages/api`, `packages/config`, `packages/env` | existing shared packages |
| tooling | Bun, Turborepo, Biome |

Local SQLite with a seeded database and the demo CSV on disk is the **offline demo-day fallback**; it must be tested with wifi physically off.

## Language rule

- **Domain vocabulary stays Spanish** — `control`, `señal`, `evento`, `alerta`, `caso`, `delito`, `proveedor` — across the Drizzle schema, the tRPC procedure names and the UI. The ubiquitous language and the legal vocabulary are the same vocabulary; see `glossary.md`.
- **Everything else is English**: code, identifiers outside the domain vocabulary, comments, commit messages, documentation.

## Data model conventions

- **RUT is the entity-resolution join key** for `proveedor` and `persona`, and would be the join key for every external Chilean source if enrichment were ever integrated.
- The **`breakdown[]` is persisted** with the alerta, never recomputed at read time. An alerta must remain readable as the decision it was, even after its control definition changes.
- Control definitions are **stored as data**, and the seeding path stays working independently of the authoring UI.

## Type-level enforcement

The `{ score, breakdown[] }` contract is enforced in the scorer's **type signature**, so that no later code path can return a bare number. This is deliberate: it is the one architectural decision that cannot be retrofitted without rewriting every señal.

## Working rules carried from the build order

- **Vertical slice before width.** Nothing widens until `ingest → score → explain → review → close` runs end to end.
- **The thesis is written alongside the code.** Each phase names its own chapter; the document is never deferred to the last three weeks.
- **Deploy early** (W9), keep the local fallback, record the video backup at W15. Capstone demos die on infrastructure more often than on code.

Phase-by-phase sequencing, the week numbers, and the two marked decision points live in the adopted `build-order.md`.
