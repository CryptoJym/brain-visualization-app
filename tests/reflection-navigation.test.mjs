import test from 'node:test';
import assert from 'node:assert/strict';

// Removing history writes, accepting stale entries or leaking extra route fields
// must break these regressions. Real browser traversal is checked separately.
const load=()=>import('../src/utils/reflectionNavigation.mjs');
function browserWindow(){
 const win=new EventTarget(),entries=[{state:null,url:'/'}];let index=0;
 win.location={pathname:'/'};win.crypto={randomUUID:()=> 'page-session'};
 win.history={get state(){return entries[index].state;},get length(){return entries.length;},
  replaceState(state,_,url){entries[index]={state:structuredClone(state),url};},
  pushState(state,_,url){entries.splice(index+1);entries.push({state:structuredClone(state),url});index++;}};
 win.traverse=delta=>{index+=delta;const event=new Event('popstate');event.state=entries[index].state;win.dispatchEvent(event);};
 win.entry=()=>entries[index];return win;
}
test('fresh and reloaded routes replace the entry with welcome',async()=>{
 const {createReflectionNavigation}=await load(),win=browserWindow(),seen=[];
 win.history.replaceState({cortexCompass:{sessionId:'old-page',screen:'assessment',sectionIndex:3}},'', '/#/reflect/4');
 const nav=createReflectionNavigation(win,r=>seen.push(r),5);
 assert.equal(win.entry().url,'/#/welcome');assert.equal(win.history.length,1);assert.equal(seen.at(-1).screen,'welcome');nav.dispose();
});
test('Back and Forward restore screen and section without duplicate entries',async()=>{
 const {createReflectionNavigation}=await load(),win=browserWindow(),seen=[];
 const nav=createReflectionNavigation(win,r=>seen.push(r),5);
 nav.navigate({screen:'context'});nav.navigate({screen:'assessment',sectionIndex:0});nav.navigate({screen:'assessment',sectionIndex:1});nav.navigate({screen:'assessment',sectionIndex:1});
 assert.equal(win.history.length,4);assert.equal(win.entry().url,'/#/reflect/2');
 win.traverse(-1);assert.equal(seen.at(-1).screen,'assessment');assert.equal(seen.at(-1).sectionIndex,0);
 win.traverse(-1);assert.equal(seen.at(-1).screen,'context');win.traverse(-1);assert.equal(seen.at(-1).screen,'welcome');
 win.traverse(1);win.traverse(1);win.traverse(1);assert.equal(seen.at(-1).sectionIndex,1);nav.dispose();
});
test('history contains only whitelisted navigation fields, never supplied personal data',async()=>{
 const {createReflectionNavigation}=await load(),win=browserWindow();
 const nav=createReflectionNavigation(win,()=>{},5);
 nav.navigate({screen:'assessment',sectionIndex:2,answers:{private:'synthetic-private-marker'},personContext:{sexAssigned:'synthetic-private-marker'},backupReturn:'results',backupTab:'import'});
 const serialized=JSON.stringify(win.entry());assert.ok(!serialized.includes('synthetic-private-marker'));assert.ok(!serialized.includes('answers'));assert.ok(!serialized.includes('personContext'));
 assert.equal(win.entry().url,'/#/reflect/3');nav.dispose();
});
test('stale page sessions and malformed steps return safely to welcome',async()=>{
 const {createReflectionNavigation}=await load(),win=browserWindow(),seen=[];
 const nav=createReflectionNavigation(win,r=>seen.push(r),5);
 for(const route of [{sessionId:'old-page',screen:'results',sectionIndex:0},{sessionId:'page-session',screen:'assessment',sectionIndex:99},{sessionId:'page-session',screen:'private-marker',sectionIndex:0}]){
  const event=new Event('popstate');event.state={cortexCompass:route};win.dispatchEvent(event);assert.equal(seen.at(-1).screen,'welcome');assert.equal(win.entry().url,'/#/welcome');
 }
 nav.dispose();
});
test('return destinations restore with the navigation entry',async()=>{
 const {createReflectionNavigation}=await load(),win=browserWindow(),seen=[];
 const nav=createReflectionNavigation(win,r=>seen.push(r),5);
 nav.navigate({screen:'results'});nav.navigate({screen:'context',contextReturn:'results'});nav.navigate({screen:'backup',backupReturn:'context',backupTab:'import'});
 win.traverse(-1);assert.equal(seen.at(-1).contextReturn,'results');win.traverse(1);assert.equal(seen.at(-1).backupReturn,'context');assert.equal(seen.at(-1).backupTab,'import');nav.dispose();
});
