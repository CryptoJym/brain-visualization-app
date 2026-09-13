# Cortex Compass by Utlyze

Cortex Compass is an adult educational self-reflection and research browser. It does not measure a person’s brain, diagnose a condition, or estimate injury. The active application is `src/App.jsx` → `src/components/CortexCompass.jsx`.

## Current v6 product

- The existing 28 optional childhood, prenatal and support prompts retain flexible age ranges and schema-4 device saves.
- A separate 16-prompt present-day reflection describes possible strengths, friction and current supports. Only explicit current endorsements select these cards; history never manufactures a power.
- The **Superhero Report** is a two-page, print-friendly field guide. The **Scientific Report** includes the full observation ledger, methods, limitations, 26-region teaching atlas, 15 curated primary-study records and every question-to-research mapping decision.
- Named combination powers are untested editorial hypotheses, not validated neural phenotypes. Both component strengths must be explicitly endorsed. No injury, synergy, personal risk or protective-buffering percentages are calculated.
- The same generic Blender teaching model is used for everyone. Surface partitions are geometric, not registered atlas parcels. Mobile users get a lightweight poster before choosing the larger 3D download, and can switch between 3D gestures and page scrolling.
- Saving is explicit browser-local storage, not an encrypted cloud account. Adversity/prenatal responses and age ranges are excluded from the printable Scientific Report unless a separate private-appendix checkbox is selected. Reports still contain sensitive present-day observations and reported childhood/current supports.

Live application: https://cortexcompass.utlyze.com

## Run and verify

```sh
npm ci
npm test
npm run check:anatomy
npm run build
npm run preview -- --host 127.0.0.1 --port 5266 --strictPort
# In another terminal:
CORTEX_TEST_ORIGIN=http://127.0.0.1:5266 npm run test:reports
```

The app uses React, Three.js and Vite. No model API, cloud-profile backend, biometric collection, therapy executor, account sign-in or clinical scoring is connected in this entry point. Public deployment uses the existing Cloudflare Worker described in `wrangler.jsonc`.

Test the actual Worker response path as well as Vite: embedded GLB image textures require the narrowly scoped `blob:` permission in `connect-src`. Restart local Wrangler after rebuilding assets so the asset manifest matches the new hashed filenames. The v6 acceptance run used Wrangler 4.131.1 from an isolated npm cache; shared dependencies and the production compatibility date were not changed.

## Architecture and provenance

- `src/data/insightQuestions.mjs`: transparent observation and combination definitions.
- `src/utils/insightProfile.mjs`: pure normalization and selection; no history or anatomy imports.
- `src/utils/assessmentProfile.mjs`: existing history profile and backward-compatible device-save extension.
- `src/components/CompassReports.jsx`: independent report rendering and explicit print privacy controls.
- `src/components/CortexBrain.jsx`: educational viewer, reduced mobile asset, retry/fallback and idle-render suppression.
- `src/data/regionStudies.mjs` and `questionRegionLinks.mjs`: study registry and exposure-fit audit.
- `docs/reports-v6/`: implementation and release evidence. `docs/research-v5/` records the retained anatomy/research foundations.
- `ATTRIBUTION.md`: model license and attribution. Images are teaching illustrations, not a medical atlas or patient scan.

Old advanced-assessment and healing-platform descriptions are retained in `docs/archive/LEGACY-README.md` as historical material. They must not be treated as a list of current capabilities. Dormant legacy scoring modules are not imported by the active app.

Software testing is not clinical validation. The questionnaire, named combinations and model have not undergone independent clinical/neuroanatomical validation.
