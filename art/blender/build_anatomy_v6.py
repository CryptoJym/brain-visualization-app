"""Cortex Compass anatomy v6, stage 3 (Blender 5.2): teaching meshes -> versioned GLBs.

Run stages 1-2 with the Python venv first (docs/anatomy-v6/README.md), then:
    /Applications/Blender.app/Contents/MacOS/Blender --background --python art/blender/build_anatomy_v6.py

Writes public/models/cortex-brain-v6-<hash>.glb (desktop) and cortex-brain-v6-mobile-<hash>.glb,
public/models/cortex-brain-v6.manifest.json, src/data/brainModel.mjs (the file names the viewer
loads), art/blender/cortex-brain-v6.blend (desktop scene, packed) and evidence renders in
.local-evidence/anatomy-v6/renders/. Geometry: HuBMAP HRA 3D Reference Organ for Brain, Female
v1.4 (Allen Human Reference Atlas), CC BY 4.0. One generic reference brain; no respondent data.
Exported glTF axes: +X patient left, +Y superior, +Z anterior (right-handed).
"""
import bpy, bmesh, hashlib, json, math
from pathlib import Path
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art/blender'; OUT = ROOT / 'public/models'
STAGE2 = ROOT / '.local-evidence/anatomy-v6/stage2'
RENDERS = ROOT / '.local-evidence/anatomy-v6/renders'
VERSION = 'cc-blender-6.0'
CEREBRUM_LENGTH_UNITS = 6.4  # same framing as v2-v5
if not (STAGE2 / 'index.json').exists():
    raise SystemExit('Run art/blender/anatomy_v6_atlas.py and anatomy_v6_meshes.py (Python venv) first.')
index = json.loads((STAGE2 / 'index.json').read_text())
catalog_path = ROOT / 'src/data/anatomyRegions.json'
catalog = json.loads(catalog_path.read_text())
regions = {r['id']: r for r in catalog['regions']}
SOURCE = {
    'id': 'hra-brain-female-v1.4',
    'title': '3D Reference Organ for Brain, Female v1.4',
    'creators': 'Kristen Browne, Heidi Schlehlein (HuBMAP); reviewed by Song-Lin Ding',
    'basis': 'Allen Human Reference Atlas (Ding et al. 2016, J Comp Neurol 524:3127-3481)',
    'license': 'CC-BY-4.0',
    'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/',
    'url': 'https://doi.org/10.48539/HBM674.NTLM.353',
    'download': 'https://cdn.humanatlas.io/digital-objects/ref-organ/brain-female/v1.4/assets/3d-allen-f-brain.glb',
    'sha256': 'f20d87a347f8d5c6467439cba7db18f19307d29b2c3e0c2b6ddb7e9d49e1c1fc',
}
CAP = {  # cut-face fill colours (viewer cutaway)
    'grey': '#97a3ae', 'white': '#e8edf0', 'csf': '#1d3245', 'brainstem': '#aab6c0', 'cerebellum': '#9aa5b0',
}
WALL_COLOR = '#c3d0d9'
METHOD_NOTES = {
    'hemisphere-surface-split': 'Hemisphere outer surface split by nearest atlas cortical label; edges follow atlas gyral boundaries.',
    'atlas-union': 'Union of the atlas parts listed in atlasParts.',
    'atlas-grey-matter-volume': 'Closed grey-matter volume of the atlas insular gyri, beneath the lateral sulcus.',
    'cap-volume': 'Cut-face helper only (never drawn as a surface).',
}


def linear(hex_color):
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


# Canonical millimetres -> model units: cerebrum length 6.4, whole-model box centred on the origin.
desktop_entries = index['lods']['desktop']
lo = np.full(3, 1e9); hi = -lo.copy(); clo = lo.copy(); chi = hi.copy()
for e in desktop_entries:
    if e['layer'] == 'cap':
        continue
    v = np.load(STAGE2 / 'desktop' / e['file'])['V']
    lo = np.minimum(lo, v.min(0)); hi = np.maximum(hi, v.max(0))
    if e['capGroup'].startswith('hemisphere'):
        clo = np.minimum(clo, v.min(0)); chi = np.maximum(chi, v.max(0))
