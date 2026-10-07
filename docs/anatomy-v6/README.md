# Cortex Compass anatomy v6

The 3D teaching brain (`src/components/CortexBrain.jsx`) now loads a model built from one expert-reviewed
reference brain instead of an artist's sculpt with boxes painted on it. It's the same generic brain for everyone.
It is not a scan of anyone, and it never changes with answers.

## What changed for people using it

- **Real shapes.**
  - The deep structures come from a published atlas: amygdala, hippocampus (head, body, tail), thalamus, hypothalamus, caudate, putamen, nucleus accumbens, corpus callosum, cerebellar vermis and brainstem.
  - The insula is a folded sheet of cortex under the lateral sulcus.
  - The anterior cingulate is the front of the cingulate gyrus, wrapping the genu of the corpus callosum.
  - The corpus callosum is one arch with genu, body and splenium. It is split only at the midline, for the Left/Right controls.
- **Region edges follow sulci.** Cortex regions are groups of the atlas's own gyri. The motor and sensory strips meet at the central sulcus, and the temporal lobe sits below the lateral (Sylvian) fissure.
- **Solid cutaway.** The cut face is filled:
  - gray cortex, white matter and dark ventricles;
  - each deep structure in its own colour;
  - the picked structure drawn whole in front of the cut.

  Medial picks (ACC, PCC, precuneus, visual) show the midline section: callosal arch, third ventricle, thalamus, hypothalamus, brainstem, and vermis with its arbor vitae.
- **Picked parts are always shown.**
  - Lateral cortex opens Surface, turned to face it.
  - Medial cortex opens the medial cutaway.
  - Buried and internal parts open Deep structures, a see-through cortex that stays inside the panel.
  - If someone switches to a mode that would hide the pick, it shows as an x-ray.
  - The label's leader line ends on a visible part of the pick.
- **Smaller, cached files.**
  - Desktop: 1,126,072 bytes (v5: 9,398,032).
  - Phone: 629,524 bytes (v5: 7,236,132).
  - Content-hashed names with a one-year immutable cache.
- **Correct sides.** The patient's left hemisphere is on +X. The Left view shows a true left lateral view, frontal lobe to the viewer's left. v2/v5 had left and right mirrored (see "Handedness" below).

## Source and license

| Item | Value |
|---|---|
| Model | HuBMAP Human Reference Atlas, **"3D Reference Organ for Brain, Female" v1.4** |
| Creators / review | Kristen Browne, Heidi Schlehlein; reviewed by Song-Lin Ding |
| Basis | Allen Human Reference Atlas (Ding et al. 2016, *J Comp Neurol* 524:3127–3481); 141 structures, mirrored to a whole brain |
| License | **CC BY 4.0**. The metadata says: "In version v1.3, an update in licensing occurred; this brain model is now licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)." |
| DOI | https://doi.org/10.48539/HBM674.NTLM.353 |
| GLB | https://cdn.humanatlas.io/digital-objects/ref-organ/brain-female/v1.4/assets/3d-allen-f-brain.glb (sha256 `f20d87a347f8d5c6467439cba7db18f19307d29b2c3e0c2b6ddb7e9d49e1c1fc`) |
| Metadata | https://cdn.humanatlas.io/digital-objects/ref-organ/brain-female/v1.4/metadata.json (sha256 `a063705cc37ca128270e8d66fe5db1051c4a7f7eae75f186f6ad2bffa67b523f`) |

Every exported mesh lists its source, license, method and atlas parts in `public/models/cortex-brain-v6.manifest.json`. Credit is in `ATTRIBUTION.md` and in the viewer's "Model provenance".

### Sources considered and not used

- **CerebrA (Manera et al. 2020).** Released CC0. Its subcortical labels come from the Mindboggle "OASIS-TRT-20 jointfusion DKT31 CMA" atlas. Mindboggle publishes that atlas under CC BY 4.0, but it was made from the OASIS-TRT-20 manual subcortical labels, which are CC BY-NC-ND 4.0. It wasn't needed, so the question is left open rather than relied on.
- **MNI ICBM152 2009 templates.** McConnell permissive notice, but tissue maps only, no structure labels. Not needed.
- **CIT168 subcortical atlas** (Pauli et al. 2018, CC BY 4.0). It has a hypothalamus and accumbens, but HRA already has both in the same space as its cortex. Not needed.
- **Excluded by the brief**, so not used: BodyParts3D (CC BY-SA), Harvard-Oxford/FSL (non-commercial terms). No PAG atlas with a clear commercial license was found, so the PAG is built geometrically (below).

## Build (reproducible)

