# Evaluation methodology and the circular-evaluation countermeasure

## Synthetic data is the instrument, not a compromise

Planted casos give **ground truth**, so precisión and recall can actually be measured. Real data has no labels. This inverts the original proposal's named weakness — *no real data to train ML on* — into the evaluation methodology of the thesis.

It also reinforces the choice of rules-based scoring: an auditor asking "why 0.87?" can be answered by a breakdown, and cannot be answered by an opaque model.

## The harness (CAP-11)

- Run the engine over the dataset.
- Compare the alertas produced against the ground truth held **outside** the ingested CSV (see `demo-dataset.md`).
- Report **precisión and recall per control**.

Per control, not in aggregate — the unit of the claim is a control, because a control is what the derivation chain produces.

## The sharpest risk: circular evaluation

If the same person designs both the planted casos and the señales that catch them, the evaluation proves nothing. The panel question is: *"you built the data to match your rules."* This is the counter-risk to the synthetic-data reframe and it must be answered explicitly, in the document, not in code.

## Countermeasure — separate the two authorships in time and in source

All four of the following:

1. **A second batch derived only from the legal derivation.** Casos written from the *conductas típicas* taken from the law, **before** looking at which señales were implemented. Some will be conductas the engine cannot catch. That is the point: the misses are a finding, not a defect.
2. **Negative controls.** Rows that look suspicious on a dimension no señal reads, and rows that legitimately trip a señal — a genuinely new proveedor, a legitimately small compra. Measure the false positives and report them.
3. **A blind third-party batch.** A supervisor, classmate or panel-facing reviewer plants casos **without being shown the señal definitions**; score blind against it.
4. **Report the batches separately.** The self-authored batch demonstrates the mechanism. The independent batch is the one that carries evidential weight. Merging them destroys the distinction that makes the evaluation credible.

## The honest limitation, stated regardless of the numbers

Synthetic data measures whether the señales detect the conductas **as derived**. It does not measure whether they detect real fraud. This limitation goes in the thesis whatever the precisión and recall turn out to be — as does the structural blind spot in `senales-catalog.md`, the conductas that leave no data trace at all.

## Design stance the numbers are read against

**Precision over recall.** A control with high recall and poor precision is not a safer system; it is a system whose alerts get dismissed reflexively. A control that fires too often is reported as a defect of that control.
