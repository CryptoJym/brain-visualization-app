# Cortex Compass v6 release record

Status: implementation and local release verification complete; native publication receipt will be appended after deployment.

## Scope and ownership

- Repository: CryptoJym/brain-visualization-app
- Branch: astra/cortex-reports-mobile-v6
- Work item: eco-c340nw
- Base: 3c7710a
- Original integration working copy was left unchanged.
- The BORG-original session reconciled the parallel continuation's additions and holds the single-publisher role recorded in COORDINATION.md.
- Existing Worker/domain only: cortex-compass / cortexcompass.utlyze.com. No account, routing, database or authentication changes.

## Final verification

- Unit and contract tests: 81 passed, zero failed.
- Existing research-to-region browser regression: 54 passed.
- Existing timing/storage browser regression: 37 passed.
- Existing Blender/interaction/fallback browser regression: 37 passed.
- Final new report/mobile browser suite against an actual local Worker on port 5268: 51 passed.
- Final WebKit/iPhone-13 emulation against the same Worker: 13 passed.
- No page or console errors in the successful final browser suites.
- Mobile widths: 320, 390 and 768 CSS pixels; desktop: 1440 pixels.
- Production dependency audit: zero findings after removal of an unused routing dependency and its lockfile entries. This is not a claim that all development dependencies or all possible vulnerabilities have been eliminated.
- Atlas consistency check: 26 topics synchronized.
- Every A4 page of both fictional sample reports was rendered and visually reviewed. Both A4 and Letter pass page-content and text-bounds checks. The Scientific report retains 50 clickable link annotations.

Final fictional sample files in public/reports/samples:

| File | Pages | Bytes |
|---|---:|---:|
| Cortex-Compass-Superhero-A4.pdf | 2 | 321482 |
| Cortex-Compass-Superhero-Letter.pdf | 2 | 321166 |
| Cortex-Compass-Scientific-A4.pdf | 22 | 983834 |
| Cortex-Compass-Scientific-Letter.pdf | 22 | 985087 |

These contain only the built-in fictional sample. User-specific reports are generated in the browser. Scientific report length varies with observations and the optional private appendix.

## Evidence locations

Local-only evidence: .local-evidence/reports-v6/unit-final.txt; regression-research/verification.json; regression-timing/browser-verification.json; regression-brain/verification.json; final-worker/verification.json; final-webkit/verification.json; final-pdf/; render-final/audit.json; dependency-audit-final.json.

Final unchanged application assets: index-DMNnALAV.js and index-uVpgWzTi.css. The final rebuild added fictional sample PDF assets without changing those application bundles.

## Interpretation and device limits

The questionnaire and named combination hypotheses are not clinically validated instruments. No individual brain deformation, anatomical change, performance superiority, causal pathway or numeric protective effect is inferred. The generic Blender teaching model has not received independent neuroanatomical expert review. The research registry is curated, not an exhaustive systematic review.

WebKit/iPhone emulation verifies rendering, touch-size behavior, model selection and the print invocation path; it is not verification of a physical iPhone's native print/share dialog or a physical printer. Actual native device acceptance remains a release limitation, not a passed test.

## Rollback

Native production version observed before publication: ac83e352-0dde-4e67-b66a-85608f0668f4, at 100 percent. Recheck native state immediately before publication; preserve this version for rollback unless another legitimate release has intervened. Never use a local Git commit as proof of production state.

## Final native publication and public acceptance — supersedes the pre-publication fields above

- Status: **RELEASED AND PUBLICLY VERIFIED**.
- Worker version: `46935ccd-8683-4f22-922b-543bdfc6eae6`, native deployment `c865c1fe-9e90-4113-81a6-a326f7f742bb`, 100% traffic.
- Native deployment time: 2026-09-12T14:25:40.304696Z.
- Public origin: https://cortexcompass.utlyze.com
- Current app bundle: `index-BIOLmgzY.js`; stylesheet: `index-uVpgWzTi.css`.
- Current Worker SHA-256: `1270cdd9b115f0980fda2742ec9b519cfe8897d9b62d1ca296dcf425c8c2e978`.
- Exact public Chromium report/mobile flow: **51/51**, zero console/page errors, 14:26:34Z.
- Exact public WebKit/iPhone emulation: **13/13**, zero console/page errors, 14:26:38Z.
- Thirteen public files, including exact HTML, JS/CSS, both GLBs, four brain images and both current PDFs, returned 200 and matched the deployed snapshot by SHA-256 at 14:30:11Z.
- First v6 publication `12a5f173-8307-42c5-9ad3-a326ebe7869f` revealed Cloudflare's automatically injected analytics beacon. CSP blocked it. The corrective version adds `public, no-cache, no-transform` to static HTML only; the self-origin CSP and other asset caching remain intact. Final served HTML is exactly the application build, without that injected script.
- Latest privacy wording explicitly excludes adversity/prenatal responses and ages by default while disclosing that reported childhood/current supports remain included.
- Current Superhero sample: `/reports/Cortex-Compass-Superhero-Sample.pdf`, 2 pages, 321482 bytes, SHA-256 `24de110ffce422a7b839c39b85037b4b6fefd3790da49411c38f92352a073713`.
- Current Scientific sample: `/reports/Cortex-Compass-Scientific-Sample.pdf`, 22 pages, 984329 bytes, SHA-256 `cce707888e15f3b61a59f8c101a35d936f11d5c47ec4d9cc6a555bc5fcc915f6`.
- Current sample verification supersedes the older Scientific byte count above. Both formats passed A4/Letter bounds and content checks. All samples are fictional.

Final evidence: `live-no-transform-browser/verification.json`, `live-no-transform-webkit/verification.json`, `independent-release/public-assets-final.json`, `native-final-deployments.json`, and `release-browser/` under `.local-evidence/reports-v6/`.

Source commit/push remains with the original BORG integration owner; the production-execution continuation did not mutate shared Git. The deployed source and assets are preserved in the immutable `independent-release/final-no-transform-snapshot`. No further deployment is required to complete that source-history integration. The physical-iPhone/native-print and clinical-validation limits stated above remain unchanged.
