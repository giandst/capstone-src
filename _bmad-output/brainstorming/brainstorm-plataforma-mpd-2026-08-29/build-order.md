# Build Order — Plataforma de apoyo al MPD

Ordered plan of work for a one-semester capstone prototype. Derived from the backcasting done in the brainstorming session: the session walked backward from demo day to week one; this document presents that same chain forward.

Substrate: the existing Better-T-Stack monorepo — React + TanStack Router (`apps/web`), Hono + tRPC (`apps/server`), Drizzle ORM over SQLite/Turso (`packages/db`), Better-Auth (`packages/auth`), shared shadcn/ui (`packages/ui`), Bun + Turborepo + Biome. The stack is already standing, so no phase below spends time on scaffolding; sequencing only references it where a layer boundary actually forces an ordering.

Week numbers are relative (W1 = first week of build), assuming a ~16-week semester.

---

## Governing rules (apply to every phase)

- **Pre-committed cut line.** The MoSCoW ratified in the session is the scope contract: MUST = motor de controles (scorer returns breakdown) + flujo del encargado + explicabilidad / ficha del control + CSV-only ingest + metodología (derivation chain, synthetic dataset with ground truth) + declarative control authoring (D1 + D2). Anything added later requires consciously amending this line, in writing.
- **Vertical slice before width.** Nothing gets widened until `ingest -> score -> explain -> review -> close` runs end to end. A magnificent library of señales with no review screen demos as nothing.
- **Scorer contract, from the first line of code.** The scorer returns `{ score, breakdown[] }` — never a bare number. Explainability is not a feature layered on top; retrofitting it means rewriting every señal.
- **Thesis written alongside the code.** Every phase below names its thesis output. The document is never deferred to the last three weeks.
- **Domain vocabulary is the code vocabulary.** Control, Señal, Evento, Alerta, Caso, Delito, Proveedor stay in Spanish across the schema, the tRPC procedures and the UI.

---

## Phase 0 — Pre-commitments (W1, half a day, before anything else)

- [ ] Write down the cut line above as a signed-and-dated file in the repo. It is also the thesis section `delimitación del alcance`.
- [ ] Write the WON'T list as the seed of `trabajo futuro`: canal de denuncias, real ERP integration, multi-source enrichment, monitoreo continuo, blocking enforcement, ML prioritization, multi-tenant. Add "she uploads documents / la política that defines the control" as item #1 — the natural next increment.
- [ ] Set the **D2 cutoff date** now (see Phase 6) and record it in the same file.
- [ ] Set the deploy-early date and the video-backup date (see Phase 8) in the same file.

---

## Phase 1 — Legal derivation (W1, timeboxed to one week, NO code)

Week one is legal derivation, not implementation. This is the project's intellectual contribution and the `levantamiento y análisis de requerimientos` competency.

Apply the derivation chain to each delito in scope:

`delito (ley) -> conducta típica -> rastro que deja -> dato observable -> señal -> control`

- [ ] Derive **corrupción entre particulares** through the full chain. Output: named conductas típicas, the rastro each leaves, the observable data field that would carry it, the señal that reads that field, the control that composes the señales.
- [ ] Derive **lavado de activos** through the full chain. Confirm it produces a different evento type (pago / transferencia rather than compra) over the same machinery.
- [ ] Optional third delito only if the first two are done and the week is not spent.
- [ ] Record which señales came out **intrínsecas** (shape of the transaction — needs only internal data: fraccionamiento, solicitante approves their own compra, anomalous timing, price far off market) and which came out **relacionales** (who the counterparty is: proveedor recently constituted, apellido shared with the solicitante, PEP, causas judiciales).
- [ ] Note explicitly that fraccionamiento fires for both delitos — this is the evidence that señales are reusable and that the three-layer model (Eventos -> Señales -> Controles) is correct.

**Timebox is hard.** Derive 2–3 delitos properly, then build. The method is the contribution; exhaustive catalog coverage is not. The named failure mode is eight weeks of legal research with coding starting in W10.

**Thesis output:** the derivation chain chapter, written this week while the reasoning is fresh.

**Exit criterion:** a written derivation for at least two delitos, ending in a concrete list of señales with the exact input fields each one reads.

---

## Phase 2 — Domain spine and the scorer contract (W2)

Everything here exists to make the vertical slice possible. Build the minimum, not the general case.

- [ ] Model the three layers in `packages/db` (Drizzle): `evento`, `señal` (definition + fired instance), `control`, `alerta`, `caso`. RUT is the entity key for proveedor and persona.
- [ ] **D1 — the engine consumes declarative control definitions.** A control is data: which evento type it watches, which señales it composes, their weights, its thresholds, which delito it is bound to. The engine reads this structure; it does not contain per-control code. D1 is architecture and is always a MUST, independent of whether a UI ever exists to write those definitions.
- [ ] Implement the scorer against the contract: `{ score, breakdown[] }`, where each `breakdown` entry names the señal, whether it fired, its weight and its contribution to the total. **No code path may return a bare number.** Enforce it in the type signature so it cannot be bypassed later.
- [ ] Implement the threshold bucketing (probabilidad baja / media / alta) as configuration on the control definition, not constants in the engine.
- [ ] Implement **two or three señales only** — enough to make one control meaningful. Pick from the Phase 1 derivation: fraccionamiento (intrínseca), proveedor recientemente constituido (relacional, fed from a CSV column), apellido compartido con el solicitante (relacional, fed from a CSV column).
- [ ] Seed one control definition for corrupción entre particulares directly (a fixture / seed script). This is also the standing D2 fallback.

