import {createRequire} from 'node:module';
import {readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),sharp=require('/Users/utlyze/Projects/freely-sweet/node_modules/sharp');
const dir=resolve(dirname(fileURLToPath(import.meta.url)),'../.local-evidence/hero-editions/final-render');
const pages=readdirSync(dir).filter(n=>/^Cortex-Compass-Cinematic-Scientific-A4-\d+\.png$/.test(n)).sort();
for(let first=0;first<pages.length;first+=4){const layers=[];for(const [i,name] of pages.slice(first,first+4).entries())layers.push({input:await sharp(resolve(dir,name)).resize(480,680,{fit:'contain',background:'#dbe3e8'}).png().toBuffer(),left:i%2*490,top:Math.floor(i/2)*690});await sharp({create:{width:980,height:1380,channels:3,background:'#dbe3e8'}}).composite(layers).png().toFile(resolve(dir,`science-contact-${first/4+1}.png`));}
console.log('Contact sheets for',pages.length,'scientific pages.');
