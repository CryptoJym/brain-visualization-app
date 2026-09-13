# Neurograph successor — resumed on Studio, baseline reconciled

Work item: `eco-eib7d3` (NG01). Scope completed: bring the preserved graph checkpoint onto the latest verified Cortex Compass product without changing the application or enabling the provisional graph.

Working copy: `/Users/utlyze/Projects/cortex-compass-neurograph-next`.
Branch: `astra/cortex-neurograph-next`.
Product baseline: `2aa769bc3728146a3bfa8801da0253b93c4293f8`.
Original graph checkpoint: `aae0e60e9d0b36c17ec19154c32881a11be90413`.
Selective import commit: `2a98f7d`.

The original release and graph worktrees, the handoff archive and the current production deployment are unchanged. The new checkout has its own lockfile-installed node_modules, not a mutable shared dependency symlink. npm lifecycle scripts were skipped; the installed locked packages successfully built the application. No new provider or paid image call occurred.

## Verification performed
- All 262 unit/contract tests passed: 253 existing application checks plus nine graph-prototype checks.
- The nine prototype tests also passed independently; this is software proof, not scientific calibration.
- All 26 teaching anatomy topics passed the existing synchronization check.
- All 222 existing runtime/config/public files matched the product baseline byte-for-byte.
- All 15 imported graph checkpoint files matched their preserved source byte-for-byte.
- All 72 built files matched the exact deployed-release snapshot by SHA-256.
- Native production remains Worker `e127727f-f809-4b6f-85ca-fa7e7f67b75d` at 100% traffic.

Read `verification.json` beside this file for the recorded acceptance checks. Raw test logs are in `.local-evidence/neurograph-next/`. Reproduce the reconciliation guard with `node scripts/verify-neurograph-reconciliation.mjs` only while the intended baseline remains unchanged; its equality checks deliberately fail once accepted engine integration changes the app.

## Next work
`eco-yn5ip8` (NG02) is the next research task: claim-level source, cohort and measurement provenance. Then NG03/NG04 reconcile the ontology and inference contract before the graph can affect public results. Current graph weights remain hand-set and uncalibrated; no public hero-selection or scientific-report import has been added. The graph must not be advertised as a completed empirical interaction model.

The current BORG plugin search returned no directly callable BORG plugin. The route actually verified for this continuation was Remote Desktop Commander to Studio0 plus the native Beads CLI. Project read/write, terminal execution, tracker updates, installation and tests all succeeded. That observation establishes a usable Studio development channel; it is not an end-to-end qualification of every BORG provider.
