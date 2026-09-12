---
title: "Product Brief — Plataforma de apoyo al Modelo de Prevención del Delito"
status: draft
created: 2026-09-02
updated: 2026-09-02
---

# Product Brief: Plataforma de apoyo al Modelo de Prevención del Delito

**Context:** APT (actividad de titulación), Ingeniería en Informática, Duoc UC — Chile.
**Deliverable:** a functional prototype plus its thesis document, inside one semester.
**Legal frame:** Ley 20.393 and Ley 21.595.
**Upstream input:** the ratified brainstorming session at `_bmad-output/brainstorming/brainstorm-plataforma-mpd-2026-08-29/` — its `scope-contract.md` is the binding cut line and this brief does not widen it.

## Executive Summary

Under Ley 20.393 and Ley 21.595, a Chilean organization's defense rests on having a Modelo de Prevención del Delito that is *implemented and effective*, not merely written down. The person carrying that obligation is the **encargado de cumplimiento**, and the moment that defines her job is an external audit: someone sits across the table and asks for documents proving everything was in order. A binder of policies does not answer that question. A record of what the organization watched, what it was warned about, and what it decided anyway does.

This project builds a web platform whose real output is that record. At its centre is a **motor de controles**: business activity arrives as **eventos** (a `compra`, a `pago`), reusable detectors called **señales** examine each event, and **controles** — weighted compositions of señales bound to a specific **delito** — produce a score between 0 and 1, bucketed by pre-configured thresholds into **probabilidad baja / media / alta**. The scorer never returns a bare number; it returns a score *and* the breakdown of which señales fired and what each contributed. An alerta the encargado cannot explain is not evidence, so explainability is built into the scoring contract from the first line of code rather than bolted on later.

Controles are declarative definitions consumed as data, not code. That single decision does most of the work in this project: adding a new delito becomes configuration rather than development (which is what makes a semester scope realistic and what makes the word "plataforma" true rather than asserted), the same definition renders as an auditor-readable **ficha del control** for almost nothing, and the encargado can author a control herself without a developer. The prototype proves this on stage: upload a CSV of compras, watch a caso appear, click into the alerta to see exactly why, then author a new control live — no code — re-run the same CSV, and see a different caso surface.

## The Problem

The gap the law cares about is between a *modelo de papel* and an implemented one, and nothing in a document distinguishes them. Concretely, the encargado de cumplimiento cannot answer, months after the fact and under external scrutiny:

- Was this control actually operating during the period in question?
- Who was responsible for it, and who reviewed what it produced?
- What did the organization decide *despite* the warning, and on what stated reasoning?

Today that answer is assembled by hand, out of spreadsheets, mail threads and memory, at the moment it is demanded. The cost of the status quo is not inefficiency — it is that an organization with genuinely good intentions cannot prove them, and an organization with bad ones is indistinguishable from it.

Underneath sits a second problem, which is where the intellectual work of this project lives: there is no repeatable, inspectable path from *a delito defined in a statute* to *a rule running over transactional data*. Controles get written by consultants from experience. If the derivation cannot be shown, neither the control nor the alerta it produces can really be defended.

## The Solution

**Three layers, one engine.**

```
Eventos  →  Señales  →  Controles  →  Alerta (score + breakdown)  →  Decisión humana
```

- **Eventos** — business activity ingested from the organization. A different delito means a different *event type*, not different machinery.
- **Señales** — reusable detectors, shared across controles. Two families: **intrínsecas**, which read only the shape of the transaction (`fraccionamiento`, self-approval, off-market price, anomalous timing), and **relacionales**, which read who the counterparty is (proveedor recently constituted, kinship with the solicitante, PEP, causas judiciales). `fraccionamiento` fires for both *soborno y cohecho* and *lavado de activos* — which is the proof that señales are a layer and not per-control code.
- **Controles** — weighted compositions of señales bound to a delito, scoring `0..1` into **probabilidad baja / media / alta** by pre-configured thresholds.
- **Flujo del encargado** — review, check, dismiss, escalate, and **cierre con justificación**, all logged. Alertas prove the model was watching; the cierre con justificación proves what the organization decided anyway. That record, not the dashboard, is where liability actually lives.

**One artifact, three renderings.** A control definition is authored once and read three ways: as executable logic by the engine, as the **ficha del control** by the auditor, and as the object edited in the authoring UI. Auditor transparency is therefore bought as a side effect of a build decision made for other reasons.

