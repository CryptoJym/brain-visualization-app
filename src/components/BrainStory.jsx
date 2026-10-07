import React,{useEffect,useMemo,useRef,useState} from 'react';
import CortexBrain from './CortexBrain';
import {buildBrainStory,stepDwellMs,STORY_COPY as COPY} from '../utils/brainStory.mjs';
import './BrainStory.css';

// The results-page brain map and walkthrough. It highlights every structure research links to the
// person's answers on the one shared 3D viewer, then explains each one in plain words.
// Views: map (all highlighted), tour (camera visits each stop), list (still steps for people who ask
// for less motion), explore (the person picked something themselves), empty (nothing linked).
const REDUCE='(prefers-reduced-motion: reduce)';
function useReducedMotion(){
  const [reduced,setReduced]=useState(()=>window.matchMedia(REDUCE).matches);
  useEffect(()=>{
    const query=window.matchMedia(REDUCE),update=()=>setReduced(query.matches);
    query.addEventListener('change',update);return()=>query.removeEventListener('change',update);
  },[]);
  return reduced;
}

// One stop's words. The walkthrough, the still list and the text version all use this, in this order.
function StopBody({step,level}){
  const Heading=`h${level}`,Sub=`h${level+1}`;
  return <>
    <Heading className="bs-stop-name">{step.plainName}</Heading>
    <p className="bs-stop-science">{step.scientificName} · {step.sideText}</p>
    <div className="bs-stop-answers"><Sub>{COPY.answersHeading}</Sub>
      <ul>{step.answers.map(a=><li key={a.id}><b>{a.title}</b>{a.text&&<span>“{a.text}” {COPY.answered}</span>}</li>)}</ul>
    </div>
    <div className="bs-stop-findings"><Sub>{COPY.findingsHeading}</Sub><p className="bs-stop-lead">{step.lead}</p>
      {step.studies.map(s=><div className="bs-study" key={s.id}>
        <p>{s.finding}</p>
        <p className="bs-study-meta">{s.label} · {s.type}{s.evidence&&` · ${s.evidence}`}. {s.sample}</p>
        <a href={s.url} target="_blank" rel="noreferrer">{COPY.readStudy}<span className="bs-sr">: {s.label} (opens in a new tab)</span></a>
      </div>)}
    </div>
    <div className="bs-stop-meaning"><Sub>{COPY.meaningHeading}</Sub><p>{step.meaning}</p></div>
  </>;
}
function StepList({steps,idPrefix}){
  return <ol className="bs-steps">{steps.map(step=><li key={step.id} id={`${idPrefix}-${step.id}`} data-story-text-step={step.id} tabIndex={-1} style={{'--marker':step.color}}>
    <span className="bs-num" aria-hidden="true">{step.number}</span><div><StopBody step={step} level={4}/></div>
  </li>)}</ol>;
}

