import React,{useState} from 'react';
import {REGION_STUDIES,RESEARCH_LESSONS,RESEARCH_VERSION} from '../data/regionStudies.mjs';
import {REGION_BY_ID} from '../data/anatomyCatalog.mjs';
import {ALL_QUESTIONS,SECTIONS} from '../data/assessmentQuestions.mjs';
import {QUESTION_RESEARCH,RESEARCH_LABELS} from '../data/questionRegionLinks.mjs';

export function RegionLink({id,side='both',onFocus}){
  const r=REGION_BY_ID[id];if(!r)return null;
  const label=side==='L'?'Left':side==='R'?'Right':'Bilateral guide';
  return onFocus?<button type="button" className="cc-study-region cc-print-hide" data-region-link={id} data-side={side} onClick={()=>onFocus({id,side})}><i style={{background:r.color}}/>{r.label}<small>{label} · show in 3D ↗</small></button>:<span className="cc-study-region-text">{r.label} · {label}</span>;
}
export function StudyCard({id,onFocus,questions=[]}){
  const study=REGION_STUDIES[id];if(!study)return null;
  return <article className="cc-study-card" data-study={id}>
    <div className="cc-study-heading"><span className="cc-eyebrow">{study.type}</span><h3><a href={study.url} target="_blank" rel="noreferrer">{study.label}</a></h3><small>DOI: {study.doi}</small></div>
    {questions.length>0&&<div className="cc-study-reasons">{questions.map(q=><p key={q.id}><b>{q.title}</b> · {RESEARCH_LABELS[q.status]}<span>{q.note}</span></p>)}</div>}
    <dl className="cc-study-facts"><div><dt>Participants</dt><dd>{study.sample}</dd></div><div><dt>What was measured</dt><dd>{study.measure}</dd></div></dl>
    <p><strong>Finding:</strong> {study.finding}</p>
    <div className="cc-study-regions" aria-label="Study regions">{study.regions.map(r=><RegionLink key={`${r.id}-${r.side}`} {...r} onFocus={onFocus}/>)}{onFocus&&<span className="cc-study-print-regions">{study.regions.map(r=>`${REGION_BY_ID[r.id]?.label} (${r.side==='L'?'left':r.side==='R'?'right':'bilateral guide'})`).join('; ')}</span>}</div>
    <p className="cc-study-limit"><strong>Do not infer:</strong> {study.limit}</p>
    <p className="cc-study-timing"><strong>Age and timing:</strong> {study.timing}</p>
    <small>Source reviewed: {study.review}.{study.correction&&<> <a href={study.correction} target="_blank" rel="noreferrer">Published correction</a>.</>}</small>
  </article>;
}
export function ResearchLessons(){
  return <section className="cc-research-lessons"><h2>Read the finding, not just the colored region.</h2>{RESEARCH_LESSONS.map(text=><p key={text}>{text}</p>)}</section>;
}
export function QuestionResearchAudit({onExplore}){
  const counts=Object.values(QUESTION_RESEARCH).reduce((out,r)=>({...out,[r.status]:out[r.status]+1}),{domain:0,related:0,unmapped:0});
  return <section className="cc-research-audit"><span className="cc-eyebrow">ALL QUESTIONS REVIEWED · {RESEARCH_VERSION}</span><h2>Every link has a reason. Every gap is visible.</h2>
    <p>{ALL_QUESTIONS.length} prompts reviewed: {counts.domain} with domain-study links, {counts.related} with related-evidence links, and {counts.unmapped} without a specific region assignment. These describe exposure fit, not clinical certainty.</p>
    <details><summary>Review all {ALL_QUESTIONS.length} question-to-research decisions</summary>
      {SECTIONS.map(section=><div key={section.id}><h3>{section.title}</h3>{section.questions.map(q=>{const r=QUESTION_RESEARCH[q.id];return <article key={q.id} data-audit-question={q.id}><div><b>{q.title}</b><span className={`cc-research-status ${r.status}`}>{RESEARCH_LABELS[r.status]}</span></div><p>{r.note}</p>{r.studies.length>0&&<button className="cc-secondary" onClick={()=>onExplore?.(q.id)}>Explore this question’s research</button>}</article>;})}</div>)}
    </details>
  </section>;
}
export function ResearchStudyBrowser({questionId='',onFocus,onQuestionChange}){
  const [filter,setFilter]=useState(questionId);
  const actual=onQuestionChange?questionId:filter;
  const change=id=>{setFilter(id);onQuestionChange?.(id);};
  const q=ALL_QUESTIONS.find(item=>item.id===actual),research=q?QUESTION_RESEARCH[q.id]:null;
  const ids=research?research.studies:Object.keys(REGION_STUDIES);
  return <section className="cc-study-browser" aria-label="Primary study browser">
    <label>Choose a question or browse all studies<select aria-label="Research question filter" value={actual} onChange={e=>change(e.target.value)}><option value="">All primary studies ({Object.keys(REGION_STUDIES).length})</option>{SECTIONS.map(s=><optgroup key={s.id} label={s.title}>{s.questions.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}</optgroup>)}</select></label>
    {q&&<div className="cc-research-filter-note"><h2>{q.title}</h2><span className={`cc-research-status ${research.status}`}>{RESEARCH_LABELS[research.status]}</span><p>{research.note}</p></div>}
    {ids.map(id=><StudyCard key={id} id={id} onFocus={onFocus}/>)}
    {ids.length===0&&<p className="cc-unmapped-message">No brain-specific study is assigned to this question in the current review. This does not mean the experience is unimportant or that no research exists. Questionnaire/domain sources remain available in Research & methods below.</p>}
  </section>;
}
