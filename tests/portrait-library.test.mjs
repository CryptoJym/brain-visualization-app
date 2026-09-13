import test from 'node:test';
import assert from 'node:assert/strict';
import {savedEdition,nextPortraitEdition,matchingPortraits} from '../src/utils/neurohero/portraitLibrary.mjs';
const spec={heroId:'signal_cartographer',choices:{presentation:'woman'}};
const jobs=[{id:'first',status:'failed',createdAt:1,spec:{...spec,edition:0}},{id:'second',status:'ready',createdAt:2,spec:{...spec,edition:1}}];
test('reopening prefers the accepted saved edition',()=>assert.equal(savedEdition(jobs,spec),1));
test('an explicitly chosen new edition is retained',()=>assert.equal(savedEdition(jobs,spec,2),2));
test('another edition follows all existing editions',()=>assert.equal(nextPortraitEdition(jobs,spec),2));
test('unrelated visual choices do not match',()=>assert.equal(matchingPortraits(jobs,{...spec,choices:{presentation:'man'}}).length,0));
