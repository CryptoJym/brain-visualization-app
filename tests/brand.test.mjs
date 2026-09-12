import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url));
test('approved logo variants are path-based SVG, with no external resources',()=>{
 for(const variant of ['light','dark'])for(const type of ['lockup','mark']){const s=read(`public/brand/logo-${type}-${variant}.svg`).toString();assert.match(s,/<svg/);assert.match(s,/<path/);assert.doesNotMatch(s,/<script|<text|<image|<foreignObject|\sonload=|href=/i);}
});
test('favicon ICO contains four actual icon sizes',()=>{const b=read('public/favicon.ico');assert.equal(b.readUInt16LE(2),1);assert.equal(b.readUInt16LE(4),4);assert.deepEqual([0,1,2,3].map(i=>b[6+i*16]),[16,32,48,64]);});
test('PNG icons have the declared dimensions',()=>{
 for(const [path,size] of [['apple-touch-icon.png',180],['brand/favicon-32.png',32],['brand/favicon-192.png',192],['brand/favicon-512.png',512],['brand/icon-maskable-512.png',512]]){const b=read('public/'+path);assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size);}
});
test('manifest does not imply unsupported standalone/offline capability',()=>{const m=JSON.parse(read('public/site.webmanifest'));assert.equal(m.display,'browser');assert.equal(m.icons.filter(i=>i.purpose==='maskable').length,1);});
test('metadata references versioned icons and local assets',()=>{const s=read('index.html').toString();assert.match(s,/favicon\.svg\?v=cc-brand-20260912/);assert.match(s,/apple-touch-icon/);assert.match(s,/site\.webmanifest/);assert.match(s,/og:image/);});
test('every active page uses the shared identity component',()=>{for(const name of ['CortexCompass','CompassReports','InsightReflection']){const s=read(`src/components/${name}.jsx`).toString();assert.match(s,/import CortexBrand/);assert.doesNotMatch(s,/<span className="cc-mark">◇/);}});
test('paper variant and print picture use the light logo',()=>{const s=read('src/components/CortexBrand.jsx').toString();assert.match(s,/variant==='paper'/);assert.match(s,/media="print"/);assert.match(s,/alt="Cortex Compass"/);});
