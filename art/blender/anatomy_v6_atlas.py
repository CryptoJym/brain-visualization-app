"""Cortex Compass anatomy v6, stage 1: atlas meshes -> 0.5 mm label volume.

Run with the Python venv described in docs/anatomy-v6/README.md (not inside Blender):
    python art/blender/anatomy_v6_atlas.py

Source: HuBMAP Human Reference Atlas, "3D Reference Organ for Brain, Female" v1.4
(Browne & Schlehlein 2024, reviewed by Song-Lin Ding), built from the Allen Human
Reference Atlas (Ding et al. 2016). Licensed CC BY 4.0 since v1.3. The download is
pinned by SHA-256. This is one generic reference brain; no respondent data is used.

Output (ignored, regenerable): .local-evidence/anatomy-v6/stage1/
  labels.npz   int16 label volume, per-voxel winding confidence, grid origin/spacing
  labels.json  label id -> atlas mesh name, side, voxel count, canonical transform
  meshes.npz   every atlas mesh in the canonical frame (<name>__V, <name>__F), for exact distances
Canonical frame (millimetres): +X patient left, +Y superior, +Z anterior (right-handed,
the glTF convention). The atlas is a mirrored hemisphere pair, so the fitted mirror plane
becomes x = 0 and the anterior-commissure/posterior-commissure line is levelled.
"""
import hashlib, json, sys, time, urllib.request
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / '.local-evidence/anatomy-v6/cache'
OUT = ROOT / '.local-evidence/anatomy-v6/stage1'
SOURCES = {
    'hra-brain-female-v1.4': {
        'url': 'https://cdn.humanatlas.io/digital-objects/ref-organ/brain-female/v1.4/assets/3d-allen-f-brain.glb',
        'sha256': 'f20d87a347f8d5c6467439cba7db18f19307d29b2c3e0c2b6ddb7e9d49e1c1fc',
        'file': '3d-allen-f-brain.glb',
    },
    'hra-brain-female-v1.4-metadata': {
        'url': 'https://cdn.humanatlas.io/digital-objects/ref-organ/brain-female/v1.4/metadata.json',
        'sha256': 'a063705cc37ca128270e8d66fe5db1051c4a7f7eae75f186f6ad2bffa67b523f',
        'file': 'brain-female-v1.4.metadata.json',
    },
}
SPACING = 0.5  # mm


def fetch(key):
    spec = SOURCES[key]
    path = CACHE / spec['file']
    CACHE.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        print('download', spec['url'])
        with urllib.request.urlopen(spec['url'], timeout=300) as response:
            path.write_bytes(response.read())
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != spec['sha256']:
        raise SystemExit(f'{path.name}: sha256 {digest} does not match pinned {spec["sha256"]}')
    return path


def load_meshes(path):
    import trimesh
    scene = trimesh.load(path, force='scene', process=False)
    meshes = {}
    for node in scene.graph.nodes_geometry:
        transform, name = scene.graph[node]
        mesh = scene.geometry[name]
        meshes[node] = (trimesh.transformations.transform_points(mesh.vertices, transform) * 1000.0,
                        np.asarray(mesh.faces, dtype=np.int64))
    return meshes


def mirror_plane(meshes):
    """Least-squares mirror plane of the atlas hemisphere pair (n.p = d)."""
    from scipy.spatial import cKDTree
    pairs = [(n, n[:-2] + '_R') for n in meshes if n.endswith('_L') and n[:-2] + '_R' in meshes]
    left = np.vstack([meshes[a][0] for a, _ in pairs])
    right = np.vstack([meshes[b][0] for _, b in pairs])
    delta = np.array([meshes[b][0].mean(0) - meshes[a][0].mean(0) for a, b in pairs])
    normal = (delta / np.linalg.norm(delta, axis=1, keepdims=True)).mean(0)
    normal /= np.linalg.norm(normal)
    offset = float(((left.mean(0) + right.mean(0)) / 2) @ normal)
    tree = cKDTree(right)
    for _ in range(4):
        reflected = left - 2 * ((left @ normal) - offset)[:, None] * normal[None, :]
        dist, idx = tree.query(reflected)
        match = right[idx]
        good = dist < 1.0
        normal = ((match - left)[good] / np.linalg.norm((match - left)[good], axis=1, keepdims=True)).mean(0)
        normal /= np.linalg.norm(normal)
        offset = float((((left + match) / 2)[good] @ normal).mean())
    return normal, offset, float(np.median(dist)), float(good.mean()), len(pairs)


def rotation_between(a, b):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    v = np.cross(a, b); c = float(a @ b)
    if np.linalg.norm(v) < 1e-12:
        return np.eye(3)
    k = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + k + k @ k * (1 / (1 + c))


