import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {REGIONS,REGION_BY_ID,ANATOMY_SOURCES} from '../data/anatomyCatalog.mjs';
import './CortexBrain.css';

const MODEL_VERSION = 'cc-blender-5.0';
const cache = new Map();
const VIEWS = {perspective: [-7.2,3.2,7.2], left: [-10.5,1,0], right: [10.5,1,0], top: [0,11,.01], front: [0,1,10.5]};
const SURFACE_IDS=new Set(REGIONS.filter(r=>r.kind==='cortex').map(r=>r.id));
function loadModel(mobile) {
  const url = `/models/cortex-brain-v5${mobile ? '-mobile' : ''}.glb`;
  if (!cache.has(url)) cache.set(url, new GLTFLoader().loadAsync(url).catch(error => {cache.delete(url); throw error;}));
  return cache.get(url);
}
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
    const r=REGION_BY_ID[id];setSelected(r?id:'');setSide(['L','R'].includes(wantedSide)?wantedSide:'both');setRotate(false);
    callback.current?.(r?{...r}:null);if(fromStudy)setIsolate(false);
    if(!r){setIsolate(false);return;}
    if(r.kind==='cortex'&&!r.medial){setMode('surface');setView(wantedSide==='R'?'right':wantedSide==='L'?'left':'perspective');}
    else if(r.kind==='support'){setMode('surface');setView('perspective');}
    else if(fromStudy&&wantedSide==='both'&&r.kind==='deep'){setMode('deep');setView('perspective');}
    else{setMode('cutaway');setView(wantedSide==='L'?'right':'left');}
  };
  const chooseRef=useRef(choose); chooseRef.current=choose;
  useEffect(() => {
    const host=mount.current; if(!host) return;
    let disposed=false, frame=0, model=null, down=null, visible=true, needsRender=true;
    const ownedMaterials=[];
    setStatus('loading'); host.dataset.model='loading'; host.dataset.version=MODEL_VERSION;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.1,100);
    camera.position.set(...VIEWS.perspective);
    let renderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}
    catch {setStatus('unavailable');host.dataset.model='unavailable';return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.15; renderer.localClippingEnabled=true;
    renderer.domElement.setAttribute('aria-label','Rotate the 3D brain with pointer drag or arrow keys; plus and minus zoom. Region details are available below.');
    renderer.domElement.setAttribute('tabindex','0'); host.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement);
    const markDirty=()=>{needsRender=true;};controls.addEventListener('change',markDirty);
    controls.enableDamping=true; controls.enablePan=false; controls.dampingFactor=.08;
    controls.minDistance=8; controls.maxDistance=22; controls.target.set(0,0,0); controls.autoRotateSpeed=.45;
    scene.add(new THREE.HemisphereLight(0xcbeaff,0x162236,1.3));
    const key=new THREE.DirectionalLight(0xfff4ed,2.7);key.position.set(-5,7,7);scene.add(key);
    const rim=new THREE.DirectionalLight(0x74cdff,2.2);rim.position.set(5,3,-5);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xcbb9ed,.8);fill.position.set(-5,-1,-3);scene.add(fill);
    const meshes=[];let selectedMeshes=[],activeId='',activeSide='both',activeIsolate=false;
    const clip=new THREE.Plane(new THREE.Vector3(1,0,0),-.28);
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
        const box=new THREE.Box3().setFromObject(model),sphere=box.getBoundingSphere(new THREE.Sphere());
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
    const fitView=name=>{
      controls.minDistance=activeIsolate?.3:8;camera.up.set(0,1,0);camera.position.set(...(VIEWS[name]||VIEWS.perspective));
      if(name==='top')camera.up.set(0,0,-1);
      if(host.clientWidth<400) camera.position.multiplyScalar(1.13);
      controls.target.set(0,0,0);controls.update();
    };
    let activeMode='surface';
    const configure=(nextMode,id,selectedSide='both',only=false,colored=true)=>{
      needsRender=true;activeMode=nextMode;activeId=id;activeSide=selectedSide;activeIsolate=only;
      host.dataset.mode=nextMode;host.dataset.selected=id||'';host.dataset.side=selectedSide;host.dataset.isolated=String(only);
      const members=REGION_BY_ID[id]?.members||[id];selectedMeshes=[];
      const keep=selectedSide==='L'?'L':'R';clip.normal.set(keep==='L'?-1:1,0,0);clip.constant=-.06;
      for(const mesh of meshes){
        const {kind,hemisphere,regionId,baseColor}=mesh.userData,mat=mesh.material;
        const match=members.includes(regionId)&&(selectedSide==='both'||hemisphere===selectedSide||!['L','R'].includes(hemisphere));
        mesh.position.copy(mesh.userData.restPosition);mesh.visible=true;mesh.renderOrder=0;mat.clippingPlanes=[];
        mat.color.copy(colored?baseColor:new THREE.Color('#bed0dc'));mat.emissive.copy(baseColor);mat.emissiveIntensity=match?.2:0;
        mat.opacity=1;mat.transparent=false;mat.depthWrite=true;mat.side=THREE.DoubleSide;
        if(kind==='cortex'){
          mesh.visible=nextMode!=='cutaway'||hemisphere===keep;
          if(nextMode==='deep'){mesh.position.x+=hemisphere==='L'?-1.45:1.45;mat.opacity=.1;mesh.renderOrder=3;}
          if(nextMode==='cutaway'&&!(match&&REGION_BY_ID[id]?.medial))mat.clippingPlanes=[clip];
        }else if(kind==='deep'){
          mesh.visible=nextMode!=='surface'&&(nextMode!=='cutaway'||!['L','R'].includes(hemisphere)||hemisphere===keep);
          if(id&&!match)mat.opacity=.32;
        }else if(nextMode==='deep'){mat.opacity=.18;}
        if(only&&id){mesh.visible=match;mat.opacity=1;mat.clippingPlanes=[];mesh.position.copy(mesh.userData.restPosition);}
        mat.transparent=mat.opacity<1;mat.depthWrite=!mat.transparent;mat.needsUpdate=true;
        if(match&&mesh.visible)selectedMeshes.push(mesh);
      }
      host.dataset.selectedMeshes=selectedMeshes.map(m=>m.name).join(',');
    };
    const frameSelection=()=>{
      const targets=selectedMeshes.length?selectedMeshes:meshes.filter(o=>o.visible);
      const box=new THREE.Box3();targets.forEach(o=>box.union(new THREE.Box3().setFromObject(o)));
      if(box.isEmpty())return;const sphere=box.getBoundingSphere(new THREE.Sphere());
      const direction=camera.position.clone().sub(controls.target).normalize();
      const angle=Math.min(THREE.MathUtils.degToRad(camera.fov),2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect));
      const distance=Math.max(.65,sphere.radius/Math.sin(angle/2)*1.08);controls.minDistance=selectedMeshes.length?.3:8;
      controls.target.copy(sphere.center);camera.position.copy(sphere.center).addScaledVector(direction,distance);controls.update();
    };
    engine.current={configure,frame:frameSelection,view:fitView,rotate:value=>{controls.autoRotate=value;},zoom:factor=>{camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();}};
    const mobile=compact||window.matchMedia('(max-width: 700px)').matches;
    let loadedMobile=mobile;
    withDeadline(loadModel(mobile),45000).catch(error=>{if(mobile)throw error;loadedMobile=true;return withDeadline(loadModel(true),30000);}).then(gltf=>{
      if(disposed)return;
      model=gltf.scene.clone(true);
      model.traverse(obj=>{
        if(!obj.isMesh)return;
        const mat=obj.material.clone();obj.material=mat;ownedMaterials.push(mat);
        mat.roughness=Math.max(mat.roughness||.4,.4);mat.metalness=.08;
        if(mat.normalMap)mat.normalScale.set(.7,.7);
        obj.userData={...obj.userData,restPosition:obj.position.clone(),baseColor:mat.color.clone()};
        meshes.push(obj);
      });
      scene.add(model);configure('surface','');fitView('perspective');
      host.dataset.model='loaded';host.dataset.meshes=String(meshes.length);
      host.dataset.triangles=String(meshes.reduce((n,o)=>n+(o.geometry.index?.count||o.geometry.attributes.position.count)/3,0));
      host.dataset.lod=loadedMobile?'mobile':'desktop';setStatus('ready');
    }).catch(()=>{if(!disposed){host.dataset.model='failed';setStatus('error');}});
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
    const pointerDown=event=>{down={x:event.clientX,y:event.clientY};};
    const pointerUp=event=>{
      if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>6){down=null;return;}down=null;
      const box=renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);ray.setFromCamera(pointer,camera);
      const candidates=meshes.filter(o=>o.visible&&(activeMode==='deep'&&!activeIsolate?o.userData.kind!=='cortex':true));
      const hits=ray.intersectObjects(candidates,false);
      const hit=hits.find(h=>!h.object.material.clippingPlanes?.some(p=>p.distanceToPoint(h.point)<0));if(!hit)return;
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
      camera.position.setFromSpherical(s).add(controls.target);controls.update();
    };
    const lost=event=>{event.preventDefault();host.dataset.model='unavailable';setStatus('unavailable');};
    const canvas=renderer.domElement;
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
    canvas.addEventListener('keydown',keyDown);canvas.addEventListener('webglcontextlost',lost);
    const updateLabel=()=>{
      const label=labelRef.current,line=lineRef.current;if(!label||!line)return;
      const mesh=selectedMeshes[0];if(!mesh||!mesh.visible){label.style.opacity='0';line.style.opacity='0';return;}
      const point=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()).project(camera);
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
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);
      canvas.removeEventListener('keydown',keyDown);canvas.removeEventListener('webglcontextlost',lost);
      window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);printImage.remove();
      controls.removeEventListener('change',markDirty);controls.dispose();ownedMaterials.forEach(m=>m.dispose());
      renderer.dispose();renderer.forceContextLoss();canvas.remove();engine.current=null;
    };
  },[attempt,compact,loadRequested]);
  useEffect(()=>{engine.current?.configure(mode,selected,side,isolate,regionColors);},[mode,selected,side,isolate,regionColors,status]);
  useEffect(()=>{engine.current?.view(view);if(isolate)engine.current?.frame();},[view,isolate,selected,side,status]);
  useEffect(()=>{if(focus?.id)chooseRef.current(focus.id,focus.side,true);},[focus]);
  useEffect(()=>{engine.current?.rotate(rotate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);},[rotate,status]);
  const changeMode=next=>{setMode(next);setIsolate(false);setView(next==='cutaway'?(side==='L'?'right':'left'):'perspective');};
  if(compact&&!loadRequested)return <section className="cc-brain cc-brain-v2 compact cc-brain-poster" aria-label="Educational brain preview"><div className="cc-brain-poster-image"><img src="/reports/brain-surface.jpg" width="1020" height="645" alt="Generic educational brain surface, not a personal scan"/><button className="cc-primary" onClick={()=>{setLoadRequested(true);setTouchActive(true);}}>Load interactive brain</button></div><p className="cc-brain-model-note">Explore the same teaching anatomy used in the reports. The larger 3D download starts only when you choose to open it.</p></section>;
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
      <div className="cc-brain-view-label">{isolate?'ISOLATED TEACHING REGION':mode==='cutaway'?`MEDIAL CUTAWAY · ${side==='L'?'LEFT':'RIGHT'} HEMISPHERE`:mode==='deep'?'OPEN HEMISPHERES · SCHEMATIC STRUCTURES':'CORTICAL SURFACE · GENERIC TEACHING MODEL'}</div>
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
    {<details className="cc-brain-credits"><summary>Model provenance</summary><p>Surface adapted in Blender from “Brain - with labeled parts” by AbdulMuhaymin (CC BY 4.0). Surface divided into 26 selectable teaching topics with geometric boundaries; internal guide shapes remain schematic. Textures and attribution are retained. Not a medical atlas.</p><a href="https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8" target="_blank" rel="noreferrer">Original model</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">License</a></details>}
  </section>;
}
