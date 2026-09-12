import {JourneyRail} from './CortexExperience';
import CortexBrand from './CortexBrand';
import React,{useState} from 'react';
import {INSIGHT_SECTIONS,INSIGHT_CHOICES,INSIGHT_QUESTIONS} from '../data/insightQuestions.mjs';
import {normalizeInsights} from '../utils/insightProfile.mjs';
export default function InsightReflection({answers,onChange,onDone,onBack}) {
 const [step,setStep]=useState(0),section=INSIGHT_SECTIONS[step],clean=normalizeInsights(answers);
 const move=next=>{setStep(next);window.scrollTo({top:0});requestAnimationFrame(()=>document.querySelector('.cc-insight-title')?.focus());};
 return <main className="cc-shell cc-insight-screen"><header className="cc-nav"><div className="cc-brand"><CortexBrand/></div><button className="cc-secondary" onClick={onBack}>Back to overview</button></header>
  <div className="cc-insight-container"><JourneyRail active="patterns"/><span className="cc-eyebrow">PRESENT-DAY REFLECTION · OPTIONAL</span><h1 className="cc-insight-title" tabIndex={-1}>{section.title}</h1><p className="cc-lead">{section.subtitle}</p>
  <p className="cc-boundary">Your history does not select a superpower. These separate observations personalize the report. You can skip every question.</p>
  <nav className="cc-insight-steps" aria-label="Present-day reflection sections">{INSIGHT_SECTIONS.map((s,i)=><button key={s.id} className="cc-secondary" aria-current={i===step?'step':undefined} onClick={()=>move(i)}>{i+1}. {s.id==='strength'?'Strengths':s.id==='friction'?'Friction':'Supports'}</button>)}</nav>
  <p role="status">{Object.keys(clean).length} of {INSIGHT_QUESTIONS.length} optional observations recorded</p>
  <div className="cc-question-list">{section.items.map(q=><fieldset className="cc-question cc-insight-question" data-insight-question={q.id} key={q.id}><legend>{q.title}</legend><p>{q.text}</p><div className="cc-insight-choices">{INSIGHT_CHOICES.map(([id,label])=><button type="button" key={id} aria-pressed={clean[q.id]===id} onClick={()=>onChange({...clean,[q.id]:id})}>{label}</button>)}</div></fieldset>)}</div>
  <div className="cc-insight-bottom"><button className="cc-secondary" onClick={onDone}>Skip to my reports</button><button className="cc-primary" onClick={()=>step<2?move(step+1):onDone()}>{step<2?'Continue':'Build my reports'} →</button></div>
  <p className="cc-small-note">Answers stay in the open page until you explicitly save the profile on this device. No background upload, diagnostic inference, or neural scoring.</p>
  </div></main>;
}
