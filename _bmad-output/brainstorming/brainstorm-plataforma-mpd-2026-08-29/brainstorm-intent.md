# Brainstorm Intent — Plataforma de apoyo al Modelo de Prevención del Delito (MPD)

**Context:** APT capstone, Ingeniería en Informática, Duoc UC (Chile). Regulated frame: Ley 20.393 and Ley 21.595. Deliverable: a functional prototype within one semester.
**Source:** convergence of a two-batch brainstorming session (Job to Be Done, Question Storming, Assumption Reversal, One Feature Only; Morphological Analysis, Backcasting, Failure Analysis), ratified via affinity clustering and MoSCoW.

## 1. Problem and job to be done

The **encargado de cumplimiento** is hired to **make the MPD effective, not merely documented** — the opposite of a *modelo de papel*. The adversary is the external auditor sitting across the table, asking for documents that prove everything was in order.

The product's real output is therefore **a defensible evidence trail, not a dashboard**: months later it must answer *was this control operating, who was responsible, who reviewed it, and what was decided despite the warning?*

Two complementary sensors cover the organization: **controles** (the data sensor, blind to anything that leaves no trace) and the **canal de denuncias** (the people sensor, covering exactly that blind spot). Only the data sensor is in scope this semester.

## 2. Core architecture (settled)

**Three-layer engine:**

```
Eventos  →  Señales  →  Controles
```

- **Eventos** — business activity ingested from the organization (a `compra`, a `pago`/`transferencia`). A different **delito** means a different event type, not different machinery.
- **Señales** — reusable detectors, shared across controles. Two families: **intrínsecas** (shape of the transaction itself; internal data only — e.g. `fraccionamiento`, self-approval, off-market price, anomalous timing, shared bank account/address with an employee) and **relacionales** (who the counterparty is — proveedor recently constituted, kinship with the solicitante, PEP, causas judiciales). `fraccionamiento` fires for both *soborno y cohecho* and *lavado de activos*, which is the proof that señales are a layer, not per-control code.
- **Controles** — weighted compositions of señales bound to a specific **delito**, producing a score `0..1` bucketed by pre-configured thresholds into **probabilidad baja / media / alta**.

**One engine, many configs.** Controles are **declarative definitions consumed as data/config**. Adding a new delito is configuration, not new code — this is what makes a semester scope tractable and what makes the "platform" claim true rather than asserted.

**Scorer contract:** the scorer returns `{score, breakdown[]}`, never a bare number. Explainability is built into scoring from day one; retrofitting it means rewriting every señal.

**One artifact, three renderings.** The same declarative control definition renders as (a) executable logic, (b) the auditor-readable **ficha del control**, (c) the object edited by the authoring UI. Auditor transparency is bought almost for free by choosing config-driven authoring.

**Enrichment (deferred but shaped):** external Chilean sources (SII, Poder Judicial, CMF, listas PEP, Diario Oficial, ChileCompra, Boletín Comercial, sanctions lists) all share one shape — *give a RUT, get facts about the entity*. That is **one `enriquecedor de entidades` interface with N adapters**, not N integrations.

## 3. Design axioms

1. **A human always decides.** Computers cannot be held accountable. The system informs; it is not a mechanism of legal determination. This demotes ML to *prioritization* only.
2. **Explainability is the evidence.** The auditor asks "why 0.87?" — every alerta must show which señales fired and what each contributed. Rules-based scoring is *more* defensible than opaque ML; the absence of real training data becomes a design strength, not a weakness.
3. **Point-in-time enrichment.** Store what a source said *when it was checked*, with timestamp. The auditor asks what you knew on 14 March, not what the source says today.
4. **RUT is the universal join key** — the entity-resolution key of the data model across every Chilean source.
5. **Ubiquitous language.** The domain model uses legal vocabulary directly: Control, Señal, Evento, Alerta, Caso, Delito, Proveedor, Denuncia.
6. **Cierre con justificación is the highest-value record.** Alertas prove the model was watching; overrides prove what the organization *decided despite a warning*. That is where liability lives — and overrides are themselves a data stream the engine can run a control over (the mechanism for making non-action visible).

## 4. Scope — MoSCoW as finally ratified

Clusters: A motor · B evidencia · C flujo del encargado · D autoría sin código · E ingesta · F enriquecimiento · G denuncias · H efectividad · I preventivos · J gobernanza · K metodología.

