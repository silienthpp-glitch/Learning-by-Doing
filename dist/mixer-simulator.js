/* Eigenstaendiger didaktischer 8-Kanal-Web-Audio-Mixer.
   Modell fuer Grundlagen, kein Ersatz fuer reale Beschallungs-/Monitorhardware.
*/
(function(){
"use strict";
const NAMES=["Kick","Snare","Bass","Keyboard","Gitarre","Lead Vocal","Backing Vocal","Playback"];
let root=null,ctx=null,master=null,monitor=null,fx=null,output=null,channels=[],players=[],playing=false,position=0,started=0,generation=0,loop=false,monitorMode=false,frame=0;
let statusElement=null;
function $(s){return document.querySelector(s);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function gain(db){return db<=-60?0:Math.pow(10,db/20);}
function note(message){if(statusElement)statusElement.textContent=message;}
function fmt(s){const n=Math.max(0,Math.floor(s||0));return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
function createChannels(){channels=NAMES.map((name,i)=>({name,buffer:null,volume:i===0?-10:-14,preamp:0,hpf:40,eqFreq:500,eqGain:0,pan:0,ratio:1,send:0.1,muted:false,solo:false,nodes:null}));}
function html(){
return '<section class="card aa-mixer"><div class="topic-line"><div><span class="tag">BETA · 8 KANAELE</span><h2>Virtuelles Live-Mischpult</h2></div><span class="small">Eigene Stems oder synthetische Demo</span></div>'+
 '<p>Alle Kanalregler veraendern reale AudioNodes. Bitte mit leiser Systemlautstaerke beginnen; die Demo verwendet kuenstlich erzeugte Toene statt echter Bandaufnahmen.</p>'+
 '<div class="actions"><button id="mx-demo">Demo-Spuren erzeugen</button><button id="mx-play">▶ Play</button><button class="quiet" id="mx-pause">Pause</button><button class="quiet" id="mx-stop">Stop</button><label><input type="checkbox" id="mx-loop"> Loop (gleich lange Stems)</label><label>Abhoeren <select id="mx-listen"><option value="main">Main LR</option><option value="monitor">Monitorbus</option></select></label></div>'+
 '<div class="aa-mixer-status" id="mx-status" role="status">Lade Demo-Spuren oder deine eigenen Audiodateien.</div><div class="aa-mixer-time" id="mx-time">0:00 / 0:00</div>'+
 '<div class="aa-mixer-grid">'+NAMES.map((name,i)=>
 '<article class="aa-channel"><h3>'+esc(name)+'</h3><label>Audio '+(i+1)+'<input class="aa-track-file" type="file" accept="audio/*,.wav,.mp3,.m4a,.flac" data-mx-file="'+i+'"></label><small id="mx-file-name-'+i+'">Demo oder Datei</small>'+
 '<div class="aa-mix-buttons"><button class="quiet" type="button" data-mx-mute="'+i+'" aria-pressed="false">Mute</button><button class="quiet" type="button" data-mx-solo="'+i+'" aria-pressed="false">Solo</button></div>'+
 slider(i,"preamp","Input Gain",-12,12,0,0.5," dB")+
 slider(i,"hpf","HPF",20,300,40,5," Hz")+
 slider(i,"eqFreq","EQ-Frequenz",60,12000,500,10," Hz")+
 slider(i,"eqGain","EQ-Gain",-12,12,0,0.5," dB")+
 slider(i,"ratio","Comp-Ratio",1,6,1,0.5,":1")+
 slider(i,"pan","Pan",-1,1,0,0.1,"")+
 slider(i,"send","Monitor-Send",0,1,.1,.05,"")+
 slider(i,"volume","Fader",-60,6,i===0?-10:-14,.5," dB")+
 '<div class="aa-meter-wrap"><div class="aa-meter" id="mx-meter-'+i+'"></div></div></article>').join("")+'</div>'+
 '<div class="aa-mixer-footer"><p class="small">Monitor-Sends sind hier vor dem Kanal-Fader abgegriffen. Der Monitorbus wird nur bei entsprechender Auswahl abgehört. Demo-Spuren und eigene Audios werden lokal verarbeitet. Importierte Dateien werden nicht dauerhaft gesichert.</p>'+
 '<button class="quiet" id="mx-reset">Regler zuruecksetzen</button></div></section>';
}
function slider(i,key,label,min,max,value,step,suffix){
 return '<label class="aa-mixer-slider">'+label+'<input type="range" data-mx-key="'+key+'" data-mx-index="'+i+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"><output id="mx-out-'+i+'-'+key+'">'+value+suffix+'</output></label>';
}
function ensure(){
 if(ctx)return;
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)throw Error("Web Audio API ist in diesem Browser nicht verfuegbar.");
 ctx=new AC();
 master=ctx.createGain();monitor=ctx.createGain();output=ctx.createGain();
 const compressor=ctx.createDynamicsCompressor();
 compressor.threshold.value=-12;compressor.ratio.value=12;compressor.attack.value=.005;compressor.release.value=.12;
 master.connect(compressor);monitor.connect(compressor);compressor.connect(output);output.connect(ctx.destination);output.gain.value=.25;
 // Unabhaengiger Test-Delay-Weg fuer FX-Beispiele, bewusst gering gehalten.
 const delay=ctx.createDelay(1),feedback=ctx.createGain(),returnGain=ctx.createGain();
 delay.delayTime.value=.15;feedback.gain.value=.12;returnGain.gain.value=.13;
 delay.connect(feedback);feedback.connect(delay);delay.connect(returnGain);returnGain.connect(master);
 fx={delay,feedback,returnGain};
 for(const c of channels){
   const pre=ctx.createGain(),hpf=ctx.createBiquadFilter(),eq=ctx.createBiquadFilter(),comp=ctx.createDynamicsCompressor(),pan=ctx.createStereoPanner(),fader=ctx.createGain(),send=ctx.createGain(),wet=ctx.createGain(),meter=ctx.createAnalyser();
   hpf.type="highpass";eq.type="peaking";eq.Q.value=1.2;
   comp.threshold.value=-18;comp.ratio.value=c.ratio;comp.knee.value=6;
   pre.connect(hpf);hpf.connect(eq);eq.connect(comp);comp.connect(pan);pan.connect(fader);fader.connect(meter);meter.connect(master);
   comp.connect(send);send.connect(monitor);comp.connect(wet);wet.connect(fx.delay);
   meter.fftSize=512;
   c.nodes={pre,hpf,eq,comp,pan,fader,send,wet,meter};
 }
 updateAll();
}
function smooth(param,value){if(ctx)param.setTargetAtTime(value,ctx.currentTime,.018);}
function updateAll(){
 if(!ctx)return;
 const solo=channels.some(c=>c.solo);
 channels.forEach(c=>{
   const n=c.nodes;if(!n)return;
   smooth(n.pre.gain,gain(c.preamp));smooth(n.hpf.frequency,c.hpf);
   smooth(n.eq.frequency,c.eqFreq);smooth(n.eq.gain,c.eqGain);
   smooth(n.comp.ratio,c.ratio);smooth(n.pan.pan,c.pan);
   smooth(n.fader.gain,c.muted||(solo&&!c.solo)?0:gain(c.volume));
   smooth(n.send.gain,c.muted||(solo&&!c.solo)?0:c.send);
   smooth(n.wet.gain,c.muted||(solo&&!c.solo)?0:.05);
 });
 smooth(master.gain,monitorMode?0:1);
 smooth(monitor.gain,monitorMode?1:0);
}
function makeDemo(){
 ensure();halt(true);
 const duration=4,sr=ctx.sampleRate,frames=Math.floor(sr*duration);
 channels.forEach((c,i)=>{
   const b=ctx.createBuffer(1,frames,sr),data=b.getChannelData(0);
   for(let n=0;n<frames;n++){
     const t=n/sr,beat=t%0.5,bar=t%2,env=Math.exp(-beat*7);
     let v=0;
     if(i===0)v=Math.sin(2*Math.PI*(52*t+28*(1-Math.exp(-beat*18)))*t)*Math.exp(-beat*16)*.7;
     if(i===1)v=(Math.sin(n*98.14)*Math.sin(n*0.137)+Math.sin(n*6.19))*Math.exp(-Math.abs((t+.5)%1-.5)*28)*.12;
     if(i===2)v=Math.sin(2*Math.PI*110*t)*(.3+.3*Math.sin(Math.PI*2*2*t)**2);
     if(i===3)v=(Math.sin(2*Math.PI*220*t)+Math.sin(2*Math.PI*277.18*t)+Math.sin(2*Math.PI*329.63*t))*.09;
     if(i===4)v=(Math.sin(2*Math.PI*196*t)+.35*Math.sin(2*Math.PI*588*t))*env*.24;
     if(i===5)v=(Math.sin(2*Math.PI*(220+4*Math.sin(t*4))*t)+.38*Math.sin(2*Math.PI*440*t)+.2*Math.sin(2*Math.PI*880*t))*.17;
     if(i===6)v=(Math.sin(2*Math.PI*329.63*t)+.25*Math.sin(2*Math.PI*659.26*t))*.14;
     if(i===7)v=(Math.sin(n*83.1)+Math.sin(n*143.3))*.04*Math.exp(-beat*27);
     data[n]=Math.max(-1,Math.min(1,v));
   }
   c.buffer=b;
   const info=$("#mx-file-name-"+i);if(info)info.textContent="Synthetische Demo · 4 s";
 });
 note("8 synthetische Demo-Spuren bereit. Starte mit niedrigem Ausgangspegel.");
 updateTime();
}
function duration(){return Math.max(0,...channels.map(c=>c.buffer?.duration||0));}
function now(){return playing&&ctx?Math.max(0,position+(ctx.currentTime-started)):position;}
function updateTime(){const el=$("#mx-time");if(el)el.textContent=fmt(now())+" / "+fmt(duration());}
function halt(reset){
 generation++;playing=false;
 for(const p of players){p.onended=null;try{p.stop();}catch(e){}try{p.disconnect();}catch(e){}}
 players=[];
 if(reset)position=0;
 updateTime();
}
async function play(){
 try{
   ensure();
   const loaded=channels.filter(c=>c.buffer);
   if(!loaded.length){note("Bitte Demo-Spuren erzeugen oder Audiodateien importieren.");return;}
   if(playing)return;
   const token=++generation;
   await ctx.resume();
   // Stop, Trackwechsel oder Navigation waehrend Resume: keinen alten Start ausfuehren.
   if(token!==generation||!channels.length)return;
   if(position>=duration())position=0;
   const when=ctx.currentTime+.065;
   started=when;
   let ended=0;
   players=[];
   for(const c of loaded){
     const p=ctx.createBufferSource();p.buffer=c.buffer;p.loop=loop;
     const startOffset=loop?position % c.buffer.duration:Math.min(position,c.buffer.duration-.00001);
     p.connect(c.nodes.pre);players.push(p);
     p.onended=()=>{if(token!==generation||loop)return;if(++ended===players.length){halt(true);note("Wiedergabe beendet.");}};
     p.start(when,startOffset);
   }
   playing=true;
   note("Wiedergabe aktiv · "+loaded.length+" Spur(en).");
   tick();
 }catch(e){halt(false);note("Wiedergabe konnte nicht gestartet werden: "+e.message);}
}
function pause(){
 if(!playing){generation++;return;}
 position=Math.min(duration(),now());halt(false);note("Pausiert bei "+fmt(position)+".");
}
function tick(){
 if(frame)cancelAnimationFrame(frame);
 const update=()=>{
   if(!playing){frame=0;return;}
   updateTime();
   channels.forEach((c,i)=>{
     if(!c.nodes||!c.buffer)return;
     const buf=new Float32Array(c.nodes.meter.fftSize);c.nodes.meter.getFloatTimeDomainData(buf);
     let peak=0;for(let j=0;j<buf.length;j++)peak=Math.max(peak,Math.abs(buf[j]));
     const el=$("#mx-meter-"+i);if(el)el.style.width=Math.min(100,peak*100)+"%";
   });
   frame=requestAnimationFrame(update);
 };
 frame=requestAnimationFrame(update);
}
async function fileChanged(e){
 const el=e.target,index=Number(el.dataset.mxFile),file=el.files?.[0];if(!file)return;
 const target=channels[index],seq=(target.loadSeq||0)+1;target.loadSeq=seq;
 if(file.size>60*1024*1024){note("Eine Spur darf hoechstens 60 MB gross sein.");el.value="";return;}
 if(!file.type.startsWith("audio/")&&!/\.(wav|mp3|m4a|flac|ogg)$/i.test(file.name)){note("Nicht unterstuetzte Audio-Datei.");el.value="";return;}
 try{
   ensure();
   const data=await file.arrayBuffer();
   const decoded=await ctx.decodeAudioData(data);
   if(channels[index]!==target||target.loadSeq!==seq)return;
   // Der Browser dekodiert komprimierte Dateien vollstaendig in RAM.
   const usedBytes=channels.reduce((sum,c)=>sum+(c===target||!c.buffer?0:c.buffer.length*c.buffer.numberOfChannels*4),0);
   const requestedBytes=usedBytes+decoded.length*decoded.numberOfChannels*4;
   if(requestedBytes>180*1024*1024)throw Error("Zu viele oder zu lange Spuren fuer das lokale Uebungslabor (max. ca. 180 MB dekodiertes Audio).");
   halt(true);
   target.buffer=decoded;
   $("#mx-file-name-"+index).textContent=file.name;
   note(file.name+" geladen. Fuer synchrone Wiedergabe muessen alle Stems am gleichen Zeitpunkt beginnen.");
   updateTime();
 }catch(err){note("Audiodatei konnte nicht dekodiert werden: "+err.message);}
 finally{el.value="";}
}
function bind(){
 statusElement=$("#mx-status");
 $("#mx-demo").onclick=makeDemo;$("#mx-play").onclick=play;$("#mx-pause").onclick=pause;$("#mx-stop").onclick=()=>{halt(true);note("Gestoppt.");};
 $("#mx-reset").onclick=()=>{halt(true);createChannels();if(ctx){disposeNodes();}note("Regler zurueckgesetzt. Bitte Demo oder Dateien erneut laden.");render(root);};
 $("#mx-loop").onchange=e=>{
   loop=e.target.checked;
   if(playing){pause();play();}
   note(loop?"Loop an. Exakt ausgerichtete, gleich lange Stems empfohlen.":"Loop aus.");
 };
 $("#mx-listen").onchange=e=>{monitorMode=e.target.value==="monitor";updateAll();note(monitorMode?"Abhoeren: Monitorbus":"Abhoeren: Main LR");};
 document.querySelectorAll("[data-mx-file]").forEach(x=>x.addEventListener("change",fileChanged));
 document.querySelectorAll("[data-mx-mute]").forEach(b=>b.onclick=()=>{
   const c=channels[Number(b.dataset.mxMute)];c.muted=!c.muted;b.setAttribute("aria-pressed",String(c.muted));b.textContent=c.muted?"Mute ✓":"Mute";updateAll();
 });
 document.querySelectorAll("[data-mx-solo]").forEach(b=>b.onclick=()=>{
   const c=channels[Number(b.dataset.mxSolo)];c.solo=!c.solo;b.setAttribute("aria-pressed",String(c.solo));b.textContent=c.solo?"Solo ✓":"Solo";updateAll();
 });
 document.querySelectorAll("[data-mx-key]").forEach(el=>el.oninput=()=>{
   const c=channels[Number(el.dataset.mxIndex)],key=el.dataset.mxKey;
   c[key]=Number(el.value);
   const suffix=["preamp","eqGain","volume"].includes(key)?" dB":key==="hpf"||key==="eqFreq"?" Hz":key==="ratio"?":1":"";
   $("#mx-out-"+el.dataset.mxIndex+"-"+key).textContent=el.value+suffix;
   updateAll();
 });
}
function disposeNodes(){
 halt(true);
 if(frame){cancelAnimationFrame(frame);frame=0;}
 if(ctx){const old=ctx;ctx=null;old.close().catch(()=>{});}
 master=null;monitor=null;fx=null;output=null;
 channels.forEach(c=>c.nodes=null);
}
function dispose(){disposeNodes();root=null;statusElement=null;players=[];channels=[];}
function render(target){
 if(!target)return;
 root=target;
 if(!channels.length)createChannels();
 root.innerHTML=html();bind();
}
window.AudioMixer={render,dispose};
})();