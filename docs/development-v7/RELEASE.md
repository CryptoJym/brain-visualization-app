# Cortex Compass — developmental context and Field Guide release

Status: exact local build verified; native publication receipt pending below.

## What changed

The approved brain-and-compass identity now extends into an original Field Guide experience: sea-glass controls, navy and warm-paper sections, brass orientation accents, editorial typography, real report-edition previews, a framed interactive atlas, and consistent four-step journey markers. Layouts were checked from 320 through 1440 CSS pixels. Reduced-motion behavior and keyboard focus are explicit; no external font or analytics dependency was added.

The questionnaire now records developmental context before optional calendar history. Pubertal stage is a reported proxy, not measured brain maturation. Six optional fields keep assigned sex, gender identity, sex-characteristic variation, historical hormonal context, gendered experience and gender-related support distinct. Eight primary-source cards retain specific stimuli, outcomes, measured interactions, negative results and limitations. No sex/age multipliers or inferred individual sensitive windows are generated.

Schema 5 / cc-reflection-5.0 / cc-development-1.0 / cc-context-1.0 / cc-reports-7.0. Existing schema-4 histories, ages and present-day observations migrate without inventing demographic or developmental answers; browser storage remains unchanged until explicit saving. The core childhood/adolescent questions retain their previous recall scope, not a claim about when brains finish maturing.

Personal sex/gender context and adversity history have separate, unchecked-by-default print appendices. The ordinary reports still contain current observations and reported childhood supports, so they remain sensitive. The Superhero report never uses sex or stages to manufacture a power.

## Acceptance

120 unit/contract tests passed. Final local Worker checks: 40 developmental-flow/privacy/migration checks, 46 design/journey/responsive checks, 51 report/mobile checks, 18 WebKit/iPhone-emulation checks, 37 historical timing/storage regressions and 54 research/anatomy regressions. All final suites reported zero errors. Source/build hashes remained stable throughout the run.

Both A4 and Letter outputs pass text-bounds and page-content checks. Every Scientific A4 page was rendered and visually inspected. The fictional Superhero sample remains 2 pages; the expanded Scientific sample is 28 pages with 69 clickable source links. The tested samples replace both existing public sample endpoints and the A4/Letter copies. Private appendices can change a personal report's length.

Evidence lives under .local-evidence/development-v7 (not published). Current local application assets: index-BsTcn46E.js and index-CWL4pRPK.css. Competing incomplete visual work was preserved separately and is not included in the Field Guide build.

## Release boundary and limitations

Existing Cloudflare Worker cortex-compass / cortexcompass.utlyze.com only. Required native precondition and rollback: 00c629c5-60be-40da-adaa-0d1234309abe. Strict CSP, blob-texture allowance, HTML no-transform policy, accounts and routes remain unchanged. WebKit testing is emulation, not a physical iPhone or printer. This release is not clinical validation or an independent neuroanatomical review.