## Design Axioms

These are constraints on the build, not aspirations. Each one was a decision in the session and each one is load-bearing.

1. **A human always decides.** Computers cannot be held accountable. The system informs a decision; it is never a mechanism of legal determination. This is also what demotes ML to a prioritization role — and out of this iteration entirely.
2. **Explainability is the evidence.** Rules-based scoring is *more* defensible here than opaque ML, which turns the original proposal's named weakness (no real data to train on) into a design strength.
3. **RUT is the universal join key** for entity resolution across every Chilean data source.
4. **Ubiquitous language.** The domain model uses the legal vocabulary directly: Control, Señal, Evento, Alerta, Caso, Delito, Proveedor, Denuncia.
5. **Point-in-time truth.** Store what a source said *when it was checked*, timestamped. The auditor asks what you knew on 14 March, not what is true today. (In scope as a Should; the axiom shapes the data model regardless.)

## Who This Serves

**Primary — the encargado de cumplimiento.** Hired to make the MPD effective and personally exposed when it is not. She needs to see what fired and why, act on it, and leave a defensible trail behind every decision. Success for her is walking into an audit able to answer questions instead of assembling answers.

**Secondary — the external auditor.** Not a user of the workflow but the reader the artifacts are written for. Every explainability requirement in this brief traces back to a question this person asks.

**Evaluation audience — the APT panel.** They judge whether the requirements were properly derived, whether the architecture holds, and whether the evaluation proves anything. The methodology and the stated limitations below exist for them.

## What Makes This Defensible

This is an academic capstone, so the honest claim is not a competitive moat. It is a method and an architecture, and both are falsifiable.

**The derivation chain** is the project's intellectual contribution:

```
delito (ley) → conducta típica → rastro que deja → dato observable → señal → control
```

A repeatable path from statute to running rule. It is the concrete expression of the *levantamiento y análisis de requerimientos* competency. The chain validated itself during the session: followed from first principles it arrived at **debida diligencia de terceros**, a standard named MPD component, which was not the starting point.

**Synthetic data is the experimental instrument, not a compromise.** Planted casos carry ground truth, so precision and recall can be measured. Real transactional data has no labels; it could not support the same claim.

**Honest limitations, stated up front:**

- **Circular evaluation.** The same person derives the señales and constructs the dataset that tests them, so the evaluation proves less than it appears to. The mitigation is procedural and belongs in the document, not the code: derive the señales from the law *first and separately*, construct the dataset afterwards, and state the limitation explicitly.
- **The controles are a data sensor, and a data sensor is blind to anything that leaves no trace** — cash, favors, rigged bidding. The **canal de denuncias** is the people sensor covering exactly that blind spot, and it is out of scope this semester. A thesis that names which delitos its controles structurally cannot see is more defensible than one implying full coverage.
- **No market, competitor or adoption evidence has been gathered.** Whether Chilean medianas empresas would buy or adopt this is unknown and is not claimed.
- **The user research base is thin.** No encargado de cumplimiento has been interviewed. The persona above is derived from the legal frame and the proposal, not from fieldwork.

## Scope — delimitación del alcance

The cut line is ratified and pre-committed in `scope-contract.md`. Adding anything is a conscious amendment to that contract, not a drift. The build order is **slice first, widen later**: one narrow vertical path — ingest → score → explain → review → close — through every layer before anything is widened.

**MUST**
- **A — motor de controles.** Eventos → señales → controles; the scorer returns `{score, breakdown[]}`, never a bare number.
- **C — flujo del encargado.** Review, check, dismiss, escalate, **cierre con justificación**, everything logged.
- **B-core — explicabilidad + ficha del control.**
- **E-core — CSV ingest only.** No ERP integration.
- **D — autoría sin código.** Split at a deliberate fallback seam: **D1**, the engine consumes declarative control definitions (architecture, non-negotiable); **D2**, the authoring UI. If D2 stalls, definitions are seeded directly — one screen is lost, not the architecture. **This fallback requires a cutoff date committed in advance**, or the seam does not protect anything.
- **K — metodología.** Derivation chain plus a synthetic dataset with ground truth. Legal research is timeboxed: derive **two or three delitos** properly, then build.

**SHOULD** — started only once the vertical slice runs end to end. Append-only log and point-in-time storage; efectividad / visibilidad de la no-acción; señales de timing preventivo.

