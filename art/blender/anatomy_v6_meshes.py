"""Cortex Compass anatomy v6, stage 2: label volume -> teaching meshes.

Run after anatomy_v6_atlas.py with the same Python venv:
    python art/blender/anatomy_v6_meshes.py

Every surface comes from the stage-1 label volume of the HRA/Allen reference brain (CC BY 4.0):
  * each hemisphere is one closed outer surface; its faces are split into teaching regions
    by the nearest atlas cortical label, so region edges follow the atlas gyral boundaries
    (sulcal fundi) and are smoothed on the surface, not boxed;
  * deep structures are unions of their atlas parts (e.g. hippocampal head + body + tail);
  * the periaqueductal grey is not a separate structure in the source: it is built as the
    atlas midbrain tissue within PAG_RADIUS_MM of the atlas cerebral aqueduct;
  * cap-only helper volumes (white matter, ventricles, cerebellar white matter) let the
    viewer fill a cut face with grey matter, white matter and CSF in the right places.
Left-side meshes are built once and mirrored, because the source is a mirrored pair.
Output (ignored, regenerable): .local-evidence/anatomy-v6/stage2/<lod>/*.npz and index.json
in canonical millimetres (+X left, +Y superior, +Z anterior, origin at the anterior commissure).
"""
import json, time
from pathlib import Path
import numpy as np
from scipy import ndimage, sparse
from scipy.spatial import cKDTree
from skimage import measure

ROOT = Path(__file__).resolve().parents[2]
STAGE1 = ROOT / '.local-evidence/anatomy-v6/stage1'
OUT = ROOT / '.local-evidence/anatomy-v6/stage2'
PAG_RADIUS_MM = 4.0
FISSURE_MM = 0.8  # minimum gap between medial cortex and the mirror plane (off the voxel centres)
WHOLE_THEN_TRIM = ('callosum',)  # one continuous arch: decimated whole, then cut exactly at x = 0

# HRA brain-female v1.4 names one consecutive block of meshes after a neighbouring entry.
# Each mesh below is assigned by where its geometry actually lies (checked against the
# label volume and renders; see docs/anatomy-v6/README.md), not by its file name.
RELABEL = {
    'posteroventral_putamen': 'paracingulate_gyrus',  # medial frontal band above the cingulate sulcus
    'paracingulate_gyrus': 'frontal_pole',  # anterior tip of the frontal lobe
    'frontal_pole': 'optic_radiation',  # thin tract along the posterior horn
    'optic_radiation': 'posteroventral_putamen',  # posteroventral edge of the putamen
    'frontomarginal_gyrus': 'perirhinal_gyrus',  # anterior medial temporal surface
    'perirhinal_gyrus_rostral_part_of_FuGt': 'atrium_of_lateral_ventricle',  # ventricular trigone
    'atrium_of_lateral_ventricle': 'rostral_gyrus',  # ventromedial prefrontal surface
    'rostral_gyrus': 'frontomarginal_gyrus',  # anterior frontal margin
}
CORTEX = {
    'frontal': ['superior_frontal_gyrus', 'inferior_frontal_gyrus_triangular_part', 'inferior_frontal_gyrus_opercular_part',
                'frontal_operculum', 'paracingulate_gyrus', 'rostral_gyrus', 'frontal_pole', 'frontomarginal_gyrus'],
    'dlpfc': ['middle_frontal_gyrus'],
    'ofc': ['gyrus_rectus_straight_gyrus', 'medial_orbital_gyrus', 'anterior_intermediate_orbital_gyrus',
            'posterior_intermediate_orbital_gyrus', 'lateral_orbital_gyrus', 'lateral_olfactory_gyrus'],
    'motor': ['primary_motor_cortex', 'paracentral_lobule_rostral_part'],
    'somatosensory': ['postcentral_gyrus', 'paracentral_lobule_caudal_part'],
    'parietal': ['supraparietal_lobule', 'supramarginal_gyrus', 'angular_gyrus', 'parietal_operculum'],
    'precuneus': ['precuneus'],
    'temporal': ['middle_temporal_gyrus', 'inferior_temporal_gyrus', 'occipitotemporal_fusiform_gyrus_temporal_part',
                 'temporal_pole', 'anterior_parahippocampal_gyrus', 'posterior_parahippocampal_gyrus', 'gyrus_ambiens',
                 'piriform_region', 'perirhinal_gyrus'],
    'auditory': ['superior_temporal_gyrus', 'transverse_temporal_gyrus_Heschls_gyrus', 'planum_temporale', 'planum_polare'],
    'occipital': ['superior_occipital_gyrus', 'inferior_occipital_gyrus', 'occipital_pole',
                  'lateral_occipitotemporal_fusiform_gyrus_occipital_part'],
    'visual': ['cuneus', 'lingual_gyrus_medial_occipitotemporal_gyrus'],
    'pcc': ['cingulate_gyrus_caudal_posterior_part', 'ingulo_parahippocampal_isthmus'],
    'acc': ['cingulate_gyrus_rostral_anterior_part', 'subcallosal_gyrus_parolfactory_gyrus'],
    'insula': ['long_insular_gyri', 'short_insular_gyri', 'limen_insula', 'frontal_agranular_insular_cortex_area_Fl',
               'temporal_agranular_insular_cortex_area_Tl'],
}
DEEP = {  # bilateral forebrain structures, built on the left and mirrored
    'amygdala': ['amygdaloid_complex', 'anterior_amygdaloid_area', 'central_nuclear_group', 'lateral_nucleus',
                 'basolateral_nucleus_basal_nucleus', 'basomedial_nucleus_accessory_basal_nucleus',
                 'anterior_cortical_nucleus', 'posterior_cortical_nucleus', 'medial_nucleus', 'amygdalohippocampal_area'],
    'hippocampus': ['head_of_hippocampus', 'body_of_hippocampus', 'tail_of_hippocampus'],
    'thalamus': ['thalamus', 'anterior_nuclear_complex_of_thalamus', 'lateral_dorsal_nucleus_of_thalamus',
                 'mediodorsal_nucleus_of_thalamus', 'reuniens_nucleus_medioventral_nucleus_of_thalamus',
                 'lateral_posterior_nucleus_of_thalamus', 'pulvinar_of_thalamus', 'ventral_anterior_nucleus_of_thalamus',
                 'ventral_lateral_nucleus_of_thalamus', 'ventral_posterior_lateral_nucleus', 'ventral_posterior_medial_nucleus',
                 'dorsal_lateral_geniculate_nucleus', 'medial_geniculate_nuclei', 'centromedian_nucleus_of_thalamus',
                 'parafascicular_nucleus_of_thalamus', 'midline_nuclear_complex'],
    'caudate': ['head_of_caudate', 'body_of_caudate', 'tail_of_caudate'],
    'putamen': ['putamen', 'posteroventral_putamen'],
    'ventral_striatum': ['nucleus_accumbens'],
    'callosum': ['corpus_callosum'],
}
MIDLINE = {  # single meshes across the midline
    'hypothalamus': ['hypothalamus', 'preoptic_region_of_HTH', 'supraoptic_region_of_HTH', 'tuberal_region_of_HTH',
                     'mammillary_region_of_HTH'],
    'cerebellum': ['cerebellar_vermis'],
}
FOREBRAIN_OTHER = ['white_matter_of_forebrain', 'anterior_commissure', 'fornix', 'mammillothalamic_tract', 'optic_tract',
                   'optic_radiation', 'claustrum', 'external_segment_of_globus_pallidus',
                   'internal_segment_of_globus_pallidus', 'basal_forebrain', 'septal_nuclei',
                   'bed_nucleus_of_stria_terminalis', 'zona_incerta', 'subthalamic_nucleus', 'habenular_nuclei',
                   'pineal_body', 'optic_chiasm']
