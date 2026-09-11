export const AGE_BANDS = ['0-3','3-5','6-11','11-13','14-18','throughout'];
export const FREQUENCIES = ['once','sometimes','often','chronic'];

export const SYSTEMS = {
  executive:{label:'Executive control',color:'#38bdf8'},
  salience:{label:'Salience & regulation',color:'#fb7185'},
  memory:{label:'Memory & context',color:'#a78bfa'},
  stress:{label:'Stress & survival',color:'#f59e0b'},
  interoception:{label:'Body awareness',color:'#2dd4bf'},
  social:{label:'Social meaning',color:'#f472b6'},
  sensory:{label:'Sensory processing',color:'#84cc16'},
};

export const REGIONS = [
  {id:'dlpfc',label:'dlPFC',name:'Dorsolateral Prefrontal Cortex',system:'executive',function:'Working memory, planning, flexibility',pos:[-2.6,2.1,2.8],scale:[1.35,.9,1.1]},
  {id:'acc',label:'ACC',name:'Anterior Cingulate Cortex',system:'salience',function:'Conflict monitoring and regulation',pos:[0,.9,1.1],scale:[1,.65,.65]},
  {id:'amygdala',label:'Amygdala',name:'Amygdala',system:'salience',function:'Threat and salience detection',pos:[-1.15,-.65,1.0],scale:[.62,.5,.55]},
  {id:'hippocampus',label:'Hippocampus',name:'Hippocampus',system:'memory',function:'Memory, learning and stress context',pos:[-1.4,-.65,-.25],scale:[1.2,.42,.48]},
  {id:'insula',label:'Insula',name:'Insula',system:'interoception',function:'Body awareness and emotional signals',pos:[-2.65,.05,.35],scale:[.8,.95,.5]},
  {id:'thalamus',label:'Thalamus',name:'Thalamus',system:'sensory',function:'Sensory relay and information routing',pos:[0,-.1,.15],scale:[.75,.6,.7]},
  {id:'hypothalamus',label:'Hypothalamus',name:'Hypothalamus',system:'stress',function:'HPA-axis and stress coordination',pos:[0,-.75,.6],scale:[.55,.42,.5]},
  {id:'pag',label:'PAG',name:'Periaqueductal Gray',system:'stress',function:'Fight, flight and freeze coordination',pos:[0,-1.45,-.45],scale:[.4,.65,.4]},
  {id:'temporal',label:'Temporal',name:'Temporal Social-Language Regions',system:'social',function:'Language, social cues and meaning',pos:[-3.45,-.45,-.25],scale:[1.3,.95,1.35]},
  {id:'cerebellum',label:'Cerebellum',name:'Cerebellar Vermis',system:'stress',function:'Timing, regulation and sensorimotor integration',pos:[0,-2.2,-2.7],scale:[1.7,.9,1.1]},
];

const r=(...ids)=>ids;
export const SECTIONS = [
 {id:'home',title:'Home & Safety',icon:'⌂',subtitle:'Safety, predictability and caregiving',questions:[
  {id:'unsafe_home',text:'Did home often feel unsafe, frightening, or unpredictable?',regions:r('amygdala','acc','hypothalamus','pag'),weight:1.1},
  {id:'physical_harm',text:'Were you physically harmed or often afraid you would be harmed?',regions:r('amygdala','pag','dlpfc'),weight:1.2},
  {id:'basic_needs',text:'Were food, clothing, medical care, or supervision often unreliable?',regions:r('hypothalamus','acc','cerebellum'),weight:1.0},
  {id:'household_instability',text:'Was there major household instability from substance use, incarceration, or repeated crises?',regions:r('dlpfc','amygdala','hippocampus'),weight:1.0},
  {id:'domestic_conflict',text:'Did you regularly witness severe conflict or violence between caregivers?',regions:r('amygdala','insula','temporal'),weight:1.1},
 ]},
 {id:'relationships',title:'Relationships',icon:'♡',subtitle:'Attachment, belonging and emotional safety',questions:[
  {id:'emotional_harm',text:'Were you frequently insulted, humiliated, threatened, or made to feel worthless?',regions:r('acc','dlpfc','insula','temporal'),weight:1.1},
  {id:'emotional_neglect',text:'Did you often feel unseen, unloved, unsupported, or emotionally alone?',regions:r('acc','hippocampus','temporal'),weight:1.0},
  {id:'sexual_boundary',text:'Did an older person cross sexual boundaries with you or involve you in unwanted sexual experiences?',regions:r('hippocampus','insula','amygdala','sensory'),weight:1.25},
  {id:'caregiver_loss',text:'Was there a major caregiver separation, abandonment, or loss?',regions:r('hippocampus','amygdala','temporal'),weight:1.0},
  {id:'relationship_volatility',text:'Did closeness with important people often feel unpredictable or conditional?',regions:r('amygdala','acc','insula'),weight:.9},
 ]},
 {id:'school',title:'School & Social',icon:'◎',subtitle:'Peers, identity, learning and belonging',questions:[
  {id:'bullying',text:'Were you repeatedly bullied, excluded, or socially targeted?',regions:r('amygdala','temporal','acc'),weight:1.0},
  {id:'discrimination',text:'Did you experience persistent discrimination or identity-based hostility?',regions:r('amygdala','acc','dlpfc'),weight:1.0},
  {id:'school_instability',text:'Did frequent moves, school changes, or instability disrupt your learning?',regions:r('dlpfc','hippocampus'),weight:.85},
  {id:'performance_pressure',text:'Did school or performance expectations frequently feel threatening or overwhelming?',regions:r('dlpfc','acc','hypothalamus'),weight:.8},
  {id:'social_isolation',text:'Did you spend long periods feeling isolated or without a dependable peer connection?',regions:r('temporal','acc','hippocampus'),weight:.8},
 ]},
 {id:'health',title:'Health & Major Events',icon:'✚',subtitle:'Medical stress, loss and acute events',questions:[
  {id:'medical_trauma',text:'Did serious illness, injury, hospitalization, or painful procedures feel traumatic?',regions:r('insula','amygdala','hippocampus'),weight:1.0},
  {id:'life_threat',text:'Did you experience an accident, disaster, assault, or event where life felt in danger?',regions:r('amygdala','pag','hypothalamus','hippocampus'),weight:1.2},
  {id:'bereavement',text:'Did you experience a major death or traumatic loss during childhood?',regions:r('hippocampus','temporal','acc'),weight:1.0},
  {id:'chronic_stress',text:'Were there long periods when you felt you always had to stay alert or ready for something bad?',regions:r('amygdala','hypothalamus','pag','dlpfc'),weight:1.15},
  {id:'sleep_disruption',text:'Was sleep frequently disrupted by fear, conflict, instability, or caregiving stress?',regions:r('hypothalamus','hippocampus','dlpfc'),weight:.8},
 ]},
 {id:'protective',title:'Protective Factors',icon:'✦',subtitle:'What helped you adapt and recover',protective:true,questions:[
  {id:'safe_adult',text:'Was there at least one dependable adult who made you feel safe and valued?',regions:[],weight:1.2},
  {id:'close_friend',text:'Did you have at least one trusted friend or peer connection?',regions:[],weight:.8},
  {id:'belonging',text:'Did school, community, culture, faith, sport, or another group give you belonging?',regions:[],weight:.8},
  {id:'competence',text:'Did you have skills, interests, or achievements that made you feel capable?',regions:[],weight:.8},
  {id:'routine',text:'Did predictable routines, traditions, or stable spaces help you feel grounded?',regions:[],weight:.7},
 ]},
];

