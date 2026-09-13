// Publish only explicitly fictional test artwork; never copy private workspace storage.
import sharp from "/Users/utlyze/Projects/freely-sweet/node_modules/sharp/dist/index.cjs";
import {mkdirSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source='.local-evidence/xai-portraits/final-samples',target='public/reports/xai';mkdirSync(target,{recursive:true});
const audit=JSON.parse(readFileSync(`${source}/audit.json`));
for(const row of audit){if(!row.fictionalLabel||!row.portraitEmbedded||!row.textBoundsPass)throw new Error('Sample verification incomplete.');copyFileSync(`${source}/${row.file}`,`${target}/${row.file}`);}
const imageFile='Cortex-Compass-xAI-Signal-Cartographer.jpg';
await sharp('.local-evidence/xai-portraits/live/live-xai-hero.png').resize({width:1200,withoutEnlargement:true}).jpeg({quality:90,mozjpeg:true}).toFile(`${target}/${imageFile}`);
const files=[...audit.map(a=>a.file),imageFile].map(name=>({name,sha256:createHash('sha256').update(readFileSync(`${target}/${name}`)).digest('hex')}));
writeFileSync(`${target}/samples.json`,JSON.stringify({fictional:true,provider:'xAI',model:'grok-imagine-image-2.0',note:'Demonstration artwork and synthetic report answers. Personal portrait-library objects are never publicly listed.',files},null,2));
console.log(JSON.stringify({prepared:files.map(f=>f.name),fictional:true},null,2));
