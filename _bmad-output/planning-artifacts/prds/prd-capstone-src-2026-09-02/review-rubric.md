# PRD Quality Review — Plataforma de apoyo al MPD

Run inline by the parent (no subagents available this session). Rubric: `bmad-prd/assets/prd-validation-checklist.md`. Date: 2026-09-12.

## Overall verdict

The PRD holds up. It has a real thesis (§4, the derivation chain), its requirements visibly descend from that thesis rather than sitting beside it, and its omissions are argued rather than hidden. The main risk is not in the document but under it: the legal derivation the whole §7 matrix depends on has not been executed yet, and the PRD is honest about that rather than papering over it — which is the right call but leaves the document's central claim provisional until W1. Eight mechanical and substantive defects were found and fixed during this pass.

## 1. Decision-readiness — strong

Decisions appear as decisions, not considerations. §8 states thirteen guardrails as constraints on the build with the reasoning attached to each; §9.2 tabulates every cut with its argument, so a reader who disagrees can find the reason and attack it. §13 contains three genuinely open questions, one flagged explicitly as blocking — not rhetorical questions with the answer in the next clause.

The document does not smooth to neutral. §11.1 concedes that the evaluation "prueba menos de lo que aparenta"; §6.6 RNF-12 refuses to state a throughput number and says why refusing is more honest than inventing one. Both are places where a weaker PRD would have hedged.

### Findings
- **low** Counter-metric placement (§10.2) — SM-C2 counterbalances SM-2, but SM-2 is itself the falsifiable form of the platform claim. The tension is real and correctly named; no fix needed, noted so a reviewer does not mistake it for an error.

## 2. Substance over theater — strong

No persona theater: four actors in §2.1, each with a distinct relationship to the system, and the auditor — the one most at risk of being decorative — was upgraded mid-run from narrative device to statutory requirement (§7 T-7, Ley 20.393 art. 4 as reformed by Ley 21.595). Two named protagonists across four UJs, which is restraint rather than furniture.

No NFR theater. RNF-12 declines a scale target with a stated reason. RNF-07 is a product-specific decision (synthetic data only) rather than boilerplate about security. RNF-01 encodes explainability in a type signature, which is the opposite of an adjective.

No innovation theater: §11 contains eight declared limitations including "no market evidence" and "thin user research base."

### Findings
- **medium** *(fixed)* The brief's fifth design axiom — point-in-time truth — existed only in `addendum.md`, invisible in the PRD body despite shaping the data model. Added as guardrail §8.11.

## 3. Strategic coherence — strong

The PRD has a thesis and bets on it. §4 states the method; §7 renders it verifiable; §5 descends from it; SM-2 is its falsifiable form ("adding a delito requires no engine change"). The features are not a backlog: the vertical-slice gate (§8.7) makes ordering an argument rather than a preference.

Counter-metrics are present and load-bearing — SM-C1 (alert volume) is the one that protects the *precisión sobre recall* stance from being gamed.

### Findings
- none.

## 4. Done-ness clarity — adequate → strong after fixes

31 of 31 RFs and 15 of 15 RNFs now carry verification criteria. No adjective-only acceptance survived the scan (`razonable`, `amigable`, `correctamente`, `eficiente` return zero hits).

### Findings
- **high** *(fixed)* RF-20 (Revisión de una alerta) had no `Consecuencias verificables` block — the only FR in the document without one. Added two, including the non-obvious one: re-opening an alerta appends a record rather than overwriting.
- **medium** *(fixed)* RNF-13 (sustrato tecnológico) had no verification line. Added.
- **medium** *(open, by design)* RF-29 (fecha de corte de D2) is a project commitment, not a system behaviour — it is an FR that no code satisfies. Kept as an RF deliberately: it is the only place the D1/D2 seam becomes auditable, and burying it in §12 Riesgos would let it be forgotten. Flagged here so a reviewer does not read it as a category error.

## 5. Scope honesty — strong

Omissions are explicit and argued. §9.2 carries all eight WON'Ts with reasoning; §11 declares eight limitations including the two most damaging to the project (circular evaluation, structural blind spot). Eleven assumptions are tagged inline and indexed in §14, seven of them marked `[SPEC]` because they close questions the technical contract left open.

Scope-contract check: the PRD does **not** widen `scope-contract.md`. Every MUST cluster maps to RFs; SHOULDs stay SHOULD; COULDs stay COULD; all eight WON'Ts are present. Four items were introduced that no source document contains — RF-03 (all-or-nothing ingest), RF-04 (carga registrada), RNF-08 (no export), RNF-09 (retención) — all reviewed and accepted by the author.

Open-items density: 11 assumptions + 3 open questions against a thesis-stakes PRD whose central derivation is scheduled for W1. Proportionate.

### Findings
- **medium** *(fixed)* S-11 (the 287 bis / 248-250 fork) existed only as an index row with no inline anchor, breaking the assumptions-index roundtrip. Added inline in §7.
- **medium** *(fixed)* The §4 assumption about the derivation's status was stale after the legal-verification pass — it still claimed the norms were unverified while §7 said the opposite. Aligned.

## 6. Downstream usability — adequate *(and deliberately so)*

This PRD is **not** chain-top. `SPEC.md` is the build contract and already feeds `bmad-create-epics-and-stories`; this document feeds the thesis. §0 states the precedence rule explicitly (SPEC governs implementation, PRD governs argumentation), which is what keeps two documents describing the same system from drifting into contradiction.

Within that role: glossary present and used verbatim, IDs contiguous and unique, every CAP-1..CAP-11 referenced at least once, no unresolved cross-references.

### Findings
- **low** §5.6 heading reads "Flujo del encargado" while the glossary term is "encargado de cumplimiento". Matches the SPEC companion filename; left as-is.

## 7. Shape fit — adequate

The product is a single-operator internal tool wearing a regulatory concern. The rubric says regulatory shape makes constraint traceability non-negotiable (§7 delivers it) and can make UJs irrelevant. Four UJs for one operator role is at the upper bound of what this shape justifies.

They earn their place, narrowly: UJ-3 (authoring) is the beat that converts the platform claim into a demonstration and exists in no other section; UJ-4 exercises the auditor path, which §7 T-7 has since shown to be a statutory requirement. UJ-1 and UJ-2 are one continuous narrative deliberately split at the promote-to-caso boundary.

### Findings
- **low** If the document needs shortening for a page budget, UJ-1 and UJ-2 merge cleanly into one narrative. No other section compresses without losing argument.

## Mechanical notes

| Check | Result |
|---|---|
| RF ID continuity | RF-01..RF-31, contiguous, unique |
| RNF ID continuity | RNF-01..RNF-15, contiguous, unique |
| UJ / SM IDs | UJ-1..UJ-4; SM-1..SM-5 + SM-C1, SM-C2 |
| Trazabilidad row IDs | **was** T-1..T-6, T-8, T-7 — *fixed*, now ascending T-1..T-8 |
| Assumptions roundtrip | **was** 11 inline vs 11 index with S-11 unanchored — *fixed* |
| CAP cross-references | CAP-1..CAP-11 all referenced; none dangling |
| Glossary drift | none detected |
| Adjective-only acceptance | zero hits |
