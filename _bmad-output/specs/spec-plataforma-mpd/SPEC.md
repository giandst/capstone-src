---
id: SPEC-plataforma-mpd
companions:
  - glossary.md
  - control-model.md
  - senales-catalog.md
  - flujo-del-encargado.md
  - derivation-chain.md
  - evaluation-methodology.md
  - demo-dataset.md
  - stack-and-conventions.md
  - ../../brainstorming/brainstorm-plataforma-mpd-2026-08-29/scope-contract.md
  - ../../brainstorming/brainstorm-plataforma-mpd-2026-08-29/build-order.md
sources:
  - ../../brainstorming/brainstorm-plataforma-mpd-2026-08-29/brainstorm-intent.md
  - ../../brainstorming/brainstorm-plataforma-mpd-2026-08-29/inputs/apt-project-idea.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Plataforma de apoyo al Modelo de Prevención del Delito

## Why

A **mandate to meet**, carried by one person. Ley 20.393 and Ley 21.595 oblige Chilean organizations to operate a Modelo de Prevención del Delito, and the **encargado de cumplimiento** is hired to make that model *effective* rather than merely documented — the opposite of a *modelo de papel*. Her adversary is the external auditor across the table, asking for documents that prove everything was in order. The product's real output is therefore a **defensible evidence trail, not a dashboard**: months later it must answer *was this control operating, who was responsible, who reviewed it, and what was decided despite the warning?* This spec covers one of the two sensors that watch an organization — the **data sensor** (controles over business activity). The people sensor (canal de denuncias) is deliberately out of scope and named as a blind spot rather than hidden. The work is an APT capstone for Ingeniería en Informática at Duoc UC: a functional prototype built in one semester on an existing empty Better-T-Stack monorepo, where the named failure mode is death by breadth, and the cut line in `scope-contract.md` is pre-committed before construction.

## Capabilities

- **CAP-1**
  - **intent:** The encargado uploads a CSV of business activity and the system persists each row as an `evento` it can reason over.
  - **success:** A CSV of compras uploaded through the web app produces one `evento` record per row, with its enrichment columns retained, and no console step in the path.

- **CAP-2**
  - **intent:** The engine executes a `control` read as a declarative definition — which evento type it watches, which señales it composes, their weights, its thresholds, which delito it is bound to — so that adding a delito is configuration rather than new code.
  - **success:** A control definition supplied as data (seeded fixture or authored record) is executed by the engine with no per-control code path; a second definition bound to a different delito runs on the same engine unchanged.

- **CAP-3**
  - **intent:** Señales exist as reusable detectors that any control can compose, rather than logic owned by one control.
  - **success:** `fraccionamiento` is referenced by a control bound to *corrupción entre particulares* and by a control bound to *lavado de activos*, with one implementation and no duplication.

- **CAP-4**
  - **intent:** The engine scores an evento against a control and returns both the number and how it was reached, bucketed into a probability band.
  - **success:** A unit test feeds one evento to the engine and asserts on `breakdown[]` — each entry naming its señal, whether it fired, its weight and its contribution — not merely on the score; the score maps to *probabilidad baja / media / alta* by thresholds read from the control definition.

- **CAP-5**
  - **intent:** The encargado (and, through her, the auditor) can see why an alerta has the score it has.
  - **success:** Opening an alerta shows every señal in the stored breakdown with its contribution, such that the question "why 0.87?" is answered on screen without recomputation.

- **CAP-6**
  - **intent:** Anyone auditing the system can read what a control watches, composes, weighs and where its thresholds sit, as a document rather than as code.
  - **success:** The **ficha del control** renders from the same declarative definition the engine executed, and changing the definition changes the ficha with no second authoring step.

- **CAP-7**
  - **intent:** The encargado works an alert queue — opening an alerta, reviewing it, dismissing it, escalating it, or promoting it to a `caso`.
  - **success:** From the queue, each of dismiss, escalate and promote-to-caso is reachable and moves the alerta to a recorded state; no state transition happens without a human action.

- **CAP-8**
  - **intent:** The encargado closes a caso with a written justificación that becomes the system's highest-value evidence record.
  - **success:** Closing requires a written reason; the stored record carries the reason, the acting person and the timestamp, and is not editable through the UI afterwards.

- **CAP-9**
  - **intent:** Every review action and cierre is attributable to a named person.
  - **success:** An unauthenticated visitor cannot act on an alerta, and each recorded action names the authenticated actor who performed it.

- **CAP-10**
  - **intent:** The encargado authors a new control without a developer and without editing JSON — picking the delito and evento type, selecting señales, setting weights and thresholds.
  - **success:** A control created entirely through the UI is validated before save, is rejected if malformed, and is then executed by the engine unchanged over a re-run of the same CSV, producing a caso the previous configuration did not produce.

- **CAP-11**
  - **intent:** The project can state how well its controles detect the conductas they were derived from, rather than asserting it.
  - **success:** The harness runs the engine over the synthetic dataset, compares alertas against the separately-held ground truth, and reports precisión and recall per control, with the self-authored and independently-planted batches reported separately.

## Constraints

