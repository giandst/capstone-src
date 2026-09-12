# Scope Contract — Plataforma de apoyo al Modelo de Prevención del Delito

**Project:** APT capstone, Ingeniería en Informática, Duoc UC
**Status:** ratified cut line, pre-committed before construction begins · amended 2026-09-12 with Phase 0 committed dates (§8)
**Date:** 2026-08-29

---

## 1. Why this boundary exists

The original APT proposal contained its own condition of viability: the project works *"siempre que se defina adecuadamente el alcance"*. That clause is not a formality. It names the exact failure this project is most exposed to, and the brainstorming session that preceded this document ended by naming it explicitly: **death by breadth** — starting the canal de denuncias, the dashboard and the ERP integration, and finishing none of them. It is the most common way a capstone dies, and it was identified by the student as the single biggest self-assessed risk.

The antidote is not discipline in the abstract. It is a cut line written down *before* building starts, so that adding anything later is a conscious amendment to a contract rather than a drift nobody noticed. That is what this document is. It has a second, convenient property: the discipline doubles as a deliverable. What stays below is the **delimitación del alcance**; what was cut becomes **trabajo futuro**. Both are standard thesis sections, so the ideas that did not survive have a legitimate academic home instead of being waste.

The convergence step clustered every idea generated into eleven groups (A motor, B evidencia, C flujo del encargado, D autoría sin código, E ingesta, F enriquecimiento, G denuncias, H efectividad, I preventivos, J gobernanza, K metodología) and sorted them by MoSCoW. What follows is that ratified sort, with the reasoning attached to every line.

---

## 2. MUST — the vertical slice

These items constitute one narrow path through every layer — ingest, score, explain, review, close. The build order is **slice first, widen later**: a complete vertical slice, not a complete system.

**A. El motor de controles.** The One Feature Only exercise reduced everything to this: the engine is the product, and every other module was decoration around it. It is built on three layers — Eventos → señales (reusable detectors) → controles (weighted compositions bound to a delito). *Architectural constraint, non-negotiable:* the scorer returns `{score, breakdown[]}`, never a bare number. Explainability must be built into scoring from day one; retrofitting it later means rewriting every señal.

**C. Flujo del encargado de cumplimiento.** Review, dismiss, escalate, and close with a documented reason. Included because of the design axiom that a human always makes the decision — computers cannot be held accountable — which also matches the proposal's own boundary that the system is not a mechanism of legal determination. The cierre con justificación is the highest-value evidence the system produces: alerts prove the model was watching; overrides prove what the organization *decided* despite a warning, which is where liability actually lives.

**B-core. Explicabilidad y ficha del control.** The auditor asks "why 0.87?", so every alert must show which señales fired and what each contributed. Rules-based scoring is *more* defensible than opaque ML here — this turns the proposal's named weakness (no real data for ML) into a design strength.

**E-core. Ingesta por CSV únicamente.** No ERP integration. This is the correct call, not a compromise: any ERP is a partial sensor anyway — a compra paid in cash leaves no trace in it at all — so betting the semester on someone else's API buys less than it appears to. Many medianas chilenas run on spreadsheets regardless.

**K. Metodología.** The derivation chain (delito en la ley → conducta típica → rastro que deja → dato observable → señal → control) is the project's intellectual contribution and the concrete expression of the levantamiento y análisis de requerimientos competency. Paired with a synthetic dataset carrying planted casos: because the data has ground truth, precision and recall can actually be measured — real data has no labels. *Legal research is timeboxed:* derive two or three delitos properly, then build. The method is the contribution; exhaustive catalog coverage is not.

### 2.1 Late ratified change: D promoted from Should to Must

**D. Autoría sin código.** Originally sorted as a Should. Promoted to **Must** on the student's own reasoning: *it is part of the flow*. If the only way to produce a control definition is the student editing JSON by hand, then the encargado de cumplimiento is not a user of the system, and the platform claim collapses into "a script with a UI".

To keep that promotion from becoming a breadth risk, D is split at a deliberate fallback seam:

