# Glossary — ubiquitous language

The domain model uses legal vocabulary directly. These terms stay Spanish in the Drizzle schema, the tRPC procedures and the UI; the surrounding code, comments and commits are English.

| Term | Meaning in this system |
|---|---|
| **MPD** (Modelo de Prevención del Delito) | The crime-prevention model an organization must operate under Ley 20.393 and Ley 21.595. The platform supports it; it does not constitute it. |
| **delito** | A specific offence in the law that a control is bound to. In scope: *corrupción entre particulares* (Código Penal art. 287 bis / 287 ter) and *lavado de activos* (Ley 19.913 art. 27). |
| **evento** | One unit of ingested business activity — a `compra`, a `pago`/`transferencia`. A different delito means a different evento type, not different machinery. |
| **señal** | A reusable detector over an evento (and its related entities) that either fires or does not. Shared across controles; never owned by one. Two families: **intrínseca** and **relacional**. |
| **señal intrínseca** | Reads the shape of the transaction itself, from internal data only — `fraccionamiento`, self-approval, off-market price, anomalous timing. |
| **señal relacional** | Reads who the counterparty is — proveedor recently constituted, kinship with the solicitante, PEP, causas judiciales. In this iteration fed from CSV columns, not from external sources. |
| **control** | A weighted composition of señales bound to one delito and one evento type, with its own thresholds. A declarative definition consumed as data, not code. |
| **ficha del control** | The auditor-readable rendering of a control definition: what it watches, which señales, which weights, which thresholds. Same artifact as the executable logic. |
| **score** | A number `0..1` produced by a control over one evento, always accompanied by its `breakdown[]`. |
| **breakdown** | The per-señal record of how a score was reached: the señal, whether it fired, its weight, its contribution. Persisted with the alerta. |
| **probabilidad baja / media / alta** | The band a score falls into, decided by thresholds configured on the control definition. |
| **alerta** | The record produced when a control scores an evento above its alerting threshold. Proves the model was watching. |
| **caso** | An alerta a human promoted for investigation. |
| **cierre con justificación** | Closing a caso with a written reason, attributed and timestamped. The highest-value evidence in the system: alertas prove the model was watching, the cierre proves what the organization decided despite the warning. |
| **encargado de cumplimiento** | The compliance officer. The system's primary user; the person who always makes the decision. |
| **solicitante** | The person inside the organization who requested or approved a compra. |
| **proveedor** | A counterparty entity, keyed by RUT. |
| **RUT** | Rol Único Tributario — the Chilean tax identifier. The universal entity-resolution join key across proveedor and persona. |
| **fraccionamiento** | Splitting a compra into pieces each just under an approval threshold. Fires for both delitos in scope — the evidence that señales are a layer, not per-control code. |
| **PEP** | Persona Expuesta Políticamente. Arrives as the `flag_PEP` column. |
| **debida diligencia de terceros** | The standard MPD component of screening counterparties before approval; arrived at from first principles via the derivation chain. |
| **modelo de papel** | A compliance model that exists on paper and does nothing. The failure the product exists to prevent. |
| **delimitación del alcance** / **trabajo futuro** | Thesis sections that the scope contract's MUST tier and WON'T list respectively become. |
| **canal de denuncias** | The whistleblowing channel — the *people sensor*. Out of scope this iteration; the named blind spot of the data sensor. |
