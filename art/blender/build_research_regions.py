"""Build v5 teaching-region meshes from the packed v2 Blender source.
Boundaries are geometric educational approximations, NOT atlas parcellations.
No questionnaire answers, personal anatomy or patient imaging are used.
Run: Blender --background --threads 4 --python art/blender/build_research_regions.py
"""
import bpy, bmesh, json, math, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art/blender'; OUT=ROOT/'public/models'; EVIDENCE=ROOT/'.local-evidence/research-v5'
EVIDENCE.mkdir(parents=True,exist_ok=True)
catalog=json.loads((ROOT/'src/data/anatomyRegions.json').read_text())
regions={r['id']:r for r in catalog['regions']}
bpy.ops.wm.open_mainfile(filepath=str(ART/'cortex-brain-v2.blend'))
def linear(color):
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in [int(color[i:i+2],16)/255 for i in (1,3,5)])
def classify(point):
    x,y,z=abs(point.x),point.z,-point.y # Blender -> glTF anatomical axes
    if x<.95 and z< -1.65: return 'visual'
    if z< -1.65: return 'occipital'
    if x<.82 and -.95<z<.1 and .45<y<1.65: return 'pcc'
    if x<.9 and z<.2 and y>=1.65: return 'precuneus'
    if y<.45 and z>1.1: return 'ofc'
    if x>1.3 and -.2<y<.55 and -.85<z<1.1: return 'auditory'
    if y<.55: return 'temporal'
    central=.25+.12*y
    if central<z<central+.3: return 'motor'
    if central-.35<z<=central: return 'somatosensory'
    if z<central-.35: return 'parietal'
    if x>1.05 and .75<y<2.35 and z>1.1: return 'dlpfc'
    return 'frontal'
def apply_material(obj,id,base=None):
    mat=base.copy() if base else bpy.data.materials.new('Region '+id)
    mat.name='Region '+id;mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    for link in list(shader.inputs['Base Color'].links):mat.node_tree.links.remove(link)
    shader.inputs['Base Color'].default_value=(*linear(regions[id]['color']),1)
    shader.inputs['Roughness'].default_value=.43;shader.inputs['Metallic'].default_value=.06
    obj.data.materials.clear();obj.data.materials.append(mat)
    for layer in list(obj.data.color_attributes):obj.data.color_attributes.remove(layer)
    for p in obj.data.polygons:p.use_smooth=True
    obj['regionId']=id;obj['kind']=regions[id]['kind'];obj['educationalOnly']=True
    obj['assetVersion']='cc-blender-5.0';obj['anatomy_note']=regions[id]['look']
parts=[]
for side in ('L','R'):
    source=bpy.data.objects['Cortex_'+side];base=source.data.materials[0]
    labels=[classify(p.center) for p in source.data.polygons]
    for id in sorted(set(labels)):
        part=source.copy();part.data=source.data.copy();bpy.context.collection.objects.link(part)
        part.name='Cortex_'+id+'_'+side;part['hemisphere']=side
        bm=bmesh.new();bm.from_mesh(part.data);bm.faces.ensure_lookup_table()
        bmesh.ops.delete(bm,geom=[f for f in bm.faces if labels[f.index]!=id],context='FACES')
        bm.to_mesh(part.data);bm.free();part.data.update()
        apply_material(part,id,base);parts.append(part)
    bpy.data.objects.remove(source,do_unlink=True)
# Existing internal guide shapes stay intact; expose the previously hidden callosum topic.
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH' or obj in parts:continue
    id=obj.get('regionId') or {'Brainstem':'brainstem','Cerebellar_hemispheres':'cerebellar_hemispheres'}[obj.name]
    apply_material(obj,id,obj.data.materials[0]);parts.append(obj)
def xyz(p):return (p[0],-p[2],p[1])
def ellipsoid(id,side,pos,size):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=xyz(pos))
    o=bpy.context.object;o.name=id+'_'+side;o['hemisphere']=side
    for v in o.data.vertices:
        p=v.co;v.co=(p.x*size[0],p.y*size[2],p.z*size[1])
    apply_material(o,id);parts.append(o)