**COULD** — the `enriquecedor de entidades` interface with one real adapter; a second role, since thresholds create a detection shadow and who may see threshold configuration is a genuine requirement.

**WON'T this time** — canal de denuncias in full, real ERP integration, multi-source enrichment, monitoreo continuo, blocking enforcement, ML prioritization, multi-tenant. Each is recorded as **trabajo futuro** with its reasoning, not dropped.

**The enrichment cut costs nothing**, because the demo CSV carries enrichment as columns (`fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`). Both families of señales run with zero integrations, the engine is exercised at full breadth, and the adapter interface plugs in behind the same shape later. This is the general pattern the scope contract relies on: cut the integration, keep the capability, place the seam where reversing the decision costs nothing already built.

## Success Criteria

**The demo must land these beats, in order.** Upload a CSV of compras carrying a planted narrative → a caso appears → click the alerta and see which señales fired and what each contributed, with the ficha del control behind it → walk the full encargado flow through to cierre con justificación → **author a new control live without touching code, re-run the same CSV, and a different caso appears.** The beat that convinces a panel is the explanation, not the detection; the last beat is what converts the platform claim from an assertion into a demonstration.

**Measurable outcomes.**
- Precision and recall against the planted ground truth, reported honestly, with the circular-evaluation limitation stated alongside them. **Precision is preferred over recall** — alert fatigue trains the encargado to dismiss everything.
- Adding a new delito requires only a new control definition and, at most, new señales — no engine changes. This is the falsifiable form of the "one engine, many configs" claim.
- Every alerta in the system can be traced back to a specific clause via the derivation chain, and every closed alerta carries a stored justificación.
- The instance is deployed and running with all seeded data, verified ahead of demo day, with a local fallback and a recorded video backup.

## Risks

| Risk | Mitigation |
|---|---|
| **Death by breadth** — the self-identified biggest risk: starting denuncias, dashboard and ERP integration, finishing none | The pre-committed cut line above; amendments must be conscious. It doubles as the thesis's delimitación del alcance. |
| **Circular evaluation** — the sharpest risk to the evaluation's validity | Answered in the document: derive señales from law before and separately from dataset construction, and state the limitation. |
| **Legal-research overrun** — eight weeks of statutes, coding starts week 10 | Timebox to two or three delitos. The method is the contribution; catalog coverage is not. |
| **D2 half-built** — an authoring UI that neither works nor got replaced in time | The D1/D2 seam plus a cutoff date fixed in advance, not decided in the optimistic week before the demo. |
| **Demo-day infrastructure** — capstone demos die on infrastructure more often than on code | Deploy early, local fallback, recorded video backup. |
| **Thesis written last** — code "almost done" while the document is three weeks of panic | Write the delimitación del alcance and trabajo futuro sections now; they already exist as session outputs. |

## Implementation Substrate

The prototype is built on an existing but empty Better-T-Stack monorepo: React with TanStack Router, Hono with tRPC, Drizzle over SQLite/Turso, Better-Auth, shadcn/ui, Bun, Turborepo. Nothing in the domain design depends on these choices; they are settled so that no time is spent settling them. Architectural decisions live downstream of this brief.

## Vision — trabajo futuro

The engine is the falsifiable claim; everything below was cut for the semester, not for value, and each carries its reasoning in `scope-contract.md`.

The natural next increment is **gestión documental** — the política that defines a control, stored beside the control it justifies, which is what would make the derivation chain visible inside the product rather than only in the thesis. After that, the **canal de denuncias**: the people sensor that covers the data sensor's blind spot, whose design is already worked out (technical anonymity guarantees, a named recipient chain with recusación routing when the recipient is the accused, and a **código de seguimiento** for two-way communication with an anonymous denunciante). Then the `enriquecedor de entidades` adapters over real Chilean sources, and **monitoreo continuo**, which re-evaluates the existing proveedor base when an external source moves — a proveedor clean at onboarding can be sanctioned later. Blocking enforcement, ML prioritization and multi-tenant follow, each gated on an argument recorded in the scope contract.

Two open questions the thesis should acknowledge rather than resolve: **independence** — whether the encargado de cumplimiento can close an alerta about the person who signs her paycheck, which implies an escalation path to the directorio or comité de ética — and **agregación temporal** as the counter-signal to deliberate under-threshold evasion.
