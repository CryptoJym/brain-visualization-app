import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {REGIONS, SYSTEMS} from '../data/cortexCompass';
import './CortexBrain.css';

const MODEL_VERSION = 'cc-blender-2.0';
const cache = new Map();
const VIEWS = {perspective: [-7.2,3.2,7.2], left: [-10.5,1,0], right: [10.5,1,0], top: [0,11,.01], front: [0,1,10.5]};
const SURFACE_IDS = new Set(['dlpfc', 'temporal']);
function loadModel(mobile) {
  const url = `/models/cortex-brain-v2${mobile ? '-mobile' : ''}.glb`;
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
export default function CortexBrain({profile, onSelect, compact=false}) {
  const mount = useRef(null), engine = useRef(null), callback = useRef(onSelect), currentProfile = useRef(profile);
  const [mode,setMode] = useState('surface'), [view,setView] = useState('perspective');
  const [selected,setSelected] = useState(''), [status,setStatus] = useState('loading'), [attempt,setAttempt] = useState(0);
  const [rotate,setRotate] = useState(false);
  callback.current = onSelect; currentProfile.current = profile;
  const region = REGIONS.find(r => r.id === selected);
  const choose = id => {
    setSelected(id);
    const r=REGIONS.find(item => item.id===id);
    if(!r) callback.current?.(null);
    if (r) callback.current?.({...r, score:currentProfile.current?.regions?.find(item=>item.id===id)?.score||0});
    if(r && SURFACE_IDS.has(id) && mode!=='surface') {setMode('surface');setView('perspective');}
    if (r && !SURFACE_IDS.has(id) && mode==='surface') {setMode('cutaway'); setView('left');}
  };
  const chooseRef=useRef(choose); chooseRef.current=choose;
  useEffect(() => {
    const host=mount.current; if(!host) return;
    let disposed=false, frame=0, model=null, down=null, visible=true;
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
    controls.enableDamping=true; controls.enablePan=false; controls.dampingFactor=.08;
    controls.minDistance=8; controls.maxDistance=22; controls.target.set(0,0,0); controls.autoRotateSpeed=.45;
    scene.add(new THREE.HemisphereLight(0xcbeaff,0x162236,1.3));
    const key=new THREE.DirectionalLight(0xfff4ed,2.7);key.position.set(-5,7,7);scene.add(key);
    const rim=new THREE.DirectionalLight(0x74cdff,2.2);rim.position.set(5,3,-5);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xcbb9ed,.8);fill.position.set(-5,-1,-3);scene.add(fill);
    const meshes=[], focusUniforms=[];
    const clip=new THREE.Plane(new THREE.Vector3(1,0,0),-.28);
    function addSurfaceFocus(material) {
      const uniforms={uFocus:{value:new THREE.Vector3()},uFocusColor:{value:new THREE.Color('#49cbe9')},uFocusRadius:{value:new THREE.Vector3(1,1,1)},uFocusStrength:{value:0}};
      focusUniforms.push(uniforms);
      material.onBeforeCompile=shader=>{
        Object.assign(shader.uniforms,uniforms);
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTeachingPosition;');
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTeachingPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vTeachingPosition;\nuniform vec3 uFocus;\nuniform vec3 uFocusRadius;\nuniform vec3 uFocusColor;\nuniform float uFocusStrength;');
        shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nvec3 focusDelta = (vec3(abs(vTeachingPosition.x),vTeachingPosition.yz)-uFocus)/uFocusRadius;\nfloat teachingFocus = exp(-dot(focusDelta,focusDelta)*2.0);\ntotalEmissiveRadiance += uFocusColor * uFocusStrength * teachingFocus;');
      };
      material.customProgramCacheKey=()=> 'cortex-teaching-focus-v2';
    }
    const resize=()=>{
      const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
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
    const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;});intersection.observe(host);
    const fitView=name=>{
      camera.up.set(0,1,0);camera.position.set(...(VIEWS[name]||VIEWS.perspective));
      if(name==='top')camera.up.set(0,0,-1);
      if(host.clientWidth<400) camera.position.multiplyScalar(1.13);
      controls.target.set(0,0,0);controls.update();
    };
    let activeMode='surface';
    const configure=(nextMode,id)=>{
      activeMode=nextMode;host.dataset.mode=nextMode;host.dataset.selected=id||'';
      for(const mesh of meshes){
        const {kind,hemisphere,regionId}=mesh.userData;
        const mat=mesh.material;const selected=regionId===id;
        mesh.visible=true;mat.clippingPlanes=[];mesh.position.copy(mesh.userData.restPosition);
        if(kind==='cortex'){
          mesh.visible=!(nextMode==='cutaway'&&hemisphere==='L');
          mesh.position.x+=(nextMode==='deep'?(hemisphere==='L'?-1.45:1.45):0);
          mat.opacity=nextMode==='deep'?.13:1;mat.transparent=nextMode==='deep';
          mat.depthWrite=nextMode!=='deep';mat.side=nextMode==='cutaway'?THREE.DoubleSide:THREE.FrontSide;mesh.renderOrder=nextMode==='deep'?3:0;
          if(nextMode==='cutaway')mat.clippingPlanes=[clip];
        }else if(kind==='deep'){
          mesh.visible=nextMode!=='surface'&&!(nextMode==='cutaway'&&hemisphere==='L');
          mat.opacity=id&&!selected&&regionId!=='callosum'?.5:1;mat.transparent=mat.opacity<1;mat.depthWrite=!mat.transparent;
          mat.emissive.copy(mat.color);mat.emissiveIntensity=selected?.4:.025;
        }else{
          mat.opacity=nextMode==='deep'?.23:1;mat.transparent=nextMode==='deep';mat.depthWrite=!mat.transparent;
          if(nextMode==='cutaway')mat.clippingPlanes=[clip];
        }
        mat.needsUpdate=true;
      }
      for(const u of focusUniforms){
        u.uFocusStrength.value=SURFACE_IDS.has(id)?.65:0;
        u.uFocus.value.set(...(id==='temporal'?[1.9,-.32,.25]:[1.5,1.55,1.5]));
        u.uFocusRadius.value.set(...(id==='temporal'?[.85,.65,1.4]:[.9,.85,1.1]));
        u.uFocusColor.value.set(id==='temporal'?'#f3a4d4':'#55d8ff');
      }
    };
    engine.current={configure,view:fitView,rotate:value=>{controls.autoRotate=value;},zoom:factor=>{camera.position.multiplyScalar(factor);controls.update();}};
    const mobile=compact||window.matchMedia('(max-width: 700px)').matches;
    withDeadline(loadModel(mobile),20000).catch(error=>mobile?Promise.reject(error):withDeadline(loadModel(true),15000)).then(gltf=>{
      if(disposed)return;
      model=gltf.scene.clone(true);
      model.traverse(obj=>{
        if(!obj.isMesh)return;
        const mat=obj.material.clone();obj.material=mat;ownedMaterials.push(mat);
        mat.roughness=Math.max(mat.roughness||.4,.4);mat.metalness=.08;
        if(mat.normalMap)mat.normalScale.set(.7,.7);
        obj.userData={...obj.userData,restPosition:obj.position.clone()};
        if(obj.userData.kind==='cortex')addSurfaceFocus(mat);
        meshes.push(obj);
      });
      scene.add(model);configure('surface','');fitView('perspective');
      host.dataset.model='loaded';host.dataset.meshes=String(meshes.length);
      host.dataset.triangles=String(meshes.reduce((n,o)=>n+(o.geometry.index?.count||o.geometry.attributes.position.count)/3,0));
      host.dataset.lod=mobile?'mobile':'desktop';setStatus('ready');
    }).catch(()=>{if(!disposed){host.dataset.model='failed';setStatus('error');}});
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
    const pointerDown=event=>{down={x:event.clientX,y:event.clientY};};
    const pointerUp=event=>{
      if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>6){down=null;return;}down=null;
      const box=renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);ray.setFromCamera(pointer,camera);
      const candidates=meshes.filter(o=>o.visible&&(activeMode==='surface'?o.userData.kind==='cortex':o.userData.kind==='deep'));
      const hit=ray.intersectObjects(candidates,false)[0];if(!hit)return;
      const p=hit.point;
      const surfaceId=Math.abs(p.x)>1.2&&p.y<.35?'temporal':Math.abs(p.x)>1&&p.y>.7&&p.z>.8?'dlpfc':null;
      const id=hit.object.userData.regionId||surfaceId;
      if(REGIONS.some(r=>r.id===id))chooseRef.current(id);
    };
    const keyDown=event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(event.key))return;
      event.preventDefault();const s=new THREE.Spherical().setFromVector3(camera.position);
      if(event.key==='ArrowLeft')s.theta-=.12;if(event.key==='ArrowRight')s.theta+=.12;
      if(event.key==='ArrowUp')s.phi-=.1;if(event.key==='ArrowDown')s.phi+=.1;
      if(event.key==='+'||event.key==='=')s.radius*=.9;if(event.key==='-')s.radius*=1.1;
      s.phi=THREE.MathUtils.clamp(s.phi,.05,Math.PI-.05);s.radius=THREE.MathUtils.clamp(s.radius,8,22);
      camera.position.setFromSpherical(s);controls.update();
    };
    const lost=event=>{event.preventDefault();host.dataset.model='unavailable';setStatus('unavailable');};
    const canvas=renderer.domElement;
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
    canvas.addEventListener('keydown',keyDown);canvas.addEventListener('webglcontextlost',lost);
    let last=0;
    const draw=time=>{if(disposed)return;frame=requestAnimationFrame(draw);if(!visible||document.hidden||time-last<32)return;last=time;controls.update();renderer.render(scene,camera);};
    frame=requestAnimationFrame(draw);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);
      canvas.removeEventListener('keydown',keyDown);canvas.removeEventListener('webglcontextlost',lost);
      window.removeEventListener('beforeprint',beforePrint);window.removeEventListener('afterprint',afterPrint);printImage.remove();
      controls.dispose();ownedMaterials.forEach(m=>m.dispose());
      renderer.dispose();canvas.remove();engine.current=null;
    };
  },[attempt,compact]);
  useEffect(()=>{engine.current?.configure(mode,selected);},[mode,selected,status]);
  useEffect(()=>{engine.current?.view(view);},[view,status]);
  useEffect(()=>{engine.current?.rotate(rotate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);},[rotate,status]);
  const changeMode=next=>{setMode(next);setView(next==='cutaway'?'left':'perspective');};
  return <section className={`cc-brain cc-brain-v2 ${compact?'compact':''}`} aria-label="Blender-built educational brain explorer">
    <div className="cc-brain-v2-header cc-print-hide">
      <span className="cc-brain-version">BLENDER / ANATOMY EXPLORER</span>
      <div className="cc-brain-modes" aria-label="Brain layers">
        {['surface','cutaway','deep'].map(value=><button key={value} aria-pressed={mode===value} onClick={()=>changeMode(value)}>{value==='deep'?'Deep structures':value[0].toUpperCase()+value.slice(1)}</button>)}
      </div>
    </div>
    <div className="cc-brain-stage">
      <div ref={mount} className="cc-brain-canvas" />
      {status==='loading'&&<div className="cc-brain-loading" role="status">Loading the detailed brain model…</div>}
      {(status==='error'||status==='unavailable')&&<div className="cc-brain-loading" role="status"><strong>3D view unavailable</strong><span>{status==='error'?'The model could not be downloaded.':'This browser cannot render WebGL right now.'} The region guide below still works.</span><button onClick={()=>setAttempt(n=>n+1)}>Retry 3D</button></div>}
      <div className="cc-brain-view-label">{mode==='cutaway'?'MEDIAL CUTAWAY · RIGHT HEMISPHERE':mode==='deep'?'OPEN HEMISPHERES · SCHEMATIC STRUCTURES':'CORTICAL SURFACE · GENERIC TEACHING MODEL'}</div>
    </div>
    <div className="cc-brain-v2-controls cc-print-hide" aria-label="Camera controls">
      <div>{['left','right','top','front'].map(value=><button key={value} aria-pressed={view===value} onClick={()=>setView(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div>
      <div><button aria-label="Zoom in" onClick={()=>engine.current?.zoom(.9)}>＋</button><button aria-label="Zoom out" onClick={()=>engine.current?.zoom(1.1)}>−</button><button onClick={()=>{setMode('surface');setView('perspective');setSelected('');callback.current?.(null);setRotate(false);engine.current?.view('perspective');}}>Reset</button><button aria-pressed={rotate} onClick={()=>setRotate(v=>!v)}>Rotate</button></div>
    </div>
    <label className="cc-brain-region-selector cc-print-hide"><span>Explore a region</span><select value={selected} onChange={event=>choose(event.target.value)}><option value="">Choose a brain region…</option>{REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
    {region&&<div className="cc-brain-explanation" aria-live="polite"><strong style={{color:SYSTEMS[region.system]?.color}}>{region.name}</strong><span>{region.function}</span><small>{SURFACE_IDS.has(region.id)?'Highlighted surface is an approximate teaching location, not a parcellated atlas region.':'Inner shape and placement are schematic, not a clinical segmentation.'}</small></div>}
    <p className="cc-brain-model-note">Same anatomy for every person. Colors identify teaching systems—not injury, activation, or measured brain changes.</p>
    {<details className="cc-brain-credits"><summary>Model provenance</summary><p>Surface adapted in Blender from “Brain - with labeled parts” by AbdulMuhaymin (CC BY 4.0). Labels removed, hemispheres separated, surface refined, textures preserved; new inner structures are illustrative. Not a medical atlas.</p><a href="https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8" target="_blank" rel="noreferrer">Original model</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">License</a></details>}
  </section>;
}
