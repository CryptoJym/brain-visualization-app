// One canonical unit (months since birth); pregnancy is a separate channel.
export const TIMING_VERSION = 1;
export const MAX_MONTH = 216;
export const AGE_PRESETS = Object.freeze([
  {id:'infancy', label:'Birth–18 months', startMonth:0, endMonth:18},
  {id:'toddler', label:'18 months–3 years', startMonth:18, endMonth:36},
  {id:'early', label:'3–6 years', startMonth:36, endMonth:72},
  {id:'school', label:'6–12 years', startMonth:72, endMonth:144},
  {id:'early-teen', label:'12–15 years', startMonth:144, endMonth:180},
  {id:'later-teen', label:'15–18 years', startMonth:180, endMonth:216},
]);
export const KNOWLEDGE_SOURCES = Object.freeze([
  {id:'memory', label:'My own recollection'},
  {id:'family', label:'What family or a caregiver told me'},
  {id:'records', label:'Records or documented information'},
  {id:'mixed', label:'More than one source'},
  {id:'unknown', label:'Not sure / source not recorded'},
]);
export function emptyTiming(status='unanswered') {
  return {version:TIMING_VERSION, status, periods:[], source:'unknown', precision:'approximate'};
}
export function periodError(startMonth,endMonth) {
  if(!Number.isInteger(startMonth)||!Number.isInteger(endMonth)) return 'Choose whole months.';
  if(startMonth<0||startMonth>=MAX_MONTH||endMonth<0||endMonth>MAX_MONTH) return 'Use ages from birth up to the 18th birthday.';
  if(startMonth>endMonth) return 'The end age must be the same as or later than the start age.';
  return '';
}
export function mergePeriods(periods=[]) {
  if(!Array.isArray(periods)||periods.length>32) throw new TypeError('Invalid period list.');
  const sorted=periods.map(p=>{
    if(!p||periodError(p.startMonth,p.endMonth)) throw new TypeError('Invalid age period.');
    return {startMonth:p.startMonth,endMonth:p.endMonth};
  }).sort((a,b)=>a.startMonth-b.startMonth||a.endMonth-b.endMonth);
  const result=[];
  for(const p of sorted){
    const last=result.at(-1);
    if(last&&p.startMonth<=last.endMonth) last.endMonth=Math.max(last.endMonth,p.endMonth);
    else result.push({...p});
  }
  return result;
}
export function normalizeTiming(value,prenatal=false) {
  const t=value&&typeof value==='object'?value:{};
  const source=KNOWLEDGE_SOURCES.some(s=>s.id===t.source)&&(!prenatal||t.source!=='memory')?t.source:'unknown';
  if(prenatal) return {...emptyTiming('prenatal'),source};
  const status=['known','unknown','withheld','unanswered'].includes(t.status)?t.status:'unanswered';
  if(status!=='known') return {...emptyTiming(status),source};
  const periods=mergePeriods(t.periods);
  return {...emptyTiming(periods.length?'known':'unanswered'),periods,source};
}
export function safeTiming(value,prenatal=false) {
  try{return normalizeTiming(value,prenatal);}catch{return {...emptyTiming('unknown'),invalid:true};}
}
export function ageLabel(months) {
  if(months===0)return 'Birth';
  if(months<24)return `${months} months`;
  const years=Math.floor(months/12),extra=months%12;
  return `${years} years${extra?` ${extra} ${extra===1?'month':'months'}`:''}`;
}
export function periodLabel(p) {
  return p.startMonth===p.endMonth?`Around ${ageLabel(p.startMonth).toLowerCase()}`:`${ageLabel(p.startMonth)} → ${ageLabel(p.endMonth)}`;
}
export function timingLabel(value,prenatal=false) {
  const t=safeTiming(value,prenatal);
  if(prenatal)return 'Before birth · during pregnancy';
  if(t.status==='unknown')return 'Timing not sure';
  if(t.status==='withheld')return 'Timing not shared';
  if(t.status!=='known')return 'Timing not provided';
  return t.periods.map(periodLabel).join('; ');
}
export function hasBand(periods,band) {
  return mergePeriods(periods).some(p=>p.startMonth<=band.startMonth&&p.endMonth>=band.endMonth);
}
export function toggleBand(timing,band) {
  const t=normalizeTiming(timing);let periods=t.periods;
  if(hasBand(periods,band)){
    periods=periods.flatMap(p=>{
      if(p.endMonth<=band.startMonth||p.startMonth>=band.endMonth)return [p];
      const pieces=[];
      if(p.startMonth<band.startMonth)pieces.push({startMonth:p.startMonth,endMonth:band.startMonth});
      if(p.endMonth>band.endMonth)pieces.push({startMonth:band.endMonth,endMonth:p.endMonth});
      return pieces;
    });
  }else periods=[...periods,{startMonth:band.startMonth,endMonth:band.endMonth}];
  return normalizeTiming({...t,status:'known',periods});
}
export function putPeriod(timing,period,index=null) {
  const t=normalizeTiming(timing);const periods=t.periods.filter((_,i)=>i!==index);
  return normalizeTiming({...t,status:'known',periods:[...periods,period]});
}
