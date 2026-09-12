# Control model — the three-layer engine and the declarative definition

The engine is the product. Everything else in this spec is a surface over it.

## The three layers

```
Eventos  →  Señales  →  Controles
```

- **Eventos** — ingested business activity. A different delito means a different evento *type* over the same machinery, not different machinery.
- **Señales** — reusable detectors, shared across controles. See `senales-catalog.md`.
- **Controles** — weighted compositions of señales bound to one delito, producing a score `0..1` bucketed by pre-configured thresholds into *probabilidad baja / media / alta*.

The proof that the middle layer is real: `fraccionamiento` is composed by a control bound to *corrupción entre particulares* and by a control bound to *lavado de activos*, with one implementation.

## One artifact, three renderings

A control definition is written once and read by three audiences:

1. **Executable logic** — the engine reads the structure and evaluates it. It contains no per-control code.
2. **Ficha del control** — the same definition rendered as an auditor-readable document (CAP-6).
3. **Authoring-UI object** — the same definition as the thing the D2 form creates and edits (CAP-10).

Auditor transparency is therefore bought almost for free by choosing config-driven authoring. A second, parallel representation of the same control anywhere in the system is a defect.

## What a control definition carries

| Element | Purpose |
|---|---|
| identity + human-readable name | referenced by alertas and by the ficha |
| `delito` bound to | which offence this control watches for |
| evento type watched | `compra`, `pago`/`transferencia` |
| composed señales, each with a weight | what it looks at and how much each matters |
| thresholds | the cut points mapping a score into *baja / media / alta*, and the point at which an alerta is raised |
| version / authored-by | so the ficha and the alerta can name the definition as it was when it ran |

Everything a control does must be fully described by this structure. If behaviour lives anywhere else, D1 is broken.

## The scorer contract

The scorer returns `{ score, breakdown[] }` — **never a bare number**. Each `breakdown` entry names the señal, whether it fired, its weight and its contribution to the total.

- Enforce it in the **type signature**, so no code path can return a score alone.
- **Persist** the breakdown alongside the alerta. It is not recomputed at read time: the auditor asks about the decision *as it was made*, and the definition may have changed since.
- Retrofitting explainability later means rewriting every señal. This is the one irreversible architectural decision in the project, taken in W2.

## Thresholds as configuration

Bucketing into *probabilidad baja / media / alta* is configuration on the control definition, not constants in the engine and not values the encargado tunes ad hoc while reviewing an alerta. Thresholds are pre-configured.

They also create a **detection shadow**: anyone who knows a threshold hides under it. Who may see threshold configuration is therefore a genuine access-control requirement — unresolved in this iteration (see SPEC Open Questions).

## Seeding and the D2 seam

The engine's ability to execute definitions (D1) is independent of any UI existing to write them (D2). A seeded fixture path must exist and keep working:

- It is how the vertical slice runs before the authoring UI exists.
- It is the standing fallback if D2 is stopped at its cutoff date.

If D2 is cut, the engine is unaffected, the demo survives, and what is lost is one screen, not the architecture.

## Deferred but shaped: enriquecedor de entidades

Every Chilean external source shares one shape — *give a RUT, get facts about the entity*. That is one `enriquecedor de entidades` interface with N adapters, not N integrations. **Not built this iteration.** Enrichment arrives as CSV columns instead, so the same señales relacionales run with zero integrations and the adapter interface, if ever built, plugs in behind the same shape and changes nothing upstream. The cut is reversible by construction.
