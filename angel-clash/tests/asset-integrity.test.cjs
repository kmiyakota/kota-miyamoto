/** ANGEL CLASH source integrity test — dependency-free.
 * Run: node angel-clash/tests/asset-integrity.test.cjs
 * Source invariants, NOT approval of every character drawing.
 */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const audit=fs.readFileSync(path.join(root,'sprite-audit.html'),'utf8');
const canon=fs.readFileSync(path.join(root,'CHARACTER_CANON.md'),'utf8');
const retouch=fs.readFileSync(path.join(root,'sprite-retouch.html'),'utf8');
const extract=source=>[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
let total=0;
const test=(description,fn)=>{
 try{fn();total++;console.log('PASS '+description)}
 catch(e){console.error('FAIL '+description+'\n'+e.stack);process.exitCode=1}
};
test('game and QA scripts parse',()=>{
 for(const code of [...extract(html),...extract(audit),...extract(retouch)])new vm.Script(code);
 assert.ok(extract(html).length>=1&&extract(audit).length>=1);
});
test('four canonical identities remain mapped',()=>{
 for(const id of ['ito','akari','tamaki','nox']){
  assert.ok(html.includes(id+':'),id+' metadata missing');
  assert.ok(audit.includes('data-char="'+id+'"'),id+' inspector missing');
 }
 assert.match(canon,/衣都/);assert.match(canon,/灯/);assert.match(canon,/環/);
});
test('no per-pose geometric warp or unstable head scaling',()=>{
 assert.doesNotMatch(html,/g\.scale\(1,\s*stretch\)/);
 assert.doesNotMatch(html,/const u=sc\*meta\.scale/);
 assert.doesNotMatch(html,/headCenter\*u|footY\*u/);
 assert.match(html,/g\.drawImage\(fixedAtlas\|\|im,sx,sy,tw,th,-sw\/2,-sh\+5,sw,sh\)/);
 assert.match(html,/const sw=tw\*sc,sh=th\*sc/);
});
test('principal characters share the same world scale',()=>{
 const match=html.match(/HD_COMBAT_DISPLAY_SCALE=Object\.freeze\((\{[^}]+\})\)/);
 assert.ok(match,'display scale object missing');
 const scales=match[1].match(/(?:ito|akari|tamaki|nox):\s*([.\d]+)/g)||[];
 assert.equal(scales.length,4);
 assert.equal(new Set(scales.map(x=>Number(x.split(':')[1]))).size,1);
});
test('retired blonde or low-resolution source does not re-enter the UI',()=>{
 assert.doesNotMatch(html,/loadImage\('original'/);
 assert.doesNotMatch(html,/loadImage\(id\+'Portrait'/);
 assert.doesNotMatch(html,/const fallback=images\.original/);
 assert.match(html,/const chosen=choosePortraitArt\(id,w,h,detail/);
 assert.match(html,/const im=chosen\?\.image;/);
});
test('high definition cut-ins and quick specials are intact',()=>{
 assert.match(html,/portrait\(cutIn\.id,x,174,350,335,'cinematic'\)/);
 assert.match(html,/portrait\(win\.id,426,140,428,415,'cinematic'\)/);
 for(const binding of ["quickPulse:'KeyQ'","quickRiser:'KeyE'","quickRush:'KeyF'","quickSuper:'KeyT'"])assert.ok(html.includes(binding),binding);
});
test('HD portrait resolution and TAMAKI voice',()=>{
 assert.match(html,/function portraitSourceDensity\(im,w,h\)/);
 assert.match(html,/function choosePortraitArt\(id,w,h,detail/);
 assert.match(html,/Math\.min\(visibleW\/w,visibleH\/h\)/);
 assert.match(html,/quote:'月の静けさこそ、ぼくの力なのだ！'/);
 assert.match(html,/\['QUICK SPECIALS','Q: PROJECTILE/);
});
test('sprite cleanup A/B mode never replaces a different costume atlas',()=>{
 assert.match(html,/function repairedAtlasFor\(f,im\)/);
 assert.match(html,/useCleanedAtlas&&im===images\[f\.id\+'Fight9'\]/);
 assert.match(html,/toggleSpriteCleanup:\(enabled\)/);
 assert.match(html,/if\(just\('F9'\)\)/);
});
test('HD atlas layout follows chosen costume sprite dimensions',()=>{
 assert.match(html,/function usesModernAtlas\(f\)/);
 assert.match(html,/if\(usesModernAtlas\(f\)\)return spriteFrame9\(f\)/);
 assert.doesNotMatch(html,/const modern=!!fighterAtlas9\(f\)/);
});
test('portrait quality selection always prefers adequate source density',()=>{
 assert.match(html,/function portraitSourceDensity\(im,w,h\)/);
 assert.match(html,/if\(solo&&sd>0&&sd>=cd\)/);
 assert.doesNotMatch(html,/sd>=cd\|\|large/);
});
test('audit supports candidate versus original same-pose comparison',()=>{
 assert.match(audit,/id="compareOriginal"/);
 assert.match(audit,/originalBaselines=Object\.create\(null\)/);
 assert.match(audit,/paint\(reference,before\?selected:0,1/);
 assert.match(audit,/URL\.revokeObjectURL/);
});
test('four original-source alpha drafts are audit-only and never loaded in the game',()=>{
 for(const id of [
  'c3c31e_18335341248043bd941a1e1b02809367',
  'c3c31e_d6996052e8b9463ebc9436ea4f7be442',
  'c3c31e_27b7ee6750954f1bbc5d4440664d4461',
  'c3c31e_cd46dafed2a84a81bce45ed53a997d0c'
 ]){
  assert.ok(audit.includes(id),'Audit candidate link absent: '+id);
  assert.ok(!html.includes(id),'Game must never use unapproved candidate: '+id);
 }
 assert.match(audit,/id="loadAlphaDraft"/);
 assert.match(audit,/id="loadEyeDraft"/);
 assert.ok(!html.includes('c3c31e_b5039ed0b76a41578307da8f56fce88a'));
});
test('AKARI uses natural-face 12-pose transparent WebP, no old eye retouch',()=>{
 assert.match(html,/c3c31e_465e674d2bf2438ba00e9073377bfdb9~mv2\.webp/);
 assert.doesNotMatch(html,/c3c31e_16cac0b756874f78863a1b0cf7145efe/);
 assert.match(html,/if\(id==='akari'\)\{combatAtlasStats\.akari=/);
 assert.match(html,/replacedByNaturalFaceArtwork:true/);
 assert.match(html,/poseCount:12,frameWidth:400,frameHeight:400/);
});
test('12 pose indices and fixed-size atlases',()=>{
 assert.match(html,/for\(let k=0;k<12;k\+\+\)/);
 assert.match(html,/naturalWidth===1600&&image\?\.naturalHeight===1200/);
 assert.match(audit,/const POSES=\[/);
 assert.match(audit,/getImageData\(0,0,400,400\)/);
});
test('local-source inspection stays in the browser',()=>{
 assert.match(audit,/URL\.createObjectURL\(file\)/);
 assert.match(audit,/URL\.revokeObjectURL/);
 assert.doesNotMatch(audit,/fetch\([^\n]*method:\s*['"]POST/);
});
test('pixel retouch editor preserves original art dimensions and export transparency',()=>{
 assert.match(retouch,/master\.width=original\.width=1600/);
 assert.match(retouch,/master\.height=original\.height=1200/);
 assert.match(retouch,/function validateImage\(im\)/);
 assert.match(retouch,/if\(transparent<1000\)/);
 assert.match(retouch,/function repairAlphaFringe\(\)/);
 assert.match(retouch,/function applyPoint\(point\)/);
 assert.match(retouch,/function captureFrame\(k\)/);
 assert.match(retouch,/master\.toBlob\(blob=>/);
 assert.match(retouch,/type==='image\/png'/);
 assert.match(retouch,/tool==='clone'/);
 assert.doesNotMatch(retouch,/fetch\(/);
});
console.log('Completed '+total+' integrity checks. Runtime and visual master QA are separate.');
if(process.exitCode)process.exit(process.exitCode);
