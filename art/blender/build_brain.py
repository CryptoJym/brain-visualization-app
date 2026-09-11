"""Reproducible Cortex Compass asset build. Run in Blender --background --threads 4.
Derived surface: AbdulMuhaymin, Brain - with labeled parts, CC BY 4.0.
Deep structures and teaching overlays are schematic, NOT a segmented MRI atlas.
Axes in exported glTF: +X right, +Y superior, +Z anterior. No respondent data.
"""
import bpy, bmesh, math, json, hashlib
from pathlib import Path
from mathutils import Vector, Matrix
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/models'
ART = ROOT / 'art/blender'
EVIDENCE = ROOT / '.local-evidence/blender-v2'
for folder in (OUT, ART, EVIDENCE): folder.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(OUT / 'brain-labeled.glb'))
keep = ['Object_10', 'Object_13', 'Object_7']
original = {name: bpy.data.objects[name] for name in keep}
for obj in original.values():
    world = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world = world
for obj in list(bpy.context.scene.objects):
    if obj.name not in keep: bpy.data.objects.remove(obj, do_unlink=True)
# Normalize only anatomical surfaces; annotation labels must not affect framing.
SCALE = 6.4 / 5.546509504318237
CENTER_Z = (5.201961994171143 + .11163163185119629) / 2
for obj in original.values():
    for v in obj.data.vertices:
        p = obj.matrix_world @ v.co
        v.co = (p.x*SCALE, p.y*SCALE, (p.z-CENTER_Z)*SCALE)
    obj.matrix_world = Matrix.Identity(4)
    bm = bmesh.new(); bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=.00001)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(obj.data); bm.free(); obj.data.update()
    for p in obj.data.polygons: p.use_smooth = True
# Retain original normal maps, which the old viewer discarded; reduce texture cost.
for image in bpy.data.images:
    if image.size[0] > 1024:
        ratio = 1024 / image.size[0]
        image.scale(1024, max(1, round(image.size[1]*ratio)))
        image.pack()
def linear(hex_color):
    rgb=[int(hex_color[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)
def polish(obj, name, color):
    mat=obj.data.materials[0].copy(); mat.name=name
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    for socket in ('Base Color','Metallic','Roughness'):
        for link in list(shader.inputs[socket].links): mat.node_tree.links.remove(link)
    shader.inputs['Base Color'].default_value=(*linear(color),1)
    shader.inputs['Metallic'].default_value=.08
    shader.inputs['Roughness'].default_value=.4
    obj.data.materials.clear(); obj.data.materials.append(mat)
cortex=original['Object_10']; polish(cortex,'Cortical porcelain','#ffffff')
polish(original['Object_13'],'Cerebellar satin','#b3b7d5')
polish(original['Object_7'],'Brainstem satin','#b4c5d3')
original['Object_13'].name='Cerebellar_hemispheres'
original['Object_7'].name='Brainstem'
for name,obj in original.items():
    if name != 'Object_10': obj['kind']='support'
def cortex_tint(obj):
    mesh=obj.data; attr=mesh.color_attributes.new(name='CortexTint',type='FLOAT_COLOR',domain='POINT')
    for v in mesh.vertices:
        x,y,z=v.co; anterior=-y
        frontal=max(0,min(1,(anterior-.1)/1.8))
        temporal=max(0,min(1,(.6-z)/1.2))*max(0,min(1,(abs(x)-.8)/1.2))
        occipital=max(0,min(1,(-anterior-1.4)/1.1))
        base=Vector(linear('#b4cddf'))
        for weight,color in [(frontal,'#6dc9e5'),(temporal,'#d8a4bd'),(occipital,'#aa9bd7')]:
            base=base.lerp(Vector(linear(color)),weight*.78)
        attr.data[v.index].color=(*base,1)
    mat=mesh.materials[0]; nodes=mat.node_tree.nodes
    shader=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    vc=nodes.new('ShaderNodeVertexColor'); vc.layer_name='CortexTint'
    mat.node_tree.links.new(vc.outputs['Color'],shader.inputs['Base Color'])
cortex_tint(cortex)
# Split at the longitudinal fissure so the deep mode can open the hemispheres.
hemispheres=[]
for side in ('L','R'):
    obj=cortex.copy(); obj.data=cortex.data.copy(); bpy.context.collection.objects.link(obj)
    obj.name='Cortex_'+side
    bm=bmesh.new(); bm.from_mesh(obj.data)
    cut=bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=(0,0,0),plane_no=(1,0,0),clear_outer=side=='L',clear_inner=side=='R')
    edges=[e for e in cut['geom_cut'] if isinstance(e,bmesh.types.BMEdge) and e.is_boundary]
    if edges: bmesh.ops.holes_fill(bm,edges=edges,sides=0)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(obj.data); bm.free()
    obj['kind']='cortex'; obj['hemisphere']=side
    obj['anatomy_note']='Licensed teaching surface; color boundaries are approximate, not atlas parcellation.'
    bpy.context.view_layer.objects.active=obj
    subdiv=obj.modifiers.new('Cortical surface refinement','SUBSURF'); subdiv.levels=1
    bpy.ops.object.modifier_apply(modifier=subdiv.name)
    dec=obj.modifiers.new('Web geometry budget','DECIMATE'); dec.ratio=.38
    bpy.ops.object.modifier_apply(modifier=dec.name)
    for p in obj.data.polygons: p.use_smooth=True
    hemispheres.append(obj)
bpy.data.objects.remove(cortex,do_unlink=True)
COLORS={'amygdala':'#f0a1a5','hippocampus':'#ae9aef','acc':'#e9abb6','insula':'#62d4c2','thalamus':'#91cde7','hypothalamus':'#edbe73','pag':'#ebb984','cerebellum':'#c7afd9','callosum':'#d8e2e6'}
def material(region):
    mat=bpy.data.materials.get('Structure '+region)
    if mat: return mat
    mat=bpy.data.materials.new('Structure '+region); mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*linear(COLORS[region]),1)
    shader.inputs['Metallic'].default_value=.1
    shader.inputs['Roughness'].default_value=.32
    return mat
