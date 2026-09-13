# Cortex Compass Neurocomposition Graph v1

Work item: eco-cq76kh. Owner: ChatGPT. Isolated worktree `cortex-compass-neurograph-v1`, branch `astra/cortex-neurograph-v1`, based on verified portable-profile completion `43ceccb`.

## Outcome

Replace the shallow hero-combination layer with a traceable graph that separates observed self-report from neuroscience context. The graph connects research evidence → functional systems → assessable processes → interactions → possible capabilities/trade-offs → environmental leverage → hero expression. It is deterministic and versioned.

## Scientific contract

Cortex Compass does not infer an individual's structural alteration, activation pattern, connectivity, hormone level, diagnosis, or brain maturity from history or questionnaire responses. A self-report can support a *reported functional pattern*. Research can identify group-level mechanisms and constraints that make an interpretation more or less plausible. Hero compositions are transparent product hypotheses unless direct joint evidence exists.

History, age, pubertal context, assigned sex, gender identity and hormonal context remain context variables. They may determine which studies are useful to read, but cannot manufacture a capability, a deficit, or a neural state.

## Mathematical contract

The engine computes support indices, not probabilities. Component fit is non-compensatory: a weak required component cannot be hidden by a strong one. Composition support uses a weighted geometric mean of reported component fit, counterexample agreement, evidence quality, interaction-evidence class and observation completeness. Environmental supports are reported separately as leverage/context, never as evidence that the composition is true.

No coefficient is presented as an empirically estimated personal effect size. All weights are explicit product-calibration parameters with tests for monotonicity, determinism and boundary behavior.
## Confidence lanes

Each output carries independent fields:

- `observationFit`: how strongly the required present-day patterns were reported.
- `counterexampleCoverage`: whether disconfirming examples were explicitly reviewed.
- `evidenceStrength`: quality/relevance of the cited research for the component processes.
- `interactionSupport`: direct-joint, convergent-component, transfer, or editorial hypothesis.
- `measurementGap`: direct neural measurement is absent unless an actual supported measurement is supplied in a future version.
- `supportIndex`: deterministic ranking aid, never a probability of a brain state or future outcome.

Labels are conservative: `reported-functional-fit`, `supported-candidate`, `plausible-candidate`, and `exploratory-composition`. Neural status remains `not-measured` in this questionnaire product.

## Graph layers

1. Framework systems: RDoC-aligned negative/positive valence, cognition, social process, arousal/regulation and sensorimotor constructs, plus explicit cross-cutting integration/agency layers.
2. Scientific processes: narrower functions such as threat discrimination, contextual memory, performance monitoring and reward prediction error.
3. Observation anchors: the existing 27 Deep Hero Atlas questions. Only these can create a personal functional fit in v1.
4. Evidence edges: source → process/system with relation type and applicability limits.
5. Interaction rules: pair/triple composition rules with synergy type, required components, evidence class, capability, overextension and environmental conditions.
6. Archetype layer: memorable hero language generated only from eligible interaction rules.
7. Explanation trace: every selected hero returns the exact observations, counterexamples, rule, evidence records and limits used.

## Release gates

- Graph contains at least 50 scientific process nodes and 100 interaction rules.
- Every referenced system/process/evidence/capability resolves.
- No demographic/history field enters the personal fit calculation.
- Counterexamples monotonically lower support; unknowns never increase it.
- Direct joint evidence outranks component-only evidence when observation fit is held constant.
- A composition cannot activate unless every required assessable component is supported.
- Existing 235+ tests and all browser/report/mobile regressions remain green.
- Scientific report exposes the trace and distinction between observation, research, hypothesis and unknown.
- Production publication requires native predecessor reconciliation and exact tested artifact verification.
