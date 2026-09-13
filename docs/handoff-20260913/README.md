# Cortex Compass — complete agent handoff

**Start here.** This is the transfer record for the full Cortex Compass thread, prepared on Studio0 on 2026-09-13. It separates what is running in production from the unfinished neuroscience graph. The user requested preservation and a resumable work board; this handoff does not deploy new code.

## The two working copies that matter

**Live-product source:** `/Users/utlyze/Projects/cortex-compass-hero-editions-20260913`, branch `astra/cortex-hero-editions-20260913`. Deployed application commit: `85a29955e7b206a2cd8581289c321f72e1f21243`. Existing release receipt: `157971e`. Production: `https://cortexcompass.utlyze.com`. Native Worker `e127727f-f809-4b6f-85ca-fa7e7f67b75d`, 100% traffic, rechecked during handoff. Rollback: `6fc5170e-fbea-44f1-bfaf-07e0b6d7fec0`.

**Unfinished graph:** `/Users/utlyze/Projects/cortex-compass-neurograph-v1`, branch `astra/cortex-neurograph-v1`. It started from older commit `43ceccb`. Its files were untracked when this handoff began. They must be checkpointed separately, not mistaken for a deployed successor. The active application has no imports of the graph modules.

## Read in this order

| Document | Purpose |
|---|---|
| `01-CURRENT-STATE.md` | Completed releases, current features, version and storage boundaries. |
| `02-ENGINEERING-MAP.md` | File ownership, request flow, state, reports, portraits, backups and settings. |
| `03-NEUROGRAPH.md` | Exact prototype inventory, mathematics, defects, research requirements and integration plan. |
| `04-NEXT-AGENT.md` | Safe starting commands, checkpoints, execution order and finish criteria. |
| `05-BEADS.md` | Canonical IDs, dependency-linked work packages, synchronization status and recovery. |
| `06-VERIFICATION-OPERATIONS.md` | Existing evidence, test boundaries, release/rollback and secret custody. |
| `07-DECISIONS.md` | User decisions to preserve, superseded claims and explicit unknowns. |
| `handoff-state.json` / `workboard.json` | Machine-readable snapshot and task dependency graph. |

**Next product priority:** finish the neuroscience-backed composition graph. First reconcile it onto the current live-product baseline and repair its evidence/inference contract. Do not ship its present arbitrary numerical weights as measured confidence. More generated combinations do not themselves create more empirical evidence.

**Do not redo:** logo/favicon, developmental-context migration, xAI private portrait service, portrait-byte reuse, encrypted backups, required Male/Female field, cinematic/ink-saving report editions. These already exist. Preserve their tests and privacy semantics.

**Do not infer:** an earlier missing biological-sex answer from identity; an individual's anatomy from history; a numerical protective effect; calibrated confidence from the prototype's support index; public account registration from the private portrait access-pass pilot.

**Work tracking:** reuse `eco-a318wk` for the broader Neurohero work and `eco-cq76kh` for the graph. `eco-iln18c` is the completed cinematic/required-sex release. Beads is the established shared tracker at `/Users/utlyze/.beads`, not a new repository-local database. Read `05-BEADS.md` for the current native-sync result before creating duplicates.
