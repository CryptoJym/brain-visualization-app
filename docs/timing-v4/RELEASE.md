# Flexible timing and questionnaire evidence — verified release

- Date: 2026-09-11.
- Public site: https://cortexcompass.utlyze.com
- Runtime source commit: `2e9df9f` (feature commit `c49a3c7`).
- Branch: `astra/cortex-timing-evidence-v4`.
- Questionnaire version: `cc-reflection-4.0`.
- Evidence version: `cc-evidence-2026-09-11`; device-save schema: 4.
- Cloudflare Worker: `cortex-compass`.
- Verified deployed version: `ab450296-401e-4e65-821c-74f30d75e3a0`, 100%.
- Previous rollback version: `d7704fbe-3254-4d31-a342-4eaeed67afd1`.
- Production Vite build: PASS.
- Timing, validation, determinism and migration unit tests: 31 PASS, 0 FAIL.
- Questionnaire browser checks: 37 PASS locally; 37 PASS on the public site.
- Existing brain browser checks: 37 PASS locally; 37 PASS on the public site.
- Browser page/console errors in both live suites: none.
- Served HTML, app JavaScript, CSS and vendor bundles: HTTP 200; all five
  SHA-256 values exactly match the local production build.
- Fictional PDF fixture: four pages, 16 clickable links; custom ages, gaps,
  prenatal context and research citations verified in text and rendered pages.
- Blender GLB hashes: unchanged; print framing/snapshot behavior repaired.
- Cloudflare routing, account, identity settings and backend: unchanged.
- Saving remains explicitly consented browser-device storage, not cloud login.

Evidence: ignored `.local-evidence/timing-v4/`, including both live JSON receipts,
`live-asset-verification.json`, provider readback and `pdf-verification.json`.
The adapted questionnaire and new timing UI are not clinically validated scales.
Further region articulation is separate work (`eco-v1ifkx`), not this release.
