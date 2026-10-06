import test from 'node:test';
import assert from 'node:assert/strict';
const load=()=>import('../src/utils/reflectionNavigation.mjs');
test('empty and fictional reflections do not arm a leave warning',async()=>{
 const {shouldWarnBeforeLeave}=await load();
 assert.equal(shouldWarnBeforeLeave({}),false);assert.equal(shouldWarnBeforeLeave({personContext:{sexAssigned:'',hormonalContext:''}}),false);
 assert.equal(shouldWarnBeforeLeave({demo:true,answers:{physical_assault:{value:'yes'}}}),false);
});
test('all real answer surfaces arm a warning before saving',async()=>{
 const {shouldWarnBeforeLeave}=await load();
 for(const state of [{answers:{physical_assault:{value:'no'}}},{personContext:{sexAssigned:'male'}},{insightAnswers:{noticing:'often'}},{heroAnswers:{signal_detection:'often'}},{selectedHeroId:'signal_cartographer'},{portraitChoices:{setting:'forest'}},{portraitAsset:{id:'synthetic-device-art'}},{legacyRecord:{answers:{old:'yes'}}}])assert.equal(shouldWarnBeforeLeave(state),true,JSON.stringify(state));
});
test('only an explicit device save suppresses the warning for real answers',async()=>{
 const {shouldWarnBeforeLeave}=await load(),state={answers:{physical_assault:{value:'no'}}};
 assert.equal(shouldWarnBeforeLeave({...state,saved:true}),false);assert.equal(shouldWarnBeforeLeave({...state,exported:true}),true);
 assert.equal(shouldWarnBeforeLeave({...state,saved:false,exported:false}),true);
});