VENTRICLES = ['anterior_horn_of_lateral_ventricle', 'body_of_lateral_ventricle', 'atrium_of_lateral_ventricle',
              'posterior_horn_of_lateral_ventricle', 'inferior_horn_of_lateral_ventricle', 'third_ventricle']
BRAINSTEM = ['midbrain_tegmentum', 'cerebral_peduncle_crus_cerebri', 'substantia_nigra', 'red_nucleus',
             'superior_colliculus', 'inferior_colliculus', 'pretectal_region', 'basilar_part_of_pons', 'pontine_tegmentum',
             'pyramidal_part_of_medulla_oblongata', 'tegmentum_of_medulla_oblongata', 'inferior_olive',
             'superior_cerebellar_peduncle_brachium_conjunctivum', 'middle_cerebellar_peduncle',
             'inferior_cerebellar_peduncle']
HINDBRAIN_CSF = ['cerebral_aqueduct', 'fourth_ventricle', 'central_canal_of_medulla_oblongata']
CEREBELLUM = ['lateral_hemisphere_of_cerebellum', 'paravermis_of_cerebellum', 'cerebellar_deep_nuclei']
HINDBRAIN_WM = ['white_matter_of_hindbrain']
EXCLUDED = ['olfactory_bulb', 'olfactory_tract', 'anterior_olfactory_nucleus']  # thin basal tracts, not taught

# Triangle budgets per level of detail.
BUDGET = {
    'desktop': {'hemisphere': 54000, 'wm': 14000, 'ventricles': 3000, 'cerebellum': 14000, 'cerebellum_wm': 3500,
                'brainstem': 6000, 'hindbrain_csf': 600, 'amygdala': 1400, 'hippocampus': 2200, 'thalamus': 2400,
                'caudate': 2200, 'putamen': 1800, 'ventral_striatum': 900, 'callosum': 2600, 'hypothalamus': 1600,
                'cerebellum_vermis': 3200, 'pag': 900, 'insula': 2600},
    'mobile': {'hemisphere': 24000, 'wm': 6500, 'ventricles': 1500, 'cerebellum': 6500, 'cerebellum_wm': 1800,
               'brainstem': 3000, 'hindbrain_csf': 300, 'amygdala': 800, 'hippocampus': 1200, 'thalamus': 1300,
               'caudate': 1200, 'putamen': 1000, 'ventral_striatum': 500, 'callosum': 1400, 'hypothalamus': 900,
               'cerebellum_vermis': 1700, 'pag': 500, 'insula': 1400},
}


def base_name(node):
    name = node[len('Allen_'):] if node.startswith('Allen_') else node.replace('VH_F_', '')
    side = 'M'
    if name.endswith('_L') or name.endswith('_R'):
        name, side = name[:-2], name[-1]
    return RELABEL.get(name, name), side


