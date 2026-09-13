# 03 — Exact neuroscience-graph checkpoint and next design

## What actually exists
Graph branch `astra/cortex-neurograph-v1` is now checkpointed as `aae0e60` and pushed. It remains based on the older portable-profile source, not the latest hero editions. It has no UI, report or live-engine imports. `graph-inventory.json` is an actual module-derived snapshot: 16 system nodes, 46 context-only constructs, 27 observation nodes, 24 named-composition nodes, 24 deduplicated evidence records, 137 total nodes, 212 static edges and five system-pair operators. Its standalone tests passed 9/9 during this handoff. A separate `processes.mjs` contains 16 partial records and is not used by the active draft graph builder.

All 351 unordered pairs of the 27 observations can be enumerated. There are mathematically 2,925 triples and 17,550 quadruples; the current implementation counts these larger spaces but does not evaluate all triples/quadruples as mechanisms. The 24 named heroes are imported from the existing product, not newly validated graph discoveries. Default output truncates sorted pair suggestions to 24. Do not repeat previous conversational promises of 100 heroes, 150 empirical links or 300 validated rules as completed work.

## File-by-file implementation
| Path relative to graph worktree | Current responsibility / limitation |
|---|---|
| `src/data/neurograph/systems.mjs` | Sixteen domain/system descriptions, framework labels, constructs and limits. RDoC-inspired mapping is editorial, not a validated taxonomy assignment. |
| `processes.mjs` in that directory | Sixteen manually begun records; incomplete and currently unused. Reconcile or explicitly archive, rather than maintaining a second conflicting taxonomy. |
| `model.mjs` | Builds nodes from live HERO_PROCESSES/HERO_COMPOSITIONS and a domain-to-system lookup; creates construct IDs from array positions. Positional IDs need stability review. |
| `evidenceRegistry.mjs` | Combines hero/development/framework records, last-record-wins deduplication by ID, and crude study-kind weights. It drops many study-specific measurement fields. |
| `operators.mjs` | Five hypothesized system-pair explanations: contextual detection, disciplined detection, adaptive monitoring, calibrated response, threat-to-recovery. These are proposed functional relations, not fitted coefficients. |
| `src/utils/neurograph/graphEngine.mjs` | Static edges, pair classification, combination counts, ID/edge checks. Shared citation and editorial-name membership presently influence pair classification. |
| `confidenceEngine.mjs` | Hard-coded self-report, counterexample, evidence and interaction weights; geometric means; uncalibrated support labels. Requires redesign before publication. |
| `weights.mjs` | Duplicate interaction-weight constant, not an independently justified model. Avoid diverging copies. |
| `compositionEngine.mjs` | Normalized observation states; eligibility; ranking of imported heroes/pairs; system summaries; preferred eligible signature. No direct brain measurement exists. |
| `environmentEngine.mjs` | Maps directly reported support/friction to systems; currently does not numerically boost neural evidence. Preserve that separation. |
| `explanationEngine.mjs` | Returns observations, source summaries, proposed capability/cost/conditions, reported context and unknowns. |
| `profileEngine.mjs` | Orchestrates profile, environment, selected explanation, eight pair explanations and graph integrity. |
| `tests/neurograph-v1.test.mjs` | Nine integrity/selection/counterexample/demographic-invariance tests. No calibration, clinical prediction or scientific validity test. |

## Current mathematics: document it, do not promote it
Observed answer weights are Often=1, Sometimes=0.72, Rarely=0.15, unknown/skip=0. Counterexample weights are Rarely=1, Sometimes=0.72, Often=0.28, unknown/missing=0.58. Their product becomes a component fit; the separate eligibility rule excludes frequent counterexamples. Evidence weights are inferred from study-kind strings (roughly 0.62–0.88). An evidence aggregate takes the largest weight plus a capped source-count bonus. Interaction weights range 0.43–0.90 and include labels such as named_convergent and shared_source. The composition index is a weighted geometric mean of fit, evidence aggregate and interaction value, multiplied by a counterexample-coverage factor; hard thresholds produce labels.