**Exit criterion:** a unit test that feeds one evento to the engine and asserts on the `breakdown[]`, not just the score.

**Thesis output:** the architecture chapter — three layers, one engine many configuraciones, why rules-based scoring is *more* defensible to an auditor than opaque ML.

---

## Phase 3 — The demo CSV as a script (W3, runs in parallel with Phase 4)

The demo CSV is not test data. It is the script of the demo and the evaluation instrument of the thesis, and it must be built deliberately.

- [ ] Design the planted narrative: a proveedor **constituido 5 días antes de la compra**; a proveedor whose **apellido is shared with the solicitante**; **tres compras justo bajo el umbral** (fraccionamiento).
- [ ] Carry enrichment **as columns** — `fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`. This is the decision that makes the relacional señales run with **zero integrations**, and it removes the named failure mode of being blocked for weeks on SII / Poder Judicial / CMF credentials.
- [ ] Bulk the file with clean, boring compras so the planted casos are not the only rows.
- [ ] Maintain a separate **ground-truth file**: which rows are planted, which delito, which señal should catch each. Never inside the CSV the system ingests.

**Exit criterion:** the CSV plus its ground truth exist and are versioned, before the ingest code that reads them.

---

## Phase 4 — The vertical slice (W3–W6)

One narrow path through every layer, in this order. Do not add a second control, a second delito or a second señal until the last box here is checked.

- [ ] **Ingest** — CSV upload in `apps/web`, parsed server-side via a tRPC procedure, rows persisted as `evento` records. CSV only. No ERP, no adapters.
- [ ] **Score** — run the seeded control definition over the ingested eventos; persist the `{ score, breakdown[] }` alongside the resulting `alerta`. The breakdown is stored, not recomputed at read time; the auditor asks about the decision as it was made.
- [ ] **Explain** — the alerta detail screen: the score, the bucket, and every señal in the breakdown with what it contributed. Beside it, the **ficha del control** rendered from the same declarative definition the engine executed — what it watches, which señales, which weights, which thresholds. One artifact, two renderings.
- [ ] **Review** — the flujo del encargado de cumplimiento: an alert queue, open an alerta, promote to `caso`. A human always makes the decision; the system never determines anything by itself.
- [ ] **Close** — **cierre con justificación**: the encargado closes with a written reason, and it is recorded. This record is the highest-value evidence in the system: alertas prove the model was watching, the cierre proves what the organization decided despite the warning.
- [ ] Wire Better-Auth so the closing action has a named actor. One role is enough for the slice.
- [ ] Rehearse the full flow yourself, on seeded data, start to finish, and time it.

