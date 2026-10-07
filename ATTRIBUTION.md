# Attribution

## 3D Brain Model

**Model:** "Brain - with labeled parts"
**Author:** AbdulMuhaymin
**Source:** Sketchfab
**URL:** https://skfb.ly/oTqPH
**License:** Creative Commons Attribution (CC-BY)
**License URL:** http://creativecommons.org/licenses/by/4.0/

This 3D brain model is used for educational visualization of the neurological impacts of Adverse Childhood Experiences (ACEs).

## Cortex Compass Blender v2 derivative

`art/blender/cortex-brain-v2.blend` and `public/models/cortex-brain-v2*.glb`
include surface geometry and normal textures adapted from the model credited
above, under CC BY 4.0. Changes: removed annotations, normalized framing,
separated hemispheres, refined/decimated geometry, resized textures, replaced
surface colors and materials, and added schematic inner teaching structures.
The original artist does not endorse Cortex Compass or its assessment logic.

This derivative is a generic educational illustration. New deep structures and
cortical teaching color boundaries are approximate, not MRI segmentations or
clinically reviewed atlas regions. See `docs/blender-upgrade/README.md` and the
public model manifest for the build and modification record.

## Cortex Compass v5 region-study derivative

`art/blender/cortex-brain-v5.blend` and `public/models/cortex-brain-v5*.glb`
derive from the v2 asset credited above. Cortical surfaces were split into
geometrically defined teaching areas, materials recolored, and bilateral caudate,
putamen and ventral-striatum guides added. Original normal maps are retained.
The model is supplied with CC BY 4.0 attribution to AbdulMuhaymin. Neither the
original artist nor the cited study authors are represented as endorsing this app.

Geometric partitions are not registered atlas labels, and added inner shapes are
schematic rather than MRI-derived segmentations. Study-region buttons are links
to educational anatomy, not reconstructions of a study participant or respondent.
The versioned manifest records source, builder, catalog and exported-asset hashes.

## Cortex Compass anatomy v6 (current model)

`public/models/cortex-brain-v6-*.glb` and `art/blender/cortex-brain-v6.blend` are built from
**"3D Reference Organ for Brain, Female" v1.4** (HuBMAP Human Reference Atlas; creators Kristen
Browne and Heidi Schlehlein; reviewed by Song-Lin Ding), https://doi.org/10.48539/HBM674.NTLM.353.
It was created from the Allen Human Reference Atlas (Ding et al. 2016, *J Comp Neurol*
524:3127–3481). **License: Creative Commons Attribution 4.0 International (CC BY 4.0)**,
https://creativecommons.org/licenses/by/4.0/. The licensors do not endorse Cortex Compass.

Changes made for this app: meshes voxelized at 0.5 mm and resurfaced; hemispheres separated at the
atlas mirror plane, oriented on the anterior–posterior commissure line and scaled; atlas gyri
grouped into 26 teaching regions; deep structures merged from their atlas parts (for example the
hippocampal head, body and tail); the periaqueductal gray drawn as a 4 mm layer around the atlas
cerebral aqueduct inside the atlas midbrain (the atlas has no separate PAG outline); eight atlas
meshes whose file names do not match their position reassigned by position (listed in
`public/models/cortex-brain-v6.manifest.json` → `atlasRelabelled`); simplified, given baked fold
shading and recolored. It is one generic reference brain shown the same way to everyone, not a
scan, segmentation or prediction of any person. Every mesh's source, license and method are in
the manifest.

The Draco decoder in `public/libs/draco/` is from three.js 0.158 (Google Draco), licensed under the
Apache License 2.0 (`public/libs/draco/LICENSE-Apache-2.0.txt`).

The v2 and v5 sections above describe the earlier models, which remain in the repository but are
no longer loaded by the app.
