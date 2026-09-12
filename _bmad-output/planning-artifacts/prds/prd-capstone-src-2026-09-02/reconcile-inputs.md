# Input reconciliation — PRD vs. upstream sources

Run inline by the parent (no subagents available). Date: 2026-09-12. Question asked of each input: *what did this source carry that the RF/RNF structure silently dropped?*

## brief.md (2026-09-02)

Covered: problem framing (§1), three-layer solution (§1, §5), who it serves (§2), derivation chain as the defensible claim (§4), scope MoSCoW (§9), demo beats (§10.1), measurable outcomes (§10.2), all four honest limitations (§11), full risk table (§12), trabajo futuro incl. gestión documental as item #1 (§9.2), both carried-forward open questions (§13).

**Gaps found:**
- **Design axiom 5, "point-in-time truth"** — the brief lists it as a load-bearing axiom; the PRD had it only in `addendum.md`. An FR register has no natural home for an axiom that shapes the data model without appearing as a requirement. **Fixed:** added as guardrail §8.11.
- Axioms 1–4 (human decides, explainability is the evidence, RUT, ubiquitous language) were already present as guardrails §8.1, §8.2, §8.13, §8.12. Only axiom 5 had fallen through.

## SPEC.md + 8 companions

- **CAP-1..CAP-11:** all eleven mapped to RFs and cited inline. Verified programmatically.
- **13 constraints:** all present in §8 or as RNFs.
- **10 non-goals:** all present in §9.2 or §2.3 (incl. "not a dashboard", "not exhaustive delito coverage").
- **4 assumptions:** delitos in scope → §7; single role → RNF-06; Drizzle/SQLite + local fallback → RNF-13, RNF-14; relative week numbers → S-6.
- **8 open questions:** all resolved as S-1..S-10 (seven marked `[SPEC]`) plus RNF-03 resolving evidence-mutability by firm decision rather than assumption.

**Gaps found:** none. The PRD introduces no behaviour the SPEC does not contain; §0 states the precedence rule for the overlap.

## scope-contract.md (ratified 2026-08-29)

- MUST clusters A, C, B-core, E-core, D1/D2, K → all mapped to RF groups (§9.1 table).
- SHOULD (B-rest, H, I-partial) → §9.2 SHOULD, unchanged in tier.
- COULD (F, J-partial) → §9.2 COULD, unchanged in tier.
- WON'T ×8 → §9.2 table, each with its recorded reasoning.

**No widening.** Four items appear in the PRD that no source contains: RF-03 (all-or-nothing ingest), RF-04 (carga registrada), RNF-08 (no bulk export), RNF-09 (retention). All four are restrictions or minor additions rather than scope growth; surfaced to the author and accepted.

**Gap found:**
- **The preventive argument behind cluster I-partial.** The contract argues *"prevention, not detection, is the point of the law; warning an approver before a compra is authorized is the higher-value shape."* The PRD had listed "señales de timing preventivo" as a bare SHOULD line, dropping the argument — which is thesis material, not backlog material, because it concedes that this prototype sits on the detective half of the axis. **Fixed:** reasoning restored in §9.2.

## build-order.md

Referenced rather than absorbed: the PRD deliberately carries no schedule. Phase-to-RF mapping lives in `addendum.md` §1 so the PRD stays argument and the addendum carries coordination. D2 cutoff (Phase 6) surfaces in the PRD as RF-29 + S-6 because it is a commitment, not a schedule item.

**Gap found:** none.

## Web research (2026-09-02, 2026-09-12)

- Ley 21.719 in force 2026-12-01 → §6.4, T-8.
- Ley 21.595 in force for legal persons 2024-09-01, 200+ delitos → T-1.
- Ley 20.393 art. 3 inc. 3 vs art. 4 → T-6, T-7 (corrected a substantive error).
- CP 287 bis/ter vs 248-250 → T-1, S-11.
- Ley 19.913 art. 27 letra a) predicate list → T-4, **unresolved**, flagged for W1.

All findings are secondary-source only. The PRD says so in the §7 assumption; the thesis must contrast against the official BCN text.
