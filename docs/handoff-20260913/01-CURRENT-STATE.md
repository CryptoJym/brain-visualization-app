# 01 — Current product, history and release boundary

## Product intent
Cortex Compass is an adult educational reflection, neuroscience research browser and personalized hero field guide. The user wants an emotionally compelling experience that helps people recognize possible capabilities, demanding conditions and practical opportunities without feeling reduced to damage. The story and art must emerge from traceable inputs. This is not a diagnostic instrument, a scan, a measured brain type, or a validated predictor of ability. Preserve the difference between the user's ambitious research goal and what the current implementation has actually established.

## Current deployed functionality
The app enters through `src/App.jsx` and `src/components/CortexCompass.jsx`. It includes the history/development reflection, separate present-day observations, an interactive generic brain, the Deep Hero Atlas, a portrait studio, multiple reports, explicit device saves and encrypted portable backups. It is a React/Vite/Three.js application served by a Cloudflare Worker. Static assets and `/api/portraits/*` are handled separately.

The active biological-context screen requires a blank-by-default Male or Female choice before continuing. Not sure and Prefer not to answer are not choices for that field. The other medical/context questions retain their own optional semantics. Identity questions are retired from the active scientific form. Previous identity/missing/unlisted answers are preserved as archived save data, never converted into biological sex. The active context version is `cc-context-2.1`; v1/v2 records remain readable.

Development is stage-first: foundational caregiver-dependent development, prepubertal childhood, progressing puberty, later puberty, and after pubertal changes. Source, response, support and existing assessment are distinct fields. Calendar ages remain optional historical notes, not sensitive-period assignments. Puberty is explicitly a proxy, not a whole-brain maturation measurement. The active biological-developmental report includes seven source cards; the original registry retains the eighth identity-related record as archival source material, not an erased or rewritten finding.

The current Deep Hero Atlas contains 27 functional observations in 12 UI chapters and 24 named editorial compositions. These are not 27 fundamental neural dimensions or 24 validated phenotypes. A required component must be recognized in current self-report; frequent counterexamples exclude it, occasional/unreviewed counterexamples qualify the fit. A preferred hero must remain eligible. Current deterministic ordering is editorial, not a neurological score. The unfinished graph has not replaced this engine.

Reports include a two-page Superhero field guide, a one-page strengths-only card when a hero is available, and a full Scientific Report. The latter includes methods, the observation ledger, limitations, generic anatomy, primary-study cards, research mappings and separate opt-in sensitive appendices. The latest fictional scientific samples have 31 pages in A4 and Letter; page count is data- and appendix-dependent, not a universal guarantee. All readers get the same generic teaching anatomy: 26 selectable teaching topics and 47 meshes, not a personal scan.

Cinematic mode is the default, with an ink-saving alternative and five decorative palettes. The accepted local portrait supplies both foreground artwork and a subtle background. Text/evidence do not change when choosing a palette or edition. The logo, favicon, Apple icon, sharing preview and brand provenance remain in `public/brand`. `public/reports/editions` contains eight fictional native samples, an index and the fictional Gamma comparison. Print readiness waits for foreground/background image decode and fonts.

The xAI private portrait pilot is live. Its server reconstructs an allowlisted visual brief from public hero IDs and enumerated appearance choices. Raw history, diagnoses, questionnaire answers, arbitrary prompt text and scientific reports are not submitted. A high-entropy access pass opens a private workspace; this is not public signup, email-verified identity or a cloud reflection account. Accepted artwork is privately stored and optionally copied to browser IndexedDB. Reprinting, reopening or reusing the same specification does not generate another paid image.

Encrypted `.cortex` files preserve normalized reflection data and, optionally, accepted portrait bytes. Unlocking first previews; explicit opening puts the imported reflection on the current page, preserving the previously saved profile. A separate Save profile action persists the opened data. Passwords are not stored or recoverable. Browser-local ordinary saves are not thereby encrypted at rest. File encryption and account authentication are separate systems.

## Durable release lineage
| Milestone | Studio worktree suffix / branch | Useful source/receipt |
|---|---|---|
| Research/anatomy and v6 reports | `cortex-compass-integration`, `astra/cortex-research-regions-v5` | `3c7710a`, `docs/research-v5`, `docs/reports-v6` |
| Approved identity | `cortex-compass-logo-20260912`, `astra/cortex-logo-20260912` | `8f79696`, `docs/brand-release.md` |
| Maturation and field-guide design | `cortex-compass-development-v7`, `astra/cortex-development-v7` | `e17f572`, `docs/development-v7` |
| Deep Hero Atlas | `cortex-compass-neurohero-v9`, `astra/cortex-neurohero-v9` | `a784b77`, `docs/neurohero-v9/RELEASE.md` |
| xAI portraits | `cortex-compass-xai-portraits`, `astra/cortex-xai-portraits` | `a7b13ce`, `docs/xai-portraits/COMPLETION.md` |
| Portable profiles | `cortex-compass-portable-profiles`, `astra/cortex-portable-profiles` | source `df72575`, receipt `43ceccb` |
| Current hero editions | `cortex-compass-hero-editions-20260913`, `astra/cortex-hero-editions-20260913` | source `85a2995`, receipt `157971e` |

All these worktrees share the Git repository whose common directory is under `cortex-compass-integration/.git`. An old checkout is not an independent current production app. Preserve existing worktrees; do not reset, clean or merge them indiscriminately. Graph development must start from a new branch of the latest verified release and selectively import the graph checkpoint, or explicitly reconcile the old graph branch before use.
