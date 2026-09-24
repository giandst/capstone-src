# The demo dataset

The demo CSV is **not test data**. It is the script of the demo and the evaluation instrument of the thesis, and it is built deliberately — and built *before* the ingest code that reads it.

## The planted narrative

Three plants, chosen so that the señales of the slice each have something to find:

1. A **proveedor constituido 5 días antes de la compra**.
2. A proveedor whose **apellido is shared with the solicitante**.
3. **Tres compras justo bajo el umbral** — fraccionamiento.
4. **Una compra adjudicada con un solo oferente** — `n_oferentes = 1` on an award large enough that competing quotes would be expected.

The file is then bulked with clean, boring compras, so the planted casos are not the only rows and precision is measurable rather than trivially perfect.

## Enrichment travels as columns

This is the decision that makes cutting external integrations costless. Alongside the compra fields, each row carries:

- `fecha_constitucion_proveedor`
- `flag_PEP`
- `causas_judiciales`
- `n_oferentes` — how many bidders the award had. Unlike the three above this is **not** enrichment: it is procurement-process data the organisation already holds, added 2026-09-19 after the derivation showed no señal read the typical element of CP art. 287 bis (`derivacion-delitos.md` §1.2).

Consequences, which are the reason the cut is costless rather than merely tolerable:

- Both families of señales — **intrínsecas and relacionales** — run in the prototype with **zero integrations**.
- The señal library, the weighting model and the ficha del control are exercised at full breadth, so the engine abstraction is genuinely demonstrated rather than partially demonstrated.
- The `enriquecedor de entidades` interface, if ever built, plugs in behind the same shape and changes nothing upstream.
- The ground-truth evaluation methodology survives the cut intact, because the planted narrative depends on exactly these columns.

The engine sees enriched entities. It does not care whether the enrichment came from an adapter or a column.

## Ground truth lives outside the CSV

A **separate, versioned ground-truth file** records: which rows are planted, which delito each belongs to, and which señal should catch each one.

**Never inside the CSV the system ingests.** If the labels are ingestible, the evaluation is contaminated.

## Second dataset

`evaluation-methodology.md` requires a second batch derived only from the legal derivation, plus negative controls, plus a blind third-party batch. Those are separate files under the same discipline — planted rows in the ingestible CSV, labels held outside it, batches never merged.

## The demo beat

Uploading the CSV and getting a detection is not the beat that lands. **Explanation** is: click the alerta, see which señales fired and what each contributed, and the ficha del control behind it. The killer move on top of that is authoring a **new** control live, without touching code, re-running the same CSV, and a different caso appearing — which proves the platform claim instead of asserting it.

## Exit criterion

The CSV and its ground-truth file exist and are versioned **before** the ingest code that reads them.
