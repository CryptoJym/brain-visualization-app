import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {REGIONS,REGION_BY_ID} from '../src/data/anatomyCatalog.mjs';
import {MODEL_VERSION,MODEL_FILES,MODEL_POSTER} from '../src/data/brainModel.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const manifest=JSON.parse(read('public/models/cortex-brain-v6.manifest.json'));
const V5={desktop:9398032,mobile:7236132,triangles:184420};
const glb=name=>{const b=read('public/models/'+name);return {b,g:JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString())};};
const desktop=manifest.assets[manifest.lods.desktop],mobile=manifest.assets[manifest.lods.mobile];

test('viewer loads the content-addressed v6 files named in the manifest',()=>{
  assert.equal(MODEL_VERSION,'cc-blender-6.0');assert.equal(manifest.version,MODEL_VERSION);
  for(const lod of ['desktop','mobile']){
    const name=MODEL_FILES[lod].replace('/models/','');
    assert.equal(manifest.lods[lod],name);
    assert.match(name,lod==='desktop'?/^cortex-brain-v6-[0-9a-f]{10}\.glb$/:/^cortex-brain-v6-mobile-[0-9a-f]{10}\.glb$/);
    const sha=createHash('sha256').update(read('public/models/'+name)).digest('hex');
    assert.ok(name.includes(sha.slice(0,10)),`${name} carries its own content hash`);
  }
  assert.match(MODEL_POSTER,/^\/models\/cortex-brain-v6-poster-[0-9a-f]{10}\.jpg$/);
  assert.equal(createHash('sha256').update(read('public'+MODEL_POSTER)).digest('hex'),manifest.poster.sha256);
});
test('v6 files are at least three times smaller than v5',()=>{
  assert.ok(desktop.bytes*3<=V5.desktop,`desktop ${desktop.bytes} bytes`);
  assert.ok(mobile.bytes*3<=V5.mobile,`mobile ${mobile.bytes} bytes`);
  assert.ok(mobile.bytes<desktop.bytes&&mobile.triangles<desktop.triangles);
});
test('drawn triangles stay near v5 and the phone file is lighter',()=>{
  assert.ok(desktop.drawnTriangles<=V5.triangles*1.1,`desktop draws ${desktop.drawnTriangles}`);
  assert.ok(mobile.drawnTriangles<desktop.drawnTriangles*.6,`mobile draws ${mobile.drawnTriangles}`);
});
test('every mesh records its source, license and method',()=>{
  for(const m of [...manifest.meshes,...manifest.helpers]){
    assert.equal(m.source,'hra-brain-female-v1.4',m.name);assert.equal(m.license,'CC-BY-4.0',m.name);assert.ok(m.method&&m.methodNote,m.name);
  }
  assert.equal(manifest.source.license,'CC-BY-4.0');assert.match(manifest.source.url,/doi\.org\/10\.48539\/HBM674/);
  assert.match(manifest.source.sha256,/^[0-9a-f]{64}$/);assert.match(manifest.boundaryMethod,/gyral boundaries/);
});
test('deep structures are unions of atlas parts, not primitives',()=>{
  for(const id of ['amygdala','hippocampus','thalamus','hypothalamus','caudate','putamen','ventral_striatum','callosum','cerebellum']){
    const meshes=manifest.meshes.filter(m=>m.regionId===id);assert.ok(meshes.length>0,id);
    for(const m of meshes){assert.equal(m.method,'atlas-union',id);assert.ok(m.atlasParts.length>=1,id);}
  }
  assert.ok(manifest.meshes.find(m=>m.regionId==='hippocampus').atlasParts.includes('tail_of_hippocampus'));
  const pag=manifest.meshes.filter(m=>m.regionId==='pag');assert.equal(pag.length,1);assert.match(pag[0].method,/^aqueduct-sleeve-/);
  const insula=manifest.meshes.filter(m=>m.regionId==='insula');assert.equal(insula.length,2);
  insula.forEach(m=>{assert.equal(m.method,'atlas-grey-matter-volume');assert.ok(m.atlasParts.includes('long_insular_gyri'));});
});
test('cortex regions are atlas gyri; ACC is cingulate cortex; the callosum is one arch split at the midline',()=>{
  for(const m of manifest.meshes.filter(m=>m.regionId==='acc')){assert.equal(m.kind,'cortex');assert.ok(m.atlasParts.includes('cingulate_gyrus_rostral_anterior_part'));}
  assert.ok(manifest.meshes.find(m=>m.regionId==='motor').atlasParts.includes('primary_motor_cortex'));
  assert.ok(manifest.meshes.find(m=>m.regionId==='somatosensory').atlasParts.includes('postcentral_gyrus'));
  assert.ok(manifest.meshes.find(m=>m.regionId==='auditory').atlasParts.includes('superior_temporal_gyrus'));
  assert.deepEqual(manifest.meshes.filter(m=>m.regionId==='callosum').map(m=>m.hemisphere).sort(),['L','R']);
  for(const m of manifest.meshes.filter(m=>m.regionId==='pcc'))assert.ok(m.triangles>1000,`${m.name}: a real medial area, not v5's 109-triangle patch`);
});
test('GLBs are Draco compressed, texture-free, shaded and carry cut-fill metadata',()=>{
  for(const name of Object.keys(manifest.assets)){
    const {g}=glb(name);
    assert.deepEqual(g.extensionsRequired,['KHR_draco_mesh_compression']);assert.equal((g.images||[]).length,0);
    const nodes=g.nodes.filter(n=>n.mesh!==undefined);assert.equal(nodes.length,manifest.assets[name].meshes);
    const groups=new Set(nodes.map(n=>n.extras.capGroup));
    for(const group of ['hemisphere-L','hemisphere-R','wm-L','wm-R','ventricles-L','ventricles-R'])assert.ok(groups.has(group),group);
    for(const n of nodes){assert.ok(['surface','internal','cap'].includes(n.extras.layer),n.name);assert.match(n.extras.capColor,/^#[0-9a-f]{6}$/);}
    for(const p of g.meshes.flatMap(m=>m.primitives))assert.notEqual(p.attributes.COLOR_0,undefined,'baked fold shading');
  }
});
test('anatomical sides: left-side meshes lie on +X, the patient-left side of a +Y up, +Z anterior frame',()=>{
  const {g}=glb(manifest.lods.desktop);
  const extent=name=>{const n=g.nodes.find(n=>n.name===name);const a=g.accessors[g.meshes[n.mesh].primitives[0].attributes.POSITION];return [a.min,a.max];};
  for(const base of ['Amygdala','Hippocampus','Putamen','Cortex_temporal']){
    const [lmin]=extent(base+'_L'),[,rmax]=extent(base+'_R');assert.ok(lmin[0]>0&&rmax[0]<0,base);
  }
  const [fmin,fmax]=extent('Cortex_frontal_L'),[omin,omax]=extent('Cortex_occipital_L');
  assert.ok((fmin[2]+fmax[2])/2>(omin[2]+omax[2])/2,'frontal lobe is anterior (+Z) of the occipital lobe');
  const [, cmax]=extent('Corpus_callosum_L'),[hmin]=extent('Hypothalamus');assert.ok(cmax[1]>hmin[1],'callosum above hypothalamus');
});
test('long-cache rule and self-hosted decoder',()=>{
  const headers=read('public/_headers').toString();
  assert.match(headers,/\/models\/cortex-brain-v6-\*\n  Cache-Control: public, max-age=31536000, immutable/);
  assert.match(headers,/\/libs\/draco\/\*\.wasm\n  Content-Type: application\/wasm/);
  for(const file of ['draco_wasm_wrapper.js','draco_decoder.wasm','draco_decoder.js','LICENSE-Apache-2.0.txt'])assert.ok(existsSync(new URL('public/libs/draco/'+file,root)),file);
  const source=read('src/components/CortexBrain.jsx').toString();
  assert.match(source,/setDecoderPath\('\/libs\/draco\/'\)/);assert.doesNotMatch(source,/https?:\/\/[^'"\s]*draco/i);
});
test('attribution names the reference brain and the decoder license',()=>{
  const text=read('ATTRIBUTION.md').toString();
  assert.match(text,/3D Reference Organ for Brain, Female/);assert.match(text,/CC BY 4\.0/);assert.match(text,/Apache License 2\.0/);
});
test('anatomy notes describe the v6 reference brain honestly',()=>{
  for(const r of REGIONS){assert.doesNotMatch(r.look,/Geometric teaching boundary|schematic/i,r.id);assert.ok(r.look.length>40,r.id);}
  assert.match(REGION_BY_ID.pag.look,/4 mm/);assert.match(REGION_BY_ID.callosum.look,/One continuous arch/);
});
test('atlas name corrections are recorded with the build',()=>{
  assert.equal(Object.keys(manifest.atlasRelabelled).length,8);
  assert.equal(manifest.atlasRelabelled.optic_radiation,'posteroventral_putamen');
});