```sh
# Python 3.12 venv for stages 1-2
uv venv --python 3.12 .venv-anatomy && source .venv-anatomy/bin/activate
uv pip install -r art/blender/requirements-anatomy-v6.txt
python art/blender/anatomy_v6_atlas.py     # ~1 min: download (sha256-pinned), frame, 0.5 mm label volume
python art/blender/anatomy_v6_meshes.py    # ~1.5 min: surfaces, regions, cut helpers, fold shading
/Applications/Blender.app/Contents/MacOS/Blender --background --python art/blender/build_anatomy_v6.py   # ~1 min
npm run check:anatomy && npm test
```

Intermediates go to `.local-evidence/anatomy-v6/`, which is ignored. The Blender stage writes:

- `public/models/cortex-brain-v6-<hash>.glb` (desktop) and `cortex-brain-v6-mobile-<hash>.glb`;
- `cortex-brain-v6-poster-<hash>.jpg`;
- `cortex-brain-v6.manifest.json`;
- `src/data/brainModel.mjs`, which holds the file names the viewer loads;
- `art/blender/cortex-brain-v6.blend`, the packed desktop scene;
- the evidence renders.

A clean rebuild from a fresh venv and a fresh download reproduced byte-identical GLBs (sha256 `8542869d…` and `1a53452d…`).

**Any rebuild that changes the geometry changes the file names.** That is what makes the immutable cache rule in `public/_headers` safe.

### Stage 1: `anatomy_v6_atlas.py`

- **Mirror plane.** The atlas is a mirrored hemisphere pair, so the mirror plane is fitted from the 141 left/right pairs (median residual 0.003 mm).
- **Frame.** The plane becomes x = 0. The anterior–posterior commissure line is levelled (16.5° pitch in the source body pose), and the anterior commissure becomes the origin.
- **Axes.** +X patient left, +Y superior, +Z anterior. That is right-handed and the glTF convention.
- **Labels.** Each of the 283 atlas meshes is voxelised at 0.5 mm with generalised winding numbers, which are robust to the atlas's open meshes. The grid is symmetric, so left and right surfaces meet exactly on x = 0.

### Stage 2: `anatomy_v6_meshes.py`

- **Surfaces.**
  - Marching cubes on a field whose sign comes from the voxel mask, which fixes topology.
  - Near the surface, the value is the exact distance to the original atlas meshes, so there are no voxel terraces.
  - Taubin smoothing, then topology-preserving quadric decimation (MeshLab). Every closed surface is watertight.
- **Hemisphere regions.**
  - One closed outer surface per hemisphere.
  - Each vertex takes the nearest atlas cortical label. Labels are smoothed along the surface, and triangles are cut exactly on the label iso-lines.
  - The pieces still form a closed surface, which the cut fill needs.
  - Midline and non-cortical faces form a non-selectable "wall".
- **Medial fissure.** Where atlas medial cortex touches or crosses the mirror plane, it is kept 0.8 mm clear of it. The midline cut then shows only true midline tissue: callosum, septum, diencephalon.
- **Deep structures.** Each is a union of its atlas parts. Left halves are built and mirrored. The callosum is meshed whole, decimated once, then trimmed exactly at x = 0 (manifold3d), so the two halves share one rim.
- **PAG.** The atlas has no separate PAG outline. It is drawn as atlas midbrain tissue (tegmentum, colliculi, pretectal area) within 4 mm of the atlas cerebral aqueduct. That gives 1.04 cm³, about 14 mm along the aqueduct.
- **Insula.** A closed gray-matter volume of the atlas insular gyri: long, short, limen, and frontal and temporal agranular areas. It lies beneath the opercula.
- **Cut-fill helpers.** Hidden closed volumes for white matter (each hemisphere), ventricles (each side), cerebellar white matter, and aqueduct plus fourth ventricle.
- **Fold shading.** Baked into vertex colours from blurred occupancy: sulcal fundi dark, crowns light. Deep structures use only their own shape.

### Atlas name fixes

In HRA brain-female v1.4, the names of one consecutive block of meshes don't match where their geometry lies. They are assigned by position, checked against the label volume and isolated renders. Table `RELABEL` in stage 2 and `atlasRelabelled` in the manifest record this.

| File name | Geometry found | Used as |
|---|---|---|
| `posteroventral_putamen` | medial frontal band above the cingulate sulcus (10 cm³) | paracingulate → frontal |
| `paracingulate_gyrus` | anterior tip of the frontal lobe | frontal pole → frontal |
| `frontal_pole` | thin tract along the posterior horn | optic radiation (white matter) |
| `optic_radiation` | posteroventral edge of the putamen | putamen |
| `frontomarginal_gyrus` | anterior medial temporal surface | perirhinal → temporal |
| `perirhinal_gyrus_rostral_part_of_FuGt` | ventricular trigone | atrium of lateral ventricle |
| `atrium_of_lateral_ventricle` | ventromedial prefrontal surface | rostral gyrus → frontal |
| `rostral_gyrus` | anterior frontal margin | frontomarginal → frontal |

