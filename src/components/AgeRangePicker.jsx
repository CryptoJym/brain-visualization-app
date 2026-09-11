import React,{useId,useState} from 'react';
import {AGE_PRESETS,KNOWLEDGE_SOURCES,MAX_MONTH,ageLabel,periodLabel,periodError,
  emptyTiming,safeTiming,normalizeTiming,toggleBand,putPeriod,hasBand} from '../utils/assessmentTiming.mjs';

function AgeFields({label,value,onChange,end=false}) {
  const years=Math.floor(value/12),months=value%12;
  return <div className="cc-age-fields"><span>{label}</span>
    <label><span className="cc-sr-only">{label} age in years</span>
      <select aria-label={`${label} age in years`} value={years} onChange={e=>{const y=Number(e.target.value);onChange(y*12+(y===18?0:months));}}>
        {Array.from({length:end?19:18},(_,i)=><option key={i} value={i}>{i} {i===1?'year':'years'}</option>)}
      </select></label>
    <label><span className="cc-sr-only">{label} additional months</span>
      <select aria-label={`${label} additional months`} disabled={years===18} value={months} onChange={e=>onChange(years*12+Number(e.target.value))}>
        {Array.from({length:12},(_,i)=><option key={i} value={i}>{i} {i===1?'month':'months'}</option>)}
      </select></label>
  </div>;
}
export function TimingSource({timing,onChange,prenatal=false}) {
  const t=safeTiming(timing,prenatal);
  return <label className="cc-timing-source">How do you know? <small>Optional; uncertainty is okay.</small>
    <select aria-label="Source of timing information" value={t.source} onChange={e=>onChange({...t,source:e.target.value})}>
      {KNOWLEDGE_SOURCES.filter(s=>!prenatal||s.id!=='memory').map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
  </label>;
}
export default function AgeRangePicker({value,onChange}) {
  const t=safeTiming(value),descriptionId=useId(),errorId=useId();
  const [mode,setMode]=useState('quick'),[start,setStart]=useState(0),[end,setEnd]=useState(18);
  const [editing,setEditing]=useState(null),[message,setMessage]=useState('');
  const error=periodError(start,end);
  const write=next=>{onChange(next);setMessage('Timing updated.');};
  const add=()=>{
    if(error)return;
    if(t.periods.length>=8&&editing===null){setMessage('Up to eight separate periods can be recorded. Edit or combine an existing period.');return;}
    write(putPeriod(t,{startMonth:start,endMonth:end},editing));setEditing(null);
    setMessage('Period saved. You can adjust it or add a separate period.');
  };
  const edit=index=>{const p=t.periods[index];setStart(p.startMonth);setEnd(p.endMonth);setEditing(index);setMode('custom');setMessage('Editing this period. Select Update period to keep the changes.');};
  const remove=index=>{write(normalizeTiming({...t,status:'known',periods:t.periods.filter((_,i)=>i!==index)}));setEditing(null);};
  return <fieldset className="cc-age-picker">
    <legend>When did this happen? <small>Optional</small></legend>
    <p id={descriptionId} className="cc-timing-help">Choose broad bands or set your own start and end ages. You can record separate periods, not just one continuous span.</p>
    <div className="cc-age-mode" aria-label="Timing entry method">
      <button type="button" aria-pressed={mode==='quick'} onClick={()=>setMode('quick')}>Quick age bands</button>
      <button type="button" aria-pressed={mode==='custom'} onClick={()=>{setMode('custom');if(t.periods.length===1){setStart(t.periods[0].startMonth);setEnd(t.periods[0].endMonth);setEditing(0);}}}>Custom range</button>
    </div>
    {mode==='quick'&&<div className="cc-age-presets">
      {AGE_PRESETS.map(b=><button type="button" key={b.id} aria-pressed={hasBand(t.periods,b)} onClick={()=>{write(toggleBand(t,b));setEditing(null);}}>{b.label}</button>)}
      <button type="button" aria-pressed={hasBand(t.periods,{startMonth:0,endMonth:MAX_MONTH})} onClick={()=>write(hasBand(t.periods,{startMonth:0,endMonth:MAX_MONTH})?emptyTiming():{...t,status:'known',periods:[{startMonth:0,endMonth:MAX_MONTH}]})}>Across childhood · birth to 18</button>
    </div>}
    {mode==='custom'&&<div className="cc-custom-age">
      <div className="cc-range-preview" aria-hidden="true"><i style={{left:`${start/MAX_MONTH*100}%`,width:`${Math.max(0,end-start)/MAX_MONTH*100}%`}}/></div>
      <div className="cc-age-axis" aria-hidden="true"><span>Birth</span><span>6 years</span><span>12 years</span><span>18 years</span></div>
      <div className="cc-range-entry">
        <AgeFields label="Start" value={start} onChange={setStart}/>
        <input type="range" min="0" max={MAX_MONTH-1} step="1" value={start} aria-label="Start age slider" aria-valuetext={ageLabel(start)} aria-describedby={descriptionId} onChange={e=>setStart(Number(e.target.value))}/>
        <AgeFields label="End" value={end} onChange={setEnd} end/>
        <input type="range" min="0" max={MAX_MONTH} step="1" value={end} aria-label="End age slider" aria-valuetext={ageLabel(end)} aria-describedby={descriptionId} onChange={e=>setEnd(Number(e.target.value))}/>
      </div>
      <p className="cc-draft-age">{error?'Check the range below':periodLabel({startMonth:start,endMonth:end})} <small>Draft until added</small></p>
      {error&&<p className="cc-form-error" id={errorId} role="alert">{error}</p>}
      <button type="button" className="cc-add-period" disabled={!!error} aria-describedby={error?errorId:undefined} onClick={add}>{editing===null?'Add this period':'Update period'}</button>
      {editing!==null&&<button type="button" onClick={()=>{setEditing(null);setMessage('Edit cancelled; the recorded period is unchanged.');}}>Cancel edit</button>}
    </div>}
    <div className="cc-recorded-periods" aria-label="Recorded age periods">
      {t.periods.map((p,i)=><div className="cc-period" key={`${p.startMonth}-${p.endMonth}`}><span>{periodLabel(p)}</span><button type="button" aria-label={`Edit period ${i+1}`} onClick={()=>edit(i)}>Edit</button><button type="button" aria-label={`Remove period ${i+1}`} onClick={()=>remove(i)}>Remove</button></div>)}
      {t.periods.length>0&&<button type="button" className="cc-another-period" onClick={()=>{setMode('custom');setEditing(null);setMessage('Choose start and end ages, then Add this period.');}}>＋ Add another period</button>}
    </div>
    <div className="cc-timing-unknown"><button type="button" aria-pressed={t.status==='unknown'} onClick={()=>{write(emptyTiming('unknown'));setEditing(null);}}>Not sure when</button><button type="button" aria-pressed={t.status==='withheld'} onClick={()=>{write(emptyTiming('withheld'));setEditing(null);}}>Prefer not to share ages</button><button type="button" onClick={()=>{write(emptyTiming());setEditing(null);}}>Clear ages</button></div>
    <p className="cc-timing-help">Ranges end at the age shown: 3–6 years means from the 3rd up to the 6th birthday. Use equal start/end ages for an event around one age. Estimates are welcome.</p>
    {t.periods.some(p=>p.startMonth<24)&&<p className="cc-infant-note">For infancy, use information you already have from family or records rather than trying to reconstruct memories. Pregnancy is recorded separately under Health & early context.</p>}
    <TimingSource timing={t} onChange={write}/>
    <span className="cc-sr-only" role="status">{message}</span>
  </fieldset>;
}
