# Deep Hero Atlas integration release

Status: released and publicly verified.

This release integrates the 27-observation functional atlas and 24 candidate compositions into the existing Cortex Compass app. A reader can review counterexamples, choose among currently eligible signatures, select independent portrait preferences, and print a two-page hero guide or one-page strengths-only card. The Scientific Report retains the original research and adds the functional ledger, selection rules and linked evidence context when the atlas has answers.

Scientific limits: these are editorial composition hypotheses informed by related evidence, not measured personal neurological alterations or validated neural types. No age, sex, history or unreviewed answer manufactures a functional observation. No numerical synergy or individual probability is computed. The source DOI/author mismatch for Adolfi et al. (2017) was corrected against the primary indexed record. The 14-source registry is not a new meta-analysis.

Privacy/persistence: main history and hero data save together in a single explicit local-storage write. The optional device portrait importer accepts bounded raster files, re-encodes pixels, strips metadata, stores image bytes in IndexedDB, and persists only an ID/hash reference in the profile. SHA-256 is checked again on retrieval. Image bytes are reused across printing. WebKit required storing ArrayBuffer bytes instead of Blob objects; that path now passes. Arbitrary external image URLs are not accepted. Sharing the strengths-only card does not include history, sex/gender fields, counterexamples or demanding-condition details.

Paid AI image generation and cloud accounts are NOT connected in this release. The application says so; it does not claim to have sent a brief or created an AI portrait. The visual brief exporter includes only allowlisted appearance choices and public symbolic motifs. No BORG/runtime API credential was repurposed. Optional device artwork is an available local feature, not a substitute represented as a working cloud generator.

Acceptance: 169 unit/contract tests; 38 Chromium neurohero checks and 11 mobile WebKit neurohero checks; regression suites report 51 report/mobile, 40 developmental, 18 WebKit, 43 brand, 46 site-experience, 37 timing/storage and 54 research checks, all passing. The known invalid first preview was a stale Worker asset manifest after a rebuild; it was replaced by a fresh owned preview before acceptance. A hidden-details-button test was corrected to measure visible touch targets, retaining the >=44px requirement.

PDFs: deep hero guide 2 pages in A4 and Letter, strengths card 1 page, deep Scientific fictional sample 32 pages. The regular samples remain 2-page Superhero and 28-page Scientific. Text bounds/content checks pass; new guide pages and scientific appendix layouts were visually inspected. This is browser printing/WebKit emulation, not a physical-printer or native-device acceptance claim.

Source branch: astra/cortex-neurohero-v9. Worktree: /Users/utlyze/Projects/cortex-compass-neurohero-v9. Work item: eco-a318wk. Evidence: .local-evidence/neurohero-v9 (not public). Baseline/rollback Worker version: 8cc9f3fa-0986-497e-920f-1c6f2a15b1ec. Existing worker/domain only; Worker security headers and authentication state are unchanged.

Remaining work after this release: dedicated application image credential and model evaluation; authenticated private cloud storage; quota/idempotency-controlled paid image jobs; real provider/storage authorization tests; separately scoped scientific validation and broader evidence extraction. The overall work item remains open for those deliverables.

## Public receipt

Worker version: `adb875e6-357a-487d-b792-93eb88577d74` at 100% traffic. Source commit: `63b72381e1f4ddff9297e08e258442d99bba624e`. Deployment: 2026-09-13T00:38:02.459235Z.

Live acceptance: 183 checks across the hero flow, mobile WebKit, reports, development and branding; zero page/console errors. Ten publicly served assets match the frozen publication by SHA-256, including the application bundles and all three new sample PDFs. Paid generation/cloud accounts remain off.
