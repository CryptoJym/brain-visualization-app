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