- **D1 — the engine consumes declarative control definitions.** This is architecture, and it is always a Must. It is what makes adding a new delito a matter of configuration rather than new code, and it is what makes the ficha del control almost free: the same definition renders twice, as executable logic and as an auditor-readable document.
- **D2 — the authoring UI.** Now also a Must. It is what proves the platform claim in front of the panel: author a new control live, re-run the same CSV, a different caso appears.

**The seam:** if D2 stalls, control definitions are seeded directly into the system. The engine is unaffected, the demo survives, and what is lost is **one screen, not the architecture**. This is why the split exists and why the promotion was safe to accept.

**A cutoff date must be committed to.** The failure mode this guards against is a half-built authoring UI that neither works nor got replaced by seeded definitions in time. The seam is only protective if the decision to fall back is made on a date fixed in advance, not on the optimism of the week before the demo.

---

## 3. SHOULD — only after the vertical slice runs end to end

The precondition is literal. Nothing here starts until ingest → score → explain → review → close works on the real demo path.

- **B-rest. Append-only log and point-in-time storage.** Evidence requires knowing what the system knew on 14 March, not what the source says today. A Should rather than a Must because the slice is demonstrable without it.
- **H. Efectividad / visibilidad de la no-acción.** Dismissal rates, aging alerts, controles never reviewed, who ignored what. This is how implementación efectiva is distinguished from a modelo de papel, and the engine can run a control over its own usage — one gerente overriding forty times is itself a señal.
- **I-partial. Señales de timing preventivo.** Prevention, not detection, is the point of the law; warning an approver before a compra is authorized is the higher-value shape. Only the timing signals are in scope here — the enforcement half is cut below.

---

## 4. COULD — if the semester is generous

- **F. Interfaz de enriquecedor de entidades + one real adapter.** Every Chilean external source shares one shape: give a RUT, get facts about the entity. So it is one interface with N adapters, not N integrations. One adapter implemented for real would prove the pattern; the rest stay stubs.
- **J-partial. A second role.** Access control matters for a real reason: thresholds create a detection shadow, and anyone who knows the threshold hides under it, so who may see threshold configuration is a genuine requirement. A single additional role is enough to demonstrate it.

---

## 5. WON'T THIS TIME

Cut deliberately, with reasoning recorded in §6: the canal de denuncias in its entirety, real ERP integration, multi-source enrichment, monitoreo continuo, blocking enforcement, ML prioritization, and multi-tenant support.

---

## 6. Trabajo futuro

Each item below matters. None was cut for being weak; each was cut because it did not fit inside one semester alongside a working motor de controles.

**1. Gestión documental — "she uploads documents".** The natural next increment, and first on this list. It was the very first idea of the session and it was cut in convergence, but it is the piece that would make the derivation chain *visible* inside the product: the política that defines a control, stored next to the control it justifies. Cut because it adds a whole storage-and-retrieval surface that the vertical slice can demonstrate without.

**2. Canal de denuncias.** This cut requires the most care, because it is the one most easily mistaken for an oversight. It is not.

The session established a structural fact about the product: the controles are a **data sensor**, and a data sensor is blind to anything that leaves no data trace — cash, favours, rigged bidding. The canal de denuncias is the **people sensor** that covers precisely that blind spot. They are two complementary sensors of the same model, not two unrelated modules. The design work is already done and is recorded here so the next increment does not start from zero: the denunciante's three fears (is this anonymous? who reads it? does anything actually happen?) map one-to-one onto three requirements — technical anonymity guarantees, a named recipient chain with recusación routing when the recipient is the accused, and a feedback loop back to an anonymous person, solvable with a código de seguimiento (anonymous ticket code plus passphrase) that permits two-way communication without ever revealing identity. Trust here is a *functional* requirement, not UX polish: if the denunciante does not trust the channel, the people sensor emits zero data and the MPD is a modelo de papel no matter how good the controles are.

It is cut because building both sensors in one semester is exactly the shape of death by breadth, and because the engine is the falsifiable claim of this thesis while the canal is a second, largely independent product. **The blind spot is therefore acknowledged and named, not hidden.** A thesis that states which crimes its controles structurally cannot see is more defensible than one that implies full coverage.

