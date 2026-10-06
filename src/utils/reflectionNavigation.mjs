const SCREENS=new Set(['welcome','context','assessment','results','insights','neurohero','portrait','report','evidence','backup']);
export const WELCOME_ROUTE=Object.freeze({screen:'welcome',sectionIndex:0,contextReturn:'assessment',evidenceReturn:'welcome',backupReturn:'welcome',backupTab:'export'});

function validRoute(route,sectionCount){
 return route&&SCREENS.has(route.screen)&&Number.isInteger(route.sectionIndex)&&route.sectionIndex>=0&&route.sectionIndex<sectionCount;
}
function navigationOnly(route,sectionCount){
 if(!validRoute(route,sectionCount))return {...WELCOME_ROUTE};
 return {screen:route.screen,sectionIndex:route.sectionIndex,
  contextReturn:['assessment','results'].includes(route.contextReturn)?route.contextReturn:'assessment',
  evidenceReturn:SCREENS.has(route.evidenceReturn)?route.evidenceReturn:'welcome',
  backupReturn:SCREENS.has(route.backupReturn)?route.backupReturn:'welcome',
  backupTab:route.backupTab==='import'?'import':'export'};
}
function stepURL(pathname,route){
 return `${pathname}#/${route.screen==='assessment'?`reflect/${route.sectionIndex+1}`:route.screen}`;
}

// Only navigation metadata crosses the History API boundary. Answers stay in React.
// Each document has its own session: an entry left by a reload cannot restore data.
export function createReflectionNavigation(win,onNavigate,sectionCount){
 const sessionId=win.crypto.randomUUID();let current={...WELCOME_ROUTE};
 const write=(method,route)=>win.history[method]({cortexCompass:{sessionId,...route}},'',stepURL(win.location.pathname,route));
 write('replaceState',current);onNavigate(current);
 const pop=event=>{
  const entry=event.state?.cortexCompass;
  current=entry?.sessionId===sessionId&&validRoute(entry,sectionCount)?navigationOnly(entry,sectionCount):{...WELCOME_ROUTE};
  if(entry?.sessionId!==sessionId||!validRoute(entry,sectionCount))write('replaceState',current);
  onNavigate(current);
 };
 win.addEventListener('popstate',pop);
 return {
  navigate(patch){
   const next=navigationOnly({...current,...patch},sectionCount);
   if(JSON.stringify(next)===JSON.stringify(current))return;
   const sameStep=next.screen===current.screen&&next.sectionIndex===current.sectionIndex;
   current=next;write(sameStep?'replaceState':'pushState',current);onNavigate(current);
  },
  dispose(){win.removeEventListener('popstate',pop);}
 };
}

export function shouldWarnBeforeLeave({demo=false,saved=false,exported=false,answers={},personContext={},insightAnswers={},heroAnswers={},selectedHeroId='',portraitChoices={},portraitAsset=null,legacyRecord=null}={}){
 if(demo||saved||exported)return false;
 return Boolean(Object.values(answers).some(a=>a?.value)||Object.values(personContext).some(Boolean)||Object.values(insightAnswers).some(Boolean)||Object.values(heroAnswers).some(Boolean)||selectedHeroId||Object.values(portraitChoices).some(Boolean)||portraitAsset||legacyRecord);
}