# Input structure coordinates use the exported Y-up convention for easy auditing.
def xyz(point): return (point[0],-point[2],point[1])
def tag(obj,region,side='M'):
    obj['kind']='deep'; obj['regionId']=region; obj['hemisphere']=side
    obj['anatomy_note']='Schematic educational structure; not a patient segmentation.'
    obj.data.materials.clear(); obj.data.materials.append(material(region))
    for face in obj.data.polygons: face.use_smooth=True
    return obj
def ellipsoid(name,region,position,size,side='M'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=xyz(position))
    obj=bpy.context.object; obj.name=name
    for v in obj.data.vertices:
        p=v.co.copy(); ripple=1+.025*math.sin(p.x*7+p.z*5)*math.cos(p.y*6)
        v.co=(p.x*size[0]*ripple,p.y*size[2]*ripple,p.z*size[1]*ripple)
    return tag(obj,region,side)
def tube(name,region,points,radius,side='M',radii=None):
    curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'
    curve.resolution_u=16; curve.bevel_depth=radius; curve.bevel_resolution=5
    curve.use_fill_caps=True; spline=curve.splines.new('BEZIER'); spline.bezier_points.add(len(points)-1)
    for i,(bp,p) in enumerate(zip(spline.bezier_points,points)):
        bp.co=xyz(p); bp.handle_left_type='AUTO'; bp.handle_right_type='AUTO'
        if radii: bp.radius=radii[i]
    obj=bpy.data.objects.new(name,curve); bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj; obj.select_set(True)
    bpy.ops.object.convert(target='MESH'); obj.select_set(False)
    return tag(obj,region,side)
for side,sign in [('L',-1),('R',1)]:
    ellipsoid('Amygdala_'+side,'amygdala',(sign*1.04,-.58,.85),(.28,.3,.4),side)
    tube('Hippocampus_'+side,'hippocampus',[(sign*1.1,-.75,.48),(sign*1.32,-.84,.05),(sign*1.42,-.62,-.7),(sign*1.12,-.29,-1.18),(sign*.78,-.05,-.98)],.2,side,[1.35,1.1,.85,.65,.4])
    ellipsoid('Thalamus_'+side,'thalamus',(sign*.44,.03,-.32),(.38,.4,.6),side)
    ellipsoid('Insula_'+side,'insula',(sign*1.6,.06,.31),(.14,.62,.78),side)
    tube('Anterior_cingulate_'+side,'acc',[(sign*.18,.25,1.42),(sign*.18,.78,1.33),(sign*.18,1.15,.75),(sign*.18,1.27,-.05),(sign*.18,1.08,-.68)],.14,side,[.65,1,1,1,.5])
    tube('Corpus_callosum_'+side,'callosum',[(sign*.13,.08,1.2),(sign*.13,.59,1.14),(sign*.13,.83,.57),(sign*.13,.89,-.18),(sign*.13,.64,-1.03)],.16,side,[.55,1.15,.7,.7,1.35])
