import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {REGIONS,REGION_BY_ID,ANATOMY_SOURCES} from '../data/anatomyCatalog.mjs';
import {MODEL_VERSION,MODEL_FILES,MODEL_POSTER} from '../data/brainModel.mjs';
import './CortexBrain.css';

// v6 model axes: +X patient left, +Y superior, +Z anterior. A camera on +X sees the left hemisphere.
const cache = new Map();
const VIEWS = {perspective:[7.2,3.2,7.2], left:[10.5,1,0], right:[-10.5,1,0], top:[0,11,.01], front:[0,1,10.5],
  below:[3.4,-9.4,5.4], back:[5.6,2.2,-9.2], low:[6.4,-2.6,7.6], posterior:[7.4,3.4,-7.2]};
const NEUTRAL = new THREE.Color('#bed0dc');
const MEDIAL_CUT = .004; // ~0.1 mm: removes only the flat midline face; medial cortex stays whole
// Pick presets. Medial cortex opens the medial cutaway; buried or internal parts open the deep view.
const MEDIAL = new Set(['acc','pcc','precuneus','visual']);
const DEEP_PICK = new Set(['amygdala','hippocampus','thalamus','hypothalamus','pag','callosum','caudate','putamen','ventral_striatum','insula','cerebellum','brainstem']);
const DEEP_VIEW = {brainstem:'low'};
const MIDLINE_CUT = new Set(['hypothalamus','pag','callosum','cerebellum']);
const PICK_VIEW = {ofc:'below', cerebellar_hemispheres:'back', occipital:'posterior'};
let draco = null;
function dracoLoader(type='wasm') {
  if (!draco || draco.type !== type) {
    draco?.loader.dispose();
    const loader = new DRACOLoader().setDecoderPath('/libs/draco/').setDecoderConfig({type}).setWorkerLimit(2);
    draco = {type, loader};
  }
  return draco.loader;
}
function loadModel(mobile, decoder='wasm') {
  const url = mobile ? MODEL_FILES.mobile : MODEL_FILES.desktop, key = `${url}#${decoder}`;
  if (!cache.has(key)) cache.set(key, new GLTFLoader().setDRACOLoader(dracoLoader(decoder)).loadAsync(url).catch(error => {cache.delete(key); throw error;}));
  return cache.get(key);
}
// Browsers that refuse WebAssembly under the page policy still get the model through the JS decoder.
const loadWithFallback = mobile => loadModel(mobile).catch(() => loadModel(mobile, 'js'));
function withDeadline(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Model download timed out')), ms);
    promise.then(value => {clearTimeout(timer); resolve(value);}, error => {clearTimeout(timer); reject(error);});
  });
}
// Crop transparent renderer padding, not brain content, for the print-only snapshot.
function printSnapshot(canvas){
  const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
  const ctx=copy.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,0,0);
  const {data}=ctx.getImageData(0,0,copy.width,copy.height);
  let left=copy.width,top=copy.height,right=-1,bottom=-1;
  for(let y=0;y<copy.height;y++)for(let x=0;x<copy.width;x++){
    if(data[(y*copy.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  }
  if(right<left)return canvas.toDataURL('image/png');
  const padding=Math.ceil(Math.max(right-left,bottom-top)*.08);
  const result=document.createElement('canvas');result.width=right-left+1+padding*2;result.height=bottom-top+1+padding*2;
  result.getContext('2d').drawImage(copy,left,top,right-left+1,bottom-top+1,padding,padding,right-left+1,bottom-top+1);
  return result.toDataURL('image/png');
}
// X-ray ghost: faces seen edge-on stay visible, faces seen head-on fade, so inner structures read clearly.
function ghostify(material) {
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>',
      '#include <dithering_fragment>\n float ccRim = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.0);\n gl_FragColor.a *= mix(.35, 1.6, ccRim);');
  };
  material.customProgramCacheKey = () => 'cc-ghost';
}
// Label anchors: the vertex nearest the part's centre first, then up to 24 points spread over it
// (farthest-point sampling), so the leader line can always end on a visible part of the region.
const anchorsOf = geometry => {
  const p = geometry.attributes.position, centre = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) centre.add(v.fromBufferAttribute(p, i));
  centre.divideScalar(Math.max(p.count, 1));
  const step = Math.max(1, Math.floor(p.count / 600)), pool = [];
  for (let i = 0; i < p.count; i += step) pool.push(new THREE.Vector3().fromBufferAttribute(p, i));
  let first = pool[0];
  for (const point of pool) if (point.distanceToSquared(centre) < first.distanceToSquared(centre)) first = point;
  const chosen = [first], gap = pool.map(point => point.distanceToSquared(first));
  while (chosen.length < 25 && chosen.length < pool.length) {
    let far = 0; for (let i = 1; i < pool.length; i++) if (gap[i] > gap[far]) far = i;
    chosen.push(pool[far]); for (let i = 0; i < pool.length; i++) gap[i] = Math.min(gap[i], pool[i].distanceToSquared(pool[far]));
  }
  return chosen.sort((a, b) => a.distanceToSquared(centre) - b.distanceToSquared(centre));
};
export default function CortexBrain({profile, onSelect, compact=false,focus=null}) {
  const mount=useRef(null),engine=useRef(null),callback=useRef(onSelect),labelRef=useRef(null),lineRef=useRef(null);
  const [mode,setMode] = useState('surface'), [view,setView] = useState('perspective');
  const [selected,setSelected] = useState(''), [status,setStatus] = useState('loading'), [attempt,setAttempt] = useState(0);
  const [rotate,setRotate] = useState(false);
  const [touchActive,setTouchActive]=useState(false);
  const [loadRequested,setLoadRequested]=useState(()=>!compact||typeof window==='undefined'||!window.matchMedia('(max-width:700px)').matches);
  const [side,setSide]=useState('both'),[isolate,setIsolate]=useState(false),[regionColors,setRegionColors]=useState(true);
  callback.current=onSelect;
  const region = REGIONS.find(r => r.id === selected);
  const choose=(id,wantedSide='both',fromStudy=false)=>{
    const r=REGION_BY_ID[id];const s=['L','R'].includes(wantedSide)?wantedSide:'both';
    setSelected(r?id:'');setSide(s);setRotate(false);
    callback.current?.(r?{...r}:null);if(fromStudy)setIsolate(false);
    if(!r){setIsolate(false);return;}
    // Every pick opens a mode where that part is actually drawn: lateral cortex on the surface, medial
    // cortex in the medial cutaway, buried and internal parts in the deep view.
    if(MEDIAL.has(id)){setMode('cutaway');setView(s==='L'?'right':'left');}
    else if(DEEP_PICK.has(id)){setMode('deep');setView(s==='L'?'left':s==='R'?'right':DEEP_VIEW[id]||'perspective');}
    else if(PICK_VIEW[id]&&s==='both'){setMode('surface');setView(PICK_VIEW[id]);}
    else{setMode('surface');setView(s==='R'?'right':s==='L'?'left':'perspective');}
  };
  const chooseRef=useRef(choose); chooseRef.current=choose;
  useEffect(() => {
    const host=mount.current; if(!host) return;
    let disposed=false, frame=0, model=null, down=null, visible=true, needsRender=true, probeTimer=0;
    const ownedMaterials=[];
    setStatus('loading'); host.dataset.model='loading'; host.dataset.version=MODEL_VERSION;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.1,100);
    camera.position.set(...VIEWS.perspective);
    let renderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,stencil:true});}
    catch {setStatus('unavailable');host.dataset.model='unavailable';return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=.92; renderer.localClippingEnabled=true;
    renderer.domElement.setAttribute('aria-label','Rotate the 3D brain with pointer drag or arrow keys; plus and minus zoom. Region details are available below.');
    renderer.domElement.setAttribute('tabindex','0'); host.appendChild(renderer.domElement);
    const pmrem=new THREE.PMREMGenerator(renderer);
    const environment=pmrem.fromScene(new RoomEnvironment(renderer),.04).texture;scene.environment=environment;
    const controls=new OrbitControls(camera,renderer.domElement);
    const markDirty=()=>{needsRender=true;};controls.addEventListener('change',markDirty);
    controls.enableDamping=true; controls.enablePan=false; controls.dampingFactor=.08;
    controls.minDistance=8; controls.maxDistance=22; controls.target.set(0,0,0); controls.autoRotateSpeed=.45;
    scene.add(new THREE.HemisphereLight(0xd6eeff,0x15223a,.36));
    const key=new THREE.DirectionalLight(0xfff3ea,2.45);key.position.set(5,7,7);scene.add(key);
    const rim=new THREE.DirectionalLight(0x86d4ff,1.05);rim.position.set(-5,3,-6);scene.add(rim);
    const meshes=[],capGroups=new Map(),capRoot=new THREE.Group();
    let selectedMeshes=[],labelMesh=null,labelPoint=null,activeMode='surface',activeIsolate=false;
    const plane=new THREE.Plane(new THREE.Vector3(-1,0,0),-MEDIAL_CUT);
    const resize=()=>{
      const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);needsRender=true;
    };
    const printImage=document.createElement('img');
    printImage.className='cc-brain-print-image';printImage.alt='Generic educational brain model rendered from the interactive 3D view';
    host.parentElement.appendChild(printImage);
    const beforePrint=()=>{
      const previousRatio=renderer.getPixelRatio();renderer.setPixelRatio(2);resize();
      const printCamera=camera.clone();
      if(model){
        const box=new THREE.Box3();meshes.filter(m=>m.visible).forEach(m=>box.union(new THREE.Box3().setFromObject(m)));
        const sphere=(box.isEmpty()?new THREE.Box3().setFromObject(model):box).getBoundingSphere(new THREE.Sphere());
        const direction=camera.position.clone().sub(controls.target).normalize();
        const vFov=THREE.MathUtils.degToRad(printCamera.fov),hFov=2*Math.atan(Math.tan(vFov/2)*printCamera.aspect);
        const distance=sphere.radius/Math.sin(Math.min(vFov,hFov)/2)*1.02;
        printCamera.position.copy(sphere.center).addScaledVector(direction,distance);printCamera.lookAt(sphere.center);
      }
      renderer.render(scene,printCamera);
      try{printImage.src=printSnapshot(renderer.domElement);}catch{printImage.removeAttribute('src');}
      renderer.setPixelRatio(previousRatio);resize();
    };
    const afterPrint=()=>requestAnimationFrame(()=>{if(!disposed){resize();renderer.render(scene,camera);}});
    window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;if(visible)needsRender=true;});intersection.observe(host);
    const fitView=(name,target=null,distanceScale=1)=>{
      controls.minDistance=activeIsolate?.3:activeMode==='deep'?5:8;camera.up.set(0,1,0);
      const position=new THREE.Vector3(...(VIEWS[name]||VIEWS.perspective));
      if(name==='top')camera.up.set(0,0,1);
      if(host.clientWidth<400) position.multiplyScalar(1.13);
      position.multiplyScalar(distanceScale);
      controls.target.copy(target||new THREE.Vector3());camera.position.copy(controls.target).add(position);controls.update();
      scheduleProbe();
    };
    // ---- cut fill: stencil caps. Each closed group (a hemisphere's surface patches, white matter,
    // ventricles, each structure) counts its clipped back minus front faces; where the count is
    // non-zero the cut plane is inside that solid and its cap colour is drawn.
    const stencilBase={depthWrite:false,depthTest:false,colorWrite:false,stencilWrite:true,stencilFunc:THREE.AlwaysStencilFunc};
    const capGeometry=new THREE.PlaneGeometry(16,16);
    const buildCaps=()=>{
      const groups=[...capGroups.values()].sort((a,b)=>a.layer-b.layer||a.name.localeCompare(b.name));
      groups.forEach((group,index)=>{
        const order=20+index*3;
        const back=new THREE.MeshBasicMaterial({...stencilBase,side:THREE.BackSide,clippingPlanes:[plane],
          stencilFail:THREE.IncrementWrapStencilOp,stencilZFail:THREE.IncrementWrapStencilOp,stencilZPass:THREE.IncrementWrapStencilOp});
        const front=new THREE.MeshBasicMaterial({...stencilBase,side:THREE.FrontSide,clippingPlanes:[plane],
          stencilFail:THREE.DecrementWrapStencilOp,stencilZFail:THREE.DecrementWrapStencilOp,stencilZPass:THREE.DecrementWrapStencilOp});
        ownedMaterials.push(back,front);
        group.stencil=[];
        for(const mesh of group.meshes)for(const [material,offset] of [[back,0],[front,1]]){
          const counter=new THREE.Mesh(mesh.geometry,material);counter.matrixAutoUpdate=false;counter.matrix.copy(mesh.matrixWorld);
          counter.renderOrder=order+offset*.1;counter.visible=false;counter.frustumCulled=false;capRoot.add(counter);group.stencil.push(counter);
        }
        const capMaterial=new THREE.MeshStandardMaterial({color:group.color,roughness:.82,metalness:0,envMapIntensity:.6,
          stencilWrite:true,stencilRef:0,stencilFunc:THREE.NotEqualStencilFunc,
          stencilFail:THREE.ReplaceStencilOp,stencilZFail:THREE.ReplaceStencilOp,stencilZPass:THREE.ReplaceStencilOp});
        ownedMaterials.push(capMaterial);
        const cap=new THREE.Mesh(capGeometry,capMaterial);cap.renderOrder=order+1;cap.visible=false;
        cap.onAfterRender=r=>r.clearStencil();capRoot.add(cap);group.cap=cap;
      });
    };
    const placeCaps=()=>{
      for(const group of capGroups.values()){
        const cap=group.cap;if(!cap)continue;
        plane.coplanarPoint(cap.position);cap.lookAt(cap.position.clone().sub(plane.normal));
      }
    };
    const isOpaqueVisible=o=>o.visible&&!o.material.transparent;
    const clippedAway=(object,point)=>object.material.clippingPlanes?.some(p=>p.distanceToPoint(point)<0);
    // Is a point on the cut plane inside the kept solid (i.e. covered by a cap)? Parity of crossings.
    const insideCap=(point,layers=[0])=>{
      const ray=new THREE.Raycaster(point,plane.normal.clone(),0,40);
      for(const group of capGroups.values()){
        if(!layers.includes(group.layer)||!group.cap?.visible)continue;
        if(ray.intersectObjects(group.meshes,false).length%2===1)return group;
      }
      return null;
    };
    // Visibility probe: a selected part counts as shown when one of its anchors is the first thing a
    // ray from the camera meets (not hidden behind other opaque parts or under a filled cut face).
    // The label then points at that anchor. Exposed as data-selected-visible for the browser checks.
    const anchorVisible=(mesh,anchor,ray)=>{
      const direction=anchor.clone().sub(camera.position),distance=direction.length();
      ray.set(camera.position,direction.normalize());ray.far=distance+.05;
      const hits=ray.intersectObjects(meshes.filter(isOpaqueVisible),false).filter(h=>!clippedAway(h.object,h.point));
      if(hits[0]&&!selectedMeshes.includes(hits[0].object)&&hits[0].distance<distance-.03)return false;
      if(activeMode==='cutaway'&&mesh.material.clippingPlanes?.length){
        const crossing=ray.ray.intersectPlane(plane,new THREE.Vector3());
        if(crossing&&crossing.distanceTo(camera.position)<distance-.01&&insideCap(crossing))return false;
      }
      return true;
    };
    const probe=()=>{
      probeTimer=0;
      if(!selectedMeshes.length){host.dataset.selectedVisible='';host.dataset.labelTarget='';labelMesh=null;labelPoint=null;return;}
      const ray=new THREE.Raycaster();let found=null,point=null;
      const ranked=[...selectedMeshes].sort((a,b)=>a.userData.anchors[0].distanceTo(camera.position)-b.userData.anchors[0].distanceTo(camera.position));
      for(const mesh of ranked){
        if(mesh.userData.xray.visible){found=mesh;point=mesh.userData.anchors[0];break;}
        if(!mesh.visible)continue;
        point=mesh.userData.anchors.find(anchor=>anchorVisible(mesh,anchor,ray));
        if(point){found=mesh;break;}
      }
      labelMesh=found||ranked[0];labelPoint=point||labelMesh.userData.anchors[0];
      host.dataset.selectedVisible=String(Boolean(found));host.dataset.labelTarget=labelMesh?.name||'';needsRender=true;
    };
    const scheduleProbe=()=>{if(probeTimer)clearTimeout(probeTimer);probeTimer=setTimeout(()=>{if(!disposed)probe();},120);};
    controls.addEventListener('end',scheduleProbe);
    const configure=(nextMode,id,selectedSide='both',only=false,colored=true)=>{
      needsRender=true;activeMode=nextMode;activeIsolate=only;
      host.dataset.mode=nextMode;host.dataset.selected=id||'';host.dataset.side=selectedSide;host.dataset.isolated=String(only);
      const members=REGION_BY_ID[id]?.members||[id];selectedMeshes=[];
      const keep=selectedSide==='L'?'L':'R';
      const matches=mesh=>{const {regionId,hemisphere}=mesh.userData;return Boolean(id)&&members.includes(regionId)&&(selectedSide==='both'||hemisphere===selectedSide||!['L','R'].includes(hemisphere));};
      // Cut plane: the medial plane, or through the selected structure on the kept side.
      let cut=MEDIAL_CUT;
      if(nextMode==='cutaway'&&id&&!MIDLINE_CUT.has(id)){
        const target=meshes.find(m=>matches(m)&&m.userData.layer==='internal'&&m.userData.hemisphere===keep);
        if(target)cut=Math.abs(target.userData.centre.x);
      }
      const sign=keep==='L'?1:-1;plane.normal.set(sign,0,0);plane.constant=-cut;placeCaps();
      host.dataset.cut=nextMode==='cutaway'?cut.toFixed(3):'';
      const anySelected=Boolean(id&&REGION_BY_ID[id]);
      for(const mesh of meshes){
        const {kind,layer,hemisphere,baseColor,helper,xray}=mesh.userData,mat=mesh.material;
        const match=!helper&&matches(mesh);
        const keptSide=hemisphere===keep||hemisphere==='M';
        mesh.position.copy(mesh.userData.restPosition);mesh.renderOrder=0;mat.clippingPlanes=[];
        mat.color.copy(colored&&!helper?baseColor:NEUTRAL);
        // A pick should stand out: everything else is muted toward neutral grey-blue.
        if(anySelected&&!match&&!helper)mat.color.lerp(NEUTRAL,colored?.5:0).multiplyScalar(.9);
        if(match&&colored)mat.color.offsetHSL(0,.12,-.05); // a little more saturated than its neighbours
        mat.emissive.copy(baseColor);mat.emissiveIntensity=match?(nextMode==='deep'?.22:.45):0;
        mat.opacity=1;mat.transparent=false;mat.depthWrite=true;mat.side=THREE.DoubleSide;
        mat.polygonOffset=false;mat.polygonOffsetFactor=0;mat.polygonOffsetUnits=0;mat.onBeforeCompile=()=>{};mat.customProgramCacheKey=()=> 'cc-solid';
        let show=layer!=='cap',ghost=false;
        if(nextMode==='surface'){show=layer==='surface';}
        else if(nextMode==='cutaway'){
          show=layer==='surface'&&keptSide;
          if(show)mat.clippingPlanes=[plane];
          if(layer==='internal'&&match&&keptSide){show=true;mat.polygonOffset=true;mat.polygonOffsetFactor=-2;mat.polygonOffsetUnits=-2;}
        }else if(nextMode==='deep'){
          if(layer==='cap')show=false;
          else if(kind==='cortex'||kind==='support'||(mesh.userData.regionId==='insula'&&!match)){ghost=!match;show=true;}
          else{show=true;if(anySelected&&!match){mat.opacity=.16;mat.color.copy(NEUTRAL);}}
        }
        if(ghost){
          mat.opacity=kind==='support'?.16:.11;mat.depthWrite=false;mat.side=THREE.FrontSide;mesh.renderOrder=5;
          mat.polygonOffset=true;mat.polygonOffsetFactor=2;mat.polygonOffsetUnits=2;ghostify(mat);
          if(!match)mat.emissiveIntensity=0;
        }
        if(only&&id){show=match;mat.opacity=1;mat.clippingPlanes=[];mat.depthWrite=true;mat.polygonOffset=false;mesh.renderOrder=0;}
        mesh.visible=show;
        mat.transparent=mat.opacity<1;if(mat.transparent&&!ghost)mat.depthWrite=false;mat.needsUpdate=true;
        // A selected part that this mode would hide (e.g. an internal one in Surface) shows as an x-ray.
        xray.visible=match&&!mesh.visible&&!only&&layer!=='cap'&&!(nextMode==='cutaway'&&!keptSide);
        if(match&&(mesh.visible||xray.visible))selectedMeshes.push(mesh);
      }
      const capping=nextMode==='cutaway'&&!only;
      for(const group of capGroups.values()){
        const on=capping&&(group.side===keep||group.side==='M');
        group.stencil?.forEach(o=>{o.visible=on;});if(group.cap){group.cap.visible=on;group.cap.material.color.copy(colored||group.layer<3?group.color:group.neutral);}
      }
      host.dataset.selectedMeshes=selectedMeshes.map(m=>m.name).join(',');
      host.dataset.selectedVisible='';host.dataset.labelTarget='';labelMesh=null;labelPoint=null;
      scheduleProbe();
    };
    const frameSelection=(targets=selectedMeshes,margin=1.08)=>{
      const list=targets.length?targets:meshes.filter(o=>o.visible);
      const box=new THREE.Box3();list.forEach(o=>box.union(new THREE.Box3().setFromObject(o)));
      if(box.isEmpty())return;const sphere=box.getBoundingSphere(new THREE.Sphere());
      const direction=camera.position.clone().sub(controls.target).normalize();
      const angle=Math.min(THREE.MathUtils.degToRad(camera.fov),2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect));
      const distance=Math.max(.65,sphere.radius/Math.sin(angle/2)*margin);controls.minDistance=Math.min(controls.minDistance,distance*.6);
      controls.target.copy(sphere.center);camera.position.copy(sphere.center).addScaledVector(direction,distance);controls.update();scheduleProbe();
    };
    // Deep picks keep the whole brain in view but move a little toward small structures.
    const focusDeep=()=>{
      if(!selectedMeshes.length)return;
      const box=new THREE.Box3();selectedMeshes.forEach(o=>box.union(new THREE.Box3().setFromObject(o)));
      const size=box.getSize(new THREE.Vector3()).length(),centre=box.getCenter(new THREE.Vector3());
      const scale=THREE.MathUtils.clamp(.5+size*.14,.56,.92); // closer for tiny parts such as the PAG
      fitView(activeView,centre.multiplyScalar(.6),scale);
    };
    let activeView='perspective';
    engine.current={configure,frame:()=>frameSelection(),view:name=>{activeView=name;fitView(name);if(activeMode==='deep')focusDeep();},rotate:value=>{controls.autoRotate=value;},zoom:factor=>{camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();scheduleProbe();}};
    const mobile=compact||window.matchMedia('(max-width: 700px)').matches;
    let loadedMobile=mobile;
    withDeadline(loadWithFallback(mobile),45000).catch(error=>{if(mobile)throw error;loadedMobile=true;return withDeadline(loadWithFallback(true),30000);}).then(gltf=>{
      if(disposed)return;
      model=gltf.scene.clone(true);scene.add(model);scene.add(capRoot);model.updateMatrixWorld(true);
      let triangles=0,drawn=0;
      model.traverse(obj=>{
        if(!obj.isMesh)return;
        const mat=obj.material.clone();obj.material=mat;ownedMaterials.push(mat);
        mat.roughness=Math.max(mat.roughness||.5,.5);mat.metalness=.02;mat.envMapIntensity=.42;
        const count=(obj.geometry.index?.count||obj.geometry.attributes.position.count)/3;triangles+=count;
        const data=obj.userData;data.helper=Boolean(data.helper);
        if(data.layer!=='cap')drawn+=count;
        obj.geometry.computeBoundingBox();
        const centre=obj.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(obj.matrixWorld);
        const anchors=anchorsOf(obj.geometry).map(a=>a.applyMatrix4(obj.matrixWorld));
        const xray=new THREE.Mesh(obj.geometry,new THREE.MeshBasicMaterial({color:mat.color,transparent:true,opacity:.5,depthTest:false,depthWrite:false}));
        ownedMaterials.push(xray.material);xray.renderOrder=999;xray.visible=false;xray.matrixAutoUpdate=false;xray.matrix.copy(obj.matrixWorld);capRoot.add(xray);
        obj.userData={...data,restPosition:obj.position.clone(),baseColor:mat.color.clone(),centre,anchors,xray};
        if(data.capGroup){
          const group=capGroups.get(data.capGroup)||{name:data.capGroup,meshes:[],layer:Number(data.capLayer)||0,
            color:new THREE.Color(data.capColor||'#97a3ae'),neutral:new THREE.Color(Number(data.capLayer)>=3?(data.regionId==='callosum'?'#e8edf0':'#97a3ae'):data.capColor||'#97a3ae'),side:data.hemisphere};
          group.meshes.push(obj);capGroups.set(data.capGroup,group);
        }
        meshes.push(obj);
      });
      buildCaps();configure('surface','');fitView('perspective');
      const selectable=meshes.filter(m=>!m.userData.helper);
      host.dataset.model='loaded';host.dataset.meshes=String(selectable.length);host.dataset.helperMeshes=String(meshes.length-selectable.length);
      host.dataset.triangles=String(triangles);host.dataset.drawnTriangles=String(drawn);
      host.dataset.lod=loadedMobile?'mobile':'desktop';setStatus('ready');
    }).catch(()=>{if(!disposed){host.dataset.model='failed';setStatus('error');}});
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
    const pointerDown=event=>{down={x:event.clientX,y:event.clientY};};
    const pointerUp=event=>{
      if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>6){down=null;return;}down=null;
      const box=renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);ray.setFromCamera(pointer,camera);
      const candidates=meshes.filter(o=>o.visible&&!o.userData.helper&&(activeMode==='deep'&&!activeIsolate?!o.material.transparent:true));
      const hit=ray.intersectObjects(candidates,false).find(h=>!clippedAway(h.object,h.point));
      // In the cutaway, a click on a filled cut face picks the structure whose section is there.
      if(activeMode==='cutaway'&&!activeIsolate){
        const crossing=ray.ray.intersectPlane(plane,new THREE.Vector3());
        if(crossing&&(!hit||crossing.distanceTo(ray.ray.origin)<hit.distance)){
          const group=insideCap(crossing,[3]);const owner=group?.meshes[0];
          if(owner&&REGION_BY_ID[owner.userData.regionId]){chooseRef.current(owner.userData.regionId,['L','R'].includes(owner.userData.hemisphere)?owner.userData.hemisphere:'both');return;}
          if(insideCap(crossing,[0,1,2]))return;
        }
      }
      if(!hit)return;
      const id=hit.object.userData.regionId;
      if(REGION_BY_ID[id])chooseRef.current(id,['L','R'].includes(hit.object.userData.hemisphere)?hit.object.userData.hemisphere:'both');
    };
    const keyDown=event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(event.key))return;
      event.preventDefault();const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if(event.key==='ArrowLeft')s.theta-=.12;if(event.key==='ArrowRight')s.theta+=.12;
      if(event.key==='ArrowUp')s.phi-=.1;if(event.key==='ArrowDown')s.phi+=.1;
      if(event.key==='+'||event.key==='=')s.radius*=.9;if(event.key==='-')s.radius*=1.1;
      s.phi=THREE.MathUtils.clamp(s.phi,.05,Math.PI-.05);s.radius=THREE.MathUtils.clamp(s.radius,controls.minDistance,22);
      camera.position.setFromSpherical(s).add(controls.target);controls.update();scheduleProbe();
    };
    const lost=event=>{event.preventDefault();host.dataset.model='unavailable';setStatus('unavailable');};
    const canvas=renderer.domElement;
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
    canvas.addEventListener('keydown',keyDown);canvas.addEventListener('webglcontextlost',lost);
    const updateLabel=()=>{
      const label=labelRef.current,line=lineRef.current;if(!label||!line)return;
      const mesh=labelMesh&&selectedMeshes.includes(labelMesh)?labelMesh:null;
      if(!mesh){label.style.opacity='0';line.style.opacity='0';return;}
      const point=(labelPoint||mesh.userData.anchors[0]).clone().project(camera);
      if(point.z>1||point.z< -1){label.style.opacity='0';line.style.opacity='0';return;}
      const x=(point.x+1)/2*host.clientWidth,y=(1-point.y)/2*host.clientHeight;
      const lx=Math.max(8,Math.min(host.clientWidth-190,x+22)),ly=Math.max(8,Math.min(host.clientHeight-65,y-68));
      label.style.left=lx+'px';label.style.top=ly+'px';label.style.opacity='1';label.dataset.target=mesh.name;
      line.setAttribute('x1',String(x));line.setAttribute('y1',String(y));line.setAttribute('x2',String(lx+15));line.setAttribute('y2',String(ly+35));line.style.opacity='1';
    };
    let last=0;
    const draw=time=>{if(disposed)return;frame=requestAnimationFrame(draw);if(!visible||document.hidden||time-last<32)return;last=time;controls.update();if(!needsRender&&!controls.autoRotate)return;updateLabel();renderer.render(scene,camera);needsRender=false;host.dataset.renderCount=String((Number(host.dataset.renderCount)||0)+1);};
    frame=requestAnimationFrame(draw);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);if(probeTimer)clearTimeout(probeTimer);observer.disconnect();intersection.disconnect();
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);
      canvas.removeEventListener('keydown',keyDown);canvas.removeEventListener('webglcontextlost',lost);
      window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);printImage.remove();
      controls.removeEventListener('change',markDirty);controls.removeEventListener('end',scheduleProbe);controls.dispose();ownedMaterials.forEach(m=>m.dispose());
      capGeometry.dispose();environment.dispose();pmrem.dispose();
      renderer.dispose();renderer.forceContextLoss();canvas.remove();engine.current=null;
    };
  },[attempt,compact,loadRequested]);
  useEffect(()=>{engine.current?.configure(mode,selected,side,isolate,regionColors);},[mode,selected,side,isolate,regionColors,status]);
  useEffect(()=>{engine.current?.view(view);if(isolate)engine.current?.frame();},[view,isolate,selected,side,status,mode]);
  useEffect(()=>{if(focus?.id)chooseRef.current(focus.id,focus.side,true);},[focus]);
  useEffect(()=>{engine.current?.rotate(rotate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);},[rotate,status]);
  const changeMode=next=>{setMode(next);setIsolate(false);setView(next==='cutaway'?(side==='L'?'right':'left'):next==='deep'&&side!=='both'?(side==='L'?'left':'right'):'perspective');};
  if(compact&&!loadRequested)return <section className="cc-brain cc-brain-v2 compact cc-brain-poster" aria-label="Educational brain preview"><div className="cc-brain-poster-image"><img src={MODEL_POSTER} width="1020" height="645" alt="Generic educational brain surface, not a personal scan"/><button className="cc-primary" onClick={()=>{setLoadRequested(true);setTouchActive(true);}}>Load interactive brain</button></div><p className="cc-brain-model-note">Explore the same teaching anatomy used in the reports. The larger 3D download starts only when you choose to open it.</p></section>;
  return <section className={`cc-brain cc-brain-v2 ${compact?'compact':''}`} aria-label="Blender-built educational brain explorer">
    <div className="cc-brain-v2-header cc-print-hide">
      <span className="cc-brain-version">CORTEX / ANATOMY EXPLORER</span>
      <div className="cc-brain-modes" aria-label="Brain layers">
        {['surface','cutaway','deep'].map(value=><button key={value} aria-pressed={mode===value} onClick={()=>changeMode(value)}>{value==='deep'?'Deep structures':value[0].toUpperCase()+value.slice(1)}</button>)}
      </div>
    </div>
    <div className="cc-brain-stage">
      <div ref={mount} className="cc-brain-canvas" />
      {status==='ready'&&(!touchActive?<div className="cc-brain-touch-guard cc-print-hide"><button type="button" onClick={()=>setTouchActive(true)}>Enable 3D touch · page scroll is on</button></div>:<button type="button" className="cc-brain-touch-exit cc-print-hide" onClick={()=>setTouchActive(false)}>Return to page scrolling</button>)}
      <svg className="cc-region-leader cc-print-hide" aria-hidden="true"><line ref={lineRef}/></svg>
      <div ref={labelRef} className="cc-region-label cc-print-hide" aria-hidden="true">{region?.label}<small>{side==='L'?'Left':side==='R'?'Right':'Anatomy guide'}</small></div>
      {status==='loading'&&<div className="cc-brain-loading" role="status">Loading the detailed brain model…</div>}
      {(status==='error'||status==='unavailable')&&<div className="cc-brain-loading" role="status"><strong>3D view unavailable</strong><span>{status==='error'?'The model could not be downloaded.':'This browser cannot render WebGL right now.'} The region guide below still works.</span><button onClick={()=>setAttempt(n=>n+1)}>Retry 3D</button></div>}
      <div className="cc-brain-view-label">{isolate?'ISOLATED TEACHING REGION':mode==='cutaway'?`CUTAWAY · ${side==='L'?'LEFT':'RIGHT'} HEMISPHERE`:mode==='deep'?'DEEP STRUCTURES · CORTEX SEE-THROUGH':'CORTICAL SURFACE · GENERIC TEACHING MODEL'}</div>
    </div>
    <div className="cc-brain-v2-controls cc-print-hide" aria-label="Camera controls">
      <div>{['left','right','top','front'].map(value=><button key={value} aria-pressed={view===value} onClick={()=>setView(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div>
      <div><button aria-label="Zoom in" onClick={()=>engine.current?.zoom(.9)}>＋</button><button aria-label="Zoom out" onClick={()=>engine.current?.zoom(1.1)}>−</button><button onClick={()=>{setMode('surface');setView('perspective');setSelected('');setSide('both');setIsolate(false);callback.current?.(null);setRotate(false);engine.current?.view('perspective');}}>Reset</button><button aria-pressed={rotate} onClick={()=>setRotate(v=>!v)}>Rotate</button></div>
    </div>
    <div className="cc-anatomy-options cc-print-hide">
      <div role="group" aria-label="Hemisphere focus">{[['both','Both sides'],['L','Left side'],['R','Right side']].map(([id,text])=><button key={id} aria-pressed={side===id} onClick={()=>{setSide(id);setView(mode==='cutaway'?(id==='L'?'right':'left'):(id==='both'?'perspective':id==='L'?'left':'right'));}}>{text}</button>)}</div>
      <div><button disabled={!selected} aria-pressed={isolate} onClick={()=>{setIsolate(v=>!v);if(!isolate)setView('perspective');}}>Isolate region</button><button aria-pressed={regionColors} onClick={()=>setRegionColors(v=>!v)}>Region colors</button><button disabled={!selected} onClick={()=>engine.current?.frame()}>Frame selection</button></div>
    </div>
    <label className="cc-brain-region-selector cc-print-hide"><span>Explore a region</span><select value={selected} onChange={event=>choose(event.target.value)}><option value="">Choose a brain region…</option>{['Cortical surface','Internal & medial','Supporting anatomy'].map(group=><optgroup label={group} key={group}>{REGIONS.filter(r=>r.group===group).map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</optgroup>)}</select></label>
    {region&&<div className="cc-brain-explanation" aria-live="polite"><strong style={{color:region.color}}>{region.name}</strong><span>{region.where}</span><span>{region.function}</span><small>{region.look}</small><a href={ANATOMY_SOURCES[region.source]?.url} target="_blank" rel="noreferrer">Anatomy background</a></div>}
    <p className="cc-brain-model-note">Same anatomy for every person. Colors identify teaching systems—not injury, activation, or measured brain changes.</p>
    {<details className="cc-brain-credits"><summary>Model provenance</summary><p>Shapes come from one reference brain: the HuBMAP “3D Reference Organ for Brain, Female” v1.4 (Browne &amp; Schlehlein, reviewed by Song-Lin Ding), built from the Allen Human Reference Atlas (Ding et al. 2016), CC BY 4.0. Cortex colors group its gyri into 26 teaching topics, so edges follow its sulci; the periaqueductal gray is drawn as a 4 mm layer around its aqueduct. Adapted and compressed in Blender for this app; not a scan of any person and not a medical atlas.</p><a href="https://doi.org/10.48539/HBM674.NTLM.353" target="_blank" rel="noreferrer">Reference organ</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">License</a></details>}
  </section>;
}