- The scorer returns `{score, breakdown[]}` — never a bare number — enforced in the type signature so no code path can bypass it. The breakdown is persisted alongside the alerta, not recomputed at read time: the auditor asks about the decision as it was made.
- Controles are declarative data consumed as config. No per-control code in the engine, and no control whose behaviour is not fully described by its definition.
- One control definition, three renderings — executable logic, ficha del control, authoring-UI object. A second, parallel representation of the same control is a defect.
- Thresholds are configuration on the control definition: not constants in the engine, and not tuned ad hoc by the encargado at review time.
- A human always decides. The system informs; it is never a mechanism of legal determination. No automatic determination, no blocking, no action taken without a person taking it.
- Ingest is CSV only. No ERP integration, no external adapters. Enrichment reaches the engine as CSV columns (`fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`) so that señales relacionales run with zero integrations.
- Vertical-slice gate: nothing widens until `ingest → score → explain → review → close` runs end to end on the demo path. A magnificent señal library with no review screen demos as nothing.
- D2 (CAP-10) carries a pre-committed cutoff date (end of W10 in `build-order.md`). If an authored control does not execute end to end by that date, D2 stops, definitions are seeded directly, and D2 moves to trabajo futuro. The seeding path of CAP-2 must therefore exist and work independently of any UI.
- Domain vocabulary stays Spanish across the Drizzle schema, the tRPC procedures and the UI — `control`, `señal`, `evento`, `alerta`, `caso`, `delito`, `proveedor`. Everything else — code, comments, commits, documentation — is English.
- RUT is the entity-resolution join key for `proveedor` and `persona`.
- Build on the existing Better-T-Stack monorepo. No new stack, no scaffolding phase; see `stack-and-conventions.md`.
- Legal derivation is timeboxed to one week and to two or three delitos. The method is the contribution; exhaustive catalog coverage is not.
- Precision over recall. A control that fires too often is a defect, not a safety margin: alert fatigue trains the encargado to dismiss everything.
- Review actions and cierres are recorded with actor and timestamp and are not editable through the UI. A full append-only evidence log with point-in-time enrichment storage is a SHOULD, not part of this contract.

## Non-goals

- **Canal de denuncias**, in its entirety. It is the people sensor covering the data sensor's structural blind spot (cash, favours, rigged bidding); its design is recorded in `scope-contract.md` §6 for the next increment. The blind spot is named in the thesis, not hidden.
- **Real ERP integration.** Any ERP is a partial sensor anyway — a compra paid in cash leaves no trace in it — so CSV is the correct call, not a compromise.
- **Multi-source external enrichment.** No SII, Poder Judicial, CMF, listas PEP, ChileCompra or sanctions adapters; not even the `enriquecedor de entidades` interface, which is a COULD.
- **Monitoreo continuo.** No re-evaluation of the existing proveedor base when an external source moves; it presupposes external sources.
- **Blocking enforcement.** No blocking a compra and no requiring a second approval. That would move the system from informing a human decision to constraining one.
- **Machine learning in any role**, prioritization included. Rules-based scoring is the more defensible evaluation story, and ranking is meaningless before there is a volume of alertas to rank.
- **Multi-tenant.** One organization, one instance.
- **Gestión documental** — no document upload, no storing the política that justifies a control. It is item #1 of trabajo futuro.
- Not a dashboard product. The output is an evidence trail; reporting surfaces beyond the alerta and the ficha del control are out.
- Not exhaustive delito coverage. Two or three delitos, derived properly.

## Success signal

On a clean database, the encargado uploads the demo CSV, the planted casos surface as alertas with *probabilidad alta*, she opens one and sees which señales fired and what each contributed beside the ficha del control that produced it, and she closes it with a **cierre con justificación** attributed to her — the whole path through the UI, without touching a console. Then, in front of the panel, a new control authored through the UI without code, re-run over the same CSV, produces a caso the previous configuration did not — and the harness reports precisión and recall per control against the independently planted ground-truth batch.

## Assumptions

- One organization, one instance; a single encargado role suffices for the slice. A second role is a COULD, not part of this contract.
- Delitos in scope: *corrupción entre particulares* over a `compra` evento (primary) and *lavado de activos* over a `pago`/`transferencia` evento (secondary). A third is optional and only if the derivation timebox is not spent.
- **Amended 2026-09-12.** The primary delito was originally recorded as *soborno y cohecho*. The modelled organisation is a private company that does not contract with the State, so no funcionario público is party to the transaction and the applicable tipo penal is **corrupción entre particulares** (Código Penal art. 287 bis / 287 ter), not cohecho (arts. 248–250). The señales are unaffected: the same three would serve a cohecho-bound control if the company sold to the State — which is a second demonstration of engine generality, alongside `fraccionamiento` crossing evento types. Derivation and rationale: PRD §7 and S-11.
- Persistence is Drizzle over SQLite/Turso, as the existing monorepo already provides; local SQLite is the demo-day offline fallback.
- Week numbers in `build-order.md` are relative to the first build week over a ~16-week semester.

## Open Questions

- Is the application UI fully Spanish for the encargado, or English chrome with Spanish domain terms? The contract mandates Spanish domain vocabulary but never settles interface language.
- The system stores personal data on employees and terceros (`flag_PEP`, `causas_judiciales`, apellidos). What does Chilean data-protection law require of this prototype regarding consent, retention and access restriction? Raised during the session and never resolved.
- Does *escalate* in CAP-7 have a destination in this iteration, or is it a status change only? The independence problem — whether the encargado can close an alerta about the person who signs her paycheck — implies an escalation path to the directorio or comité de ética and is carried forward unresolved.
- May any evidence record be deleted or edited at all, and by whom?
- Who may see threshold configuration? Thresholds create a detection shadow — anyone who knows the threshold hides under it — but the second role that would enforce this restriction is only a COULD.
- What is the absolute calendar date of the D2 cutoff? `build-order.md` fixes it at end of W10 relative, and Phase 0 requires it written down.
- Can the person under suspicion see their own alerta?
- Is a third delito in or out of the derivation timebox?
