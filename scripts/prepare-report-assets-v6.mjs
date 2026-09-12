import {createRequire} from 'node:module';
import {statSync} from 'node:fs';
const require=createRequire(import.meta.url);
const sharp=require(process.env.CORTEX_SHARP_MODULE||'sharp');
for(const name of ['surface','right','cutaway','deep']){
 const source=`public/reports/brain-${name}.webp`,dest=`public/reports/brain-${name}.jpg`;
 await sharp(source).resize({width:1020}).jpeg({quality:85,mozjpeg:true}).toFile(dest);
 console.log(dest,statSync(dest).size);
}