**3. Integración real con ERP.** The honest integration story eventually, but the cash-payment argument shows the ERP is a partial sensor regardless of which one is chosen, so the marginal value over CSV ingest is far lower than the integration risk.

**4. Enriquecimiento multi-fuente.** Listas PEP, Diario Oficial, CMF, SII, Poder Judicial, ChileCompra, Registro de Empresas y Sociedades, Dirección del Trabajo, TDLC, Boletín Comercial, sanction lists. RUT is the universal join key across all of them, so the model is ready for it. Cut because of a specific named failure mode: weeks blocked on credentials, scraping, or legal access that never materialised — being blocked on someone else's API is not a risk a semester can absorb.

**5. Monitoreo continuo.** A proveedor clean at onboarding can be sanctioned later, so an evento can originate *externally* — a source moved — and the existing proveedor base should be re-evaluated. Genuinely valuable, and cut as a direct dependency of item 4: continuous monitoring of external sources presupposes external sources.

**6. Enforcement bloqueante.** Blocking a compra, or requiring a second approval, is the unexplored half of the preventivo axis and the point where the system would stop merely advising. Cut because it moves the system from informing a human decision to constraining one, which raises the accountability stakes well past what a prototype should claim — and the design axiom is that a human always decides.

**7. Priorización con ML.** Resolved rather than merely deferred: the axiom that computers cannot be held accountable demotes ML from decision-maker to prioritiser, which is precisely the role the original proposal assigned it. It is cut for this iteration because rules-based scoring is the more defensible evaluation story, and because the ranking layer is meaningless until there is a volume of alerts to rank.

**8. Multi-tenant.** Serving several organisations from one instance is a productisation concern, not a thesis concern. Cut for that reason alone.

**Also carried forward as open questions the thesis should acknowledge:** independence — whether the encargado de cumplimiento can close an alert about the person who signs her paycheck, implying an escalation path to the directorio or comité de ética; agregación temporal as a counter-signal to under-threshold evasion; debida diligencia de terceros as a full module; and the circular-evaluation risk, since if the same person designs both the planted casos and the señales that catch them, the evaluation proves less than it appears to. That last one must be answered in the document rather than in code.

---

## 7. How the enrichment cut was made painless

Cutting external integrations would ordinarily also cut the señales relacionales — proveedor recently constituted, proveedor linked to a family member of the person making the compra, PEP involvement, pending judicial cases — which would have left the demo with only señales intrínsecas and a visibly narrower story.

It does not, because of one design decision: **the demo CSV carries enrichment as columns.** Fields such as `fecha_constitucion_proveedor`, `flag_PEP` and `causas_judiciales` arrive alongside the compras themselves. The engine sees enriched entities; it does not care whether the enrichment came from an adapter or a column.

The consequences are worth stating plainly, because they are what makes this cut costless rather than merely tolerable:

- Both families of señales — relacional and intrínseca — run in the prototype, with **zero integrations**.
- The señal library, the weighting model and the ficha del control are exercised at full breadth, so the engine abstraction is genuinely demonstrated rather than partially demonstrated.
- The F adapter interface, if it is ever built, plugs in behind the same shape and changes nothing upstream. The cut is reversible by construction.
- The planted narrative in the demo CSV — a proveedor constituted five days before the compra, an apellido shared with the solicitante, three compras just under the threshold — depends on exactly these columns, so the ground-truth evaluation methodology survives the cut intact.

This is the general pattern the scope contract relies on: cut the *integration*, keep the *capability*, and place the seam where reversing the decision later costs nothing already built.

---

## 8. Committed dates — Phase 0

**Amendment date:** 2026-09-12. This section closes Phase 0 of `build-order.md`. The cut line in §2–§5 is unchanged; these are the dates that make the D1/D2 seam and the demo-day mitigations real rather than notional.

**Semester anchor.** W1 = Monday 2026-08-10, confirmed against the four graded milestones, which all fall on the Saturday closing weeks 4, 10, 15 and 17.

