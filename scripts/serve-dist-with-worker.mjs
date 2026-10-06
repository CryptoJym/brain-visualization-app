// Serve dist/ through worker/index.js with the public/_headers rules, so local checks see the
// production Content-Security-Policy and cache headers without wrangler or Cloudflare.
// Usage: node scripts/serve-dist-with-worker.mjs [port]
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {extname,join,normalize} from 'node:path';
import worker from '../worker/index.js';

const root=new URL('../dist/',import.meta.url).pathname;
const port=Number(process.argv[2]||process.env.PORT||5682);
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json',
  '.wasm':'application/wasm','.glb':'model/gltf-binary','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.pdf':'application/pdf','.webmanifest':'application/manifest+json','.txt':'text/plain','.md':'text/markdown'};
// Minimal _headers support: "/path/*" rules with indented "Name: value" lines.
const rules=[];let current=null;
for(const line of readFileSync(new URL('../public/_headers',import.meta.url),'utf8').split('\n')){
  if(!line.trim())continue;
  if(!/^\s/.test(line)){current={pattern:new RegExp('^'+line.trim().replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$'),headers:[]};rules.push(current);}
  else if(current){const i=line.indexOf(':');current.headers.push([line.slice(0,i).trim(),line.slice(i+1).trim()]);}
}
const assets={async fetch(request){
  const url=new URL(request.url);let path=normalize(decodeURIComponent(url.pathname));
  let file=join(root,path);
  if(!file.startsWith(root))return new Response('Not found',{status:404});
  if(!existsSync(file)||statSync(file).isDirectory())file=join(root,'index.html'); // single-page application
  const headers=new Headers({'Content-Type':TYPES[extname(file)]||'application/octet-stream','Cache-Control':'public, max-age=0, must-revalidate'});
  for(const rule of rules)if(rule.pattern.test(url.pathname))for(const [name,value] of rule.headers)headers.set(name,value);
  return new Response(readFileSync(file),{headers});
}};
createServer(async(req,res)=>{
  const response=await worker.fetch(new Request(`http://127.0.0.1:${port}${req.url}`,{method:req.method,headers:req.headers}),{ASSETS:assets});
  res.writeHead(response.status,Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(port,'127.0.0.1',()=>console.log(`dist + worker headers on http://127.0.0.1:${port}`));
