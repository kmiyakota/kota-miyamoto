/** ANGEL CLASH Canvas2D runtime smoke tests, dependency-free.
 * Run: node angel-clash/tests/runtime-smoke.test.cjs
 * This tests game logic and drawing invariants only. It does not perform visual
 * or real-PC/iPhone testing. All image dimensions in this test are simulated.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'Inline game script not found');
new vm.Script(js);
const IDS=['ito','akari','tamaki','nox'];
const MOVES=['lp','hp','lk','hk','pulse','riser','rush','super'];
function runMock(withHD){
 const stats={matchups:0,moves:0,drawCalls:0,atlasDrawCalls:0,invalid:0};
 const gradient={addColorStop(){}};
 const context=new Proxy({
  globalAlpha:1,measureText(t){return {width:String(t).length*12}},
  getImageData(){return {data:new Uint8ClampedArray(400*400*4)}}
 },{
  get(o,k){
   if(k in o)return o[k];
   if(['createRadialGradient','createLinearGradient','createPattern'].includes(k))return()=>gradient;
   if(typeof k==='symbol')return undefined;
   return (...a)=>{
    if(k!=='drawImage')return;
    stats.drawCalls++;
    if(a.slice(1).some(x=>typeof x==='number'&&!Number.isFinite(x)))stats.invalid++;
    // 4×3 current sprite atlases: source frames must be 400px square.
    if(a.length===9&&a[3]===400&&a[4]===400){
     stats.atlasDrawCalls++;
     const [image,sx,sy,sw,sh,dx,dy,dw,dh]=a;
     if(sx<0||sy<0||sx+sw>1600||sy+sh>1200||dw<=0||dh<=0)stats.invalid++;
     if(Math.abs(dw/dh-sw/sh)>0.00001)stats.invalid++;
    }
   };
  },
  set(o,k,v){o[k]=v;return true}
 });
 function el(){
  return {style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},
   addEventListener(){},removeEventListener(){},querySelectorAll(){return []},
   querySelector(){return el()},setAttribute(){},append(){},
   getContext(){return context},getBoundingClientRect(){return {width:1280,height:720}},
   width:1280,height:720,textContent:''};
 }
 const elems={},document={
  body:el(),documentElement:el(),getElementById(id){return elems[id]||(elems[id]=el())},
  createElement(){return el()},querySelector(){return el()},querySelectorAll(){return []},
  addEventListener(){}
 };
 const window={
  devicePixelRatio:withHD?2:1,
  matchMedia(){return {matches:false}},
  addEventListener(){},innerWidth:1280,innerHeight:720
 };
 const navigator={getGamepads(){return []}};
 class Image{
  constructor(){this.naturalWidth=0;this.naturalHeight=0;}
  set src(v){
   this.url=v;
   // Pretend only the known optional source files are decoded.
   if(withHD&&v.includes('~mv2.webp')){this.naturalWidth=1600;this.naturalHeight=1200;}
   if(withHD&&v.includes('~mv2.png')){this.naturalWidth=1400;this.naturalHeight=1800;}
  }
  get src(){return this.url}
  addEventListener(){}
 }
 class Audio{constructor(){this.paused=true;this.volume=1}pause(){}play(){return Promise.resolve()}addEventListener(){}}
 const storage={getItem(){return null},setItem(){}};
 new Function('document','window','navigator','Image','Audio','requestAnimationFrame',
 'setTimeout','localStorage','ResizeObserver','performance',js)(
 document,window,navigator,Image,Audio,()=>0,()=>0,storage,undefined,{now(){return 0}}
 );
 const debug=window.AngelClashDebug;
 assert.ok(debug,'Debug hooks were not installed');
 for(const a of IDS)for(const b of IDS){
  if(a===b)continue;
  debug.start(a,b,'training');debug.tick(6);
  assert.equal(debug.state().scene,'fight');
  stats.matchups++;
  for(const move of MOVES){
   debug.setMeter(0,100);debug.move(0,move);debug.tick(3);stats.moves++;
  }
 }
 assert.equal(stats.invalid,0,'Invalid drawImage bounds, aspect or coordinates');
 assert.equal(stats.matchups,12);
 assert.equal(stats.moves,96);
 if(withHD)assert.ok(stats.atlasDrawCalls>0,'No HD atlas frames drawn');
 return stats;
}
const fallback=runMock(false),hd=runMock(true);
console.log('Fallback:',JSON.stringify(fallback));
console.log('Mock-HD:',JSON.stringify(hd));
console.log('PASS: 24 matchups, 192 requested moves, zero sprite rectangle/aspect violations');
