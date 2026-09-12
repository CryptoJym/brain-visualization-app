# Question → study → anatomy: Cortex Compass v5

## Delivered scope

All 28 existing prompts now have an explicit research disposition: 6 link to
studies of a closely related exposure domain, 8 to related evidence with important
exposure mismatches, and 14 have no specific region assignment in this review.
These are editorial exposure-fit labels, NOT a validated evidence grading scale.

The library contains 15 structured primary-study records, including longitudinal
reward, peer-victimization and developmental imaging; sensory-region studies;
prenatal-context studies; a foster-care trial; and a 2026 ENIGMA mega-analysis.
Each record identifies participants, measurement, finding, timing, limitations,
laterality and source-review level. Existing questionnaire/domain references stay
available. An empty mapping does not mean no research exists or the event is minor.

Each study can select its corresponding teaching region and side in the actual
3D viewer. Regions can be isolated, framed, recolored or viewed from either side.
The question-level entry preserves answers when returning from research browsing.
Reports contain the actual study cards and question-match rationale, not a generic
review citation pasted onto every region. Shared studies are deduplicated.

## Model and provenance

- 26 selectable anatomy topics; 47 named GLB meshes.
- 12 bilateral cortical teaching partitions, with geometric rather than atlas
  boundaries; preserved cortical surface folds and normal maps.
- Added bilateral caudate, putamen and ventral-striatum/accumbens guides.
- Existing corpus-callosum, cingulate, insular and other inner guides exposed.
- Source: `art/blender/cortex-brain-v5.blend` with packed textures.
- Builder: `art/blender/build_research_regions.py`, executed in Blender 5.2.1 LTS.
- Runtime assets: `public/models/cortex-brain-v5*.glb`.
- Manifest: `public/models/cortex-brain-v5.manifest.json`; includes artifact hashes
  and hashes of the source blend, builder and anatomy catalog.
- The completed `src/data/anatomyRegions.json` generates `anatomyCatalog.mjs`
  through `node scripts/sync-anatomy.mjs`; `--check` verifies synchronization.

The surface derives from AbdulMuhaymin's CC BY 4.0 model; see ATTRIBUTION.md.
These are educational geometries, not registered atlas parcels or patient scans.
The visual, auditory and somatosensory patches do NOT reproduce an exact research
cluster or genital-representation field. The ventral-striatum guide is simplified.
Independent clinical validation and neuroanatomical expert review have not run.

## Research controls

`regionStudies.mjs` is the primary-study registry. `questionRegionLinks.mjs`
contains the complete question audit and distinguishes optional related reading
from the narrower default reading guide. `QUESTION-AUDIT.md` is a generated human
readable snapshot, not an independent source of mapping rules.

No numbers for damage, activation, protective buffering or personal risk are
computed. Measurement types are not interchanged. Exposure timing is not scan
age, a research sample is not an individual prediction, and independent findings
cannot be assumed for analyses sharing ABCD participants. Recent null findings,
contrasting directions and published source corrections remain explicit.

Bick et al. uses the final DTI Methods sample (69 total: 23 foster care, 26
institutional care and 20 never institutionalized), not the original trial's
136-person enrollment. Its callosal result is not described as normalized by
foster placement; persistent group differences are retained in the summary.

## Compatibility, verification and release

Questionnaire wording, IDs, `cc-reflection-4.0`, save schema 4 and custom age-range
semantics remain unchanged. Existing v4 answers reopen without migration; a notice
explains that the research guide changed. Earlier combined-question records keep
their separate legacy snapshot. Saving is still explicit browser-device storage,
not cloud accounts or Utlyze sign-in. No database, auth or DNS changes are included.

```sh
node scripts/sync-anatomy.mjs --check
node --test tests/assessment-timing-v4.test.mjs tests/research-regions-v5.test.mjs
npm run build
npm run preview -- --host 127.0.0.1 --port 5195 --strictPort
# Separate terminal; each script also accepts CORTEX_TEST_ORIGIN/OUTPUT:
node scripts/verify-research-v5.mjs
CORTEX_TEST_ORIGIN=http://127.0.0.1:5195 node scripts/verify-assessment-v4.mjs
CORTEX_TEST_ORIGIN=http://127.0.0.1:5195 node scripts/verify-blender-brain.mjs
```

PDF fixtures use fictional answers and the real WebGL canvas. Render and inspect
the PDF, including its source cards and brain framing, before release. Evidence
belongs in ignored `.local-evidence/research-v5/`; do not publish any real responses.

Deploy only the verified build using the established Keychain-backed Wrangler
channel. Target remains `cortex-compass` at `cortexcompass.utlyze.com`.
Prior release: `ab450296-401e-4e65-821c-74f30d75e3a0`; source base: `ccf0a74`.
Recheck native provider state before deployment. See RELEASE.md for the actual
source commit, current Worker version, live tests and served-asset hash checks.