def load():
    data = np.load(STAGE1 / 'labels.npz')
    meta = json.loads((STAGE1 / 'labels.json').read_text())
    label = data['label']; origin = data['origin'].astype(float); sp = float(data['spacing'])
    names = {int(k): v['name'] for k, v in meta['labels'].items()}
    groups = {}
    for table in (CORTEX, DEEP, MIDLINE):
        for key, members in table.items():
            for m in members:
                groups.setdefault(m, []).append(key)
    for key, members in {'forebrain_other': FOREBRAIN_OTHER, 'ventricles': VENTRICLES, 'brainstem': BRAINSTEM,
                         'hindbrain_csf': HINDBRAIN_CSF, 'cerebellar_cortex': CEREBELLUM, 'hindbrain_wm': HINDBRAIN_WM,
                         'excluded': EXCLUDED}.items():
        for m in members:
            groups.setdefault(m, []).append(key)
    seen = {base_name(n)[0] for n in names.values()}
    missing = sorted(seen - set(groups)); unused = sorted(set(groups) - seen); doubled = sorted(k for k, v in groups.items() if len(v) > 1)
    if missing or unused or doubled:
        raise SystemExit(f'atlas grouping incomplete: missing={missing} unused={unused} doubled={doubled}')
    lut = {}
    for i, node in names.items():
        lut[i] = groups[base_name(node)[0]][0]
    return label, origin, sp, names, lut, meta


def grid_coords(origin, sp, shape):
    return [origin[k] + sp * np.arange(shape[k]) for k in range(3)]


def mask_for(label, lut, keys):
    keys = {keys} if isinstance(keys, str) else set(keys)
    ids = np.array([i for i, k in lut.items() if k in keys], dtype=np.int16)
    return np.isin(label, ids)


def largest_component(mask):
    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    return lab == (1 + int(np.argmax(sizes)))


class Soup:
    """Atlas meshes in the canonical frame, outward oriented, for exact signed distances."""
    def __init__(self, path):
        data = np.load(path)
        self.meshes = {}
        for key in data.files:
            if key.endswith('__V'):
                name = key[:-3]
                v, f = data[key].astype(np.float64), data[name + '__F'].astype(np.int64)
                if signed_volume(v, f) < 0:  # the mirror flip reverses winding
                    f = f[:, ::-1].copy()
                self.meshes[name] = (v, f)

    def union(self, nodes):
        vs, fs, offset = [], [], 0
        for node in nodes:
            v, f = self.meshes[node]
            vs.append(v); fs.append(f + offset); offset += len(v)
        return np.vstack(vs), np.vstack(fs)


def surface(mask, origin, sp, sigma=0.6, side=None, keep_all=False, soup=None, band=2, clip_offset=None):
    """Marching cubes of a solid (outward normals, mm).

    The binary mask (per-mesh winding numbers from stage 1) decides inside/outside, so filled
    cavities and chosen components are respected. When a mesh soup is given, voxels within
    `band` of the mask boundary take their exact distance to the original atlas meshes, so the
    surface keeps the atlas shape at sub-voxel precision instead of voxel terraces. The sign
    always comes from the mask: summed winding numbers of large open atlas shells (e.g. the
    forebrain white matter) are not reliable near the cortex.

    side='L' keeps x >= 0 of the whole (both-sided) solid. The clip is applied after smoothing,
    so the surface runs straight into a crisp cut face and a mirrored right half continues it
    without a groove. `clip_offset` (mm, per voxel) moves the clip off the plane locally: the
    hemisphere uses it to keep medial cortex clear of the midline (an open fissure)."""
    import igl
    if side == 'L':
        mask = mask.copy()
        mask[:max(int(np.searchsorted(origin[0] + sp * np.arange(mask.shape[0]), -3 * sp)), 0)] = False
    idx = np.argwhere(mask)
    lo = np.maximum(idx.min(0) - 3, 0); hi = np.minimum(idx.max(0) + 4, mask.shape)
    sub = np.pad(mask[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]], 2)
    base = origin + (lo - 2) * sp
    if soup is None:
        inside = ndimage.distance_transform_edt(sub)
        outside = ndimage.distance_transform_edt(~sub)
        field = ndimage.gaussian_filter(((outside - inside) * sp).astype(np.float32), sigma)
    else:
        field = np.where(sub, -band * sp, band * sp).astype(np.float32)
        ring = ndimage.binary_dilation(sub, iterations=band) & ~ndimage.binary_erosion(sub, iterations=band)
        cells = np.argwhere(ring)
        points = base + cells * sp
        dist = np.abs(igl.signed_distance(points, soup[0], soup[1], sign_type=igl.SIGNED_DISTANCE_TYPE_UNSIGNED)[0])
        inside = sub[tuple(cells.T)]
        dist = np.maximum(dist, 0.01)
        field[tuple(cells.T)] = np.clip(np.where(inside, -dist, dist), -band * sp, band * sp)
        if sigma:
            field = ndimage.gaussian_filter(field, sigma)
    if side == 'L':
        x = (base[0] + sp * np.arange(field.shape[0]))[:, None, None].astype(np.float32)
        if clip_offset is not None:
            offset = np.pad(clip_offset[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]], 2, mode='edge')
            field = np.maximum(field, offset - x)
        else:
            field = np.maximum(field, -x)
    field[field == 0.0] = 1e-5  # samples exactly on the iso-level make marching cubes leave cracks
    verts, faces, _, _ = measure.marching_cubes(field, level=0.0, spacing=(sp, sp, sp))
    verts = verts + base
    faces = faces[:, ::-1].copy()  # skimage winds faces for gradient descent; flip so normals point out
    v, f = clean(verts, faces, keep_all)
    if signed_volume(v, f) < 0:
        f = f[:, ::-1].copy()
    if side == 'L':  # snap the cut face exactly onto the mirror plane
        v[np.abs(v[:, 0]) < 0.02 * sp, 0] = 0.0
    return v, f