def canonical_transform(meshes):
    normal, offset, residual, matched, pairs = mirror_plane(meshes)
    # 1) mirror plane -> x = 0.  2) reflect x so atlas "_L" lies at +x (patient left in a
    # right-handed +Y superior, +Z anterior frame).
    rot = rotation_between(normal, np.array([1.0, 0.0, 0.0]))
    point = normal * offset
    reflect = np.diag([-1.0, 1.0, 1.0])
    def apply(points, pitch=np.eye(3)):
        return ((points - point) @ rot.T @ reflect.T) @ pitch.T
    # 3) level the AC-PC line: AC = midline anterior commissure, PC ~ rostral end of the
    # cerebral aqueduct (the commissure sits immediately above the aqueduct entrance).
    ac_pts = apply(np.vstack([meshes['Allen_anterior_commissure_L'][0], meshes['Allen_anterior_commissure_R'][0]]))
    ac = ac_pts[np.abs(ac_pts[:, 0]) < 2.0].mean(0)
    aq = apply(np.vstack([meshes['Allen_cerebral_aqueduct_L'][0], meshes['Allen_cerebral_aqueduct_R'][0]]))
    pc = aq[aq[:, 1] > np.percentile(aq[:, 1], 90)].mean(0)
    angle = np.arctan2(ac[1] - pc[1], ac[2] - pc[2])  # rise of AC over PC along +z
    # Rotate about x by +angle: y' = c*y - s*z, z' = s*y + c*z maps the PC->AC vector to +z.
    c, s = np.cos(angle), np.sin(angle)
    pitch = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    origin = ac @ pitch.T  # AC becomes the origin of the canonical frame
    info = {'mirrorNormal': normal.round(6).tolist(), 'mirrorOffsetMm': round(offset, 4),
            'mirrorMedianResidualMm': round(residual, 5), 'mirrorMatchedFraction': round(matched, 5),
            'mirroredPairs': pairs, 'acpcPitchDeg': round(float(np.degrees(angle)), 3),
            'acMm': ac.round(3).tolist(), 'pcMm': pc.round(3).tolist(),
            'frame': '+X patient left, +Y superior, +Z anterior (mm, right-handed)'}
    info['frame'] += '; origin at the anterior commissure'
    return (lambda p: apply(p, pitch) - origin), info


def voxelize(meshes, transform):
    import igl
    names = sorted(meshes)
    verts = {n: transform(meshes[n][0]) for n in names}
    lo = np.min([v.min(0) for v in verts.values()], axis=0) - 2.0
    hi = np.max([v.max(0) for v in verts.values()], axis=0) + 2.0
    # Voxel centres sit at x = +/-(k + 1/2) * SPACING, so the midline (x = 0) falls exactly
    # between two voxel columns and left/right surfaces meet on the mirror plane.
    half = int(np.ceil(max(-lo[0], hi[0]) / SPACING))
    lo[0], hi[0] = -(half - 0.5) * SPACING, (half - 0.5) * SPACING
    shape = np.ceil((hi - lo) / SPACING).astype(int) + 1
    shape[0] = 2 * half
    label = np.zeros(shape, np.int16)
    best = np.zeros(shape, np.float32)
    table = {}
    t0 = time.time()
    for i, name in enumerate(names, start=1):
        v = verts[name]; f = meshes[name][1]
        if f.shape[1] != 3 or len(f) < 4:
            continue
        a = np.floor((v.min(0) - 1.0 - lo) / SPACING).astype(int).clip(0)
        b = np.minimum(np.ceil((v.max(0) + 1.0 - lo) / SPACING).astype(int) + 1, shape)
        axes = [lo[k] + SPACING * np.arange(a[k], b[k]) for k in range(3)]
        grid = np.stack(np.meshgrid(*axes, indexing='ij'), -1).reshape(-1, 3)
        # Reflection flipped orientation; |winding| is orientation independent.
        w = np.abs(igl.fast_winding_number(v.astype(np.float64), f, grid)).astype(np.float32)
        w = w.reshape(b - a)
        sub_best = best[a[0]:b[0], a[1]:b[1], a[2]:b[2]]
        sub_label = label[a[0]:b[0], a[1]:b[1], a[2]:b[2]]
        take = (w > 0.5) & (w > sub_best)
        sub_label[take] = i; sub_best[take] = w[take]
        table[i] = {'name': name, 'side': 'L' if name.endswith('_L') else 'R' if name.endswith('_R') else 'M',
                    'triangles': int(len(f)), 'voxelsInside': int((w > 0.5).sum())}
    print(f'voxelized {len(table)} meshes in {time.time() - t0:.1f}s, grid {shape.tolist()}')
    for i, entry in table.items():
        entry['voxelsAssigned'] = int((label == i).sum())
    return label, best, lo, table, verts


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    glb = fetch('hra-brain-female-v1.4'); fetch('hra-brain-female-v1.4-metadata')
    meshes = load_meshes(glb)
    transform, info = canonical_transform(meshes)
    label, best, origin, table, verts = voxelize(meshes, transform)
    np.savez_compressed(OUT / 'labels.npz', label=label, confidence=best, origin=origin, spacing=SPACING)
    canonical = {}
    for name, v in verts.items():
        canonical[name + '__V'] = v.astype(np.float64); canonical[name + '__F'] = meshes[name][1]
    np.savez_compressed(OUT / 'meshes.npz', **canonical)
    (OUT / 'labels.json').write_text(json.dumps({'source': SOURCES, 'transform': info, 'spacingMm': SPACING,
                                                 'originMm': origin.round(4).tolist(), 'shape': list(label.shape),
                                                 'labels': table}, indent=1) + '\n')
    print(json.dumps(info))


if __name__ == '__main__':
    sys.exit(main())