SCALE = CEREBRUM_LENGTH_UNITS / float(chi[2] - clo[2])
CENTER = (lo + hi) / 2
CENTER[0] = 0.0


def to_blender(points):  # glTF frame (X left, Y up, Z anterior) -> Blender (X, -Z, Y)
    p = (points - CENTER) * SCALE
    return np.c_[p[:, 0], -p[:, 2], p[:, 1]]


def material(name, hex_color, roughness=.5, metallic=.04):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*linear(hex_color), 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    mat.diffuse_color = (*linear(hex_color), 1)
    return mat


def cap_color(entry):
    if entry['capLayer'] == 3:
        return regions[entry['regionId']]['color']
    name = entry['name']
    if name.startswith('Cap_wm') or name == 'Cap_cerebellum_wm':
        return CAP['white']
    if name.startswith('Cap_ventricles') or name == 'Cap_hindbrain_csf':
        return CAP['csf']
    if name == 'Brainstem':
        return CAP['brainstem']
    if name == 'Cerebellar_hemispheres':
        return CAP['cerebellum']
    return CAP['grey']


def build(lod):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    objects = []
    for e in index['lods'][lod]:
        data = np.load(STAGE2 / lod / e['file'])
        v = to_blender(data['V'].astype(np.float64))
        f = data['F'].astype(np.int64)
        n = data['N'].astype(np.float64); n = np.c_[n[:, 0], -n[:, 2], n[:, 1]]
        ao = data['AO'].astype(np.float32)
        mesh = bpy.data.meshes.new(e['name'])
        mesh.vertices.add(len(v)); mesh.vertices.foreach_set('co', v.ravel())
        mesh.loops.add(f.size); mesh.loops.foreach_set('vertex_index', f.ravel())
        mesh.polygons.add(len(f)); mesh.polygons.foreach_set('loop_start', np.arange(0, f.size, 3))
        mesh.update(); mesh.validate(clean_customdata=False)
        mesh.polygons.foreach_set('use_smooth', np.ones(len(f), bool))
        # Per-corner normals: curved surface smooth across the midline seam; faces on the
        # mirror plane (where a left solid meets its mirror) keep their own flat normal.
        loops = n[f].reshape(-1, 3)
        flat = data['FLAT'] if 'FLAT' in data.files else np.zeros(len(f), bool)
        if flat.any():
            loops.reshape(-1, 3, 3)[flat] = (1.0 if e['hemisphere'] == 'R' else -1.0, 0.0, 0.0)
        mesh.normals_split_custom_set(loops.tolist())
        color = mesh.color_attributes.new('Color', 'BYTE_COLOR', 'POINT')
        rgba = np.repeat(ao[:, None], 4, 1); rgba[:, 3] = 1
        color.data.foreach_set('color', rgba.ravel())
        mesh.color_attributes.active_color = color
        obj = bpy.data.objects.new(e['name'], mesh)
        scene.collection.objects.link(obj)
        rid = e.get('regionId')
        if e['layer'] == 'cap':
            mat = material('Cut fill helper', cap_color(e), .9, 0)
        elif rid is None:
            mat = material('Medial wall', WALL_COLOR, .55)
        else:
            mat = material('Region ' + rid, regions[rid]['color'], .5 if e['kind'] == 'cortex' else .42)
        mesh.materials.append(mat)
        extras = {'regionId': rid or '', 'kind': e['kind'], 'layer': e['layer'], 'hemisphere': e['hemisphere'],
                  'helper': bool(e['helper']), 'capGroup': e['capGroup'], 'capLayer': int(e['capLayer']),
                  'capColor': cap_color(e), 'method': e['method'], 'source': SOURCE['id'], 'license': SOURCE['license'],
                  'educationalOnly': True, 'assetVersion': VERSION}
        if rid:
            extras['anatomy_note'] = regions[rid]['look']
        for key, value in extras.items():
            obj[key] = value
        obj['_meta'] = e
        objects.append(obj)
    return objects


