---
title: "Addendum — Plataforma de apoyo al Modelo de Prevención del Delito"
status: draft
created: 2026-09-02
updated: 2026-09-02
---

# Addendum

Depth carried forward from the brainstorming session that does not belong in a two-page brief but that the PRD, the architecture and the thesis will need. Nothing here amends the scope contract.

## 1. Domain glossary

The domain model uses legal vocabulary directly — this is a deliberate ubiquitous-language decision, not a translation gap.

| Term | Meaning in the system |
|---|---|
| **Modelo de Prevención del Delito (MPD)** | The organization's crime-prevention model; its adoption and effective implementation ground the organization's position under Ley 20.393 / Ley 21.595. The thing the platform supports. |
| **Encargado de cumplimiento** | The person accountable for the MPD being effective. Primary user. |
| **Delito** | A crime defined in statute. Controles are bound to one. |
| **Evento** | One unit of ingested business activity: a `compra`, a `pago`/`transferencia`. |
| **Señal** | A reusable detector over an evento. Shared across controles. |
| **Control** | A weighted composition of señales bound to a delito, with thresholds. |
| **Alerta** | The output of a control over an evento: `{score, breakdown[]}`. |
| **Caso** | An alerta escalated into something being worked. |
| **Ficha del control** | The auditor-readable rendering of a control definition. |
| **Cierre con justificación** | Closing an alerta with a stored, attributed reason. |
| **Fraccionamiento** | Splitting a compra into pieces that each sit under the approval threshold. |
| **Proveedor** | Counterparty on a compra. Resolved by RUT. |
| **Denuncia / canal de denuncias** | Whistleblowing report and channel. Out of scope; see §6. |
| **Probabilidad baja / media / alta** | The three buckets the `0..1` score maps into via pre-configured thresholds. |

## 2. The derivation chain, worked

```
delito (ley) → conducta típica → rastro que deja → dato observable → señal → control
```

The validating instance from the session: following the chain for a bribery-adjacent risk over the proveedor axis produced a control that screens a proveedor for causas judiciales and other red flags *before* approval. That control is **debida diligencia de terceros**, a standard named MPD component, reached from first principles rather than copied from a framework. Reaching a known component by derivation validates both the chain and the engine model.

The chain is also the answer to the panel's likely question about requirements: each señal traces to an observable data trace, which traces to a conducta típica, which traces to a clause. Anything that cannot be traced that way does not get built.

## 3. Señal catalogue from the session

**Intrínsecas** — shape of the transaction; internal data only; zero integration risk.
- `fraccionamiento`: a compra split into pieces each just under the approval threshold.
- Self-approval: the solicitante approves their own compra.
- Off-market price.
- Anomalous timing: weekend, cierre de ejercicio.
- Shared bank account, address or phone between proveedor and an employee.

**Relacionales** — who the counterparty is; normally requires enrichment.
- Proveedor recently constituted (days or weeks old at the time of the compra).
- Proveedor linked to a family member of the solicitante (this one forces a people/relationship registry into the data model — effectively a *declaración de intereses* component).
- A PEP (persona expuesta políticamente) is involved.
- Proveedor has causas judiciales pending.

`fraccionamiento` fires for both *soborno y cohecho* and *lavado de activos*. This is the empirical justification for señales being a shared layer rather than per-control code.

**Carried forward, not in the Must set:** *agregación temporal* — same proveedor, many small compras, sum crossing the limit over a rolling window — as the counter-signal to deliberate under-threshold evasion.

## 4. Enrichment: one interface, N adapters

Every Chilean external source shares one shape: **give a RUT, get facts about the entity.** So it is one `enriquecedor de entidades` interface with N adapters, not N integrations — the same one-engine-many-configs pattern as the controles.

Sources identified: SII, Poder Judicial, CMF, listas PEP, Diario Oficial, ChileCompra / Mercado Público, Registro de Empresas y Sociedades, Dirección del Trabajo (multas), TDLC, Boletín Comercial, OFAC / UN sanctions lists.

Two constraints the data model must honor even while enrichment is out of scope:
- **RUT is the universal join key** — the entity-resolution key across every source.
- **Point-in-time storage** — record what the source said *when it was checked*, with a timestamp. The auditor asks what was known on a date, not what is true now.