def clean(v, f, keep_all=False):
    import trimesh
    m = trimesh.Trimesh(v, f, process=True)
    m.remove_unreferenced_vertices()
    if not keep_all:
        parts = m.split(only_watertight=False)
        if len(parts) > 1:
            m = max(parts, key=lambda p: len(p.faces))
    return np.asarray(m.vertices, float), np.asarray(m.faces, np.int64)


def signed_volume(v, f):
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    return float(np.einsum('ij,ij->i', a, np.cross(b, c)).sum() / 6.0)


def taubin(v, f, iterations=6, lam=0.5, mu=-0.53):
    n = len(v)
    e = np.vstack([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]])
    adj = sparse.coo_matrix((np.ones(len(e) * 2), (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])), shape=(n, n)).tocsr()
    adj.data[:] = 1.0
    deg = np.asarray(adj.sum(1)).ravel()
    w = sparse.diags(1.0 / np.maximum(deg, 1)) @ adj
    fixed = np.abs(v[:, 0]) < 1e-9  # keep mirror-plane vertices on the plane
    for _ in range(iterations):
        for factor in (lam, mu):
            moved = v + factor * (w @ v - v)
            moved[fixed, 0] = 0.0
            v = moved
    return v


def decimate(v, f, target, keep_all=False):
    """Quadric edge collapse (MeshLab) that preserves topology, so closed solids stay closed."""
    import pymeshlab
    on_plane = np.abs(v[:, 0]) < 1e-9
    if len(f) > target:
        ms = pymeshlab.MeshSet()
        ms.add_mesh(pymeshlab.Mesh(np.asarray(v, np.float64), np.asarray(f, np.int32)))
        ms.meshing_decimation_quadric_edge_collapse(targetfacenum=int(target), preservetopology=True, preservenormal=True,
                                                    optimalplacement=True, planarquadric=True, qualitythr=0.45,
                                                    autoclean=True)
        mesh = ms.current_mesh()
        v, f = clean(np.asarray(mesh.vertex_matrix(), float), np.asarray(mesh.face_matrix(), np.int64), keep_all)
    if on_plane.any():  # keep cut faces exactly on the mirror plane after collapse
        v[np.abs(v[:, 0]) < 0.05, 0] = 0.0
    return v, f


def flat_faces(v, f):
    """Faces lying on the mirror plane x = 0 (the cut where a left solid meets its mirror)."""
    return np.all(np.abs(v[f][:, :, 0]) < 1e-6, axis=1)


def vertex_normals(v, f):
    """Area-weighted normals of the curved surface. Faces on the mirror plane are left out and
    vertices on the plane get no x component, so mirrored halves join without a shading seam."""
    flat = flat_faces(v, f)
    fn = np.cross(v[f[:, 1]] - v[f[:, 0]], v[f[:, 2]] - v[f[:, 0]])
    fn[flat] = 0.0
    n = np.zeros_like(v)
    for k in range(3):
        np.add.at(n, f[:, k], fn)
    seam = np.abs(v[:, 0]) < 1e-6
    n[seam, 0] = 0.0
    empty = np.linalg.norm(n, axis=1) < 1e-12  # interior of a cut face
    n[empty] = (-1.0, 0.0, 0.0)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def sample(volume, origin, sp, points):
    coords = ((points - origin) / sp).T
    return ndimage.map_coordinates(volume, coords, order=1, mode='nearest')


def self_occupancy(mask, origin, sp, sigma_mm=(1.2, 2.4)):
    """Blurred occupancy of one solid (cropped), for its own fold shading."""
    idx = np.argwhere(mask)
    lo = np.maximum(idx.min(0) - 12, 0); hi = np.minimum(idx.max(0) + 13, mask.shape)
    sub = mask[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]].astype(np.float32)
    base = origin + lo * sp
    return [ndimage.gaussian_filter(sub, s_ / sp) for s_ in sigma_mm], base


def obscurance(occupancy_fine, occupancy_coarse, origin, sp, v, n, strength=(0.42, 0.5)):
    """Fold shading: how enclosed each surface point is (sulcal fundi dark, crowns light)."""
    fine = sample(occupancy_fine, origin, sp, v + 0.6 * n)
    coarse = sample(occupancy_coarse, origin, sp, v + 1.5 * n)
    s = lambda x, a, b: np.clip((x - a) / (b - a), 0, 1) ** 1.5
    ao = (1 - strength[0] * s(fine, 0.18, 0.62)) * (1 - strength[1] * s(coarse, 0.22, 0.6))
    return np.clip(ao, 0.3, 1.0).astype(np.float32)