### Teaching regions → atlas gyri

| Region | Atlas parts |
|---|---|
| frontal | superior frontal gyrus, IFG triangular and opercular parts, frontal operculum, paracingulate, rostral, frontomarginal, frontal pole |
| dlpfc | middle frontal gyrus |
| ofc | gyrus rectus, medial, anterior/posterior intermediate and lateral orbital gyri, lateral olfactory gyrus |
| motor | primary motor cortex (precentral gyrus), rostral paracentral lobule |
| somatosensory | postcentral gyrus, caudal paracentral lobule |
| parietal | superior parietal lobule, supramarginal, angular, parietal operculum |
| precuneus | precuneus |
| temporal | middle and inferior temporal, fusiform (temporal), temporal pole, parahippocampal, perirhinal, ambiens, piriform |
| auditory | superior temporal gyrus, Heschl's gyrus, planum temporale, planum polare |
| occipital | superior and inferior occipital, occipital pole, occipital fusiform |
| visual | cuneus, lingual gyrus |
| pcc | cingulate gyrus caudal (posterior) part, cingulate isthmus |
| acc | cingulate gyrus rostral (anterior) part, subcallosal gyrus |
| insula | long and short insular gyri, limen, frontal and temporal agranular insular areas |

The deep regions are listed with their parts in the manifest.

## Handedness

glTF is right-handed. With +Y superior and +Z anterior, +X is the patient's **left**. v2/v5 put the meshes named "L" on −X and labelled the axes "+X right", so the whole model was a mirror image. Its "Left" camera showed what is physically a right lateral view, frontal lobe to the viewer's right.

v6 puts the left hemisphere on +X. The camera presets were updated to match: Left is at +X, Right at −X, Top has anterior up, Front faces the person.

The HRA source is itself a mirrored pair, so this only fixes the labelling. No asymmetry is claimed either way.

## Viewer

- **Loading.** `GLTFLoader` with `DRACOLoader`. The decoder is self-hosted in `public/libs/draco/` (Apache-2.0), with a pure-JS fallback if WebAssembly is refused. Lighting is `RoomEnvironment` plus `PMREMGenerator`, with no external files.
- **Cut fill.** A stencil cap per closed group: hemisphere patches, white matter, ventricles, and each structure. Caps are drawn in layer order: gray, then white, then CSF, then structures. The cut plane is 0.1 mm off the midline for medial picks, or through the picked structure's centre.
- **Mode for each pick.** Defined by `MEDIAL`, `DEEP_PICK`, `PICK_VIEW` and `DEEP_VIEW` at the top of `CortexBrain.jsx`.
- **Test hooks.**
  - Kept from v5: `data-mode`, `data-selected`, `data-selected-meshes`, `data-meshes` (47 selectable meshes), `data-triangles`, `data-lod`, `data-version` (`cc-blender-6.0`).
  - New: `data-selected-visible`, `data-label-target`, `data-cut`, `data-helper-meshes`, `data-drawn-triangles`.

## Verification

```sh
npm run build && node scripts/serve-dist-with-worker.mjs 5682    # dist through worker/index.js + public/_headers
CORTEX_TEST_ORIGIN=http://127.0.0.1:5682 node scripts/verify-anatomy-v6.mjs
CORTEX_TEST_ORIGIN=http://127.0.0.1:5682 node scripts/verify-blender-brain.mjs
```

`verify-anatomy-v6.mjs` checks, at 1440×1000 and 375×812:

- all 26 picks on the home atlas and the results explorer;
- the results "show in 3D" chips;
- that each pick is drawn, highlighted and labelled;
- that Deep structures stays inside its panel;
- that the print image is present;
- that there are no console, CSP or network errors.

It writes screenshots, contact sheets and `verification.json`.

## Limits

- One adult female reference brain, mirrored. It shows no individual variation and no measured asymmetry. Atlas boundaries are anatomical, not functional; the DLPFC is shown as the middle frontal gyrus.
- The PAG's thickness is a construction, not an atlas outline.
- The report plates (`public/reports/brain-*.{jpg,webp}`, owned by the reports screens) still show v5. Regenerate them with `scripts/render-report-plates-v6.mjs` against the v6 viewer when the report owner is ready.
- Earlier v2/v5 assets remain in the repository and are no longer loaded.
