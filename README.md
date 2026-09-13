# Cortex Compass by Utlyze

**Next agent: start with [the complete handoff](docs/handoff-20260913/README.md).** It includes the architecture, exact unfinished graph checkpoint, work dependencies, test evidence, local source locations, deployment/rollback procedure and preserved decisions. The older v6 README is retained in `docs/archive/README-v6-before-handoff-20260913.md` and is not current product documentation.

## Live state at the handoff
Production: https://cortexcompass.utlyze.com. Worker: `e127727f-f809-4b6f-85ca-fa7e7f67b75d`, 100% traffic, rechecked 2026-09-13. Deployed application source: `85a29955e7b206a2cd8581289c321f72e1f21243`. Release receipt: `docs/hero-editions/COMPLETION.md`. Later handoff-only commits do not mean a new app deployment. Rollback version: `6fc5170e-fbea-44f1-bfaf-07e0b6d7fec0`.

This working copy is `/Users/utlyze/Projects/cortex-compass-hero-editions-20260913`, branch `astra/cortex-hero-editions-20260913`. The repository is `CryptoJym/brain-visualization-app`. The active app is `src/App.jsx` → `src/components/CortexCompass.jsx`; similarly named legacy scoring/healing modules are not the current execution path.

## Implemented
Cortex Compass provides stage-first history/development reflection; a required blank-by-default Male/Female biological-sex field; separate current strengths/friction/support observations; 27 functional Hero Atlas observations and 24 editorial compositions; generic 3D teaching anatomy; cinematic and ink-saving Superhero/Scientific reports; accepted hero artwork; a private xAI portrait pilot; explicit local saves; and encrypted `.cortex` file backup/restore with optional portrait bytes.

The accepted portrait is reused when printing and restoring, not regenerated. The portrait backend receives only approved visual information, not questionnaire history. Private history and biological-context print appendices are separate opt-ins. The image pilot uses private access passes, not general public account registration. Backups are local encrypted files, not an encrypted cloud account. Software tests are not clinical validation or evidence of measured brain alterations.

## What is unfinished
The neuroscience composition graph is preserved in `/Users/utlyze/Projects/cortex-compass-neurograph-v1`, branch `astra/cortex-neurograph-v1`, checkpoint `aae0e60`, work item `eco-cq76kh`. It is NOT imported by production. It contains 137 graph nodes, 212 static links and 351 enumerable observation pairs; those counts are not validated mechanisms. Its evidence/interaction weights are uncalibrated and require the review described in [03-NEUROGRAPH.md](docs/handoff-20260913/03-NEUROGRAPH.md).

Resume from a new branch of this current live baseline and selectively bring in the graph checkpoint. Do not deploy the old graph worktree over the required-sex, cinematic-report, private-portrait and encrypted-backup releases. Use [the work board](docs/handoff-20260913/05-BEADS.md), not the chat transcript, to see dependencies and native synchronization status.

## Run and verify
```sh
npm ci
npm test
npm run check:anatomy
npm run build
npm run preview -- --host 127.0.0.1 --port 5681 --strictPort
# In a second terminal, from this repository root:
CORTEX_TEST_ORIGIN=http://127.0.0.1:5681 node scripts/run-hero-edition-checks.mjs
```

## Local transfer package
The consolidated copy is `/Users/utlyze/Projects/cortex-compass-handoff-20260913/README.md`; its archive is `/Users/utlyze/Projects/Cortex-Compass-Handoff-20260913.zip`. It separates current source from the unfinished graph, includes existing public artwork/report/Blender assets, and preserves prior uncommitted source residue without modifying the original worktrees. The package manifest and `verify-package.py` provide file-identity checks.

Nine successor tasks are registered in native Beads, with ten dependency edges and verified acceptance. Start with `eco-eib7d3` (current-baseline integration) and `eco-yn5ip8` (claim-level research audit). See [05-BEADS.md](docs/handoff-20260913/05-BEADS.md) for actual IDs and the tracker synchronization caveat. Do not rerun the historical batch-creation plan.