The cut is reversible by construction: the demo CSV supplies `fecha_constitucion_proveedor`, `flag_PEP` and `causas_judiciales` as columns, the engine sees enriched entities and does not care where the enrichment came from, and a real adapter later plugs in behind the same shape without changing anything upstream.

## 5. Demo dataset and the planted narrative

The demo CSV of compras carries a planted story that exercises both señal families at once:

- A proveedor constituted **five days before** the compra (relacional, from a CSV column).
- An **apellido shared** between the proveedor and the solicitante (relacional).
- **Three compras just under the threshold** (intrínseca, `fraccionamiento`).

Because the casos are planted, the dataset has ground truth and precision/recall are actually measurable. The stated design preference is **precision over recall**: alert fatigue trains the encargado to dismiss everything, so a control that fires too often is itself a defect the system should surface.

## 6. Canal de denuncias — design already done, deliberately deferred

Recorded so the next increment does not restart from zero. The denunciante's three fears map one-to-one onto three requirements:

| Fear | Requirement |
|---|---|
| "Is this really anonymous?" | Technical anonymity guarantees — no account, no IP retention, no metadata leak, and awareness that small-team inference can deanonymize. |
| "Who reads this?" | A named recipient chain, with **recusación** routing when the designated recipient is the accused. |
| "Does anything actually happen?" | A feedback loop back to an anonymous person: a **código de seguimiento** (anonymous ticket code plus passphrase) enabling two-way communication without ever revealing identity. |

Trust here is a **functional** requirement, not UX polish: if the denunciante does not trust the channel, the people sensor emits zero data and the MPD is a *modelo de papel* however good the controles are.

## 7. Meta-control: making non-action visible

Overrides are themselves a data stream. One gerente overriding forty times is a señal, so the engine can run a control over its own usage. This is the concrete mechanism behind cluster H (efectividad): dismissal rates, aging alertas, controles never reviewed, who ignored what. It is what distinguishes an implemented MPD from a documented one, and it is a Should — valuable, but the vertical slice is demonstrable without it.

## 8. Rejected alternatives, with reasoning

- **ERP integration over CSV ingest.** Rejected. A compra paid in cash leaves no trace in any ERP, so an ERP is a partial sensor whichever one is chosen; the marginal value over CSV is far below the integration risk. Many medianas chilenas run on spreadsheets anyway. CSV is the correct call, not a compromise.
- **ML-based detection.** Rejected for this iteration and *resolved* rather than merely deferred: the axiom that computers cannot be held accountable demotes ML to prioritization, which is exactly the role the original proposal assigned it. Rules-based scoring is the more defensible evaluation story, and a ranking layer is meaningless before there is a volume of alertas to rank.
- **Building both sensors (controles + denuncias) in one semester.** Rejected — that is precisely the shape of death by breadth. The engine is the falsifiable claim; the canal is a second, largely independent product.
- **Blocking enforcement.** Rejected because it moves the system from informing a human decision to constraining one, which raises the accountability stakes past what a prototype should claim.
- **Multi-tenant.** Rejected as a productization concern rather than a thesis concern.

## 9. Access control rationale

Thresholds create a **detection shadow**: anyone who knows the threshold can hide under it. Who may see and edit threshold configuration is therefore a genuine security requirement rather than administrative hygiene. A single additional role is enough to demonstrate this, which is why cluster J appears as a Could rather than being dropped.

## 10. Open questions for the thesis

- **Independence.** Can the encargado de cumplimiento close an alerta about the person who signs her paycheck? This implies an escalation path to the directorio or comité de ética that the prototype does not implement.
- **Personal data.** The system stores personal data on employees and terceros (PEP status, judicial records). What Chilean data-protection law demands of that has not been researched and must be before any real deployment is discussed.
- **Deletion.** Who may delete or edit anything, and whether the system should permit deletion at all if the record is evidence.
- **Visibility to the subject.** Whether a person under suspicion may see their own alerta.
- **Prevention as a measurement.** If the law's point is prevention, does an alerta that never becomes a caso count as the system working — and how would that be measured?
