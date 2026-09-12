import {createRequire} from 'node:module';
import {readdirSync,readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const sharp=require(process.env.CORTEX_SHARP_MODULE||'sharp');
const dir='.local-evidence/reports-v6/render-final';
const expected=JSON.parse(readFileSync(`${dir}/audit.json`,'utf8')).find(r=>r.file==='Cortex-Compass-Scientific-A4.pdf').pages;
const files=readdirSync(dir).filter(n=>/^Scientific-\d+\.png$/.test(n)&&Number(n.match(/\d+/)[0])<=expected).sort();
for(let start=0;start<files.length;start+=4){
 const inputs=[];
 for(const [i,name] of files.slice(start,start+4).entries())inputs.push({input:await sharp(`${dir}/${name}`).resize({width:500,height:710,fit:'contain',background:'#dfe5e9'}).png().toBuffer(),left:(i%2)*510,top:Math.floor(i/2)*720});
 await sharp({create:{width:1020,height:1440,channels:3,background:'#dfe5e9'}}).composite(inputs).png().toFile(`${dir}/contact-${String(start/4+1).padStart(2,'0')}.png`);
}
console.log('Rendered contact sheets for',files.length,'scientific pages.');