def smooth_scores(f, n_vertices, scores, iterations=12, alpha=0.55):
    e = np.vstack([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]])
    adj = sparse.coo_matrix((np.ones(len(e) * 2), (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])),
                            shape=(n_vertices, n_vertices)).tocsr()
    adj.data[:] = 1.0
    w = sparse.diags(1.0 / np.maximum(np.asarray(adj.sum(1)).ravel(), 1)) @ adj
    for _ in range(iterations):
        scores = (1 - alpha) * scores + alpha * (w @ scores)
    return scores


def split_by_labels(v, f, n, ao, scores, eps=1e-7):
    """Cut faces along iso-lines of the smoothed label scores; returns per-label meshes.

    Scores are linear on each triangle, so every label owns a convex piece of it. A face is
    clipped against every label present at any of its corners, which makes the cut points on a
    shared edge depend only on that edge: neighbouring faces produce identical vertices and the
    union of all pieces stays closed (needed for the viewer's cut-face fill)."""
    best = scores.argmax(1)
    present = scores > 1e-5
    keys = {}
    verts = [v]; norms = [n]; aos = [ao]; count = [len(v)]

    def vertex_id(p):
        if p[4] >= 0:
            return p[4]
        key = tuple(np.round(p[0], 6))
        if key not in keys:
            keys[key] = count[0]; count[0] += 1
            nn = p[1] / max(np.linalg.norm(p[1]), 1e-12)
            verts.append(p[0][None]); norms.append(nn[None]); aos.append(np.array([p[2]], np.float32))
        return keys[key]

    out = {}
    tri_labels = best[f]
    uniform = (tri_labels[:, 0] == tri_labels[:, 1]) & (tri_labels[:, 1] == tri_labels[:, 2])
    uniform &= present[f].sum(2).max(1) == 1  # a corner with a second label may still cut the face
    for lab in np.unique(best):
        out[int(lab)] = [f[uniform & (tri_labels[:, 0] == lab)]]
    for face in f[~uniform]:
        cand = np.flatnonzero(present[face].any(0)).tolist()
        for a in cand:
            poly = [(v[i], n[i], ao[i], scores[i], int(i)) for i in face]
            for b in cand:
                if b == a or len(poly) < 3:
                    continue
                clipped = []
                for k in range(len(poly)):
                    p0, p1 = poly[k], poly[(k + 1) % len(poly)]
                    d0 = p0[3][a] - p0[3][b]; d1 = p1[3][a] - p1[3][b]
                    if d0 >= 0:
                        clipped.append(p0)
                    if (d0 >= 0) != (d1 >= 0):
                        t = d0 / (d0 - d1)
                        if t <= eps:
                            if d0 < 0:
                                clipped.append(p0)
                        elif t >= 1 - eps:
                            clipped.append(p1)
                        else:
                            clipped.append((p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1]),
                                            p0[2] + t * (p1[2] - p0[2]), p0[3] + t * (p1[3] - p0[3]), -1))
                poly = clipped
            if len(poly) < 3:
                continue
            ids = [vertex_id(p) for p in poly]
            ids = [x for k, x in enumerate(ids) if x != ids[k - 1]]
            for k in range(1, len(ids) - 1):
                if len({ids[0], ids[k], ids[k + 1]}) == 3:
                    out.setdefault(a, []).append(np.array([[ids[0], ids[k], ids[k + 1]]]))
    V = np.vstack(verts); N = np.vstack(norms); A = np.concatenate(aos)
    meshes = {}
    for lab, chunks in out.items():
        chunks = [c for c in chunks if len(c)]
        if not chunks:
            continue
        faces = np.vstack(chunks)
        used, inverse = np.unique(faces, return_inverse=True)
        meshes[lab] = (V[used], inverse.reshape(-1, 3), N[used], A[used])
    return meshes, (V, N, A)


def taubin_pair(mesh):
    v, f = mesh
    return taubin(v, f, 4), f


def trim_left(v, f):
    """Keep x >= 0 of a closed whole mesh with an exact flat cut face (manifold3d). Normals come
    from the whole mesh, so the left half and its mirror share one smooth rim."""
    import manifold3d as m3d
    full_n = vertex_normals(v, f)
    half = m3d.Manifold(m3d.Mesh(vert_properties=v.astype(np.float32), tri_verts=f.astype(np.uint32)))
    out = half.trim_by_plane((1.0, 0.0, 0.0), 0.0).to_mesh()
    hv = np.asarray(out.vert_properties, np.float64)[:, :3]; hf = np.asarray(out.tri_verts, np.int64)
    hv[np.abs(hv[:, 0]) < 1e-5, 0] = 0.0
    _, nearest = cKDTree(v).query(hv)
    n = full_n[nearest].copy()
    n[hv[:, 0] == 0.0, 0] = 0.0
    flat_only = np.ones(len(hv), bool)
    flat_only[hf[~flat_faces(hv, hf)].ravel()] = False
    n[flat_only] = (-1.0, 0.0, 0.0)
    return hv, hf, n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def mirror(mesh):
    v, f, n, a = mesh
    v = v * np.array([-1.0, 1, 1]); n = n * np.array([-1.0, 1, 1])
    return v, f[:, ::-1].copy(), n, a


