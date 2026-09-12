import React from 'react';
import {StudyCard} from './ResearchStudies';
import {REGION_STUDIES} from '../data/regionStudies.mjs';
import {QUESTION_RESEARCH,RESEARCH_LABELS} from '../data/questionRegionLinks.mjs';
import {SOURCES,METHODS,EVIDENCE_VERSION} from '../data/assessmentEvidence.mjs';
export function SourceLinks({ids=[]}) {
  return <span className="cc-source-links">{[...new Set(ids)].filter(id=>SOURCES[id]).map(id=><a key={id} href={SOURCES[id].url} target="_blank" rel="noreferrer">{SOURCES[id].label}</a>)}</span>;
}
export function QuestionEvidence({question:q,onExplore}) {
  const ids=q.sources;const research=QUESTION_RESEARCH[q.id];
  return <details className="cc-question-evidence"><summary>Why this question / research</summary>
    <p><strong>{q.title}.</strong> This is an adapted reflection prompt, not a validated standalone measure.</p>
    <span className={`cc-research-status ${research.status}`}>{RESEARCH_LABELS[research.status]}</span><p>{research.note}</p>
    {research.studies.length>0&&<><SourceLinks ids={research.studies}/><button type="button" className="cc-secondary cc-explore-question" onClick={()=>onExplore?.(q.id)}>Explore studies & brain regions</button></>}
    {q.topics.length>0&&<p>The associated brain topics are a curated reading guide to broader maltreatment research. They are not measured effects of this question or predictions about you.</p>}
    {ids.length===0?<p>No specific empirical brain association is asserted for this personal-context prompt.</p>:ids.map(id=><div className="cc-evidence-entry" key={id}>
      <a href={SOURCES[id].url} target="_blank" rel="noreferrer">{SOURCES[id].label}</a><small>{SOURCES[id].type}</small>
      <p>{SOURCES[id].finding}</p><p className="cc-evidence-limit"><strong>Limit:</strong> {SOURCES[id].limit}</p>
    </div>)}
  </details>;
}
export function EvidenceLibrary({ids=Object.keys(SOURCES),report=false,onFocus,studyLinks=[]}) {
  return <section className={`cc-evidence-library ${report?'cc-report-evidence':''}`} aria-labelledby={report?'report-methods-heading':'methods-heading'}>
    <span className="cc-eyebrow">RESEARCH & METHODS · {EVIDENCE_VERSION}</span>
    <h2 id={report?'report-methods-heading':'methods-heading'}>What the evidence does—and does not—say</h2>
    <p>These sources support specific domains or explain the research background. They do not validate Cortex Compass as a diagnostic instrument.</p>
    <div className="cc-methods">{METHODS.map((rule,i)=><p key={rule}><b>{String(i+1).padStart(2,'0')}</b><span>{rule}</span></p>)}</div>
    <h3>Sources and limits</h3>
    {[...new Set(ids)].filter(id=>SOURCES[id]).map(id=>REGION_STUDIES[id]?<StudyCard key={id} id={id} onFocus={onFocus} questions={studyLinks.find(s=>s.id===id)?.questions||[]}/>:<article className="cc-evidence-card" key={id} id={`source-${id}`}>
      <h4><a href={SOURCES[id].url} target="_blank" rel="noreferrer">{SOURCES[id].label}</a></h4>
      <small>{SOURCES[id].type}{SOURCES[id].doi?` · DOI: ${SOURCES[id].doi}`:''}</small>
      <p>{SOURCES[id].finding}</p><p><strong>Limits of use:</strong> {SOURCES[id].limit}</p>
    </article>)}
  </section>;
}
