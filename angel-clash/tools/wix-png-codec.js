// Deterministic pixel-level transparent PNG codec, injected inside the Wix
// ExecuteWixAPI async function. Requires Web Streams, atob/btoa, Blob and
// DecompressionStream/CompressionStream. No Canvas, no image re-generation.
const pngBytes = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const pngBase64 = bytes => {
 let str = "";
 for(let i=0;i<bytes.length;i+=12000)str+=String.fromCharCode(...bytes.subarray(i,i+12000));
 return btoa(str);
};
const pngReadBE = (bytes,i) => ((bytes[i]*16777216)+(bytes[i+1]<<16)+(bytes[i+2]<<8)+bytes[i+3])>>>0;
const pngWriteBE = (bytes,i,v) => {
 bytes[i]=(v>>>24)&255; bytes[i+1]=(v>>>16)&255; bytes[i+2]=(v>>>8)&255; bytes[i+3]=v&255;
};
const pngInflate = async bytes => new Uint8Array(await new Response(
 new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"))
).arrayBuffer());
const pngDeflate = async bytes => new Uint8Array(await new Response(
 new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"))
).arrayBuffer());
const pngCrc = bytes => {
 let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c&1)?(c>>>1)^0xedb88320:c>>>1;}
 return (c^0xffffffff)>>>0;
};
const pngChunk = (tag,chunkData) => {
 const out=new Uint8Array(chunkData.length+12);
 pngWriteBE(out,0,chunkData.length);
 for(let i=0;i<4;i++)out[i+4]=tag.charCodeAt(i);
 out.set(chunkData,8);pngWriteBE(out,out.length-4,pngCrc(out.subarray(4,out.length-4)));
 return out;
};
async function pngDecode(base64) {
 const bytes=pngBytes(base64),w=pngReadBE(bytes,16),h=pngReadBE(bytes,20),depth=bytes[24],color=bytes[25];
 if(depth!==8 || color!==6 || !w || !h)throw new Error("Expected 8-bit RGBA PNG, got "+depth+" "+color);
 let total=0;const chunks=[];let pos=8;
 while(pos+12<=bytes.length){
  const len=pngReadBE(bytes,pos),tag=String.fromCharCode(...bytes.subarray(pos+4,pos+8));
  if(tag==="IDAT"){chunks.push(bytes.slice(pos+8,pos+8+len));total+=len;}
  pos+=12+len;if(tag==="IEND")break;
 }
 const compressed=new Uint8Array(total);pos=0;
 for(const chunk of chunks){compressed.set(chunk,pos);pos+=chunk.length;}
 const filtered=await pngInflate(compressed),pix=new Uint8Array(w*h*4);
 let scan=0,prev=new Uint8Array(w*4);
 for(let y=0;y<h;y++){
  const filter=filtered[scan++],row=new Uint8Array(w*4);
  for(let k=0;k<row.length;k++){
   const a=k>=4?row[k-4]:0,b=prev[k],c=k>=4?prev[k-4]:0;
   let predictor=0;
   if(filter===1)predictor=a;
   else if(filter===2)predictor=b;
   else if(filter===3)predictor=(a+b)>>>1;
   else if(filter===4){
    const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
   }else if(filter!==0)throw new Error("Unsupported PNG filter "+filter);
   row[k]=(filtered[scan++]+predictor)&255;
  }
  pix.set(row,y*w*4);prev=row;
 }
 return {width:w,height:h,pixels:pix};
}
async function pngEncode(w,h,pix){
 const rowBytes=w*4,raw=new Uint8Array((rowBytes+1)*h);
 for(let y=0;y<h;y++)raw.set(pix.subarray(y*rowBytes,(y+1)*rowBytes),y*(rowBytes+1)+1);
 const zip=await pngDeflate(raw),ihdr=new Uint8Array(13);
 pngWriteBE(ihdr,0,w);pngWriteBE(ihdr,4,h);ihdr[8]=8;ihdr[9]=6;
 const parts=[new Uint8Array([137,80,78,71,13,10,26,10]),pngChunk("IHDR",ihdr),pngChunk("IDAT",zip),pngChunk("IEND",new Uint8Array())];
 const joined=new Uint8Array(parts.reduce((s,c)=>s+c.length,0));
 let offset=0;for(const p of parts){joined.set(p,offset);offset+=p.length;}
 return pngBase64(joined);
}