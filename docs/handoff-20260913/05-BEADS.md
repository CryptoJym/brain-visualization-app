# 05 — Verified native Beads work board

**All nine successor tasks are registered in the established Beads tracker.** Native readback verified their titles, open states, acceptance, parent links and ten blocking edges on 2026-09-13. Exact receipt: `beads-sync.json`. The handoff task is `eco-cortex-handoff-20260913`. The existing tracker is `/Users/utlyze/.beads`, Dolt server database `eco` at loopback port 13306; this handoff did not initialize another database.

| Alias | Actual native ID | Work | Depends on |
|---|---|---|---|
| NG01 | `eco-eib7d3` | Reconcile graph checkpoint onto current live source | none |
| NG02 | `eco-yn5ip8` | Claim-level source/cohort/measurement provenance | none |
| NG03 | `eco-hb5qwn` | Ontology, stable IDs and typed edges | NG01, NG02 |
| NG04 | `eco-g272fw` | Replace uncalibrated confidence semantics | NG01, NG02 |
| NG05 | `eco-r3nv7o` | Bounded inference and explanation contracts | NG03, NG04 |
| NG06 | `eco-kkn8hg` | Accessible UI/report adapter and persistence compatibility | NG05 |
| NG07 | `eco-dfbod1` | Independent review, regression and guarded release | NG06 |
| OP01 | `eco-763a8h` | Optional public account/entitlement design | none; outside graph critical path |
| OP02 | `eco-bzuidj` | Consented longitudinal/calibration study design | NG02, NG04 |

NG01–NG07 are priority 1 children of `eco-cq76kh`; optional items are priority 3 children of `eco-a318wk`. Roles, affected paths, descriptions and acceptance are in the individual `tasks/*.md` files and `workboard.json`. Roles are responsibilities, not claims that agents are already running. Claim work before editing shared paths. The graph has no dependency cycles.

## Recovery and schema correction
The earlier batch accepted the nodes/edges but ignored explicit `id`, `status` and `acceptance_criteria` fields. No duplicate batch was submitted. This continuation retained the generated IDs above and added acceptance with supported native `bd update --acceptance`, then checked all fields and dependencies. `beads-plan-original-submitted.json` preserves that original input. `beads-plan.json` is a corrected reference format with acceptance embedded in descriptions. **Do not run either creation plan again against this tracker.** The tasks already exist.

`create-handoff-board.py` now refuses regeneration once the sync receipt exists. `reconcile-handoff-board.py` validates an exported native readback against the known task IDs/dependencies. The JSON/Markdown board is a portable snapshot, not a competing live database. Use `BEADS_DIR=/Users/utlyze/.beads bd show <id> --json` and native ready/dependency commands for current status.

## Tracker synchronization boundary
Some native operations were very slow earlier; the batch eventually succeeded. A timeout is not proof that a write failed. The tracker warns that its Dolt remote is not configured. GitHub source pushes do not synchronize the shared tracker between machines. This handoff preserves the task snapshot and actual IDs without reconfiguring that shared service. Next agents should inspect the current records before any update.

Native parent/release status at readback: `eco-cq76kh` open; `eco-a318wk` in progress; `eco-iln18c` closed; `eco-ii5x99` closed; `eco-fxdv65` open. The last item has a delivered xAI-pilot completion receipt but is still open in the tracker; do not automatically close it without checking its intended remaining scope. Only the handoff task closes when source, docs and recovery archive are fully verified. All graph/future work remains open.
