# Blender brain v2 — release receipt

- Date: 2026-09-11
- Site: https://cortexcompass.utlyze.com
- Runtime source commit: `ec82370`
- Source branch: `astra/cortex-blender-v2`
- Cloudflare Worker: `cortex-compass`
- Deployed Worker version: `d7704fbe-3254-4d31-a342-4eaeed67afd1`
- Prior rollback version: `ab8f129e-4855-484e-9440-b4c005f758e3`
- Blender executed locally: 5.2.1 LTS, Studio0, four render threads.
- Editable packed source: `art/blender/cortex-brain-v2.blend` (14,278,639 bytes).
- Production Vite build: PASS.
- Automated local Chromium checks: 37 PASS, 0 FAIL.
- Automated live-site Chromium checks: 37 PASS, 0 FAIL.
- Live desktop and mobile GLB HTTP status: 200 for both.
- Live GLB SHA-256 versus exported asset manifest: exact match for both.
- Named mesh objects: 19 in each level of detail; three normal maps retained.
- Visual inspection: Blender surface render, browser surface/cutaway/deep views,
  and mobile page reviewed.
- Questionnaire scoring changes: none.

Evidence is local and ignored at `.local-evidence/blender-v2/`, including
`live/verification.json` and `live-asset-verification.json`. Safari/Firefox and
independent neuroanatomical review were not run. The model is generic teaching
anatomy; added inner structures and cortical color boundaries are schematic.
