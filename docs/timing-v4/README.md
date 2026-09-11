# Flexible timing and evidence-backed reflection — v4

## User-facing behavior

28 optional prompts across five sections. History, pregnancy context and supports
are distinct. Household alcohol, drug use and incarceration are separate items;
physical harm and threatened harm, peer emotional and physical mistreatment,
mental health difficulties and a suicide attempt are also separate.

Timing offers quick bands or a custom start/end editor with years, additional
months and keyboard-accessible native sliders. Existing bands can be edited.
Multiple periods preserve intervening gaps; overlapping or adjacent periods
normalize to one span. Infancy starts at birth. Pregnancy is a separate optional
context channel and never a negative post-birth age or part of the infancy band.

## Schema and deterministic behavior

- Questionnaire: `cc-reflection-4.0`; evidence: `cc-evidence-2026-09-11`.
- Save schema: 4; timing schema: 1; storage key: `cortex-compass-profile`.
- Canonical age unit: integer months since birth, up to the 18th birthday.
- A period has `startMonth` and `endMonth`; equal endpoints describe an event
  around one age. Range ends are the stated age boundary, not that whole year.
- Timing states distinguish known, unknown, withheld, unanswered and prenatal.
- Answers distinguish Yes, No, Not sure, Prefer not to answer and unanswered.
- Frequency is independent of an age span; omitted frequency is not Not sure.
- No age, frequency, sex or severity weights; no injury scores, individual
  structural predictions or protective-buffering percentages.
- Reading topics are editorial links chosen in a stable order from explicit
  domain endorsements. They do not identify affected regions.
- Counts are records of endorsed items, not official ACE/MACE scores.

## Evidence and limits

`src/data/assessmentEvidence.mjs` links each source to a finding and a limit of
use. `assessmentQuestions.mjs` links each prompt to its sources and distinguishes
personal-context prompts without an asserted empirical neural mapping. The
question details, Research & methods page and printed report expose these limits.
The shortened prompts and month-range controls are not validated ACE or MACE
instruments. Studies do not validate the previous app's numerical brain model;
v4 retires those formulas rather than attaching citations to invented weights.

## Existing saved reflections

Loading a pre-v4 record is read-only. Its original answers and report are retained
as `legacyRecord`; only the five unchanged support prompts transfer automatically.
Changed or combined history questions require a fresh optional answer. A previous
Yes to `household_instability` must never populate three new Yes responses. The
original snapshot survives an explicitly consented v4 save. Corrupt, too-large or
future-version records fail visibly without being overwritten.

Saving remains browser-device storage, NOT an encrypted cloud account or Utlyze
sign-in. No server profile backend is added. Export and deletion are explicit.
Tests use only fictional answers in isolated browser profiles.

## Verification and release

```sh
node --test tests/assessment-timing-v4.test.mjs
npm run build
npm run preview -- --host 127.0.0.1 --port 5194 --strictPort
# Separate terminal:
node scripts/verify-assessment-v4.mjs
CORTEX_TEST_ORIGIN=http://127.0.0.1:5194 \
  CORTEX_TEST_OUTPUT=.local-evidence/timing-v4/brain \
  node scripts/verify-blender-brain.mjs
```

The browser script supports `CORTEX_TEST_ORIGIN` and `CORTEX_TEST_OUTPUT` for
live verification. It generates a fictional PDF fixture; render that PDF and
check the source links, timing labels and brain snapshot before release.

Blender v2 geometry and both GLBs are unchanged. A print-only snapshot captures
the real WebGL brain at a fitted camera and crops transparent margins, avoiding
the canvas clipping that appeared when switching to paper layout. The unfinished
region-articulation v3 catalog is not imported or included in this release.

Use the existing Keychain-backed Cloudflare channel, without printing tokens:

```sh
CLOUDFLARE_AUTH_USE_KEYRING=true \
  /Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler \
  deploy --config wrangler.jsonc
```

Target: existing Worker `cortex-compass`, `cortexcompass.utlyze.com`.
No routing, account, database or identity settings change. Pre-v4 rollback:
`d7704fbe-3254-4d31-a342-4eaeed67afd1`. Recheck provider state before each release.
See `RELEASE.md` for actual deployed version, source commit and test receipts.
