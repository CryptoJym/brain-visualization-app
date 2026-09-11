import React,{useMemo,useState} from 'react';
import CortexBrain from './CortexBrain';
import AgeRangePicker,{TimingSource} from './AgeRangePicker';
import {QuestionEvidence,EvidenceLibrary,SourceLinks} from './AssessmentEvidence';
import {SECTIONS,ALL_QUESTIONS,FREQUENCIES,ANSWER_CHOICES,QUESTIONNAIRE_VERSION} from '../data/assessmentQuestions.mjs';
import {calculateProfile,normalizeAnswers,readSavedRecord,saveRecord,STORAGE_KEY,SAMPLE_ANSWERS} from '../utils/assessmentProfile.mjs';
import './AssessmentTiming.css';
const SAMPLE_PROFILE=calculateProfile(SAMPLE_ANSWERS);
function savedExists(){try{return !!localStorage.getItem(STORAGE_KEY);}catch{return false;}}

export default function CortexCompass(){
  const [screen,setScreen]=useState('welcome'),[sectionIndex,setSectionIndex]=useState(0),[answers,setAnswers]=useState({});
  const [selectedRegion,setSelectedRegion]=useState(null),[demo,setDemo]=useState(false),[saved,setSaved]=useState(false);
  const [saveOpen,setSaveOpen]=useState(false),[consent,setConsent]=useState(false),[hasSaved,setHasSaved]=useState(savedExists);
  const [legacyRecord,setLegacyRecord]=useState(null),[message,setMessage]=useState(''),[evidenceReturn,setEvidenceReturn]=useState('welcome');
  const profile=useMemo(()=>calculateProfile(answers),[answers]),section=SECTIONS[sectionIndex];
  const setAnswer=(id,value)=>{setAnswers(a=>a[id]?.value===value?a:{...a,[id]:{value}});setSaved(false);};
  const updateAnswer=(id,patch)=>{setAnswers(a=>({...a,[id]:{...a[id],...patch}}));setSaved(false);};
  const navigate=next=>{setScreen(next);window.scrollTo({top:0,behavior:'auto'});};
  const start=()=>{setAnswers({});setSectionIndex(0);setSelectedRegion(null);setLegacyRecord(null);setDemo(false);setSaved(false);setConsent(false);setSaveOpen(false);setMessage('');navigate('assessment');};
  const sample=()=>{setAnswers(normalizeAnswers(SAMPLE_ANSWERS));setLegacyRecord(null);setDemo(true);setSaved(false);setSelectedRegion(null);setMessage('');navigate('results');};
  const resume=()=>{try{const record=readSavedRecord(localStorage);if(!record){setHasSaved(false);setMessage('No saved reflection was found on this device.');return;}setAnswers(record.answers);setLegacyRecord(record.legacyRecord);setDemo(false);setSaved(!record.migrated);setSelectedRegion(null);setMessage(record.legacyRecord?'Earlier answers are preserved. Changed questions need a fresh answer; combined responses were not split automatically.':'Opened your saved reflection.');navigate('results');}catch(e){setMessage(e.message);}};
  const save=()=>{try{saveRecord(localStorage,answers,legacyRecord,consent);setSaved(true);setHasSaved(true);setMessage('Saved on this device only—not uploaded to Utlyze or a server.');}catch{setSaved(false);setMessage('Could not save. Check the consent box and browser storage permissions. Existing saved data was not intentionally changed.');}};
  const showEvidence=()=>{setEvidenceReturn(screen);navigate('evidence');};
  const next=()=>{if(sectionIndex<SECTIONS.length-1){setSectionIndex(i=>i+1);window.scrollTo({top:0});}else navigate('results');};
  const exportReflection=()=>{
    const data={schemaVersion:4,questionnaireVersion:QUESTIONNAIRE_VERSION,evidenceVersion:profile.evidenceVersion,answers:normalizeAnswers(answers),legacyRecord,profile};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='cortex-compass-reflection.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const brand=<div className="cc-brand"><span className="cc-mark">◇</span><div><b>Cortex Compass</b><small>by Utlyze</small></div></div>;
  const notice=message?<p className="cc-app-notice" role="status">{message}</p>:null;
  const legacyNotice=legacyRecord?<section className="cc-legacy-notice"><b>Earlier reflection preserved—not silently reinterpreted.</b><p>The previous questionnaire combined some experiences and used ambiguous age bands. Its history answers are retained below but are not used by the new report until you answer the revised questions. Unchanged support answers were carried forward.</p><details className="cc-print-hide"><summary>View original saved answers</summary><pre>{JSON.stringify(legacyRecord.answers,null,2)}</pre></details></section>:null;
  if(screen==='evidence')return <main className="cc-shell cc-evidence-screen"><header className="cc-nav">{brand}<button className="cc-secondary" onClick={()=>navigate(evidenceReturn)}>← Back to reflection</button></header><EvidenceLibrary/></main>;
  if(screen==='welcome')return <main className="cc-shell cc-welcome">
    <header className="cc-nav">{brand}<button className="cc-secondary" onClick={showEvidence}>Research & methods</button></header>{notice}
    <section className="cc-hero"><div className="cc-hero-copy"><span className="cc-eyebrow">RESEARCH-INFORMED SELF REFLECTION</span>
      <h1>Understand the patterns.<br/><em>See the systems.</em></h1>
      <p>Explore early experiences with separate questions, flexible age ranges and transparent sources—without pretending a questionnaire is a brain scan.</p>
      <div className="cc-actions"><button className="cc-primary" onClick={start}>Begin my reflection <span>→</span></button><button className="cc-secondary" onClick={sample}>Explore sample profile</button>{hasSaved&&<button className="cc-secondary" onClick={resume}>Open saved profile</button>}</div>
      <div className="cc-trust"><span>{ALL_QUESTIONS.length} optional prompts</span><span>Quick bands or custom ages</span><span>Device save only</span></div>
      <p className="cc-home-boundary">An educational reflection for adults. Pregnancy is separate from ages since birth. No diagnosis, measured brain changes or clinical ACE score.</p>
    </div><div className="cc-hero-brain"><CortexBrain profile={SAMPLE_PROFILE} compact/></div></section>
    <section className="cc-flow"><span>Reflect</span><i>→</i><span>Choose ages</span><i>→</i><span>Explore</span><i>→</i><span>Learn</span></section>
    <footer className="cc-note">Every answer and timing detail is optional. Responses remain in this open page unless you explicitly choose device saving or export. No cloud profile or Utlyze sign-in is connected.</footer>
  </main>;
  if(screen==='assessment')return <main className="cc-shell cc-assessment">
    <header className="cc-nav"><button className="cc-brand button" onClick={()=>navigate('welcome')}>{brand}</button><div className="cc-actions small"><button className="cc-secondary" onClick={showEvidence}>Research & methods</button><button className="cc-secondary" onClick={()=>navigate('results')}>Review what I’ve shared</button></div></header>
    <div className="cc-progress-meta"><span>{profile.answered} of {profile.total} prompts responded to · Section {sectionIndex+1} of {SECTIONS.length}</span></div>
    <div className="cc-progress"><i style={{width:`${profile.answered/profile.total*100}%`}}/></div>{notice}
    <section className="cc-assessment-wrap"><aside><span className="cc-eyebrow">YOUR REFLECTION</span><h2>{section.icon} {section.title}</h2><p>{section.subtitle}</p>
      <nav>{SECTIONS.map((s,i)=><button key={s.id} aria-current={i===sectionIndex?'step':undefined} className={i===sectionIndex?'active':''} onClick={()=>{setSectionIndex(i);window.scrollTo({top:0});}}><i>{i+1}</i><span>{s.title}</span></button>)}</nav>
      <div className="cc-safety"><b>You control the pace.</b><span>Skip, say “not sure,” or finish early. No detailed description is required. A range is an estimate, not a demand for a precise memory.</span></div>
    </aside><div className="cc-question-list">{legacyNotice}
      {section.questions.map((q,idx)=>{const a=answers[q.id]||{};return <article key={q.id} data-question={q.id} className={`cc-question ${a.value?'answered':''}`}>
        <div className="cc-qhead"><span>{String(idx+1).padStart(2,'0')}</span><div><small className="cc-domain-label">{q.kind==='prenatal'?'BEFORE BIRTH · OPTIONAL':q.kind==='support'?'SUPPORT REFLECTION':'BEFORE AGE 18'} · {q.title}</small><h3>{q.text}</h3></div></div>
        {q.help&&<p className="cc-question-help">{q.help}</p>}
        <div className="cc-choice">{ANSWER_CHOICES.map(([id,label])=><button type="button" key={id} aria-pressed={a.value===id} className={a.value===id?'selected':''} onClick={()=>setAnswer(q.id,id)}>{label}</button>)}</div>
        {a.value==='yes'&&q.kind==='history'&&<div className="cc-follow">
          <AgeRangePicker value={a.timing} onChange={timing=>updateAnswer(q.id,{timing})}/>
          <fieldset className="cc-frequency"><legend>How often? <small>Optional; recorded separately from the age span.</small></legend><div className="cc-pills">{FREQUENCIES.map(([id,label])=><button type="button" key={id} aria-pressed={a.frequency===id} className={a.frequency===id?'selected':''} onClick={()=>updateAnswer(q.id,{frequency:id})}>{label}</button>)}</div></fieldset>
        </div>}
        {a.value==='yes'&&q.kind==='prenatal'&&<div className="cc-prenatal-context"><b>Before birth · during pregnancy</b><p>Not counted inside “Birth–18 months.” No age since birth or brain-impact score is assigned.</p><TimingSource prenatal timing={a.timing} onChange={timing=>updateAnswer(q.id,{timing})}/></div>}
        <QuestionEvidence question={q}/>
      </article>;})}
      <div className="cc-section-actions"><button className="cc-secondary" disabled={sectionIndex===0} onClick={()=>{setSectionIndex(i=>i-1);window.scrollTo({top:0});}}>← Previous</button><button className="cc-primary" onClick={next}>{sectionIndex===SECTIONS.length-1?'Build my reflection':'Continue'} <span>→</span></button></div>
    </div></section>
  </main>;
  const activeRegions=profile.regions.filter(r=>r.active);
  return <main className="cc-shell cc-results">
    <header className="cc-nav cc-print-hide"><button className="cc-brand button" onClick={()=>navigate('welcome')}>{brand}</button><div className="cc-actions small">
      <button className="cc-secondary" onClick={demo?start:()=>navigate('assessment')}>{demo?'Start my reflection':'Edit answers'}</button>
      <button className="cc-secondary" disabled={demo} onClick={()=>setSaveOpen(v=>!v)}>{saved?'Saved on device ✓':'Save profile'}</button>
      <button className="cc-primary" onClick={()=>window.print()}>Print / PDF</button>
    </div></header>{notice}{legacyNotice}
    {saveOpen&&!demo&&<section className="cc-save-panel cc-print-hide"><h2>Save on this device</h2><p>These responses are sensitive. Browser storage is not an encrypted cloud account; someone using this browser profile may be able to open them. Nothing is sent to a profile backend.</p>
      <label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I consent to saving this reflection in this browser on this device.</label>
      <div className="cc-actions"><button className="cc-primary" disabled={!consent} onClick={save}>Save to this device</button><button className="cc-secondary" onClick={exportReflection}>Export my reflection (.json)</button><button className="cc-secondary" disabled={!hasSaved} onClick={()=>{if(window.confirm('Delete the reflection saved in this browser? This includes any preserved earlier answers. Your current open-page answers stay until you leave or restart.')){try{localStorage.removeItem(STORAGE_KEY);setHasSaved(false);setSaved(false);setMessage('Saved browser copy deleted.');}catch{setMessage('Could not delete browser storage.');}}}}>Delete device copy</button></div>
    </section>}
    {demo&&<p className="cc-example-banner">FICTIONAL SAMPLE · These are demonstration answers, not your history.</p>}
    <section className="cc-report-head"><div><span className="cc-eyebrow">YOUR CORTEX COMPASS</span><h1>Patterns, not predictions.</h1><p>A record of what you chose to share, with timing and a research reading guide. Not a score of trauma severity, neurodivergence or brain damage.</p></div><div className="cc-load"><small>Responses recorded</small><strong>{profile.answered} / {profile.total}</strong><span>{profile.substantive} Yes/No · {profile.unsure} Not sure · {profile.skipped} skipped · {profile.unanswered} unanswered</span></div></section>
    <section className="cc-summary-grid"><div><small>Childhood events endorsed</small><strong>{profile.historyCount}</strong><span>A record count, not an ACE score.</span></div><div><small>Timing</small><strong>Ranges you reported</strong><span>Not inferred sensitive periods.</span></div><div><small>Supports endorsed</small><strong>{profile.protective}</strong><span>Shown separately; no percentage buffering.</span></div><div><small>Questionnaire version</small><strong>{profile.version}</strong><span>{profile.prenatalCount} prenatal context item(s), recorded separately.</span></div></section>
    <section className="cc-map-grid"><div className="cc-map-card"><div className="cc-card-title"><div><span className="cc-eyebrow">ILLUSTRATIVE ANATOMY</span><h2>Explore the systems</h2></div><span className="cc-chip">Same generic brain for everyone</span></div><CortexBrain profile={profile} onSelect={setSelectedRegion}/>
      {selectedRegion&&<div className="cc-selected-info"><b>{selectedRegion.name}</b><span>{selectedRegion.function}</span><strong>Educational topic · not a measured effect</strong></div>}
    </div><aside className="cc-insights cc-reading-topics"><span className="cc-eyebrow">RESEARCH TOPICS TO EXPLORE</span><p>Selected from explicit answers in fixed order. These are reading links, not affected-region rankings.</p>
      {activeRegions.length===0?<p>No brain-specific reading links were selected from the answers recorded in this version. Context-only items do not generate a neural inference.</p>:activeRegions.map(r=><article key={r.id}><h3>{r.name}</h3><p>Reading topic because you endorsed: {r.reasons.join('; ')}.</p><SourceLinks ids={r.evidenceIds}/></article>)}
    </aside></section>
    <section className="cc-report-timeline"><span className="cc-eyebrow">YOUR REPORTED TIMING</span><h2>Your timeline, in your terms</h2><p>“Not sure” and missing ages remain unknown. Overlapping periods within one answer are combined; breaks between separate periods are preserved. Timing does not change the anatomy or add a multiplier.</p>
      {profile.timeline.length===0?<p>No events were explicitly endorsed in this version. Unanswered items do not establish absence of adversity.</p>:profile.timeline.map(row=><article key={row.id} data-timeline={row.id}><div><h3>{row.title}</h3><strong>{row.timingText}</strong><p>Information source: {row.source}{row.kind==='history'?` · Frequency: ${FREQUENCIES.find(([id])=>id===row.frequency)?.[1]||'Not provided'}`:''}</p></div><div><small>{row.kind==='prenatal'?'Prenatal context only':'Domain sources'}</small>{row.sources.length?<SourceLinks ids={row.sources}/>:<span>Personal context; no brain-specific inference.</span>}</div></article>)}
    </section>
    <section className="cc-dual"><div className="cc-panel"><span className="cc-eyebrow">SUPPORTS YOU REPORTED</span><h2>What helped you</h2><p>These come from your own answers, not from a presumed resilience score.</p>{profile.supports.length?profile.supports.map(s=><div className="cc-insight-row" key={s.id}><i>✦</i><b>{s.title}</b></div>):<p>No support was explicitly endorsed in this version. That does not mean you lacked support.</p>}</div>
      <div className="cc-panel warm"><span className="cc-eyebrow">OPTIONAL REFLECTION · NOT INFERRED TRAITS</span><h2>Strengths and friction</h2><p>What strengths do you recognize in yourself? Which situations make everyday tasks harder? “Superpowers” and “kryptonites” can be your own shorthand—not conclusions drawn from trauma answers.</p><p>No current symptoms, diagnoses, attention style or specific strengths were assessed here. The same reflection prompts appear in every report.</p></div>
    </section>
    <section className="cc-priority"><div><span className="cc-eyebrow">STARTER IDEAS · EDITORIAL, NOT A TREATMENT RANKING</span><h2>Choose a useful starting point.</h2></div><div className="cc-priority-grid">
      <article><span>01</span><h3>Notice</h3><p>Choose one present-day situation you would like to understand. Write down what feels helpful and what feels demanding.</p></article>
      <article><span>02</span><h3>Learn</h3><p>Read one source below together with its limits. Group findings describe research samples, not a verdict about you.</p></article>
      <article><span>03</span><h3>Discuss</h3><p>Share only what you choose with a trusted support person. Persistent or distressing difficulties deserve an individual conversation with a qualified professional.</p></article>
    </div></section>
    <EvidenceLibrary ids={profile.evidenceIds} report/>
    <footer className="cc-report-foot"><b>◇ Cortex Compass</b><span>Self-report educational reflection. Not a diagnosis, brain scan, prognosis or medical advice. No automatic sharing or cloud profile is connected.</span><span>{profile.version} · {profile.evidenceVersion}</span></footer>
  </main>;
}
