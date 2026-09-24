# Catálogo de señales

A señal is a reusable detector shared across controles. Two families, split by what they read — and that split is what made cutting external integrations costless.

- **Intrínsecas** — the shape of the transaction itself. Internal data only, zero integration risk.
- **Relacionales** — who the counterparty is. Normally external data; in this iteration fed from **CSV columns** (see `demo-dataset.md`), so both families run in the prototype with zero integrations and the señal library is exercised at full breadth.

## Slice scope

Phase 2 implements **two or three señales only** — enough to make one control meaningful. The recommended starting set is marked *slice* below. The remainder is Phase 7 widening, taken only after `ingest → score → explain → review → close` runs end to end.

## Intrínsecas

| Señal | Reads | Delito(s) | Tier |
|---|---|---|---|
| `adjudicación sin competencia` | `n_oferentes` on the compra — the award had a single bidder | corrupción entre particulares | **slice** |
| `fraccionamiento` | several compras to the same proveedor each just under the approval threshold | corrupción entre particulares · lavado de activos | **slice** |
| solicitante approves their own compra | approver identity vs. solicitante identity | corrupción entre particulares | widen |
| precio muy fuera de mercado | compra amount vs. a reference | corrupción entre particulares | widen |
| timing anómalo | date/time of the compra (weekend, cierre de ejercicio) | corrupción entre particulares · lavado de activos | widen |
| proveedor shares bank account, address or phone with an employee | counterparty contact fields vs. employee records | corrupción entre particulares | widen |
| agregación temporal | rolling-window sum over the same proveedor crossing the limit | corrupción entre particulares | widen |

`adjudicación sin competencia` is the only señal in this catalog that reads the **typical element** of CP art. 287 bis — favouring the contracting of *one oferente over another*. Every other señal bound to that delito reads motive or enabling circumstance, not the conduct the statute describes. Derived 2026-09-19; see `derivacion-delitos.md` §1.2.

`fraccionamiento` is the load-bearing one: it fires for **both** delitos in scope, which is the concrete evidence that señales are a layer rather than per-control code.

`agregación temporal` exists specifically as the counter-signal to under-threshold evasion — the detection shadow a published threshold creates.

## Relacionales

| Señal | Reads (CSV column in this iteration) | Delito(s) | Tier |
|---|---|---|---|
| proveedor recientemente constituido | `fecha_constitucion_proveedor` vs. compra date | corrupción entre particulares | **slice** |
| apellido compartido con el solicitante | proveedor name vs. solicitante name | corrupción entre particulares | **slice** |
| PEP involucrado | `flag_PEP` | corrupción entre particulares · lavado de activos | widen |
| causas judiciales pendientes | `causas_judiciales` | corrupción entre particulares | widen |

The composition *proveedor recientemente constituido + causas judiciales + PEP*, screened before approval, **is debida diligencia de terceros** — a standard, named MPD component reached from first principles through the derivation chain. That arrival validates both the chain and the engine model.

## Structural blind spot

Señales read data. Anything that leaves no data trace — cash, favours, rigged bidding — is invisible to every señal in this catalog, no matter how many are added. That blind spot belongs to the **canal de denuncias** (the people sensor), which is out of scope. Stating which conductas the controles structurally cannot see is more defensible than implying full coverage.

## Design stance

**Precision over recall.** A señal that fires too often is a defect, not a safety margin: alert fatigue trains the encargado to dismiss everything, and a system trained to be dismissed is a modelo de papel with better graphics.