| Graded milestone | Date | Week | Weight |
|---|---|---|---|
| Sumativa Fase 1 — Definición del Proyecto | sábado 2026-09-05 | W4 | 20% |
| Sumativa Fase 2 — Informe de Avance | sábado 2026-10-17 | W10 | 20% |
| Sumativa Fase 2 — Informe Final | sábado 2026-11-21 | W15 | 30% |
| Sumativa Fase 3 — Presentación a comisión | sábado 2026-12-05 | W17 | 30% |

### The four commitments

| # | Commitment | Date | Why this date |
|---|---|---|---|
| 1 | **Skeleton deployed** | viernes 2026-10-02 (W8) | Deploy the *empty* app, before there is a domain to demo. Infrastructure gets solved two weeks before it is needed, and the Informe de Avance can carry a live URL. |
| 2 | **D2 cutoff** | viernes 2026-11-06 (W13) | If a control authored through the UI does not run end to end by this date, D2 stops, definitions are seeded via the D1 path, and D2 moves to trabajo futuro. W14 exists as the fallback week. |
| 3 | **Code freeze** | sábado 2026-11-21 (W15) | Coincides with the Informe Final. After this date the work is document and defence, not features. |
| 4 | **Video backup recorded** | viernes 2026-11-27 (W16) | Recorded from the frozen build, in the gap between the Informe Final and the defence. |

### The binding constraint

**The vertical slice — `ingesta → puntuación → explicación → revisión → cierre` — must run end to end by sábado 2026-10-17**, because the Informe de Avance is worth 20% and an avance with nothing demonstrable is an expensive one. Five weeks from this amendment, one of them cut short by Fiestas Patrias (18–19 September, W6).

This supersedes the "slice first, widen later" rule's *timing*, not its content: the rule still holds, it now has a date.

### Schedule

| Week | Dates | Phase | Milestone |
|---|---|---|---|
| W5 | 07–13 sep | Phase 0 + start Phase 1 | |
| W6 | 14–20 sep | Phase 1 — legal derivation *(4 working days)* | |
| W7 | 21–27 sep | Phase 2 — domain spine + scorer contract | |
| W8 | 28 sep – 04 oct | Phase 3 — demo CSV | skeleton deployed 02 |
| W9 | 05–11 oct | Phase 4 — vertical slice | |
| W10 | 12–18 oct | Phase 4 completes | **Informe de Avance, 17** |
| W11 | 19–25 oct | Phase 5 — evaluation instrument | |
| W12–W13 | 26 oct – 08 nov | Phase 6 — D2 | **D2 cutoff, 06 nov** |
| W14 | 09–15 nov | Phase 7 — widen + buffer | |
| W15 | 16–22 nov | Phase 9 — thesis convergence | **Informe Final, 21** |
| W16 | 23–29 nov | Defence preparation | video, 27 |
| W17 | 30 nov – 06 dic | | **Presentación, 05** |

### Compression, stated explicitly

`build-order.md` assumes ~16 build weeks. The development window is W5–W15, **eleven weeks**. Four weeks were absorbed, deliberately and here rather than silently in November:

- **Phase 7 (widen): 3 weeks → 1.** Already marked *stop when time runs out*; the cheapest correct cut.
- **Phase 6 (D2): 3 weeks → 2.** This one costs something real — D2 is the beat that turns *plataforma* from claim into demonstration, and it now has less air. Which is precisely why commitment #2 above is a date and not an intention.

Not compressed: **Phase 1** (the derivation is the intellectual contribution) and **Phase 4** (without the slice there is no demo, and now no Informe de Avance either).

### Available slack

Phase 2 does not depend on the derivation being finished — the scorer contract is an architectural decision, not a legal one. If Phase 1 overruns W6, run W7 in parallel with the remainder of the derivation rather than pushing everything back. This is the only real slack before 17 October.

### One consequence worth naming

The Informe Final (30%) is a **document**, due the same day the code freezes, and it is worth as much as the presentation. The governing rule *"thesis written alongside the code"* stops being advice at this amendment and becomes 30% of the grade with a fixed date.
