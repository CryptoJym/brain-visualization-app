import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTEXT_QUESTIONS} from '../src/data/developmentContext.mjs';
import {normalizePersonContext} from '../src/utils/developmentProfile.mjs';
test('biological sex has exactly the required Male and Female answers',()=>{const question=CONTEXT_QUESTIONS.find(q=>q.id==='sexAssigned');assert.equal(question.required,true);assert.deepEqual(question.choices,[['male','Male'],['female','Female']]);});
test('the questionnaire does not fill an unanswered sex',()=>assert.equal(normalizePersonContext({}).sexAssigned,undefined));
test('previous missing responses are not converted into a sex',()=>{for(const value of ['unknown','skip','another']){const result=normalizePersonContext({sexAssigned:value});assert.equal(result.sexAssigned,undefined);assert.equal(result.legacySexAssigned,value);}});
