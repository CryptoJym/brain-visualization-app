# 04 — Next agent runbook

## Start without reconstructing the conversation
Read `/Users/utlyze/.codex/AGENTS.md` and `/Users/Shared/agent-tools/TOOLS-DIRECTORY.md`. Use actual connector discovery; prior chat assertions that Studio access disappeared were not a reliable diagnosis. During this handoff, Remote Desktop Commander read/write/terminal tools worked on Studio0. A blocked or slow individual operation is not proof that the entire connector is absent. Never disable safeguards or borrow a different principal to get around a denial.

```sh
cd /Users/utlyze/Projects/cortex-compass-hero-editions-20260913
git status --short
git log -4 --oneline
git worktree list
cat docs/handoff-20260913/README.md
cat docs/handoff-20260913/handoff-state.json
BEADS_DIR=/Users/utlyze/.beads bd show eco-cq76kh --json
```
If native Beads is slow/unavailable, use the saved task plan and record the limitation; do not reinitialize the shared tracker, open embedded Dolt, reset its database, or claim a task write succeeded without readback. Resolve unclear ownership through the user's established Inbox/session contract before concurrent work. No additional agent is needed merely to read this handoff.

## Preserve then reconcile
The live-source branch includes the latest required sex field, cinematic reports and all earlier functionality. The graph checkpoint is `aae0e60`; it contains graph paths only and is not a deployment. After confirming the current remote refs and ownership, create a new isolated successor from the current release branch, then cherry-pick that graph checkpoint. Example intended sequence, not an instruction to overwrite any existing path:
```sh
git fetch origin
git worktree add -b astra/cortex-neurograph-next /Users/utlyze/Projects/cortex-compass-neurograph-next origin/astra/cortex-hero-editions-20260913
cd /Users/utlyze/Projects/cortex-compass-neurograph-next
git cherry-pick aae0e60
npm ci
npm test
node --test tests/neurograph-v1.test.mjs
```
Choose a fresh branch/path if these already exist; inspect them first. Do not reset another agent's work. A selective checkpoint import is safer than deploying the old graph checkout. Existing node_modules symlinks on Studio are a local convenience, not portable dependencies.

## Execute the work board
NG01 reconciles baseline and ownership. NG02 audits source/claim provenance and cohort overlap. NG03 fixes the ontology and edge schema. NG04 replaces unjustified confidence semantics and defines admissible inference. NG05 implements bounded compositional evaluation and tests counterfactual/source-withdrawal behavior. NG06 integrates transparent graph/Scientific Report views without changing privacy or portraits. NG07 supplies independent scientific/software review and an exact-artifact release gate. Optional account/longitudinal work is not a prerequisite for completing the graph.

## Finish criteria
Do not stop after writing schemas. Provide a working path through the app, inspect representative explanation chains, execute the existing regression suite, verify saved profiles and accepted portraits remain compatible, visually review A4/Letter exports and mobile layouts, commit/push, check the native production predecessor, publish only the accepted artifact, re-read the live version and public hashes, and leave a completion receipt. Failed checks require diagnosis, not weaker assertions. Statistical validation and software acceptance remain different claims.
