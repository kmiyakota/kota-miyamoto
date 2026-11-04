/* ANGEL CLASH: animated character renderer — independent keyframe poses */
(function(){
const palettes=[
 {hair:'#ffd05a',shadow:'#bf7c38',dress:'#f16bb1',trim:'#fff1fa',wing:'#ffb4e0',eye:'#9b4a4b',ribbon:'#f42c86'},
 {hair:'#503d43',shadow:'#292532',dress:'#71b5ef',trim:'#f4fbff',wing:'#f7faff',eye:'#4a445c',ribbon:'#77cfff'},
 {hair:'#664391',shadow:'#38274e',dress:'#65458b',trim:'#d6b8fa',wing:'#38294f',eye:'#5a3979',ribbon:'#ad6add'}];
function shape(ctx,points,fill,stroke,width=1){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
function oval(ctx,x,y,rx,ry,col){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(ctx,points,col,w){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function bow(ctx,x,y,col){shape(ctx,[[x,y],[x-24,y-15],[x-23,y+13]],col,'#8c355f',1.5);shape(ctx,[[x,y],[x+23,y-15],[x+23,y+13]],col,'#8c355f',1.5);oval(ctx,x,y,7,8,'#fff3f8')}
function render(f){const ctx=g,q=palettes[f.id],phase=frame*.16,step=Math.sin(phase),bounce=f.attack?0:Math.abs(step)*2.5,move=f===p?(keys.a||keys.d):Math.abs(e.x-p.x)>130,duck=f.pose===3&&f.y===0,hit=f.stun>0,atk=f.attack>0,kick=atk&&f.pose===2,punch=atk&&!kick,jump=f.y<0,scale=duck?.77:1;
ctx.save();ctx.translate(f.x,445+f.y+bounce);ctx.scale(f.face,scale);
const walk=move&&!atk?step*.6:0,arm=atk?1:0;
oval(ctx,0,4,42,8,'#241a3e77');
ctx.translate(0,duck?31:0);
const wingPulse=Math.sin(phase*.7)*7;
if(f.id!==0){for(let s of [-1,1]){ctx.save();ctx.scale(s,1);shape(ctx,[[12,-115],[45,-154+wingPulse],[71,-159+wingPulse],[65,-133],[91,-126],[71,-104],[57,-91],[20,-104]],q.wing,q.shadow,2);line(ctx,[[25,-112],[61,-139+wingPulse],[72,-147+wingPulse]],f.id===1?'#c9dded':'#70548b',2);ctx.restore()}}
if(f.id===0){for(let i=0;i<5;i++){const sway=Math.sin(phase*.7+i*.6)*8;line(ctx,[[-18+i*7,-167],[-42+i*4+sway,-126],[-37+i*4+sway*1.4,-62]],i%2?q.shadow:q.hair,9)}}
const legSpread=jump?16:walk*12;
line(ctx,[[-11,-60],[-13-legSpread,-36],[-12+walk*13,-11]],'#f7d6c8',15);
line(ctx,[[12,-60],[15+legSpread,-36],[13-walk*13,-11]],'#f7d6c8',15);
line(ctx,[[-12+walk*13,-29],[-12+walk*13,-11]],q.trim,13);
line(ctx,[[13-walk*13,-29],[13-walk*13,-11]],q.trim,13);
shape(ctx,[[-24+walk*13,-12],[-4+walk*13,-12],[0+walk*13,0],[-29+walk*13,0]],q.dress,q.shadow,1);
shape(ctx,[[3-walk*13,-12],[24-walk*13,-12],[29-walk*13,0],[0-walk*13,0]],q.dress,q.shadow,1);
shape(ctx,[[-22,-112],[22,-112],[30,-76],[23,-57],[-23,-57],[-30,-76]],q.dress,q.shadow,2);
for(let j=0;j<5;j++){let x=-29+j*14;shape(ctx,[[x,-69],[x+15,-69],[x+12,-49+(j%2)*4],[x-8,-48]],j%2?q.trim:q.dress,q.shadow,1)}
line(ctx,[[-16,-104],[-31,-86],[-27+walk*7,-68]],'#f7d6c8',12);
const fistY=punch?-115:jump?-96:-82,fistX=punch?89:36;
line(ctx,[[17,-104],[37,-92],[fistX,fistY]],'#f7d6c8',13);
oval(ctx,fistX,fistY,9,9,q.trim);
if(kick){line(ctx,[[11,-57],[53,-77],[98,-111]],q.trim,19);oval(ctx,98,-111,13,9,q.dress)}
shape(ctx,[[-22,-116],[-14,-130],[16,-130],[24,-116]],q.trim);
oval(ctx,0,-149,27,32,'#f8d9c9');
oval(ctx,-1,-174,30,25,q.hair);
shape(ctx,[[-28,-174],[-26,-139],[-15,-154],[-6,-166],[5,-151],[12,-169],[27,-149],[29,-176]],q.hair,q.shadow,1.5);
if(f.id===0){bow(ctx,-27,-179,q.ribbon);line(ctx,[[-24,-164],[-42,-130],[-35,-105]],q.hair,12)}
if(f.id===1){shape(ctx,[[-29,-173],[-37,-135],[-20,-142],[-17,-165]],q.hair);shape(ctx,[[25,-175],[35,-139],[19,-147]],q.hair)}
if(f.id===2){shape(ctx,[[-27,-169],[-35,-133],[-17,-141]],q.hair);shape(ctx,[[25,-169],[34,-134],[18,-143]],q.hair)}
oval(ctx,9,-152,4.2,6,q.eye);oval(ctx,-11,-152,3.7,5.8,q.eye);oval(ctx,10,-154,1.5,2,'white');oval(ctx,-10,-154,1.5,2,'white');
if(f.id===2){ctx.strokeStyle='#dfb8ff';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(-10,-151,10,0,7);ctx.arc(10,-151,10,0,7);ctx.moveTo(0,-153);ctx.lineTo(1,-153);ctx.stroke()}
line(ctx,[[-3,-137],[4,-137]],'#bb737d',1.5);
if(atk){ctx.globalAlpha=Math.min(1,f.attack/9);ctx.strokeStyle=q.trim;ctx.lineWidth=5;ctx.beginPath();ctx.arc(kick?101:86,kick?-110:-116,21,-1.1,1.1);ctx.stroke();ctx.globalAlpha=1}
if(hit){ctx.fillStyle='#fff9';ctx.fillRect(-34,-188,70,185)}
ctx.restore()}
drawF=render;
})();