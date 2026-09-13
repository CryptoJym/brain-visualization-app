// Reads the xAI application credential from stdin; outputs model identifiers only.
let input='';for await(const chunk of process.stdin)input+=chunk;
const key=input.trim();input='';
if(!key||key.length>1024)throw new Error('A server-side application key is required.');
const r=await fetch('https://api.x.ai/v1/models',{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(30000)});
if(!r.ok){console.log(JSON.stringify({status:r.status,available:false}));process.exitCode=1;}
else{const body=await r.json();console.log(JSON.stringify({status:r.status,imageModels:body.data.filter(m=>m.id.includes('image')).map(m=>m.id)},null,2));}