export default function BrainStory({profile,focus,selectedRegion,onSelect}){
  const story=useMemo(()=>buildBrainStory(profile),[profile]),{steps}=story,count=steps.length,last=count-1;
  const reduced=useReducedMotion();
  const [view,setView]=useState(count?'map':'empty'),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[token,setToken]=useState(1);
  const section=useRef(null),walkButton=useRef(null),playButton=useRef(null),stillHeading=useRef(null),afterRender=useRef(null),storyKey=useRef(story.key);
  const [,setRendered]=useState(0);
  const move=()=>setToken(t=>t+1); // asks the viewer to move the camera to the current stop or map
  // Focus moves only after the next view has rendered; queueing always renders, even with no other change.
  const afterNextRender=run=>{afterRender.current=run;setRendered(n=>n+1);};
  useEffect(()=>{const run=afterRender.current;afterRender.current=null;run?.();});
  // Different linked structures (new answers) start again from the map.
  useEffect(()=>{
    if(storyKey.current===story.key)return;storyKey.current=story.key;
    setView(count?'map':'empty');setStep(0);setPlaying(false);move();
  },[story.key,count]);
  // People who ask for less motion get the still list, even if they change the setting mid-walk.
  useEffect(()=>{if(reduced&&view==='tour'){setPlaying(false);setView('list');}},[reduced,view]);
  useEffect(()=>{
    if(view!=='tour'||!playing)return;
    const timer=setTimeout(()=>{if(step<last){setStep(step+1);move();}else setPlaying(false);},stepDwellMs(steps[step]));
    return()=>clearTimeout(timer);
  },[view,playing,step,last,steps]);

  const showStage=()=>section.current?.querySelector('.cc-brain-stage')?.scrollIntoView({block:'start'});
  const focusWalk=()=>afterNextRender(()=>walkButton.current?.focus({preventScroll:true}));
  const openStill=index=>{
    setView('list');setPlaying(false);
    afterNextRender(()=>{
      const target=index==null?stillHeading.current:section.current?.querySelector(`#bs-still-${steps[index].id}`);
      target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});
    });
  };
  const startTour=(index,play)=>{
    setView('tour');setStep(index);setPlaying(play);move();showStage();
    afterNextRender(()=>playButton.current?.focus({preventScroll:true}));
  };
  const walk=()=>reduced?openStill(null):startTour(0,true);
  const openStop=index=>reduced?openStill(index):startTour(index,false);
  const goTo=index=>{setStep(index);move();};
  const next=()=>{if(step<last)goTo(step+1);};
  const previous=()=>{if(step>0)goTo(step-1);};
  const togglePlay=()=>{if(playing){setPlaying(false);return;}if(step===last)goTo(0);setPlaying(true);};
  const exitTour=()=>{setView('map');setPlaying(false);move();focusWalk();};
  const closeStill=()=>{setView('map');focusWalk();};
  const showMap=()=>{setView('map');setPlaying(false);move();showStage();focusWalk();};
  // A pick the person makes on the brain (or a study's "show in 3D") hands control back to them.
  const handlePick=()=>{setPlaying(false);setView('explore');};
  const tourKeys=event=>{
    const action={Escape:exitTour,ArrowRight:next,ArrowLeft:previous}[event.key];
    if(action){event.preventDefault();action();}
  };
  const stillKeys=event=>{if(event.key==='Escape'){event.preventDefault();closeStill();}};

  const viewerStory=useMemo(()=>count&&['map','tour','list'].includes(view)
    ?{highlight:story.highlight,stop:view==='tour'?story.highlight[step]:null,mode:story.mode,view:story.view,token,glide:!reduced}:null,
  [count,view,story,step,token,reduced]);
  const current=steps[step];
  let slot=null;
  if(view==='tour'&&current)slot=<div className="bs-slot bs-tour" role="region" aria-label="Guided walkthrough" onKeyDown={tourKeys}>
    <div className="bs-tour-bar">
      <p className="bs-stop-count" style={{'--marker':current.color}}><span className="bs-num" aria-hidden="true">{current.number}</span>{COPY.stop(step,count)}</p>
      <div className="bs-controls" role="group" aria-label={COPY.controls}>
        <button type="button" data-control="previous" aria-disabled={step===0} onClick={previous}>{COPY.previous}</button>
        <button type="button" data-control="play" ref={playButton} className={playing?'is-playing':''} onClick={togglePlay}>{playing?COPY.pause:COPY.play}</button>
        <button type="button" data-control="next" aria-disabled={step===last} onClick={next}>{COPY.next}</button>
        <button type="button" data-control="exit" onClick={exitTour}>{COPY.exit}</button>
      </div>
    </div>
    {playing&&<div className="bs-progress" aria-hidden="true"><i key={step} style={{animationDuration:`${stepDwellMs(current)}ms`}}/></div>}
    <div className="bs-stop" aria-live={playing?'off':'polite'} onFocus={()=>setPlaying(false)}><StopBody step={current} level={3}/></div>
  </div>;
  else if(view==='list')slot=<div className="bs-slot bs-still" role="region" aria-labelledby="bs-still-title" onKeyDown={stillKeys}>
    <div className="bs-still-head"><h3 id="bs-still-title" ref={stillHeading} tabIndex={-1}>{COPY.stillHeading(count)}</h3><button type="button" className="bs-quiet" data-control="close" onClick={closeStill}>{COPY.closeSteps}</button></div>
    <p className="bs-still-note">{COPY.stillNote}</p>
    <StepList steps={steps} idPrefix="bs-still"/>
  </div>;
  else if(view==='explore')slot=<div className="bs-slot bs-cta"><p>{COPY.exploring}</p><button type="button" className="bs-primary bs-map-icon" data-control="map" onClick={showMap}>{COPY.backToMap}</button></div>;
  else if(view==='map')slot=<div className="bs-slot bs-cta">
    <button type="button" ref={walkButton} className="bs-primary bs-play-icon" data-control="walk" aria-describedby="bs-walk-hint" onClick={walk}>{COPY.walk}</button>
    <p id="bs-walk-hint">{reduced?COPY.walkHintStill:COPY.walkHint}</p>
  </div>;

  return <section ref={section} className="cc-map-grid bs-story" aria-labelledby="bs-title" data-story-view={view} data-story-count={count} data-story-step={view==='tour'?step:''} data-story-playing={String(view==='tour'&&playing)} data-story-reduced={String(reduced)}>
    <div className="cc-map-card">
      <div className="cc-card-title"><div><span className="cc-eyebrow">{COPY.eyebrow}</span><h2 id="bs-title">{count?COPY.title:COPY.emptyTitle}</h2></div><span className="cc-chip">{COPY.chip}</span></div>
      <CortexBrain profile={profile} onSelect={onSelect} focus={focus} story={viewerStory} onUserPick={handlePick}>{slot}</CortexBrain>
      {selectedRegion&&<div className="cc-selected-info"><b>{selectedRegion.name}</b><span>{selectedRegion.function}</span><strong>Educational topic · not a measured effect</strong></div>}
    </div>
    <aside className="cc-insights cc-reading-topics bs-panel" aria-labelledby="bs-panel-title">
      <span className="cc-eyebrow">{COPY.panelEyebrow}</span>
      {count?<>
        <h3 id="bs-panel-title" className="bs-intro">{COPY.intro(count)}</h3>
        <p className="bs-basis">{COPY.basis}</p>
        <ol className="bs-legend">{steps.map(s=><li key={s.id}>
          <button type="button" className="bs-legend-item" data-story-legend={s.id} data-region-link={s.id} data-side={s.side} aria-current={view==='tour'&&step===s.index?'step':undefined} style={{'--marker':s.color}} onClick={()=>openStop(s.index)}>
            <span className="bs-num" aria-hidden="true">{s.number}</span>
            <span className="bs-legend-text"><b>{s.plainName}</b><small>{s.scientificName} · {s.sideText}</small><small>{COPY.legendFrom(s.answers.length)} {s.answers.map(a=>a.title).join('; ')}</small></span>
          </button>
        </li>)}</ol>
        <p className="bs-order">{COPY.order}</p>
        {view!=='list'&&<details className="bs-text"><summary>{COPY.textVersion(count)}</summary><StepList steps={steps} idPrefix="bs-text"/></details>}
      </>:<>
        <h3 id="bs-panel-title" className="bs-intro">{COPY.emptyHeading}</h3>
        <p className="bs-empty">{COPY.empty}</p>
      </>}
    </aside>
  </section>;
}
