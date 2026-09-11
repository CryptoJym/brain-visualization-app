# Cortex Compass — Blender brain v2

## Delivered asset pipeline

Built on Studio0 with Blender 5.2.1 LTS. The surface is adapted from the existing
CC BY 4.0 model by AbdulMuhaymin, not generated imagery and not a new patient scan.
See the public asset manifest and the in-app provenance disclosure for attribution.

- Editable source: `art/blender/cortex-brain-v2.blend` (packed textures, review lights/camera).
- Rebuild: `art/blender/build_brain.py`.
- Desktop: `public/models/cortex-brain-v2.glb`.
- Compact/mobile: `public/models/cortex-brain-v2-mobile.glb`.
- Provenance, mesh counts and SHA-256: `public/models/cortex-brain-v2.manifest.json`.

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --threads 4 \
  --python art/blender/build_brain.py
npm run build
npm run preview -- --host 127.0.0.1 --port 5188 --strictPort
# In another terminal:
node scripts/verify-blender-brain.mjs
```

## What changed

Removed floating annotation planes and text from the source asset, normalized
only the anatomical surfaces, separated hemispheres, refined cortical geometry,
and retained/resized the source normal maps. Added 15 schematic inner structures
including bilateral hippocampi, amygdalae, thalami, insulae, anterior cingulate
segments and callosal arches, plus hypothalamus, PAG and cerebellar vermis.

## Viewer behavior and boundaries

Surface, medial cutaway, and opened-hemisphere deep views share the same model.
Selection changes materials/layers rather than rebuilding the WebGL renderer.
There are four camera presets, drag and keyboard orbit, zoom, optional rotation,
and a region selector with text explanations. Model failures remain explicit;
no fabricated replacement brain is displayed. Rendering pauses offscreen and
when the document is hidden; auto-rotation respects reduced-motion preferences.

The cortical colors/focus areas are approximate teaching locations, NOT atlas
parcellations. Added deep shapes and their locations are schematic and have not
been reviewed by a neuroanatomist. No respondent-specific geometry, injury,
measured activation, or clinical inference is produced by the viewer. The
questionnaire and scoring module were deliberately left unchanged.

## Verification and release

The production Vite bundle passed 37 automated Chromium checks before release:
19 meshes loaded; all ten topic selections; all four camera views produce distinct
frames; no remount during selection; drag-versus-click behavior; keyboard focus;
report integration; print visibility; mobile layout and LOD; failed asset download
with usable text guide; and no page/GLSL errors. Evidence stays in ignored
`.local-evidence/blender-v2/`. Run against a live site with `CORTEX_TEST_ORIGIN`.

Cloudflare target remains Worker `cortex-compass` at `cortexcompass.utlyze.com`.
The existing Worker, account, routes, storage and authentication settings are not
changed by this upgrade. The prior known release is version
`ab8f129e-4855-484e-9440-b4c005f758e3`; read current deployments before release.
Rollback uses Wrangler's rollback command with the verified prior version.
