/** ANGEL CLASH v9.15 original BGM / system-voice smoke test.
 * node angel-clash/tests/audio-smoke.test.cjs
 * WebAudio and speechSynthesis are simulated; no human listening QA.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'Inline game script not found');new vm.Script(script);
const events={},nodes={oscillator:0,buffer:0},utterances=[];
let contextInstance=null,animationFrame=()=>{};
const param=()=>({value:1,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
function audioNode(){
 const node={connect(){return node},start(){},stop(){},frequency:param(),gain:param(),detune:{value:0},buffer:null};
 return node;
}
class FakeAudioContext{
 constructor(){contextInstance=this;this.state='running';this.currentTime=5;this.sampleRate=48000;this.destination={};}
 createGain(){return audioNode()}
 createOscillator(){nodes.oscillator++;return audioNode()}
 createBufferSource(){nodes.buffer++;return audioNode()}
 createBiquadFilter(){return audioNode()}
 createBuffer(ch,length){return {getChannelData(){return new Float32Array(length)}}}
 resume(){this.state='running';return Promise.resolve()}
 suspend(){this.state='suspended';return Promise.resolve()}
}
const speechSynthesis={
 speaking:false,
 getVoices(){return [{name:'ja-jp local',lang:'ja-JP'}]},
 cancel(){this.speaking=false},
 speak(u){utterances.push({text:u.text,lang:u.lang,rate:u.rate,pitch:u.pitch});
   this.speaking=true;u.onstart?.();u.onend?.();this.speaking=false;}
};
class Utterance{constructor(text){this.text=text}}
const canvasCtx=new Proxy({measureText(text){return {width:String(text).length*12}}},
 {get(target,key){if(key in target)return target[key];
  if(key==='createLinearGradient'||key==='createRadialGradient'||key==='createPattern')
   return()=>({addColorStop(){}});
  if(typeof key==='symbol')return undefined;
  return ()=>{};},set(target,key,value){target[key]=value;return true;}});
function element(){
 return {style:{},textContent:'',dataset:{},width:1280,height:720,
  classList:{add(){},remove(){},toggle(){},contains(){return false}},
  addEventListener(){},getContext(){return canvasCtx},getBoundingClientRect(){return {width:1280,height:720}},
  querySelectorAll(){return []},closest(){return true},setPointerCapture(){}};
}
const elements={},document={
 body:element(),documentElement:element(),hidden:false,
 createElement(){return element()},querySelectorAll(){return []},
 getElementById(id){return elements[id]||(elements[id]=element())},
 addEventListener(name,fn){events['document:'+name]=fn;}
};
const window={
 AudioContext:FakeAudioContext,SpeechSynthesisUtterance:Utterance,speechSynthesis,
 devicePixelRatio:1,ANGEL_CLASH_STANDALONE:true,
 matchMedia(){return {matches:false}},addEventListener(name,fn){events['window:'+name]=fn}
};
class Image{
 constructor(){this.naturalWidth=0;this.naturalHeight=0;this.listeners={}}
 addEventListener(name,fn){this.listeners[name]=fn}
 set src(value){this.url=value;
  if(value.includes('~mv2.')){this.naturalWidth=1600;this.naturalHeight=1200}
  else {this.naturalWidth=1280;this.naturalHeight=720}
  this.onload?.();this.listeners.load?.()}
 get src(){return this.url}
}
class Audio{constructor(){throw Error('No MP3 request should occur without a configured track')}}
const storage={getItem(){return null},setItem(){}};
new Function('document','window','navigator','Image','Audio','requestAnimationFrame',
 'setTimeout','localStorage','ResizeObserver','performance','structuredClone',script)(
 document,window,{getGamepads(){return []}},Image,Audio,fn=>{animationFrame=fn},
 ()=>{},storage,undefined,{now(){return contextInstance?contextInstance.currentTime*1000:0}},
 value=>JSON.parse(JSON.stringify(value))
);
const debug=window.AngelClashDebug;
assert.ok(debug,'Debug hooks missing');
assert.equal(debug.audioStatus().context,'locked');
assert.equal(debug.audioStatus().track,'title');
assert.equal(debug.audioStatus().voiceVolume,70);
function press(code){
 events['window:keydown']({code,preventDefault(){}});
 events['window:keyup']({code,preventDefault(){}});
}
press('Enter'); // User gesture unlocks audio on iOS / desktop.
for(let i=0;i<80;i++){contextInstance.currentTime+=.05;animationFrame(i*17);}
assert.equal(debug.audioStatus().context,'running');
assert.ok(debug.audioStatus().notesScheduled>40,'Procedural BGM scheduled no notes');
assert.ok(nodes.oscillator>20,'WebAudio synthesizer was not used');
assert.equal(debug.audioStatus().voiceSupported,true);
debug.start('ito','nox','training');
assert.equal(debug.audioStatus().track,'eclipse');
assert.ok(utterances.some(u=>u.text.includes('日蝕の門')),'NOX introduction not spoken');
debug.start('akari','ito','training');
debug.wardrobeStage(0);assert.equal(debug.audioStatus().track,'sakura');
debug.wardrobeStage(1);assert.equal(debug.audioStatus().track,'sea');
debug.wardrobeStage(2);assert.equal(debug.audioStatus().track,'city');
debug.wardrobeStage(3);assert.equal(debug.audioStatus().track,'crystal');
debug.wardrobeStage(4);assert.equal(debug.audioStatus().track,'eclipse');
debug.setMeter(0,100);debug.move(0,'super');
assert.ok(utterances.some(u=>u.text.includes('スピード')),'AKARI super voice not spoken');
const count=utterances.length;
press('KeyV');assert.equal(debug.audioStatus().voiceVolume,0);
assert.equal(debug.previewVoice('tamaki','win'),false);
assert.equal(utterances.length,count,'Muted voice was still spoken');
press('KeyV');assert.equal(debug.audioStatus().voiceVolume,70);
assert.equal(debug.previewVoice('tamaki','win'),true);
assert.ok(utterances.at(-1).text.includes('なのだ'),'TAMAKI voice is not canonical');
press('KeyM');assert.equal(debug.audioStatus().musicVolume,0);
press('KeyM');assert.equal(debug.audioStatus().musicVolume,75);
console.log('PASS: 9 original themes configured, WebAudio unlocked after gesture, title music scheduled, 5 stage themes, NOX/AKARI/TAMAKI voices, music/voice mute and restore');
console.log(JSON.stringify({oscillators:nodes.oscillator,noiseSources:nodes.buffer,voices:utterances.length,notesScheduled:debug.audioStatus().notesScheduled}));