export const ALL_QUESTIONS = SECTIONS.flatMap(s=>s.questions.map(q=>({...q,section:s.id,protective:!!s.protective})));
const ageW={'0-3':1.25,'3-5':1.2,'6-11':1.1,'11-13':1.12,'14-18':1,'throughout':1.3};
const freqW={once:.65,sometimes:.9,often:1.1,chronic:1.3};

export function calculateProfile(answers={}){
 const regionScores=Object.fromEntries(REGIONS.map(x=>[x.id,0]));
 const themes={}; let adversity=0, protective=0, endorsed=0;
 ALL_QUESTIONS.forEach(q=>{ const a=answers[q.id]; if(!a||a.value!=='yes') return; endorsed++;
   if(q.protective){ protective+=q.weight; return; }
   const aw=Math.max(...(a.ages||[]).map(x=>ageW[x]||1),1); const fw=freqW[a.frequency]||.9; const score=q.weight*aw*fw;
   adversity+=score; themes[q.section]=(themes[q.section]||0)+score; q.regions.forEach(id=>{ if(regionScores[id]!==undefined) regionScores[id]+=score; });
 });
 const buffer=Math.min(.38,protective*.055); const max=Math.max(...Object.values(regionScores),1);
 const regions=REGIONS.map(x=>({...x,score:Math.min(100,(regionScores[x.id]/max)*100*(1-buffer))})).sort((a,b)=>b.score-a.score);
 const load=Math.max(0,adversity*(1-buffer)); const band=load<4?'low':load<9?'moderate':load<15?'elevated':'high';
 const strongest=Object.entries(themes).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>SECTIONS.find(s=>s.id===id)?.title).filter(Boolean);
 const ages={}; Object.values(answers).forEach(a=>(a?.ages||[]).forEach(x=>ages[x]=(ages[x]||0)+1));
 const windows=Object.entries(ages).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([x])=>x);
 return {version:'cortex-compass-1.0',load,band,buffer,protective,regions,strongest,windows,answered:Object.keys(answers).length,endorsed};
}

export const SUPERPOWERS=[
 ['pattern-detection','Pattern detection','Noticing subtle changes, inconsistencies, and context quickly.'],
 ['empathy','Empathic attunement','Reading emotional nuance and what others may need.'],
 ['adaptation','Adaptive creativity','Finding alternate paths when standard approaches fail.'],
 ['persistence','Persistence','Continuing through difficulty and uncertainty.'],
 ['context','Contextual scanning','Holding multiple environmental signals in awareness.'],
];
export const KRYPTONITES=[
 ['hypervigilance','Hypervigilance','Scanning can stay switched on after danger has passed.'],
 ['working-memory','Working-memory overload','High arousal can reduce available cognitive bandwidth.'],
 ['flooding','Emotional flooding','Strong signals may arrive faster than regulation catches up.'],
 ['sleep','Sleep / stress dysregulation','Stress systems can make recovery rhythms less predictable.'],
 ['rejection','Rejection sensitivity','Ambiguous social cues may be interpreted as higher stakes.'],
];
