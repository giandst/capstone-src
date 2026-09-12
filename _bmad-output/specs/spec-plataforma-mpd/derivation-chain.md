# The derivation chain

The project's intellectual contribution: a **repeatable method for deriving controles from law**. It is also the concrete expression of the *levantamiento y análisis de requerimientos* competency, and it is what a panel will find defensible.

```
delito (ley)  →  conducta típica  →  rastro que deja  →  dato observable  →  señal  →  control
```

Read it as: the law names an offence; the offence is committed through particular conductas; each conducta leaves (or fails to leave) a trace; a trace becomes a field in the data; a field is read by a señal; señales compose into a control.

## What running the chain must produce

For each delito in scope, a written derivation ending in:

- its named **conductas típicas**;
- the **rastro** each one leaves;
- the **dato observable** — the exact input field that would carry that rastro;
- the **señal** that reads that field, classified intrínseca or relacional;
- the **control** that composes those señales, with weights and thresholds.

The exit criterion is a written derivation for at least two delitos, ending in a concrete list of señales **with the exact input fields each one reads** — because those fields are what the demo CSV must carry.

## Delitos in scope

| Delito | Evento type | Purpose in the argument |
|---|---|---|
| **corrupción entre particulares** (CP art. 287 bis / 287 ter) | `compra` | the primary derivation and the demo path |
| **lavado de activos** | `pago` / `transferencia` | proves a different delito produces a different *evento type* over the **same machinery** |
| a third | — | optional, only if the timebox is not spent |

## Two things the chain must surface explicitly

1. **`fraccionamiento` fires for both delitos.** This is the evidence that señales are reusable and that the three-layer model is correct — not an incidental overlap.
2. **Arriving at debida diligencia de terceros from first principles.** Reaching a standard, named MPD component through the chain rather than by copying a checklist validates both the chain and the engine model.

## Hard timebox

**One week, two or three delitos, then build.** The named failure mode is eight weeks of legal research with coding starting in W10. The *method* is the contribution; exhaustive catalog coverage is not.

## Relationship to the rest of the system

The chain is the reason the engine has three layers rather than a rules file: each arrow in the chain is a seam the software preserves. It also feeds `evaluation-methodology.md` directly — the independent batch of test casos is generated from the **conducta típica** step, *before* looking at which señales were implemented. That ordering is the whole countermeasure against circular evaluation.

The chain's one missing link inside the product is the **política** that defines a control — the document that would make the derivation visible in the system rather than only in the thesis. That is gestión documental, item #1 of trabajo futuro.