**Exit criterion (the project's true midpoint):** upload the demo CSV on a clean database, and reach a closed caso with a justificación, without touching the console.

**Thesis output:** the flujo del encargado chapter, plus screenshots taken now rather than reconstructed later.

---

## Phase 5 — Evaluation instrument and the circular-evaluation countermeasure (W7)

Synthetic data with ground truth is the evaluation methodology, not a compromise — real data has no labels. But the sharpest risk in the session was named here.

**The risk:** the same person designs both the planted casos and the señales that catch them, so the evaluation proves nothing. A panelist will ask, "you built the data to match your rules."

- [ ] Implement the measurement harness: run the engine over the dataset, compare alertas against ground truth, report precisión and recall per control.
- [ ] **Countermeasure — separate the two authorships in time and in source.** Concretely, all of the following:
  - [ ] Generate a second batch of casos **derived only from the Phase 1 legal derivation** (conductas típicas taken from the law), written before looking at which señales were implemented. Some of these will be conductas the engine cannot catch — that is the point, and the misses are a finding, not a defect.
  - [ ] Include **negative controls**: rows that look suspicious on a dimension no señal reads, and rows that legitimately trip a señal (a genuinely new proveedor, a legitimate small compra). Measure the false positives; report them.
  - [ ] Have a third party — supervisor, classmate, or the panel-facing reviewer — plant a batch of casos **without being shown the señal definitions**, and score blind against it.
  - [ ] Report the two batches **separately** in the thesis. The self-authored batch demonstrates the mechanism; the independent batch is the one that carries evidential weight.
- [ ] Record the honest limitation in the thesis regardless of the numbers: synthetic data measures whether the señales detect the conductas as derived, not whether they detect real fraud.

**Thesis output:** the evaluation methodology chapter, including this countermeasure. This is what converts the proposal's named weakness ("no real data for ML") into the thesis's method.

---

## ★ DECISION POINT — D2 authoring UI (enters W8, cutoff pre-committed in Phase 0)

D1 (engine consumes declarative definitions) is already built and is unconditional. D2 (the authoring UI) is the promoted MUST: if the only way to produce a control definition is the student editing JSON, the encargado de cumplimiento is not a user and the platform claim dies.

The split exists to give a clean fallback seam. If D2 stalls, the engine is unaffected, the demo survives, and one screen is lost instead of the architecture.

---

## Phase 6 — D2, authoring sin código (W8–W10)

- [ ] Authoring form in `apps/web` over `packages/ui`: pick the delito, pick the evento type, select señales from the library, set weights, set thresholds. Persist a control definition the engine can already execute unchanged.
- [ ] Validate a definition before it is saved; a malformed control must never reach the engine.
- [ ] Render the **ficha del control** from the authored definition — free, because it is the same artifact.
- [ ] Rehearse the **killer demo move**: author a new control live, re-run the same CSV, a different caso appears. Proves the platform claim rather than asserting it.

**★ FALLBACK TRIGGER — the pre-committed cutoff date (end of W10).**
If, on that date, a control authored through the UI does not execute end to end:

- [ ] Stop D2 immediately. Do not spend W11 finishing it. The named failure mode is a half-built authoring UI that neither works nor got replaced in time.
- [ ] Seed control definitions directly (the Phase 2 fixture path, already working).
- [ ] Cut the live-authoring demo move; the demo reverts to detection + explanation + review + cierre, which is complete on its own.
- [ ] Move D2 to `trabajo futuro` and state in the thesis that D1 makes it a UI problem, not an architecture problem — this is a defensible position, not an apology.

---

## Phase 7 — Widen (W11–W13, strictly in this order, stop when time runs out)

Only after the slice runs end to end and the D2 decision is settled. Each item is independently droppable.

- [ ] Widen the señal library using the Phase 1 derivation — the remaining intrínsecas first (they need no external data): solicitante approves their own compra, anomalous timing, agregación temporal over a rolling window.
- [ ] Second control bound to **lavado de activos** over a pago / transferencia evento type. This is the demonstration that a new delito is configuration, not new code.
- [ ] Append-only evidence log and point-in-time storage of enrichment values — the auditor asks what was known on a given date, not what the source says today.
- [ ] Efectividad / non-action visibility: dismissal rates, aging alertas, controles never reviewed, overrides per person. Overrides are themselves a data stream; a meta-control over them closes the loop.
- [ ] Timing preventivo (partial): evaluate before approval rather than after, alert only — no blocking.
- [ ] Second role (partial governance): an escalation path for the case where the encargado cannot independently close an alerta about the person who signs her paycheck.

Anything not reached here stays in `trabajo futuro`. That is the plan working, not the plan failing.

---

## Phase 8 — Demo-day infrastructure (starts W9, finishes W15)

Capstone demos die on infrastructure more often than on code.

- [ ] **W9 — deploy early.** Get the deployed instance running with seeded data long before it is needed. Not the week of the demo.
- [ ] Verify the deployed instance runs the full slice on seeded data, and re-verify after every widening step in Phase 7.
- [ ] **Maintain a local fallback that runs with no network** — local SQLite, seeded database, the demo CSV on disk. Test it with wifi physically off.
- [ ] **W15 — record the video backup**, a full run of the demo, the week before demo day. Not the night before.
- [ ] Rehearse the live demo end to end at least twice against the deployed instance and once against the local fallback.

---

## Phase 9 — Thesis convergence (W14–W16)

Because each phase wrote its own chapter, this phase is assembly and defence, not writing from zero.

- [ ] Assemble: derivation chain (Phase 1), architecture (Phase 2), flujo del encargado (Phase 4), evaluation methodology and circular-evaluation countermeasure (Phase 5), `delimitación del alcance` (Phase 0), `trabajo futuro` (Phase 0 + whatever Phase 7 did not reach).
- [ ] Write the auditor-transparency argument: the same declarative control definition is executable logic, ficha del control, and thesis appendix — one artifact, three audiences.
- [ ] Prepare answers for the two questions the panel will ask: "why not ML?" (a human always decides; computers cannot be held accountable; ML is demoted to prioritization) and "did you build the data to match your rules?" (Phase 5 countermeasure, with the independent batch reported separately).

---

## Summary of marked control points

| Point | Week | Type |
|---|---|---|
| Cut line + all dates written down | W1 | Pre-commitment |
| Legal derivation timebox expires | end of W1 | Hard timebox |
| Scorer returns `{score, breakdown[]}` | W2 | Irreversible architectural decision |
| Vertical slice runs end to end | end of W6 | Gate — nothing widens before this |
| D2 authoring UI entered | W8 | ★ Decision point |
| D2 cutoff — seed definitions and move on | end of W10 | ★ Fallback trigger |
| Deployed instance live | W9 | Infrastructure gate |
| Video backup recorded | W15 | Infrastructure gate |