**MUST**
- **A** — motor de controles; scorer returns `{score, breakdown}`.
- **C** — flujo del encargado: review, check, dismiss, escalate; **cierre con justificación**, everything logged.
- **B-core** — explicabilidad + **ficha del control**.
- **E-core** — CSV ingest only.
- **K** — metodología: derivation chain + synthetic dataset with ground truth.
- **D — autoría sin código (promoted late from Should to Must).** Rationale: *"it's part of the flow."* If the only way to produce a control definition is the student editing JSON, the encargado is not a user and the platform claim dies.
  - **D1 — engine consumes declarative control definitions.** Architecture; always Must.
  - **D2 — authoring UI.** Now Must.
  - **Fallback seam:** if D2 stalls, seed definitions directly. The engine is unaffected, the demo survives, one screen is lost instead of the architecture. **Requires a pre-committed cutoff date.**

**SHOULD** (only once the vertical slice runs end to end)
- B-rest: append-only log + point-in-time storage · H efectividad · I-partial: timing preventivo.

**COULD**
- F: enriquecedor interface + one real adapter · J-partial: a second role.

**WON'T this time → trabajo futuro**
- G **canal de denuncias** in full · real ERP integration · multi-source enrichment · monitoreo continuo · blocking enforcement · ML prioritization · multi-tenant.

**Enrichment cut made painless:** the demo CSV carries enrichment as columns (`fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`), so relacional señales run with zero integrations.

## 5. Build order and demo

The demo requires a complete **vertical slice**, not a complete system: **ingest → score → explain → review → close**. Slice first, widen later.

Demo narrative: upload a CSV of **compras** carrying a planted story (proveedor constituted 5 days before the compra, apellido shared with the solicitante, three compras just under the threshold). The beat that lands is not detection but **explanation** — click the alerta, see which señales fired and what each contributed, plus the ficha del control behind it. The killer move: **author a new control live, without touching code, re-run the same CSV, a different caso appears.**

## 6. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Death by breadth** (self-identified as the biggest risk) — starting denuncias, dashboard and ERP integration, finishing none | A **pre-committed cut line written down before building starts**; adding anything requires consciously amending it. The cut line is section 4. It doubles as the thesis's **delimitación del alcance**, and every cut idea becomes **trabajo futuro**. |
| **Circular evaluation** (sharpest risk) — the same person designs both the planted casos and the señales that catch them, so the evaluation proves nothing | Must be answered explicitly in the thesis: separate the derivation of señales (from law) from the construction of the dataset, and state the limitation. This is the counter-risk to the synthetic-data reframe and cannot be left implicit. |
| **Demo-day infra** — capstone demos die on infrastructure more often than on code | Deploy early, keep a local fallback, record a video backup; verify the deployed instance runs with all seeded data. |
| **Legal-research overrun** — 8 weeks of legal research, coding starts week 10 | Timebox: derive **2–3 delitos** properly, then build. The *method* is the contribution; exhaustive catalog coverage is not. |
| **D2 half-built** — no-code authoring neither works nor got replaced in time | The D1/D2 seam plus a pre-committed cutoff date (see section 4). |
| **External data blocked** on credentials/scraping/legal access | Out of Must scope; enrichment arrives as CSV columns. |

## 7. Methodology contribution (cluster K)

The project's intellectual contribution is a **repeatable derivation chain** for deriving controles from law:

```
delito (ley) → conducta típica → rastro que deja → dato observable → señal → control
```

This *is* the "levantamiento y análisis de requerimientos" competency, and it is what a panel will find defensible. Arriving at **debida diligencia de terceros** — a standard, named MPD component — from first principles via this chain validates both the chain and the engine model.

**Synthetic data as experimental instrument, not compromise.** Planted casos give **ground truth**, so precision and recall can actually be measured; real data has no labels. Related design stance: **precision > recall** — alert fatigue trains the encargado to dismiss everything, so the system should flag controles that fire too often.

## 8. Trabajo futuro (cut, with reasons)

1. **Document upload / gestión documental** — the very first idea of the session; the piece that would make the derivation chain visible (the *política* that defines the control). The natural next increment, item #1.
2. **Canal de denuncias** — the people sensor: anonymity guarantees (no account, no IP, no metadata leak), named recipient chain with recusación routing when the recipient is the accused, and a **código de seguimiento** (anonymous ticket code + passphrase) for two-way communication with an anonymous denunciante. Trust here is a *functional* requirement, not UX polish. Cut for scope, not for value.
3. **Real ERP integration** — cash payments prove the ERP is a partial sensor whatever you pick, so betting the semester on it buys less than it looks. CSV is the correct call, not a compromise.
4. **Multi-source enrichment** — the N adapters behind the `enriquecedor` interface.
5. **Monitoreo continuo** — re-evaluating the existing proveedor base when an external source changes (a proveedor clean at onboarding can be sanctioned later).
6. **Blocking enforcement** — preventive actions beyond alerting (block, require a second approval).
7. **ML prioritization** — permitted only in the prioritization role, per axiom 1.
8. **Multi-tenant.**
