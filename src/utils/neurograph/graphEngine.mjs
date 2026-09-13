import {GRAPH_NODES,OBSERVATION_NODES,COMPOSITION_NODES,NODE_BY_ID} from '../../data/neurograph/model.mjs';
import {EVIDENCE_RECORDS,EVIDENCE_BY_ID} from '../../data/neurograph/evidenceRegistry.mjs';
import {SYSTEM_OPERATORS} from '../../data/neurograph/operators.mjs';
const key=(a,b)=>[a,b].sort().join('::');
const OPERATOR_BY_SYSTEM_PAIR=Object.fromEntries(SYSTEM_OPERATORS.map(op=>[key(...op.systems),op]));
export function staticEdges(){
 const edges=[];
 for(const node of GRAPH_NODES){
  if(node.nodeType==='construct')edges.push({from:node.systemId,to:node.id,type:'contains-construct'});
  if(node.nodeType==='observation'){edges.push({from:node.id,to:node.systemId,type:'maps-to-system'});for(const source of node.evidence||[])if(EVIDENCE_BY_ID[source])edges.push({from:source,to:node.id,type:'informs-observation'});}
  if(node.nodeType==='named-composition'){for(const id of node.requires)edges.push({from:id,to:node.id,type:'required-by'});for(const source of node.evidence||[])if(EVIDENCE_BY_ID[source])edges.push({from:source,to:node.id,type:'informs-composition'});}
 }
 return edges;
}
export const EVIDENCE_NODES=EVIDENCE_RECORDS.map(e=>({...e,nodeType:'evidence'}));
export const ALL_GRAPH_NODES=[...GRAPH_NODES,...EVIDENCE_NODES];

export function classifyPair(a,b){
 const left=NODE_BY_ID[a],right=NODE_BY_ID[b];if(left?.nodeType!=='observation'||right?.nodeType!=='observation'||a===b)return null;
 const shared=(left.evidence||[]).filter(id=>(right.evidence||[]).includes(id));
 const named=COMPOSITION_NODES.filter(c=>c.requires.includes(a)&&c.requires.includes(b));
 const operator=OPERATOR_BY_SYSTEM_PAIR[key(left.systemId,right.systemId)]||null;
 let interactionClass='editorial';
 if(shared.length)interactionClass='shared_source';else if(named.length)interactionClass='named_convergent';else if(operator)interactionClass='cross_system';else if((left.evidence||[]).length&&(right.evidence||[]).length)interactionClass='component_only';
 return {id:key(a,b),components:[a,b],systems:[left.systemId,right.systemId],sharedEvidence:shared,namedCompositions:named.map(x=>x.id),operator,interactionClass,evidenceIds:[...new Set([...(left.evidence||[]),...(right.evidence||[]),...(operator?.evidence||[])])]};
}
export function pairPotentialities(ids=OBSERVATION_NODES.map(x=>x.id)){
 const result=[];
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const pair=classifyPair(ids[i],ids[j]);if(pair)result.push(pair);}
 return result;
}
const choose=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-k+i)/i;return Math.round(x);};
export const hypothesisSpace=n=>({recognized:n,pairs:choose(n,2),triples:choose(n,3),quads:choose(n,4)});
export function validateGraph(){
 const ids=new Set(ALL_GRAPH_NODES.map(n=>n.id)),problems=[];
 if(ids.size!==ALL_GRAPH_NODES.length)problems.push('duplicate-node-id');
 for(const edge of staticEdges())if(!ids.has(edge.from)||!ids.has(edge.to))problems.push(`unresolved-edge:${edge.from}->${edge.to}`);
 for(const c of COMPOSITION_NODES)for(const id of c.requires)if(!NODE_BY_ID[id])problems.push(`composition:${c.id}:${id}`);
 return {ok:problems.length===0,problems,nodeCount:ALL_GRAPH_NODES.length,edgeCount:staticEdges().length,pairPotentialities:pairPotentialities().length};
}