ellipsoid('Hypothalamus','hypothalamus',(0,-.53,.26),(.3,.27,.32))
tube('Periaqueductal_gray','pag',[(-.11,-1.25,-.81),(-.14,-1,-.67),(0,-.92,-.59),(.14,-1,-.67),(.11,-1.25,-.81)],.065)
ellipsoid('Cerebellar_vermis','cerebellum',(0,-1.08,-1.82),(.25,.65,.7))
# Metadata travels with each selectable structure as glTF extras.
for obj in bpy.context.scene.objects:
    if obj.type=='MESH':
        obj['assetVersion']='cc-blender-2.0'; obj['educationalOnly']=True
bpy.ops.object.select_all(action='DESELECT')
mesh_objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
for obj in mesh_objects: obj.select_set(True)
common=dict(export_format='GLB',use_selection=True,export_extras=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_vertex_color='ACTIVE',export_image_format='AUTO')
bpy.ops.export_scene.gltf(filepath=str(OUT/'cortex-brain-v2.glb'),**common)
# Save the editable asset before any LOD reduction. All imported textures are packed.
bpy.ops.file.pack_all()
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.cycles.use_denoising=True; scene.render.threads_mode='FIXED'; scene.render.threads=4
scene.render.resolution_x=1200; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Cortex night'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.009,.019,.038,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
def aim(obj,target=(0,0,0)):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
def light(name,location,color,energy,size):
    data=bpy.data.lights.new(name,'AREA'); data.energy=energy; data.color=color; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=location; aim(obj)
light('Softbox key',(-5,-7,8),(0.85,.95,1),1250,7)
light('Cyan rim',(5,3,5),(.42,.84,1),1500,5)
light('Warm bounce',(-4,4,1),(1,.7,.68),850,5)
data=bpy.data.cameras.new('Review camera'); camera=bpy.data.objects.new('Review camera',data)
scene.collection.objects.link(camera); camera.location=(-9,-10,6); data.type='ORTHO'; data.ortho_scale=9
scene.camera=camera; aim(camera,(0,0,.25))
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'cortex-brain-v2.blend'),compress=True)
manifest={'version':'cc-blender-2.0','blender':bpy.app.version_string,'units':'teaching model units','axes':'+X right, +Y superior, +Z anterior','educationalOnly':True,'source':{'title':'Brain - with labeled parts','author':'AbdulMuhaymin','license':'CC-BY-4.0','url':'https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8'},'changes':['removed label meshes','normalized anatomical geometry only','split cortex hemispheres','refined cortical mesh and retained normal maps','added schematic bilateral deep structures','added approximate cortical teaching colors'],'meshes':[],'assets':{}}
for obj in mesh_objects:
    obj.data.calc_loop_triangles()
    manifest['meshes'].append({'name':obj.name,'kind':obj.get('kind'),'regionId':obj.get('regionId'),'triangles':len(obj.data.loop_triangles)})
# Reduced geometry asset for compact/mobile views; same names and metadata.
for obj in hemispheres:
    bpy.context.view_layer.objects.active=obj
    mod=obj.modifiers.new('Mobile LOD','DECIMATE'); mod.ratio=.4
    bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.object.select_all(action='DESELECT')
for obj in mesh_objects: obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'cortex-brain-v2-mobile.glb'),**common)
for name in ('cortex-brain-v2.glb','cortex-brain-v2-mobile.glb'):
    body=(OUT/name).read_bytes()
    manifest['assets'][name]={'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest()}
(OUT/'cortex-brain-v2.manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('BUILD_MANIFEST',json.dumps(manifest))
# Evidence render uses Blender, not an image-generation service.
bpy.ops.wm.open_mainfile(filepath=str(ART/'cortex-brain-v2.blend'))
scene=bpy.context.scene; scene.render.filepath=str(EVIDENCE/'blender-surface.png')
bpy.ops.render.render(write_still=True)
print('BLENDER_BUILD_COMPLETE')