def export(objects, path):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True, export_extras=True,
                              export_yup=True, export_animations=False, export_cameras=False, export_lights=False,
                              export_texcoords=False, export_normals=True, export_tangents=False,
                              export_vertex_color='ACTIVE', export_all_vertex_colors=False,
                              export_materials='EXPORT', export_image_format='NONE',
                              export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
                              export_draco_position_quantization=15, export_draco_normal_quantization=9,
                              export_draco_color_quantization=7)


manifest = {'version': VERSION, 'catalogVersion': catalog['version'], 'blender': bpy.app.version_string,
            'axes': '+X patient left, +Y superior, +Z anterior (right-handed glTF)', 'units': 'model units; cerebrum length 6.4',
            'millimetresPerUnit': round(1 / SCALE, 5), 'educationalOnly': True,
            'boundaryMethod': ('Cortical teaching regions are groups of atlas gyri from the HRA/Allen reference brain. '
                               'Each hemisphere surface is labelled by the nearest atlas cortical label, so region edges '
                               'follow the atlas gyral boundaries (sulcal fundi), then smoothed along the surface. '
                               'One generic reference brain, not a registration to any person.'),
            'source': SOURCE, 'compression': 'KHR_draco_mesh_compression (decoder self-hosted in /libs/draco/)',
            'atlasRelabelled': index['relabelled'], 'pagRadiusMm': index['pagRadiusMm'],
            'meshes': [], 'helpers': [], 'assets': {}, 'lods': {}}
