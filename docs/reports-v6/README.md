# Cortex Compass — dual reports and mobile release

## Recover this work

- Repository: CryptoJym/brain-visualization-app
- Implementation branch: astra/cortex-reports-mobile-v6
- Working copy: /Users/utlyze/Projects/cortex-compass-reports-v6
- Base release: 3c7710a; original integration working copy was left unchanged.
- Coordination task: eco-c340nw
- Existing production hostname: https://cortexcompass.utlyze.com
- Existing Worker: cortex-compass
- Release proof belongs in RELEASE.md; this README is not a deployment receipt.

## What changed

The original 28-question history/timing reflection, 26-region Blender teaching model and 15-study research registry remain. An independent, optional 16-question current-observation reflection now supplies six possible strengths, six kinds of friction and four current resources. A two-page Superhero Report and a separate Scientific Report share a single visual language and print stylesheet. The scientific report includes all teaching regions, the full curated primary-study registry, the questionnaire-to-study audit, methods and limitations. Sensitive childhood answers/ages are a separate, unchecked-by-default appendix. Even without that appendix, the reports contain sensitive current observations and support information.

The mobile work restores previously hidden edit/save actions, enlarges targets and form text, supplies focus/reduced-motion styles, and gives page scrolling priority over accidental 3D rotation. The phone landing screen displays a roughly 42 KB image instead of automatically requesting the 6.9 MB GLB; visitors explicitly load the interactive brain. The full model remains in the overview/research explorer. Idle views stop drawing unchanged WebGL frames. Unmounted renderers release their graphics context, and fallback receipts identify the geometry actually loaded.

Four report views were rendered from the inherited, Blender-built model: left surface, right surface, medial cutaway and separated hemispheres/internal guides. JPEG derivatives keep browser-generated PDFs smaller than lossless embedding of WebP. The source attribution remains visible. Geometric boundaries and internal guides are schematic, not atlas-registered anatomical segmentation.

External font loading was removed. The existing Worker adds a self-origin Content Security Policy, no-referrer policy, anti-framing and MIME-sniffing protections; HTML revalidates while asset cache semantics are preserved. No new account, backend, AI service, database or analytics integration was introduced.

## Data and interpretation contracts

`insightQuestions.mjs` owns known observations, response values and editorial combination definitions. `insightProfile.mjs` is a pure normalizer/selector. It has no access to childhood history, research mappings or anatomy. Only explicit Often/Sometimes responses select a card. Missing, Not sure, Skip and Rarely/not now do not select a strength. Rarely is a substantive time-specific response, not classified as unknown.

Every named combination requires both current strength components. The report discloses the component answers, proposed benefit, possible cost, context and a way to check the idea. Matching current friction and support are included only when explicitly endorsed. No anatomical alteration, performance advantage, risk estimate, interaction coefficient or protective-buffering percentage is calculated.

Schema-4 storage gains optional `insightsVersion: cc-insights-1.0` and normalized `insights`. Old schema-4 records load with no invented current answers. Unsupported future insight versions are refused without rewriting the record. Save remains explicit and device-local. Report rule version is `cc-reports-6.0`.

The current reports are deterministic templates. No generative AI interprets user responses. The questionnaire and named combinations are not clinically validated instruments. A study about a group does not establish an individual effect; a questionnaire cannot reveal a brain deformation merely by prefacing the claim with “may.”

## Research boundaries

Puetz et al., DOI 10.1017/S003329171900134X, is relevant direct combined-exposure research: its group/task results were not a simple sum of separate exposure patterns. It does not validate the product’s named combination powers or estimate an individual's response. Its author-name corrigendum is DOI 10.1017/S0033291719001752.

Bick et al., DOI 10.1001/jamapediatrics.2014.3212, studied a randomized foster-care intervention with diffusion MRI. Luby et al., DOI 10.1073/pnas.1118003109, studied caregiving and later hippocampal volume observationally. Those designs differ, and neither supplies a universal percentage offset for adversity or these questionnaire items.

Marek et al., DOI 10.1038/s41586-022-04492-9, supplies methods context on brain-wide association reproducibility, not a rule that every imaging design needs the same sample size. Publisher correction: 10.1038/s41586-022-04692-3.

The registry is curated rather than a systematic/exhaustive review. The teaching model has not received an independent neuroanatomical expert review. No claim of clinical or individual predictive validity accompanies this software release.

## Verification and release workflow

```sh
node scripts/sync-anatomy.mjs --check
node --test tests/assessment-timing-v4.test.mjs tests/research-regions-v5.test.mjs tests/reports-v6.test.mjs tests/worker-v6.test.mjs
npm run build
npm run preview -- --host 127.0.0.1 --port 5266 --strictPort
CORTEX_TEST_ORIGIN=http://127.0.0.1:5266 CORTEX_TEST_OUTPUT=.local-evidence/reports-v6/final-pdf node scripts/verify-reports-v6.mjs
CORTEX_PDF_ROOT=.local-evidence/reports-v6/final-pdf python3 scripts/audit-pdfs-v6.py
```

The browser suite accepts `CORTEX_TEST_ORIGIN` and `CORTEX_TEST_OUTPUT`. Always set the export directory explicitly and pass the same directory as `CORTEX_PDF_ROOT` to the PDF audit; different defaults otherwise risk auditing stale artifacts. The audit checks both A4 and Letter, rejects blank/stranded pages and out-of-bounds text, then renders every A4 page for visual inspection. The final fictional samples are two pages (Superhero) and 22 pages (Scientific), with the private appendix off, in both paper sizes. Copies are included under `public/reports/samples/`. Chromium touch emulation and the added Playwright WebKit/iPhone emulation are not a physical iPhone/native print-dialog acceptance test.

Retain the original timing, research and model-browser regression suites. Their mobile model setup now explicitly clicks Load interactive brain; their geometry/interaction assertions remain.

Use the established local Keychain-backed Wrangler channel to deploy only a verified dist to the existing Worker. Prior production version observed before this release: ac83e352-0dde-4e67-b66a-85608f0668f4. Recheck current provider state before deployment; record the new version and live checks in RELEASE.md. Roll back to the verified prior version if live critical checks fail.