def save(path, mesh, meta):
    v, f, n, a = mesh
    np.savez_compressed(path, V=v.astype(np.float32), F=f.astype(np.int32), N=n.astype(np.float32), AO=a.astype(np.float32),
                        FLAT=flat_faces(v, f))
    meta = dict(meta); meta.update({'file': path.name, 'triangles': int(len(f)), 'vertices': int(len(v))})
    return meta


def main():
    t0 = time.time()
    label, origin, sp, names, lut, meta1 = load()
    xs, ys, zs = grid_coords(origin, sp, label.shape)
    left = (xs > 0)[:, None, None]
    cortex_keys, deep_keys = list(CORTEX), list(DEEP)
    forebrain = mask_for(label, lut, cortex_keys + deep_keys + ['hypothalamus', 'forebrain_other', 'ventricles'])
    hemi_both = ndimage.binary_fill_holes(largest_component(forebrain))  # both hemispheres, joined at the midline
    hemi = hemi_both & left
    surface_keys = [k for k in cortex_keys if k != 'insula']  # the insula is buried: own closed volume
    gm_regions = np.zeros(label.shape, np.int8)
    for k, key in enumerate(surface_keys, start=1):
        gm_regions[mask_for(label, lut, key) & left] = k
    brainstem = mask_for(label, lut, 'brainstem')
    vermis = mask_for(label, lut, 'cerebellum')  # MIDLINE 'cerebellum' = cerebellar vermis
    cereb_cortex = mask_for(label, lut, 'cerebellar_cortex')  # lateral hemispheres, paravermis, deep nuclei
    hind_wm = mask_for(label, lut, 'hindbrain_wm')
    # Split hindbrain white matter between cerebellum and brainstem by nearest grey structure.
    d_cer = ndimage.distance_transform_edt(~(cereb_cortex | vermis))
    d_bs = ndimage.distance_transform_edt(~brainstem)
    cereb_wm = hind_wm & (d_cer <= d_bs)
    brainstem_solid = ndimage.binary_fill_holes(largest_component(brainstem | (hind_wm & ~cereb_wm)))
    cereb_solid = ndimage.binary_fill_holes(largest_component(cereb_cortex | cereb_wm))
    hind_csf = mask_for(label, lut, 'hindbrain_csf')
    aqueduct = np.isin(label, np.array([i for i, k in lut.items() if base_name(names[i])[0] == 'cerebral_aqueduct'], np.int16))
    midbrain = np.isin(label, np.array([i for i, k in lut.items() if base_name(names[i])[0] in
                                        ('midbrain_tegmentum', 'superior_colliculus', 'inferior_colliculus', 'pretectal_region')], np.int16))
    dist_aq = ndimage.distance_transform_edt(~aqueduct, sampling=sp)
    aq_z = zs[np.argwhere(aqueduct)[:, 2]]
    zwin = ((zs >= aq_z.min() - 1.0) & (zs <= aq_z.max() + 1.0))[None, None, :]
    pag = (dist_aq <= PAG_RADIUS_MM) & ~aqueduct & midbrain & zwin
    pag = largest_component(pag)
    print(f'masks ready in {time.time() - t0:.1f}s; PAG volume {pag.sum() * sp ** 3 / 1000:.3f} cm3')

    # Fold shading occupancy: the left hemisphere with the hindbrain, never the other hemisphere.
    occ = (hemi | brainstem_solid | cereb_solid | vermis).astype(np.float32)
    occ_fine = ndimage.gaussian_filter(occ, 1.4 / sp)
    occ_coarse = ndimage.gaussian_filter(occ, 3.2 / sp)
    gm_points = np.argwhere(gm_regions > 0)
    gm_tree = cKDTree(origin + gm_points * sp)
    gm_label = gm_regions[tuple(gm_points.T)]
    insula_tree = cKDTree(origin + np.argwhere(mask_for(label, lut, 'insula') & left) * sp)
    source = {'atlas': 'HRA 3D Reference Organ for Brain, Female v1.4 (Allen Human Reference Atlas, Ding et al. 2016)',
              'license': 'CC-BY-4.0', 'url': 'https://doi.org/10.48539/HBM674.NTLM.353'}

    def deep_mask(key, side_mask=left):
        return mask_for(label, lut, key) & side_mask

    soup = Soup(STAGE1 / 'meshes.npz')
    nodes = lambda keys: [names[i] for i, k in sorted(lut.items()) if k in ({keys} if isinstance(keys, str) else set(keys))]
    of = lambda keys: soup.union(nodes(keys))
    forebrain_keys = cortex_keys + deep_keys + ['hypothalamus', 'forebrain_other', 'ventricles']
    raw = {}
    both = lambda key: mask_for(label, lut, key)
    gm_both = mask_for(label, lut, cortex_keys)
    # Medial cortex that touches or crosses the mirror plane in the atlas is kept FISSURE_MM clear of
    # it (smoothly, by a cortex-territory weight); callosum, septum and diencephalon still meet at x = 0.
    territory = ndimage.gaussian_filter(gm_both.astype(np.float32), 1.0 / sp)
    fissure = (FISSURE_MM * np.clip((territory - 0.1) / 0.3, 0, 1)).astype(np.float32)
    raw['hemisphere'] = surface(hemi_both, origin, sp, sigma=0.35, side='L', soup=of(forebrain_keys), clip_offset=fissure)
    raw['wm'] = surface(ndimage.binary_fill_holes(largest_component(hemi_both & ~gm_both)), origin, sp, sigma=0.45,
                        side='L', soup=of(forebrain_keys))
    raw['ventricles'] = surface(both('ventricles'), origin, sp, sigma=0.4, side='L', keep_all=True, soup=of('ventricles'))
    raw['insula'] = surface(both('insula'), origin, sp, sigma=0.35, side='L', keep_all=True, soup=of('insula'))
    for key in deep_keys:
        if key in WHOLE_THEN_TRIM:
            continue
        raw[key] = surface(both(key), origin, sp, sigma=0.4, side='L', soup=of(key))
    whole = {key: surface(both(key), origin, sp, sigma=0.4, soup=of(key)) for key in WHOLE_THEN_TRIM}
    raw['hypothalamus'] = surface(mask_for(label, lut, 'hypothalamus'), origin, sp, sigma=0.4, soup=of('hypothalamus'))
    raw['cerebellum_vermis'] = surface(vermis, origin, sp, sigma=0.35, soup=of('cerebellum'))
    raw['pag'] = surface(pag, origin, sp, sigma=1.0)
    raw['cerebellum'] = surface(cereb_solid, origin, sp, sigma=0.35, soup=of(['cerebellar_cortex', 'hindbrain_wm']))
    raw['cerebellum_wm'] = surface(cereb_wm, origin, sp, sigma=0.45, keep_all=True, soup=of('hindbrain_wm'))
    raw['brainstem'] = surface(brainstem_solid, origin, sp, sigma=0.4, soup=of(['brainstem', 'hindbrain_wm']))
    raw['hindbrain_csf'] = surface(hind_csf, origin, sp, sigma=0.4, keep_all=True, soup=of('hindbrain_csf'))
    for k, (v, f) in raw.items():
        raw[k] = (taubin(v, f, 12 if k in ('hemisphere', 'cerebellum') else 4), f)
        print(f'{k}: {len(f)} raw triangles ({time.time() - t0:.0f}s)')

    solids = {key: self_occupancy(deep_mask(key), origin, sp) for key in deep_keys + ['insula']}
    solids['hypothalamus'] = self_occupancy(mask_for(label, lut, 'hypothalamus'), origin, sp)
    solids['cerebellum_vermis'] = self_occupancy(vermis, origin, sp)
    solids['pag'] = self_occupancy(pag, origin, sp)
    index = {'source': source, 'stage1': {k: meta1[k] for k in ('transform', 'spacingMm', 'shape')},
             'pagRadiusMm': PAG_RADIUS_MM, 'relabelled': RELABEL, 'groups': {'cortex': CORTEX, 'deep': DEEP, 'midline': MIDLINE,
             'forebrainOther': FOREBRAIN_OTHER, 'ventricles': VENTRICLES, 'brainstem': BRAINSTEM, 'cerebellum': CEREBELLUM,
             'hindbrainCsf': HINDBRAIN_CSF, 'hindbrainWhiteMatter': HINDBRAIN_WM, 'excluded': EXCLUDED}, 'lods': {}}
    region_names = surface_keys + ['wall']
    for lod, budget in BUDGET.items():
        folder = OUT / lod; folder.mkdir(parents=True, exist_ok=True)
        entries = []
        # Hemisphere: decimate, label, split.
        v, f = decimate(*raw['hemisphere'], budget['hemisphere'])
        n = vertex_normals(v, f)
        ao = obscurance(occ_fine, occ_coarse, origin, sp, v, n)
        dist, nearest = gm_tree.query(v - 0.5 * n)
        lab = gm_label[nearest].astype(int) - 1
        # Faces over the exposed limen insulae take the neighbouring gyrus; the insula itself is a
        # separate closed grey-matter volume beneath the lateral sulcus.
        near_insula = insula_tree.query(v - 0.5 * n)[0]
        lab[(dist > 1.6) & ~(near_insula <= 1.6) | (v[:, 0] < 0.3)] = len(surface_keys)  # wall: midline cut, non-cortex
        scores = np.zeros((len(v), len(region_names)), np.float32)
        scores[np.arange(len(v)), lab] = 1.0
        scores = smooth_scores(f, len(v), scores)
        parts, _ = split_by_labels(v, f, n, ao, scores)
        for k, mesh in parts.items():
            rid = region_names[k]
            meta = {'regionId': None if rid == 'wall' else rid, 'kind': 'cortex', 'layer': 'surface',
                    'helper': rid == 'wall', 'capGroup': 'hemisphere', 'capLayer': 0,
                    'atlasParts': [] if rid == 'wall' else CORTEX[rid], 'method': 'hemisphere-surface-split'}
            for side, m in (('L', mesh), ('R', mirror(mesh))):
                name = ('Cortex_wall_' if rid == 'wall' else f'Cortex_{rid}_') + side
                entries.append(save(folder / f'{name}.npz', m, {**meta, 'name': name, 'hemisphere': side,
                                                                'capGroup': f'hemisphere-{side}'}))
        # Cap-only helpers and deep structures.
        def simple(key, target, ao_strength=(0.25, 0.25), keep_all=False):
            if key in whole:
                v, f, n = trim_left(*decimate(*taubin_pair(whole[key]), 2 * target))
            else:
                v, f = decimate(*raw[key], target, keep_all)
                n = vertex_normals(v, f)
            if not ao_strength:
                ao = np.ones(len(v), np.float32)
            elif key in solids:  # deep structures: self-occlusion only (they sit inside the cortex)
                (fine, coarse), base = solids[key]
                ao = obscurance(fine, coarse, base, sp, v, n, ao_strength)
            else:
                ao = obscurance(occ_fine, occ_coarse, origin, sp, v, n, ao_strength)
            return v, f, n, ao
        for key, meta in (('wm', {'capLayer': 1, 'helper': True, 'layer': 'cap', 'kind': 'cortex', 'regionId': None}),
                          ('ventricles', {'capLayer': 2, 'helper': True, 'layer': 'cap', 'kind': 'cortex', 'regionId': None})):
            mesh = simple(key, budget[key], None, keep_all=True)
            for side, m in (('L', mesh), ('R', mirror(mesh))):
                name = f'Cap_{key}_{side}'
                entries.append(save(folder / f'{name}.npz', m, {**meta, 'name': name, 'hemisphere': side,
                                                                'capGroup': f'{key}-{side}', 'method': 'cap-volume'}))
        mesh = simple('insula', budget['insula'], (0.3, 0.3), keep_all=True)
        for side, m in (('L', mesh), ('R', mirror(mesh))):
            name = f'Insula_{side}'
            entries.append(save(folder / f'{name}.npz', m, {'name': name, 'regionId': 'insula', 'kind': 'deep', 'layer': 'internal',
                                                            'hemisphere': side, 'helper': False, 'capGroup': name, 'capLayer': 3,
                                                            'atlasParts': CORTEX['insula'], 'method': 'atlas-grey-matter-volume'}))
        deep_names = {'amygdala': 'Amygdala', 'hippocampus': 'Hippocampus', 'thalamus': 'Thalamus', 'caudate': 'Caudate',
                      'putamen': 'Putamen', 'ventral_striatum': 'Ventral_striatum', 'callosum': 'Corpus_callosum'}
        for key in deep_keys:
            mesh = simple(key, budget[key], (0.2, 0.25))
            for side, m in (('L', mesh), ('R', mirror(mesh))):
                name = f'{deep_names[key]}_{side}'
                entries.append(save(folder / f'{name}.npz', m, {'name': name, 'regionId': key, 'kind': 'deep', 'layer': 'internal',
                                                                'hemisphere': side, 'helper': False, 'capGroup': name,
                                                                'capLayer': 3, 'atlasParts': DEEP[key], 'method': 'atlas-union'}))
        for key, name, rid, parts, method in (
                ('hypothalamus', 'Hypothalamus', 'hypothalamus', MIDLINE['hypothalamus'], 'atlas-union'),
                ('cerebellum_vermis', 'Cerebellar_vermis', 'cerebellum', MIDLINE['cerebellum'], 'atlas-union'),
                ('pag', 'Periaqueductal_gray', 'pag', ['cerebral_aqueduct', 'midbrain_tegmentum', 'superior_colliculus',
                                                       'inferior_colliculus', 'pretectal_region'], f'aqueduct-sleeve-{PAG_RADIUS_MM:g}mm')):
            mesh = simple(key, budget[key], (0.2, 0.25))
            layer = 'surface' if key == 'cerebellum_vermis' else 'internal'
            entries.append(save(folder / f'{name}.npz', mesh, {'name': name, 'regionId': rid, 'kind': 'deep', 'layer': layer,
                                                               'hemisphere': 'M', 'helper': False, 'capGroup': name,
                                                               'capLayer': 3, 'atlasParts': parts, 'method': method}))
        for key, name, rid, layer, cap_layer, helper in (
                ('cerebellum', 'Cerebellar_hemispheres', 'cerebellar_hemispheres', 'surface', 0, False),
                ('brainstem', 'Brainstem', 'brainstem', 'surface', 0, False),
                ('cerebellum_wm', 'Cap_cerebellum_wm', None, 'cap', 1, True),
                ('hindbrain_csf', 'Cap_hindbrain_csf', None, 'cap', 2, True)):
            mesh = simple(key, budget[key], None if helper else (0.35, 0.4), keep_all=helper)
            parts = {'cerebellum': CEREBELLUM + HINDBRAIN_WM, 'brainstem': BRAINSTEM + HINDBRAIN_WM,
                     'cerebellum_wm': HINDBRAIN_WM, 'hindbrain_csf': HINDBRAIN_CSF}[key]
            entries.append(save(folder / f'{name}.npz', mesh, {'name': name, 'regionId': rid, 'kind': 'support',
                                                               'layer': layer, 'hemisphere': 'M', 'helper': helper,
                                                               'capGroup': name, 'capLayer': cap_layer, 'atlasParts': parts,
                                                               'method': 'atlas-union' if not helper else 'cap-volume'}))
        index['lods'][lod] = entries
        print(lod, 'triangles', sum(e['triangles'] for e in entries), 'selectable',
              sum(e['triangles'] for e in entries if not e['helper']))
    (OUT / 'index.json').write_text(json.dumps(index, indent=1) + '\n')
    print(f'stage 2 complete in {time.time() - t0:.1f}s')


if __name__ == '__main__':
    main()