def curved_nucleus(side,sign):
    c=bpy.data.curves.new('Caudate '+side,'CURVE');c.dimensions='3D';c.resolution_u=18
    c.bevel_depth=.18;c.bevel_resolution=5;c.use_fill_caps=True
    sp=c.splines.new('BEZIER');points=[(sign*.57,.25,.78),(sign*.62,.75,.4),(sign*.72,.92,-.45),(sign*.86,.64,-1.12),(sign*.97,.1,-1.02)]
    sp.bezier_points.add(len(points)-1)
    for bp,p,r in zip(sp.bezier_points,points,[1.55,1.1,.75,.5,.25]):
        bp.co=xyz(p);bp.radius=r;bp.handle_left_type=bp.handle_right_type='AUTO'
    o=bpy.data.objects.new('Caudate_'+side,c);bpy.context.collection.objects.link(o)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH');o['hemisphere']=side;apply_material(o,'caudate');parts.append(o)
for side,sign in [('L',-1),('R',1)]:
    curved_nucleus(side,sign)
    ellipsoid('putamen',side,(sign*1.02,.22,.1),(.22,.62,.63))
    ellipsoid('ventral_striatum',side,(sign*.58,-.29,.86),(.24,.2,.26))
# Verify every catalog topic has a mesh. No label-only regions are exported.
missing=set(regions)-{o.get('regionId') for o in parts}
if missing:raise RuntimeError('Empty region partitions: '+str(sorted(missing)))
for id in regions:
    meshes=[o for o in parts if o.get('regionId')==id]
    if regions[id]['hemispheres']=='bilateral' and regions[id]['kind']!='support':
        assert {o.get('hemisphere') for o in meshes}=={'L','R'},id
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
common=dict(export_format='GLB',use_selection=True,export_extras=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_vertex_color='NONE',export_image_format='AUTO')
manifest={'version':'cc-blender-5.0','catalogVersion':catalog['version'],'blender':bpy.app.version_string,'axes':'+X right, +Y superior, +Z anterior','educationalOnly':True,'boundaryMethod':'Geometric teaching partitions, not registered atlas or patient segmentation','source':'AbdulMuhaymin, Brain - with labeled parts; CC BY 4.0; derivative of packed Cortex Compass v2','meshes':[],'assets':{}}
manifest['catalogSha256']=hashlib.sha256((ROOT/'src/data/anatomyRegions.json').read_bytes()).hexdigest()
manifest['sourceBlendSha256']=hashlib.sha256((ART/'cortex-brain-v2.blend').read_bytes()).hexdigest()
manifest['builderSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
for o in parts:
    o.data.calc_loop_triangles()
    manifest['meshes'].append({'name':o.name,'regionId':o['regionId'],'kind':o['kind'],'hemisphere':o.get('hemisphere','M'),'triangles':len(o.data.loop_triangles)})
bpy.ops.export_scene.gltf(filepath=str(OUT/'cortex-brain-v5.glb'),**common)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(ART/'cortex-brain-v5.blend'),compress=True)
for o in parts:
    if o['kind']=='cortex':
        bpy.context.view_layer.objects.active=o
        mod=o.modifiers.new('Mobile geometry budget','DECIMATE');mod.ratio=.5
        bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'cortex-brain-v5-mobile.glb'),**common)
for name in ['cortex-brain-v5.glb','cortex-brain-v5-mobile.glb']:
    b=(OUT/name).read_bytes();manifest['assets'][name]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
(OUT/'cortex-brain-v5.manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('V5_ASSET_MANIFEST',json.dumps(manifest))
bpy.ops.wm.open_mainfile(filepath=str(ART/'cortex-brain-v5.blend'))
scene=bpy.context.scene;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.cycles.samples=16
scene.render.resolution_x=1000;scene.render.resolution_y=850
scene.render.filepath=str(EVIDENCE/'blender-regions-surface.png');bpy.ops.render.render(write_still=True)
print('BLENDER_V5_COMPLETE')
