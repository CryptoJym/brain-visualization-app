import {normalizeHeroAnswers} from './engine.mjs';
import {normalizePortraitChoices,PORTRAIT_SPEC_VERSION} from './portraitBrief.mjs';
import {COMPOSITION_BY_ID} from '../../data/neurohero/compositions.mjs';
export const HERO_STORAGE_KEY='cortex-compass-neurohero';
export const HERO_STORAGE_SCHEMA=1;
export function normalizePortraitAsset(raw){
 if(!raw||typeof raw!=='object'||raw.kind!=='device'||!/^[-a-f0-9]{36}$/.test(raw.id||'')||!/^[a-f0-9]{64}$/.test(raw.sha256||''))return null;
 return {kind:'device',id:raw.id,sha256:raw.sha256,width:Number(raw.width)||0,height:Number(raw.height)||0,...(raw.provider==='xAI'&&/^[-a-f0-9]{36}$/.test(raw.cloudId||'')?{provider:'xAI',cloudId:raw.cloudId}:{})};
}
export function normalizeHeroRecord(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 if(raw.schemaVersion!==HERO_STORAGE_SCHEMA)throw new Error('Unsupported hero profile version. Existing data was not changed.');
 if(raw.portraitSpecVersion!==undefined&&raw.portraitSpecVersion!==PORTRAIT_SPEC_VERSION)throw new Error('Unsupported portrait specification. Existing data was not changed.');
 return {schemaVersion:HERO_STORAGE_SCHEMA,answers:normalizeHeroAnswers(raw.answers),selectedId:Object.hasOwn(COMPOSITION_BY_ID,raw.selectedId||'')?raw.selectedId:'',portraitSpecVersion:PORTRAIT_SPEC_VERSION,portraitChoices:normalizePortraitChoices(raw.portraitChoices),portraitAsset:normalizePortraitAsset(raw.portraitAsset)};
}
export function makeHeroRecord({answers={},selectedId='',portraitChoices={},portraitAsset=null}={}){return normalizeHeroRecord({schemaVersion:HERO_STORAGE_SCHEMA,portraitSpecVersion:PORTRAIT_SPEC_VERSION,answers,selectedId,portraitChoices,portraitAsset});}
export function loadHeroRecord(storage){const text=storage.getItem(HERO_STORAGE_KEY);if(!text)return null;if(text.length>200000)throw new Error('Saved hero profile is unexpectedly large.');return normalizeHeroRecord(JSON.parse(text));}
export function saveHeroRecord(storage,input,consent=false){if(consent!==true)throw new Error('Explicit device-save consent is required.');const record=makeHeroRecord(input);storage.setItem(HERO_STORAGE_KEY,JSON.stringify(record));return record;}
