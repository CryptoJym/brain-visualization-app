import React,{useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {REGIONS,SYSTEMS} from '../data/cortexCompass';

const colorFor=(region)=>SYSTEMS[region.system]?.color||'#38bdf8';

export default function CortexBrain({profile,onSelect,compact=false}){
 const mount=useRef(null); const api=useRef({}); const [selected,setSelected]=useState(null); const [deep,setDeep]=useState(true);
 const impact=useMemo(()=>Object.fromEntries((profile?.regions||[]).map(r=>[r.id,r.score||0])),[profile]);
 useEffect(()=>{
  if(!mount.current) return; const host=mount.current; host.innerHTML='';
  const w=host.clientWidth||700,h=host.clientHeight||520; const scene=new THREE.Scene(); scene.background=null;
  const camera=new THREE.PerspectiveCamera(36,w/h,.1,100); camera.position.set(10,5.5,10);
  let renderer; try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){host.dataset.fallback='true';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(w,h); renderer.outputColorSpace=THREE.SRGBColorSpace; host.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.enablePan=false; controls.minDistance=7; controls.maxDistance=18; controls.target.set(0,.1,0);
  scene.add(new THREE.HemisphereLight(0xc8f7ff,0x081327,2.0)); const key=new THREE.DirectionalLight(0xffffff,3); key.position.set(4,8,7); scene.add(key);
  const rim=new THREE.PointLight(0x2dd4bf,35,25); rim.position.set(-6,1,-5); scene.add(rim);
  const brain=new THREE.Group(); brain.rotation.set(-.04,.15,0); scene.add(brain);
  const hemiGeo=new THREE.SphereGeometry(3.25,64,48); hemiGeo.scale(.82,1,1.08);
  const shellMat=new THREE.MeshPhysicalMaterial({color:0xbdd7e7,roughness:.34,metalness:.05,transparent:true,opacity:.16,transmission:.18,thickness:.6,side:THREE.DoubleSide});
  const left=new THREE.Mesh(hemiGeo,shellMat); left.position.x=-1.15; brain.add(left); const right=left.clone(); right.material=shellMat.clone(); right.position.x=1.15; brain.add(right);
  const foldMat=new THREE.MeshBasicMaterial({color:0x7dd3fc,transparent:true,opacity:.12,wireframe:true}); const foldsL=new THREE.Mesh(hemiGeo.clone(),foldMat); foldsL.scale.set(1.01,1.01,1.01); foldsL.position.x=-1.15; brain.add(foldsL); const foldsR=foldsL.clone(); foldsR.position.x=1.15; brain.add(foldsR);
  const cerebGeo=new THREE.SphereGeometry(1.55,40,30); cerebGeo.scale(1.35,.75,.9); const cereb=new THREE.Mesh(cerebGeo,new THREE.MeshPhysicalMaterial({color:0x9ca3af,transparent:true,opacity:.22,roughness:.5})); cereb.position.set(0,-2.2,-2.55); brain.add(cereb);
  const stem=new THREE.Mesh(new THREE.CapsuleGeometry(.48,2.1,8,20),new THREE.MeshPhysicalMaterial({color:0x8ca4b7,transparent:true,opacity:.28,roughness:.45})); stem.position.set(0,-3.0,-1.15); stem.rotation.x=.22; brain.add(stem);
  const fallbackShell=[left,right,foldsL,foldsR,cereb,stem];
  const loader=new GLTFLoader(); loader.load('/models/brain-labeled.glb',gltf=>{const model=gltf.scene; const box=new THREE.Box3().setFromObject(model); const size=box.getSize(new THREE.Vector3()); const center=box.getCenter(new THREE.Vector3()); const fit=7/Math.max(size.x,size.y,size.z); model.position.sub(center); model.scale.setScalar(fit); model.rotation.set(0,Math.PI/2,0); model.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshPhysicalMaterial({color:0x96bdd1,roughness:.42,metalness:.05,transparent:true,opacity:.23,transmission:.12,thickness:.25,side:THREE.DoubleSide});}}); brain.add(model); host.dataset.model='loaded'; fallbackShell.forEach(x=>x.visible=false);},undefined,()=>{host.dataset.model='failed';});
  const clickable=[]; const nodes={};
  REGIONS.forEach(region=>{ const score=impact[region.id]||0; const color=new THREE.Color(colorFor(region)); const geo=new THREE.SphereGeometry(.42,28,22); geo.scale(...region.scale); const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25+score/90,transparent:true,opacity:deep?.82:.62,roughness:.3}); const mesh=new THREE.Mesh(geo,mat); mesh.position.set(...region.pos); mesh.userData={region}; brain.add(mesh); clickable.push(mesh); nodes[region.id]=mesh;
    if(score>8){const glow=new THREE.Mesh(geo.clone(),new THREE.MeshBasicMaterial({color,transparent:true,opacity:Math.min(.25,.06+score/500),side:THREE.BackSide})); glow.scale.setScalar(1.18); mesh.add(glow);}
  });
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const pick=e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickable,false)[0]; clickable.forEach(x=>x.scale.setScalar(1)); if(hit){hit.object.scale.setScalar(1.22); renderer.domElement.style.cursor='pointer'; const r=hit.object.userData.region; setSelected(r.id); onSelect?.({...r,score:impact[r.id]||0});} else renderer.domElement.style.cursor='grab';};
  renderer.domElement.addEventListener('pointerdown',pick);
  const views={left:[-10,3,1],right:[10,3,1],top:[0,12,.01],front:[0,3,11]}; api.current.view=(name)=>{const v=views[name]||views.right;camera.position.set(...v);controls.target.set(0,0,0);controls.update();}; api.current.deep=(value)=>{REGIONS.forEach(r=>{const m=nodes[r.id];if(m)m.visible=value||['dlpfc','temporal','cerebellum'].includes(r.id);});};
  let id; const animate=()=>{id=requestAnimationFrame(animate);controls.update();const t=performance.now()/1000;REGIONS.forEach((r,i)=>{const m=nodes[r.id];if(m&&impact[r.id]>15)m.material.emissiveIntensity=.45+impact[r.id]/100+Math.sin(t*1.5+i)*.08;});renderer.render(scene,camera);};animate();
  const resize=()=>{const nw=host.clientWidth,nh=host.clientHeight;if(!nw||!nh)return;camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh);}; window.addEventListener('resize',resize);
  return()=>{cancelAnimationFrame(id);window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointerdown',pick);controls.dispose();renderer.dispose();host.innerHTML='';};
 },[impact,onSelect,deep]);
 const selectedRegion=REGIONS.find(r=>r.id===selected);
 return <div className={`cc-brain ${compact?'compact':''}`}>
   <div ref={mount} className="cc-brain-canvas" aria-label="Interactive educational 3D brain map" />
   <div className="cc-brain-toolbar"><button onClick={()=>api.current.view?.('left')}>Left</button><button onClick={()=>api.current.view?.('right')}>Right</button><button onClick={()=>api.current.view?.('top')}>Top</button><button onClick={()=>api.current.view?.('front')}>Front</button><button className={deep?'active':''} onClick={()=>{setDeep(v=>!v);setTimeout(()=>api.current.deep?.(!deep),0)}}>Deep</button></div>
   {!compact&&<div className="cc-brain-legend"><span><i className="low"/>Lower signal</span><span><i className="mid"/>Moderate</span><span><i className="high"/>Higher</span></div>}
   {selectedRegion&&!compact&&<div className="cc-region-pop"><strong>{selectedRegion.name}</strong><span>{selectedRegion.function}</span><b>{Math.round(impact[selectedRegion.id]||0)} mapping signal</b></div>}
 </div>
}