None of these constants was estimated from relevant participant data, validated out of sample, or calibrated to outcome frequencies. Calling the field `probability:false` does not make an otherwise scientific-sounding confidence label valid. A geometric mean is not intrinsically more scientific than addition. The current test that requires the fictional sample index to exceed 0.8 merely locks in the arbitrary rule; replace that acceptance target rather than treating it as evidence. Preserve the original code as a checkpoint so changes remain auditable.

## Specific defects and misleading shortcuts to resolve
Shared citation does not prove joint interaction; two constructs can appear in one paper with no relevant joint result. A named editorial hero does not provide convergent empirical evidence, yet current ranking rewards this. Meta-analysis status is not automatically high-quality evidence for a given individual claim. Reviews and primary papers can share cohorts, so source count must not automatically add confidence. Current evidence normalization loses sample, task, outcome, moderators, read-depth and correction details. Same-ID records can silently overwrite one another. Study kinds are lowercased but one classifier tests mixed-case fMRI/MRI strings, so branches can be missed. These are concrete implementation/design issues, not reasons to abandon the product.

Domain mapping also collapses distinct processes: threat/safety observations inherit broad salience/regulation systems; working-context observations inherit executive control; some systems/operators therefore have no mapped observations. The partial manual process file disagrees with that map. This needs explicit many-to-many process/system links and stable source IDs, not arbitrary extra nodes. Graph validation currently checks IDs/edges, not semantic entailment, evidence completeness, source authenticity, independent cohorts or intervention applicability.

## Target contract for the next implementation
Use distinct records for SourceStudy, Cohort, Measure/Task, StudyClaim, Construct/System, Relationship, PersonalObservation, Context, CandidateComposition and ArtSpecification. A study record retains ID/DOI/URL, design, participants, exposure, developmental measure, sex-variable definition, task/stimulus, actual outcome, estimate/scale/uncertainty when available, adjustment set, nulls, limitations, corrections, cohort IDs, read depth and review date. Each claim points to the particular result that supports it.

Separate measured associations, design-supported effects, co-recruitment, construct/task mappings, required observations, contextual moderation, hypothesized interactions, proposed supports and narrative metaphors. Retain null and contrary evidence. A joint-effect claim requires a specified outcome, scale and comparison. Independently studied main effects do not establish their interaction; shared cohorts are not independent replication.

Personal outputs need an evidence ledger rather than one confidence number: reported fit, counterexample coverage, measurement/directness, source consistency/independence, task/population relevance, joint-effect testing, direct individual measurement and prediction-calibration status. Any editorial ranking must be labeled as such. Numeric probabilities require suitable data, an explicit statistical model and out-of-sample calibration, none of which this prototype supplies.

Do not assume every difficulty is an overextended strength. Keep reported friction separate from a possible trade-off. Support is contextual, not a numerical subtraction or repair estimate. Pubertal stage and biological sex can contextualize appropriately matched research; neither supplies an individual anatomical finding. Preserve the current required Male/Female input contract and its old-record migration semantics.

## Integration and acceptance
Keep the current live selector in place while developing a versioned graph adapter. Maintain saved hero IDs, user choices and accepted portrait fingerprints. Any renamed ID requires an explicit compatibility rule. The new atlas should expose a readable observation-to-process-to-study path, the type of each edge, source limits and counterevidence. Scientific PDFs should retain those traces; the short hero edition should remain understandable. Graph visuals need accessible text alternatives and bounded traversal for mobile performance.

Release requires claim-level provenance, deterministic and counterexample-sensitive behavior, no unsupported inference from demographics/history, failure handling for malformed/unknown/versioned inputs, source-withdrawal tests, independent review of representative paths and the existing mobile/PDF/backup/portrait checks. Do not send private graph traces to Gamma or xAI. A later longitudinal validation/research-consent program is a separate unimplemented project, not proof already obtained.
