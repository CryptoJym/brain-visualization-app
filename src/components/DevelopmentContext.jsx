import {JourneyRail} from './CortexExperience';
import React from 'react';
import CortexBrand from './CortexBrand';
import {DEVELOPMENT_STAGES,DEVELOPMENT_SOURCES,RESPONSE_CONTEXT,SUPPORT_CONTEXT,MEASUREMENT_CONTEXT,CONTEXT_QUESTIONS} from '../data/developmentContext.mjs';
import {normalizeDevelopment,normalizePersonContext,developmentLabel,developmentReading,contextInterpretation} from '../utils/developmentProfile.mjs';
export function DevelopmentPicker({value,onChange,questionId}) {
 const d=normalizeDevelopment(value),patch=p=>onChange({...d,...p});
 const toggle=id=>{const stages=d.stages.includes(id)?d.stages.filter(s=>s!==id):[...d.stages,id];patch({status:stages.length?'reported':'unreviewed',stages});};
 return <div className="cc-development-picker" data-development-question={questionId}>
  <h4>Developmental context at the time</h4><p>Choose what you know about your development when this happened, not an age-based brain stage. Select more than one for experiences spanning transitions.</p>
  <p className="cc-development-boundary">Brain maturation was not measured here. Pubertal stage is a developmental proxy, not a whole-brain maturity score.</p>
  <div className="cc-development-stages" role="group" aria-label="Reported developmental stage">{DEVELOPMENT_STAGES.map(s=><button type="button" key={s.id} data-stage={s.id} aria-pressed={d.stages.includes(s.id)} onClick={()=>toggle(s.id)}><b>{s.label}</b><span>{s.detail}</span></button>)}</div>
  <div className="cc-development-actions"><button type="button" aria-pressed={d.status==='unknown'} onClick={()=>patch({status:'unknown',stages:[]})}>Not sure about development</button><button type="button" aria-pressed={d.status==='skip'} onClick={()=>patch({status:'skip',stages:[]})}>Do not share stage</button></div>
  <p className="cc-development-status" role="status">{developmentLabel(d)}</p>
  <div className="cc-development-fields">{[['source','Source of developmental information',DEVELOPMENT_SOURCES],['response','How did you tend to respond at that time?',RESPONSE_CONTEXT],['support','Was support available at that time?',SUPPORT_CONTEXT],['measurement','Do you already have a relevant assessment from that time?',MEASUREMENT_CONTEXT]].map(([id,label,choices])=><label key={id}><span>{label}</span><select aria-label={label} value={d[id]||''} onChange={e=>patch({[id]:e.target.value})}><option value="">Not reviewed / optional</option>{choices.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>)}</div>
  <p className="cc-small-note">These responses describe your experience, not a neural response measurement. An existing record is not interpreted or verified by this app; no scan or hormone test is requested.</p>
 </div>;
}
export function PersonContextPage({value,onChange,onDone,doneLabel='Continue to experiences',onBack}) {
 const c=normalizePersonContext(value),sexComplete=['male','female'].includes(c.sexAssigned);
 return <main className="cc-shell cc-context-screen"><header className="cc-nav"><div className="cc-brand"><CortexBrand/></div><button className="cc-secondary" onClick={onBack}>Back</button></header><section className="cc-context-page"><JourneyRail active="context"/>
 <span className="cc-eyebrow">BIOLOGICAL CONTEXT</span><h1>Development & biological sex</h1><p className="cc-lead">Development is not one birthday. The next questions use your reported developmental context instead of assigning sensitive periods from age.</p>
 <p className="cc-development-boundary">Studies measure different things: physical puberty, hormones, brain structure, and task responses. We keep those separate. Select Male or Female to continue. The additional medical-context questions are optional.</p>
 <div className="cc-context-question-grid">{CONTEXT_QUESTIONS.map(q=><label className="cc-context-question" key={q.id} data-context-question={q.id}><strong>{q.label}</strong><span>{q.help}</span><select required={q.required===true} value={c[q.id]||''} aria-label={q.label} onChange={e=>onChange(normalizePersonContext({...c,[q.id]:e.target.value}))}><option value="" disabled={q.required===true} hidden={q.required===true}>{q.required?'Select Male or Female':'Not reviewed / optional'}</option>{q.choices.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>)}</div>
 <p className="cc-small-note">Sex and hormonal context stay out of both printable reports unless you separately include the sensitive context appendix. Device saving remains an explicit choice.</p><button className="cc-primary" disabled={!sexComplete} onClick={()=>{if(sexComplete)onDone();}}>{doneLabel} →</button>
 </section></main>;
}
export function PersonContextSummary({value}) {
 const result=contextInterpretation(value);
 return <div className="cc-context-summary" data-person-context><h3>Your separately reported context</h3><dl>{CONTEXT_QUESTIONS.map(q=><div key={q.id}><dt>{q.label}</dt><dd>{q.choices.find(([id])=>id===result.answers[q.id])?.[1]||'Not reviewed'}</dd></div>)}</dl>{result.notes.map(n=><p key={n}>{n}</p>)}<p><b>Individual brain maturation:</b> {result.brainMaturation}. <b>Personal sensitive window:</b> not established.</p></div>;
}
export function DevelopmentEventSummary({value,showReading=true}) {
 const d=normalizeDevelopment(value),reading=developmentReading(d);
 return <div className="cc-development-event"><b>{developmentLabel(d)}</b><p>Developmental source: {DEVELOPMENT_SOURCES.find(([id])=>id===d.source)?.[1]||'Not recorded'}</p><p>Reported response: {RESPONSE_CONTEXT.find(([id])=>id===d.response)?.[1]||'Not reviewed'} · Support then: {SUPPORT_CONTEXT.find(([id])=>id===d.support)?.[1]||'Not reviewed'}</p><p>Existing assessment: {MEASUREMENT_CONTEXT.find(([id])=>id===d.measurement)?.[1]||'Not reviewed'}. No document or brain measurement has been reviewed.</p>{showReading&&<p>Stage-related reading: {reading.length?reading.map(s=>s.label).join('; '):'None selected without a reported stage.'} {reading.length>0&&'Related context only; not a matched exposure or personal finding.'}</p>}</div>;
}