manifest['catalogSha256'] = sha(catalog_path)
manifest['builderSha256'] = sha(Path(__file__))
manifest['stageScriptsSha256'] = {name: sha(ART / name) for name in ('anatomy_v6_atlas.py', 'anatomy_v6_meshes.py')}
names = {}
for lod in ('desktop', 'mobile'):
    objects = build(lod)
    tmp = RENDERS.parent / f'export-{lod}.glb'
    tmp.parent.mkdir(parents=True, exist_ok=True)
    export(objects, tmp)
    digest = sha(tmp)
    # Content-addressed names make the long-cache rule in public/_headers safe on every rebuild.
    final = OUT / (f'cortex-brain-v6-{digest[:10]}.glb' if lod == 'desktop' else f'cortex-brain-v6-mobile-{digest[:10]}.glb')
    stale = OUT.glob('cortex-brain-v6-mobile-*.glb') if lod == 'mobile' else \
        [p for p in OUT.glob('cortex-brain-v6-*.glb') if not p.name.startswith('cortex-brain-v6-mobile-')]
    for old in stale:
        old.unlink()
    tmp.rename(final)
    names[lod] = final.name
    tris = sum(len(o.data.polygons) for o in objects)
    shown = sum(len(o.data.polygons) for o in objects if o['layer'] != 'cap')
    manifest['assets'][final.name] = {'lod': lod, 'bytes': final.stat().st_size, 'sha256': sha(final),
                                      'triangles': tris, 'drawnTriangles': shown, 'meshes': len(objects)}
    manifest['lods'][lod] = final.name
    if lod == 'desktop':
        for o in objects:
            e = o['_meta']
            row = {'name': o.name, 'regionId': o['regionId'] or None, 'kind': o['kind'], 'layer': o['layer'],
                   'hemisphere': o['hemisphere'], 'triangles': len(o.data.polygons), 'capGroup': o['capGroup'],
                   'capLayer': o['capLayer'], 'source': SOURCE['id'], 'license': SOURCE['license'], 'method': o['method'],
                   'methodNote': METHOD_NOTES.get(o['method'], 'Geometric sleeve: atlas midbrain tissue within '
                                                  f"{index['pagRadiusMm']} mm of the atlas cerebral aqueduct."),
                   'atlasParts': list(e.get('atlasParts', []))}
            (manifest['helpers'] if o['helper'] else manifest['meshes']).append(row)
        for o in objects:
            del o['_meta']
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(ART / 'cortex-brain-v6.blend'), compress=True)
manifest['sourceBlendSha256'] = sha(ART / 'cortex-brain-v6.blend')
(OUT / 'cortex-brain-v6.manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
(ROOT / 'src/data/brainModel.mjs').write_text(
    '// Generated by art/blender/build_anatomy_v6.py; do not edit by hand.\n'
    f'export const MODEL_VERSION={json.dumps(VERSION)};\n'
    f"export const MODEL_FILES={json.dumps({'desktop': '/models/' + names['desktop'], 'mobile': '/models/' + names['mobile']}, indent=2)};\n")
print('V6_MANIFEST', json.dumps({k: manifest[k] for k in ('version', 'lods', 'assets')}))


# ---------------------------------------------------------------- evidence renders (desktop scene)
def look_dev():
    bpy.ops.wm.open_mainfile(filepath=str(ART / 'cortex-brain-v6.blend'))
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 48; scene.cycles.use_denoising = True
    scene.render.threads_mode = 'FIXED'; scene.render.threads = 8
    scene.render.resolution_x = 1200; scene.render.resolution_y = 960
    scene.render.film_transparent = False; scene.view_settings.view_transform = 'AgX'
    world = bpy.data.worlds.new('Cortex night'); scene.world = world; world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (.012, .026, .045, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = .55
    for mat in bpy.data.materials:  # fold shading: base colour x baked vertex occlusion
        if not mat.use_nodes:
            continue
        nodes = mat.node_tree.nodes; links = mat.node_tree.links
        bsdf = next((n for n in nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf is None:
            continue
        attr = nodes.new('ShaderNodeVertexColor'); attr.layer_name = 'Color'
        mix = nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
        mix.inputs['Factor'].default_value = 1.0
        mix.inputs[6].default_value = bsdf.inputs['Base Color'].default_value[:]
        links.new(attr.outputs['Color'], mix.inputs[7]); links.new(mix.outputs[2], bsdf.inputs['Base Color'])

    def light(name, location, energy, size, color):
        data = bpy.data.lights.new(name, 'AREA'); data.energy = energy; data.size = size; data.color = color
        obj = bpy.data.objects.new(name, data); scene.collection.objects.link(obj); obj.location = location
        obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    light('Key', (7, -6, 8), 1400, 7, (1, .97, .94)); light('Rim', (-6, 7, 5), 1100, 6, (.55, .82, 1))
    light('Fill', (-7, -7, -2), 420, 7, (.85, .8, 1))
    cam_data = bpy.data.cameras.new('Review camera'); cam_data.type = 'ORTHO'; cam_data.ortho_scale = 7.6
    cam = bpy.data.objects.new('Review camera', cam_data); scene.collection.objects.link(cam); scene.camera = cam
    return scene, cam


def shoot(scene, cam, name, direction, target=(0, 0, 0), up='Z', scale=7.6):
    target = Vector(target)
    cam.location = target + Vector(direction).normalized() * 30
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.ortho_scale = scale
    scene.render.filepath = str(RENDERS / f'{name}.png')
    bpy.ops.render.render(write_still=True)


RENDERS.mkdir(parents=True, exist_ok=True)
scene, cam = look_dev()
by_layer = lambda layer: [o for o in scene.objects if o.type == 'MESH' and o.get('layer') == layer]
for o in by_layer('cap') + by_layer('internal'):
    o.hide_render = True
# Views: +X is the patient's left, so a camera on +X sees the left hemisphere's lateral surface.
shoot(scene, cam, 'v6-left-lateral', (1, 0, 0.02))
shoot(scene, cam, 'v6-front-left-oblique', (0.75, -0.7, 0.4))
shoot(scene, cam, 'v6-top', (0, 0.001, 1))
# Deep structures inside a hidden cortex.
for o in scene.objects:
    if o.type == 'MESH':
        o.hide_render = o.get('layer') == 'cap' or o.get('kind') == 'cortex' or o.get('regionId') in ('brainstem', 'cerebellar_hemispheres')
shoot(scene, cam, 'v6-deep-structures', (0.75, -0.7, 0.4), (0, 0, -.2), scale=5.2)


def cut_view(plane_x, name, view_scale=7.6, target=(0, 0, 0)):
    """Solid cut: keep x > plane, Boolean-cap every closed solid; caps are layered toward the
    camera (grey < white < CSF < structures) so the face reads like a brain slice."""
    groups = {}
    for o in scene.objects:
        if o.type != 'MESH' or o.get('hemisphere') == 'R':
            continue
        if o.get('kind') == 'cortex' and o.get('layer') == 'surface':
            groups.setdefault('hemisphere-L', []).append(o)
        else:
            groups.setdefault(o.name, [o])
    made = []
    for key, objs in groups.items():
        first = objs[0]
        # join the hemisphere patches into one closed copy for the Boolean
        copies = []
        for o in objs:
            c = o.copy(); c.data = o.data.copy(); scene.collection.objects.link(c); copies.append(c)
        bpy.ops.object.select_all(action='DESELECT')
        for c in copies:
            c.select_set(True)
        bpy.context.view_layer.objects.active = copies[0]
        if len(copies) > 1:
            bpy.ops.object.join()
        solid = bpy.context.view_layer.objects.active
        bm = bmesh.new(); bm.from_mesh(solid.data)  # patches share border positions: weld into one closed solid
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(solid.data); bm.free()
        solid.name = 'Cut ' + key
        layer = first.get('capLayer', 0)
        offset = -0.0004 * layer  # ~0.01 mm nearer the camera per layer: grey < white < CSF < structures
        cutter_mesh = bpy.data.meshes.new('cutter')
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(cutter_mesh); bm.free()
        cutter = bpy.data.objects.new('cutter ' + key, cutter_mesh); scene.collection.objects.link(cutter)
        cutter.scale = (20, 20, 20); cutter.location = (plane_x + offset - 10, 0, 0)
        cutter.data.materials.append(material('Cut ' + first.get('capColor', '#999999'), first.get('capColor', '#999999'), .7, 0))
        cutter.hide_render = True
        mod = solid.modifiers.new('cut', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.object = cutter
        mod.solver = 'EXACT'; mod.material_mode = 'TRANSFER'
        bpy.context.view_layer.objects.active = solid
        bpy.ops.object.modifier_apply(modifier=mod.name)
        # Cut faces get flat shading; custom normals from the outer surface would streak them.
        with bpy.context.temp_override(object=solid, active_object=solid):
            bpy.ops.mesh.customdata_custom_splitnormals_clear()
        cap_index = list(solid.data.materials).index(cutter.data.materials[0]) if cutter.data.materials[0] in list(solid.data.materials) else -1
        for poly in solid.data.polygons:
            poly.use_smooth = poly.material_index != cap_index
        solid.hide_render = False
        made.append((solid, cutter))
    for o in scene.objects:
        if o.type == 'MESH' and not o.name.startswith('Cut ') and not o.name.startswith('cutter'):
            o.hide_render = True
    shoot(scene, cam, name, (-1, 0, 0.0), target, scale=view_scale)
    for solid, cutter in made:
        bpy.data.objects.remove(solid, do_unlink=True); bpy.data.objects.remove(cutter, do_unlink=True)


cut_view(0.1 * SCALE, 'v6-cut-midline')  # 0.1 mm: removes only the flat midline face, not medial cortex
cut_view(24.0 * SCALE, 'v6-cut-parasagittal-24mm', 7.6)


def gradient_over(png_path, jpg_path, quality=86):
    """Composite a transparent render over the viewer's card gradient and save a JPEG."""
    image = bpy.data.images.load(str(png_path))
    w, h = image.size
    px = np.array(image.pixels[:], np.float32).reshape(h, w, 4)
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx / w - .48) / .62) ** 2 + ((yy / h - (1 - .35)) / .62) ** 2)  # pixels are bottom-up
    stops = [(0, (0x15, 0x38, 0x4e)), (.48, (0x0a, 0x1b, 0x2b)), (.82, (0x07, 0x12, 0x1f)), (9, (0x07, 0x12, 0x1f))]
    bg = np.zeros((h, w, 3), np.float32)
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        t = np.clip((r - a) / (b - a), 0, 1)[..., None]
        m = ((r >= a) & (r < b))[..., None]
        bg = np.where(m, (np.array(ca) * (1 - t) + np.array(cb) * t) / 255, bg)
    alpha = px[..., 3:4]
    out = np.concatenate([px[..., :3] * alpha + bg * (1 - alpha), np.ones((h, w, 1), np.float32)], -1)
    result = bpy.data.images.new('composite', w, h)
    result.pixels = out.ravel().tolist()
    scene.render.image_settings.file_format = 'JPEG'; scene.render.image_settings.quality = quality
    result.save_render(str(jpg_path))
    scene.render.image_settings.file_format = 'PNG'


def perspective_shot(name, gltf_position, size, target=(0, 0, 0)):
    """Match the viewer: 35 degree vertical field of view, transparent background."""
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.film_transparent = True
    cam.data.type = 'PERSP'; cam.data.sensor_fit = 'VERTICAL'; cam.data.angle = math.radians(35)
    x, y, z = gltf_position
    cam.location = Vector((x, -z, y))
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(RENDERS / f'{name}.png')
    bpy.ops.render.render(write_still=True)
    scene.render.film_transparent = False; cam.data.type = 'ORTHO'
    scene.render.resolution_x, scene.render.resolution_y = 1200, 960
    return RENDERS / f'{name}.png'


for o in scene.objects:
    if o.type == 'MESH':
        o.hide_render = o.get('layer') in ('cap', 'internal')
poster_png = perspective_shot('poster', (7.2, 3.2, 7.2), (1020, 645))
poster_tmp = RENDERS / 'poster.jpg'
gradient_over(poster_png, poster_tmp)
poster = OUT / f'cortex-brain-v6-poster-{sha(poster_tmp)[:10]}.jpg'
for old in OUT.glob('cortex-brain-v6-poster-*.jpg'):
    old.unlink()
poster_tmp.rename(poster)
# Candidate v6 report plates (same names and size as public/reports/brain-*.jpg) for the report owner.
PLATES = RENDERS / 'report-plates-v6'; PLATES.mkdir(exist_ok=True)
for name, position in (('surface', (10.5, .8, 0)), ('right', (-10.5, .8, 0))):
    gradient_over(perspective_shot('plate-' + name, position, (680, 430)), PLATES / f'brain-{name}.jpg')
for o in scene.objects:
    if o.type == 'MESH':
        o.hide_render = o.get('layer') == 'cap' or o.get('kind') == 'cortex' or o.get('regionId') in ('brainstem', 'cerebellar_hemispheres')
gradient_over(perspective_shot('plate-deep', (7.2, 3.2, 7.2), (680, 430), (0, -.2, 0)), PLATES / 'brain-deep.jpg')
model_module = ROOT / 'src/data/brainModel.mjs'
model_module.write_text(model_module.read_text() + f"export const MODEL_POSTER={json.dumps('/models/' + poster.name)};\n")
manifest['poster'] = {'file': poster.name, 'bytes': poster.stat().st_size, 'sha256': sha(poster)}
(OUT / 'cortex-brain-v6.manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print('BLENDER_V6_COMPLETE')
