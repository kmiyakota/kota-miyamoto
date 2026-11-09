/** ANGEL CLASH v9.17 Suno soundtrack / recorded-voice-placeholder test.
 * Run: node angel-clash/tests/audio-smoke.test.cjs
 * Simulates AudioContext and HTMLAudioElement, not subjective listening or Safari.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js=src.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(js);new vm.Script(js);
const TITLE='https://music.wixstatic.com/mp3/c3c31e_0bd90bedb4e540bb9e943eb4a3e241be.mp3';
const BATTLE='https://music.wixstatic.com/mp3/c3c31e_ffb5c8da41fd4b36a342916385be0846.mp3';
const media=[],events={},voiceUtterances=[],stats={oscillators:0,noiseSources:0};
let ac=null,frame=()=>{};
const param=()=>({value:1,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
function node(){return {connect(){return this},start(){},stop(){},gain:param(),frequency:param(),detune:{value:0}}}
class FakeAudioContext{
 constructor(){ac=this;this.state='running';this.currentTime=1;this.sampleRate=44100;this.destination={}}
 createOscillator(){stats.oscillators++;return node()}
 createGain(){return node()}
 createBiquadFilter(){return node()}
 createBufferSource(){stats.noiseSources++;return node()}
 createBuffer(c,size){return {getChannelData:()=>new Float32Array(size)}}
 resume(){this.state='running';return Promise.resolve()}
 suspend(){this.state='suspended';return Promise.resolve()}
}
class FakeAudio{
 constructor(url){
  this.src=url;this.volume=1;this.paused=true;this.currentTime=0;this.loop=false;
  this.preload='none';this.listeners={};this.playCalls=0;this.pauseCalls=0;media.push(this);
 }
 addEventListener(type,fn){this.listeners[type]=fn}
 play(){this.paused=false;this.playCalls++;this.listeners.playing?.();return Promise.resolve()}
 pause(){this.paused=true;this.pauseCalls++}
}
const grad={addColorStop(){}};
const canvas=new Proxy({measureText:s=>({width:String(s).length*11}),getImageData:()=>({data:new Uint8ClampedArray(400*400*4)})},{
 get(o,k){if(k in o)return o[k];if(['createLinearGradient','createRadialGradient','createPattern'].includes(k))return()=>grad;
  if(typeof k==='symbol')return undefined;return()=>{}},set(o,k,v){o[k]=v;return true}
});
function el(){return {style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},
 addEventListener(){},getContext:()=>canvas,getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720}),
 querySelectorAll:()=>[],closest:()=>true,append(){},textContent:'',width:1280,height:720,dataset:{}}}
const elements={},document={
 body:el(),documentElement:el(),hidden:false,
 getElementById(k){return elements[k]||(elements[k]=el())},
 createElement(){return el()},querySelectorAll(){return []},
 addEventListener(k,fn){events['document:'+k]=fn}
};
const speechSynthesis={speaking:false,cancel(){},getVoices:()=>[{lang:'ja-JP'}],speak(u){voiceUtterances.push(u.text)}};
const window={
 AudioContext:FakeAudioContext,speechSynthesis,
 SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
 devicePixelRatio:2,matchMedia(){return {matches:false}},
 addEventListener(k,fn){events['window:'+k]=fn}
};
class Image{
 constructor(){this.naturalWidth=0;this.naturalHeight=0;this.listeners={}}
 addEventListener(k,fn){this.listeners[k]=fn}
 set src(v){this.url=v;this.naturalWidth=v.includes('~mv2.')?1600:1280;
  this.naturalHeight=v.includes('~mv2.')?1200:720;
  this.onload?.();this.listeners.load?.()}
 get src(){return this.url}
}
const storage={getItem:()=>null,setItem(){}};
new Function('document','window','navigator','Image','Audio','requestAnimationFrame',
 'setTimeout','localStorage','ResizeObserver','performance','structuredClone',js)(
 document,window,{getGamepads:()=>[]},Image,FakeAudio,fn=>{frame=fn},()=>{},storage,undefined,
 {now:()=>ac?ac.currentTime*1000:0},value=>JSON.parse(JSON.stringify(value)));
const dbg=window.AngelClashDebug;
assert.ok(dbg);
function press(code){events['window:keydown']({code,preventDefault(){}});events['window:keyup']({code,preventDefault(){}})}
assert.equal(dbg.audioStatus().track,'title');
assert.equal(dbg.audioStatus().externalUrl,TITLE);
assert.equal(dbg.audioStatus().gestureUnlocked,false);
assert.equal(media.length,0,'Autoplay should not start before user gesture');
press('Enter');
assert.equal(dbg.audioStatus().gestureUnlocked,true);
assert.equal(dbg.audioStatus().externalActive,true);
assert.equal(media.length,1);
assert.equal(media[0].src,TITLE);
assert.equal(media[0].loop,true);
assert.equal(media[0].playCalls,1);
assert.equal(media[0].paused,false);
assert.equal(media[0].volume,.75*.53);
dbg.start('akari','ito','training');
assert.equal(media[0].paused,true,'Title must stop on entering battle');
assert.equal(dbg.audioStatus().externalUrl,BATTLE);
assert.equal(dbg.audioStatus().externalActive,true);
assert.equal(media.length,2);
assert.equal(media[1].src,BATTLE);
assert.equal(media[1].loop,true);
const fightFiles=['sakura','sea','city','crystal','eclipse'];
let previous=dbg.audioStatus().track,expectedMediaCount=media.length;
for(let stage=0;stage<5;stage++){
 dbg.wardrobeStage(stage);
 assert.equal(dbg.audioStatus().track,fightFiles[stage]);
 assert.equal(dbg.audioStatus().externalUrl,BATTLE);
 assert.equal(dbg.audioStatus().externalActive,true);
 assert.equal(media.at(-1).src,BATTLE);
 if(fightFiles[stage]!==previous)expectedMediaCount++;
 assert.equal(media.length,expectedMediaCount,'Changed stage should restart battle BGM');
 previous=fightFiles[stage];
}
assert.ok(expectedMediaCount>=5,'Most stage changes should restart the track');
assert.equal(dbg.audioStatus().voiceSupported,false,'Synthetic voice fallback must stay disabled');
assert.equal(dbg.previewVoice('akari','super'),false);
assert.equal(voiceUtterances.length,0);
press('KeyM');
assert.equal(dbg.audioStatus().musicVolume,0);
assert.equal(media.at(-1).paused,true,'Music mute should pause the MP3');
press('KeyM');
assert.equal(dbg.audioStatus().musicVolume,75);
assert.equal(dbg.audioStatus().externalActive,true,'Unmute must restart MP3');
assert.equal(media.at(-1).src,BATTLE);
dbg.start('ito','nox','training');
assert.equal(dbg.audioStatus().track,'eclipse');
assert.equal(media.at(-1).src,BATTLE);
// No voice file loaded by default.
assert.equal(dbg.audioStatus().voiceSource,'recorded-files-only');
assert.equal(voiceUtterances.length,0);
console.log('PASS: two Suno MP3s, title autoplay guard, user gesture unlock, five battle stage switches, loop, mute/unmute, TTS disabled');
console.log(JSON.stringify({audioElements:media.length,latestTrack:dbg.audioStatus().track,externalState:dbg.audioStatus().externalState,voiceUtterances:voiceUtterances.length}));
