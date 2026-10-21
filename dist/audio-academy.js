/* Audio & Live Sound: modulare Erweiterung fuer Learning by Doing.
   Lokale Audiodateien verlassen den Browser nicht. Kein fremder Code / keine API erforderlich.
*/
(function(){
  "use strict";
  const TRACKS = [
    {id:"grundlagen",name:"Audiogrundlagen",level:"Anfänger",icon:"◉",description:"Schall, Frequenz, Pegel, Signalfluss und Anschlüsse."},
    {id:"recording",name:"Recording",level:"Anfänger",icon:"●",description:"Mikrofone, Aufnahmen, Monitoring und saubere Takes."},
    {id:"mixing",name:"Mixing",level:"Anfänger bis Profi",icon:"≋",description:"Balance, Gain, EQ, Panorama und Masking."},
    {id:"effekte",name:"Effekte",level:"Fortgeschritten",icon:"✳",description:"Kompression, Hall, Delay, Gate und Dynamik."},
    {id:"daws",name:"DAWs",level:"Alle Stufen",icon:"▣",description:"Logic Pro, Ableton Live, FL Studio und GarageBand."},
    {id:"digital",name:"Digitale Mischpulte",level:"Fortgeschritten",icon:"▦",description:"Allen & Heath, X32/Wing, Yamaha und Patching."},
    {id:"analog",name:"Analoge Mischpulte",level:"Anfänger",icon:"☷",description:"Kanalzüge, Aux, PFL, Insert und Subgruppen."},
    {id:"live",name:"Live-Sound-Praxis",level:"Fortgeschritten",icon:"◈",description:"Soundcheck, Monitor-Mixe, Kirche und Konzert."},
    {id:"troubleshoot",name:"Fehlersuche",level:"Alle Stufen",icon:"⚒",description:"Kein Signal, Feedback, Brummen und Clipping."}
  ];
  const LESSONS = [
    {id:"hz-db",track:"grundlagen",title:"Schall, Hertz und Dezibel",goal:"Frequenzen und Pegel unterscheiden.",simple:"Hertz (Hz) beschreibt, wie oft eine Schwingung pro Sekunde auftritt. Dezibel (dB) beschreibt ein Verhaeltnis von Pegeln; je nach Bezug bedeutet dBFS, dBu oder dB SPL etwas anderes.",technical:"dBFS bezieht sich auf digitale Vollaussteuerung: 0 dBFS ist bei linearem PCM der hoechste Samplepegel. dB SPL ist Schalldruckpegel und nicht mit dBFS gleichzusetzen.",example:"Bei einer tiefen Kick liegt viel Energie im Bass. Eine Stimme besitzt Grundton und Obertöne; ihre Verständlichkeit kommt nicht von einer einzigen Frequenz.",practice:"Hoere eine Stimme oder Gitarre im EQ-Labor an und hebe testweise 250 Hz sowie 3 kHz getrennt an. Achte auf den Unterschied, nicht auf eine vermeintlich perfekte Einstellung."},
    {id:"signalfluss",track:"grundlagen",title:"Signalweg, Gain und Headroom",goal:"Einen Kanal sicher einpegeln.",simple:"Das Signal laeuft von Mikrofon oder Instrument ueber den Eingang und die Bearbeitung zum Kanal-Fader und danach zu einem Ausgang. Gain sitzt meist weit vorne, der Fader weiter hinten.",technical:"Clipping in einer fruehen Stufe laesst sich durch spaeteres Absenken des Faders nicht beheben. Ausreichend Headroom reserviert Platz fuer Pegelspitzen.",example:"Wenn ein Mikrofonvorverstaerker bereits verzerrt, hilft es nicht, nur den Main-Fader zu senken.",practice:"Zeichne deinen Kanalweg: Mikrofon → Preamp → HPF → EQ → Fader → Main LR. Markiere, wo du Clipping ueberpruefen wuerdest."},
    {id:"aufnahme",track:"recording",title:"Gesang sicher aufnehmen",goal:"Eine verstaendliche und verzerrungsfreie Aufnahme erstellen.",simple:"Stelle das Mikrofon passend auf, nutze Popfilter bei Bedarf und achte auf einen konstanten Abstand. Stelle den Gain bei den lautesten Stellen ein.",technical:"Direct Monitoring kann Verzoegerung vermeiden. Aufnahmepegel benoetigen Reserve fuer unerwartete Spitzen; 0 dBFS darf nicht als Zielpegel missverstanden werden.",example:"Beim lautesten Refrain clippt die Aufnahme. Senke den Eingangs-Gain, nicht erst den DAW-Spurfader.",practice:"Nimm zwei kurze Takes mit unterschiedlichen Mikrofonabstaenden auf und vergleiche Klang, Popgeraeusche und Pegel."},
    {id:"editing",track:"recording",title:"Takes, Comping und Editing",goal:"Mehrere Aufnahmen sinnvoll zu einem Take verbinden.",simple:"Ein Take ist ein Aufnahmeversuch. Beim Comping waehlt man passende Abschnitte verschiedener Takes aus. Fades verhindern harte Schnittkanten.",technical:"Schnitte an Nulldurchgaengen oder mit Crossfades reduzieren Klickgeraeusche. Punch-In ersetzt gezielt eine Passage.",example:"Ein Satz ist in Take 1 gut, das Ende klingt in Take 2 besser: Per Comping kombinierst du die besten Stellen.",practice:"Schneide zwei kurze Takes in deiner DAW und hoere mit sowie ohne Crossfade auf Klickgeraeusche."},
    {id:"balance",track:"mixing",title:"Balance vor Plugins",goal:"Fader, Pan und Arrangement als erste Werkzeuge einsetzen.",simple:"Ein guter Mix beginnt bei passenden Lautstaerken. Wenn Stimmen und Instrumente sich verdecken, pruefe zuerst Balance und Arrangement.",technical:"Maskierung entsteht, wenn aehnliche Frequenzanteile und Pegel sich ueberlagern. Mit Panorama, Dynamik und gezieltem EQ laesst sich Raum schaffen.",example:"Eine Gitarre verdeckt die Stimme: Die Loesung ist nicht automatisch, beide Spuren heller zu machen.",practice:"Hoere einen Song leise. Welche Quelle ist zu dominant? Notiere eine Balancemassnahme, bevor du EQ einsetzt."},
    {id:"param-eq",track:"mixing",title:"Parametrischer EQ in der Praxis",goal:"Frequenz, Gain und Q nach Gehoer einstellen.",simple:"Frequenz bestimmt, WO du bearbeitest, Gain bestimmt WIE STARK und Q bestimmt WIE BREIT. Ein Hochpass schwaecht tiefe Frequenzen ab.",technical:"Ein hoher Q-Wert beschreibt bei Peaking-Filtern eine schmale Bandbreite. Filter wirken auf das vorhandene Spektrum; der gleiche Wert klingt je nach Aufnahme unterschiedlich.",example:"Eine Stimme klingt boxig. Suche den Bereich mit einem schmalen Boost und reduziere bei Bedarf vorsichtig, statt eine feste Zahl auswendig zu lernen.",practice:"Oeffne das EQ-Labor. Setze Q auf 1,2, hebe bei 400 Hz um 6 dB an und vergleiche A/B. Kehre dann auf 0 dB zurueck."},
    {id:"compressor",track:"effekte",title:"Kompression verstehen",goal:"Threshold, Ratio, Attack und Release erklaeren.",simple:"Ein Kompressor verringert Pegelunterschiede, wenn das Eingangssignal einen eingestellten Schwellenwert uebersteigt.",technical:"Ratio 4:1 bedeutet idealisiert oberhalb des Thresholds: +4 dB Eingang fuehren ungefaehr zu +1 dB Ausgang. Attack, Release und Knee beeinflussen den zeitlichen Verlauf.",example:"Ein Sprecher wird gelegentlich sehr laut. Moderate Kompression kann die Schwankung reduzieren, ersetzt aber keine saubere Mikrofontechnik.",practice:"Teste in deiner DAW einen Kompressor mit grober Ratio 2:1 und vergleiche laute Worte mit Bypass bei gleichem wahrgenommenem Pegel."},
    {id:"reverb-delay",track:"effekte",title:"Hall, Delay und Sends",goal:"Effektanteil und Direktklang trennen.",simple:"Hall simuliert Reflexionen. Delay wiederholt Signale. Mit einem Send kannst du mehrere Kanäle an einen gemeinsamen Effektweg schicken.",technical:"Ein Wet/Dry-Mix mischt bearbeitetes und unbearbeitetes Signal; bei Send-Returns steht das Effektgerät oft auf 100 % Wet.",example:"Die Gesangsstimme ist kaum zu verstehen, weil der Hall zu lang ist. Reduziere zuerst den Hallanteil und pruefe die Abklingzeit.",practice:"Teste in Logic oder Ableton einen Hall als Send, nicht nur als Insert. Vergleiche kurze und lange Decay-Zeiten."},
    {id:"daw-basic",track:"daws",title:"DAWs verstehen statt Shortcuts auswendig lernen",goal:"Spuren, Inserts, Sends, Busse und Bounce erkennen.",simple:"Logic Pro, Ableton Live, FL Studio und GarageBand verwenden dieselben Grundideen: Spuren, Pegel, Effekte und Export.",technical:"MIDI enthaelt Steuerdaten, Audio ist aufgenommenes oder berechnetes Signal. Inserts liegen im Signalweg, Sends zweigen fuer zusaetzliche Mischungen ab.",example:"Ein Reverb-Send verhaelt sich in Logic oder Ableton im Prinzip gleich, selbst wenn der Weg zur Funktion anders heisst.",practice:"Erstelle in deiner bevorzugten DAW eine Audio- und eine MIDI-Spur, leite die Audio-Spur auf einen Hall-Bus und exportiere eine kurze Datei."},
    {id:"ah",track:"digital",title:"Digitale Mixer: Kanal, Bus und Patching",goal:"Patching und Sends on Fader verstehen.",simple:"Digitale Mixer ordnen physische Eingänge flexiblen Kanälen zu. Ein Aux- oder Mix-Bus erstellt einen separaten Mix, etwa fuer einen Monitor.",technical:"Bei Allen & Heath QU/SQ, Behringer X32/Wing oder Yamaha veraendern die Bedienoberflaechen die Signalflussprinzipien nicht. Scenes, DCA, FX Return und Recall-Safe unterscheiden sich je nach Geraet.",example:"Der Saenger braucht mehr Stimme auf seinem Monitor. Waehle den entsprechenden Mix-Bus und stelle dessen Send-Anteile ein.",practice:"Skizziere fuer eine Band Input 1–8, Main LR und zwei Monitorbusse. Markiere, wo ein falsch gepatchter Eingang das Signal verschwinden laesst."},
    {id:"analog-strip",track:"analog",title:"Analoger Kanalzug",goal:"PFL, Insert, Aux und Subgruppe zuordnen.",simple:"Auf analogen Pulten zeigt die physische Anordnung haeufig den Signalfluss: Vorverstaerker, EQ, Aux, Pan und Fader.",technical:"Ein Pre-Fader-Aux kann unabhaengiger vom Hauptfader sein. PFL dient zum Vorhoeren vor dem Fader; genaue Signalpunkte sind modellabhaengig.",example:"Ein Monitor wird nicht lauter, wenn du den Main-Fader hochziehst? Pruefe, ob der Aux pre-fader arbeitet.",practice:"Zeichne Kanalzug und signalisiere, welches Bedienelement FOH und Monitorveraenderungen beeinflusst."},
    {id:"soundcheck",track:"live",title:"Soundcheck in einer kleinen Veranstaltung",goal:"Eine nachvollziehbare Checkliste anwenden.",simple:"Pruefe erst Strom- und Signalwege, dann Kanal fuer Kanal Gain und Routing. Danach erst Balance, EQ, Monitore und Effekte.",technical:"FOH und Monitor-Anforderungen unterscheiden sich. Passe Pegel, Mikrofonposition und Lautsprecherabstrahlung an, um akustische Rueckkopplung zu minimieren.",example:"Kirche: Pastor-Mikrofon, Playback, Drums, Bass, Keys und Gesang benoetigen saubere Kanalnamen und eigene Monitoring-Loesungen.",practice:"Entwirf eine Inputliste fuer acht Kanäle. Beschreibe, in welcher Reihenfolge du die Signale beim Soundcheck pruefst."},
    {id:"kein-signal",track:"troubleshoot",title:"Kein Ton: systematisch suchen",goal:"Signalprobleme ohne Raten eingrenzen.",simple:"Beginne an der Quelle und gehe Schritt fuer Schritt durch Kabel, Vorverstaerker, Routing, Mute und Ausgang.",technical:"Nutze Pegelanzeigen bzw. PFL an Zwischenpunkten. Erst wenn an einer Stufe noch Signal anliegt und an der naechsten nicht, hast du die fehlerhafte Stelle eingegrenzt.",example:"Das Mikrofon ist sichtbar an Input 4 angeschlossen, aber Kanal 4 zeigt keinen Pegel. Pruefe Patch und Preamp, bevor du EQ aenderst.",practice:"Erstelle eine Liste von mindestens fuenf Ursachen und sortiere sie nach der Signalreihenfolge."}
  ];
  const COMPARE = [
    ["Audio aufnehmen","Audio- und MIDI-Spuren","Audio- und MIDI-Spuren","Audio- und MIDI-Spuren","Audio- und MIDI-Spuren"],
    ["Live-Performance","Loop- und Live-Loops-Workflows","Session View","Performance Mode","Live Loops"],
    ["Mischbusse","Busse / Sends","Returns / Gruppen","Mixer-Routing","Busse / Sends"],
    ["Automationen","Spur- und Plugin-Automation","Automation / Modulation","Events / Clips","Spur-Automation"],
    ["Plattform","macOS","Windows / macOS","Windows / macOS","macOS / iPadOS"]
  ];
  const $=(sel)=>document.querySelector(sel);
  let view="overview", chosenTrack="grundlagen", chosenLesson="", audio=null, context=null, graph=null, nodes=null, currentUrl="", raf=0, challenge=null, pendingFile=0;
  let ctx=null;
  const tr=id=>TRACKS.find(t=>t.id===id);
  function questionCount(track){return (ctx.questions()||[]).filter(q=>q.subject==="Audio & Live Sound"&&(!track||q.topic===track)).length;}
  function completed(track){return (ctx.questions()||[]).filter(q=>q.subject==="Audio & Live Sound"&&(!track||q.topic===track)&&ctx.rec(q).streak>=3).length;}
  function safe(t){return ctx.esc(t);}
  function header(title,sub){return '<div class="heading"><div><h1>'+safe(title)+'</h1><p>'+safe(sub)+'</p></div><span class="chip">Audio & Live Sound</span></div>';}
  function tabs(){return '<div class="aa-tabs" role="group" aria-label="Audiolernbereich"><button class="quiet '+(view==="overview"?'active':'')+'" data-aa-view="overview">Lernpfade</button><button class="quiet '+(view==="lab"?'active':'')+'" data-aa-view="lab">EQ-Labor & Hoertraining</button><button class="quiet '+(view==="compare"?'active':'')+'" data-aa-view="compare">DAW-Vergleich</button><button class="quiet '+(view==="mixer"?'active':'')+'" data-aa-view="mixer">Mixer Simulator</button></div>';}
  function overview(){
    const q=questionCount(),done=completed(),practice=ctx.state.audioPractice||{attempts:0,correct:0};
    return header("Audio, Recording & Live Sound","Verstehen → ausprobieren → Aufgabe loesen → Feedback bekommen → wiederholen.")+
      tabs()+'<section class="aa-hero card"><div><span class="tag">9 Lernpfade · 13 Lektionen</span><h2>Technik verstehen. Klang hoeren. Sicher mischen.</h2><p>Dieselben Grundlagen fuer Hobby, Gemeinde, Studio und professionelle Live-Veranstaltungen. Die Schwierigkeit steigt mit deiner Erfahrung.</p><div class="actions"><button id="aa-start">Audio-Fragen trainieren</button><button class="quiet" data-aa-view="lab">Eigenen Song EQen</button></div></div><div><strong>'+done+'/'+q+'</strong><small>Fragen sicher gelernt</small><progress max="'+Math.max(1,q)+'" value="'+done+'"></progress><small>'+practice.correct+'/'+practice.attempts+' Hoer-Challenges richtig</small></div></section>'+
      '<div class="aa-track-grid">'+TRACKS.map(t=>'<article class="card aa-track"><span class="aa-track-icon" aria-hidden="true">'+t.icon+'</span><div><span class="tag soft">'+safe(t.level)+'</span><h3>'+safe(t.name)+'</h3><p>'+safe(t.description)+'</p><p class="small">'+completed(t.name)+'/'+questionCount(t.name)+' Fragen sicher · '+LESSONS.filter(l=>l.track===t.id).length+' Lektion(en)</p><button class="quiet" data-aa-track="'+t.id+'">Lernpfad ansehen</button></div></article>').join('')+'</div>';
  }
  function trackPage(){
    const t=tr(chosenTrack)||TRACKS[0];
    const available=LESSONS.filter(l=>l.track===t.id);
    if(chosenLesson){
      const l=available.find(x=>x.id===chosenLesson);
      if(l) return header(l.title,l.goal)+tabs()+
        '<section class="card aa-lesson"><div class="topic-line"><span class="tag">'+safe(t.name)+'</span><button class="quiet" id="aa-back-track">← Zurueck zum Lernpfad</button></div><h2>Einfach erklaert</h2><p>'+safe(l.simple)+'</p><h3>Technischer Hintergrund</h3><p>'+safe(l.technical)+'</p><h3>Aus der Praxis</h3><p>'+safe(l.example)+'</p><div class="hint"><strong>Selbst ausprobieren</strong><p>'+safe(l.practice)+'</p></div><div class="actions"><button id="aa-lesson-quiz">Verstaendnis testen</button><button class="quiet" data-aa-view="lab">EQ-Labor oeffnen</button></div></section>';
    }
    return header(t.name,t.description)+tabs()+'<section class="card"><div class="actions"><button class="quiet" id="aa-back">← Alle Lernpfade</button><button id="aa-track-quiz">Fragen zu '+safe(t.name)+'</button></div><p>Wissen ist erst dann nuetzlich, wenn du es hoerst und anwendest. Lese eine Lektion und beginne danach mit den zugehoerigen Aufgaben.</p></section>'+
      '<div class="aa-lesson-grid">'+available.map((l,i)=>'<article class="card"><span class="tag soft">Lektion '+(i+1)+'</span><h2>'+safe(l.title)+'</h2><p>'+safe(l.goal)+'</p><button data-aa-lesson="'+safe(l.id)+'">Lektion oeffnen</button></article>').join('')+'</div>';
  }
  function compare(){
    const heads=["Funktion","Logic Pro","Ableton Live","FL Studio","GarageBand"];
    return header("DAWs im Vergleich","Arbeitsablaeufe unterscheiden sich, Audio-Grundprinzipien bleiben gleich.")+tabs()+
      '<section class="card"><div class="aa-scroll"><table class="aa-table"><thead><tr>'+heads.map(s=>'<th scope="col">'+safe(s)+'</th>').join('')+'</tr></thead><tbody>'+COMPARE.map(row=>'<tr>'+row.map(s=>'<td>'+safe(s)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="small">Funktionsumfang und Bezeichnungen koennen je nach DAW-Version abweichen. Nutze die Herstelleranleitungen fuer konkrete Klickpfade.</p></section>';
  }
  function lab(){
    return header("Interaktives EQ-Labor","Lade deine eigene WAV- oder MP3-Datei. Alle Filter werden lokal im Browser berechnet.")+tabs()+
      '<section class="card aa-lab"><div class="aa-audio-head"><label class="aa-drop">Eigene Audiodatei waehlen (WAV / MP3)<input id="aa-file" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg"></label><span id="aa-file-name" class="small">Noch keine Datei geladen</span></div>'+
      '<p class="small">Bitte zunaechst die Systemlautstaerke niedrig einstellen. Teste EQ-Anhebungen mit Vorsicht. Deine Datei wird nicht hochgeladen.</p>'+
      '<audio id="aa-player" controls preload="metadata" aria-label="Audio wiedergeben"></audio><div class="actions aa-player-actions"><label><input id="aa-loop" type="checkbox"> Loop</label><button class="quiet" id="aa-bypass" type="button" aria-pressed="false">A/B: Bearbeitet</button><button class="quiet" id="aa-mute" type="button" aria-pressed="false">Sofort stumm</button><label>Ausgangspegel <input id="aa-master" type="range" min="0" max="0.7" step="0.01" value="0.3"><output id="aa-master-out">30 %</output></label></div>'+
      '<div id="aa-message" role="status" aria-live="polite">Wähle eine Datei, um Filter und A/B anzuhören.</div>'+
      '<div class="aa-canvas-wrap"><canvas id="aa-response" width="740" height="220" aria-label="Visualisierung des berechneten EQ-Frequenzgangs"></canvas></div>'+
      '<div id="aa-controls" class="aa-filters"><label>Hochpass <input id="aa-hpf" type="range" min="20" max="300" value="20" step="5"><output id="aa-hpf-out">20 Hz</output></label>'+
      '<label>Tiefpass <input id="aa-lpf" type="range" min="3000" max="20000" value="20000" step="250"><output id="aa-lpf-out">20000 Hz</output></label>'+
      [0,1,2,3].map((i)=>'<fieldset class="aa-band"><legend>Band '+(i+1)+'</legend><label>Frequenz <input type="range" data-aa-frequency="'+i+'" min="0" max="1000" value="'+[380,500,720,880][i]+'"><output data-aa-frequency-out="'+i+'"></output></label><label>Gain <input type="range" data-aa-gain="'+i+'" min="-12" max="12" value="0" step="0.5"><output data-aa-gain-out="'+i+'">0 dB</output></label><label>Q-Faktor <input type="range" data-aa-q="'+i+'" min="0.3" max="8" value="1.2" step="0.1"><output data-aa-q-out="'+i+'">1.2</output></label></fieldset>').join("")+'</div>'+
      '<div class="actions"><button class="quiet" id="aa-reset">EQ zuruecksetzen</button><button id="aa-challenge">Hoer-Challenge starten</button></div><div id="aa-challenge-box" class="aa-challenge-box" aria-live="polite"></div>'+
      '<p class="small">Die Hoer-Challenge hebt zufaellig eine Frequenz an. Vergleiche A/B und erkenne den Bereich. Das Ergebnis ist keine Messung professioneller Mischkompetenz.</p></section>';
  }
  function log(message){const el=$("#aa-message");if(el)el.textContent=message;}
  function stopVisual(){if(raf){cancelAnimationFrame(raf);raf=0;}}
  function dispose(){
    window.AudioMixer?.dispose();
    stopVisual();pendingFile++;
    if(audio){try{audio.pause();audio.removeAttribute("src");audio.load();}catch(e){}audio=null;}
    if(nodes){try{nodes.src.disconnect();}catch(e){}nodes=null;}
    if(context){const old=context;context=null;old.close().catch(()=>{});}
    if(currentUrl){URL.revokeObjectURL(currentUrl);currentUrl="";}
    graph=null;challenge=null;
  }
  function setupLab(){
    audio=$("#aa-player");
    $("#aa-file")?.addEventListener("change",function(e){
      const f=e.target.files?.[0];if(!f)return;
      if(f.size>120*1024*1024){log("Diese Datei ist groesser als 120 MB. Bitte waehle eine kleinere Audiodatei.");this.value="";return;}
      if(!f.type.startsWith("audio/")&&!/\.(wav|mp3|m4a|ogg|flac)$/i.test(f.name)){log("Dieses Dateiformat wird nicht als Audio erkannt.");this.value="";return;}
      const token=++pendingFile;
      if(currentUrl)URL.revokeObjectURL(currentUrl);
      currentUrl=URL.createObjectURL(f);
      audio.pause();audio.src=currentUrl;audio.load();
      $("#aa-file-name").textContent=f.name;
      log("Datei geladen. Druecke Play und vergleiche die EQ-Einstellungen.");
      this.value="";
      if(nodes) { /* Die Audio-Verbindung bleibt am gleichen HTML-Audioelement. */ }
      audio.onerror=()=>{if(token===pendingFile)log("Diese Audiodatei konnte nicht gelesen werden. Probiere eine andere WAV- oder MP3-Datei.");};
    });
    audio.addEventListener("play",async function(){
      try{ensureAudio();await context.resume();log("Wiedergabe aktiv – bitte achte auf eine sichere Lautstaerke.");}
      catch(e){audio.pause();log("Audiowiedergabe konnte nicht gestartet werden: "+e.message);}
    });
    audio.addEventListener("ended",()=>{if(!audio.loop)log("Track beendet. Mit Play kannst du erneut starten.");});
    $("#aa-loop").checked=Boolean(ctx.state.audioLoop);
    audio.loop=Boolean(ctx.state.audioLoop);
    $("#aa-loop").onchange=e=>{audio.loop=e.target.checked;ctx.state.audioLoop=audio.loop;ctx.save();};
    $("#aa-master").oninput=e=>{const v=Number(e.target.value);$("#aa-master-out").textContent=Math.round(v*100)+" %";if(nodes)ramp(nodes.master.gain,v);};
    $("#aa-mute").onclick=()=>{
      const button=$("#aa-mute"),muted=button.getAttribute("aria-pressed")!=="true";
      button.setAttribute("aria-pressed",String(muted));
      button.textContent=muted?"Stumm ✓":"Sofort stumm";
      if(nodes)ramp(nodes.master.gain,muted?0:Number($("#aa-master").value));
    };
    $("#aa-bypass").onclick=()=>{
      const button=$("#aa-bypass"),bypass=button.getAttribute("aria-pressed")!=="true";
      button.setAttribute("aria-pressed",String(bypass));
      button.textContent=bypass?"A/B: Original":"A/B: Bearbeitet";
      updateProcessing();
    };
    $("#aa-hpf").oninput=()=>updateProcessing();
    $("#aa-lpf").oninput=()=>updateProcessing();
    document.querySelectorAll("[data-aa-frequency],[data-aa-gain],[data-aa-q]").forEach(el=>el.oninput=updateProcessing);
    $("#aa-reset").onclick=()=>{
      [380,500,720,880].forEach((v,i)=>{document.querySelector('[data-aa-frequency="'+i+'"]').value=String(v);document.querySelector('[data-aa-gain="'+i+'"]').value="0";document.querySelector('[data-aa-q="'+i+'"]').value="1.2";});
      $("#aa-hpf").value="20";$("#aa-lpf").value="20000";updateProcessing();log("EQ-Einstellungen zurueckgesetzt.");
    };
    $("#aa-challenge").onclick=beginChallenge;
    updateProcessing();
  }
  function ramp(param,value){param.setTargetAtTime(value,context.currentTime,0.015);}
  function freqFromSlider(v){return Math.round(20*Math.pow(1000,Number(v)/1000));}
  function ensureAudio(){
    if(nodes)return;
    if(!audio.src)throw Error("Bitte waehle erst eine Audiodatei.");
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)throw Error("Dieser Browser unterstuetzt die Web Audio API nicht.");
    context=new AudioContextClass();
    const src=context.createMediaElementSource(audio),hpf=context.createBiquadFilter(),lpf=context.createBiquadFilter();
    hpf.type="highpass";lpf.type="lowpass";
    const bands=Array.from({length:4},()=>{const n=context.createBiquadFilter();n.type="peaking";return n;});
    const dry=context.createGain(),wet=context.createGain(),master=context.createGain(),analyser=context.createAnalyser();
    src.connect(hpf);hpf.connect(bands[0]);
    bands.forEach((band,i)=>band.connect(bands[i+1]||lpf));
    lpf.connect(wet);src.connect(dry);
    wet.connect(analyser);dry.connect(analyser);analyser.connect(master);master.connect(context.destination);
    analyser.fftSize=1024;
    nodes={src,hpf,lpf,bands,dry,wet,master,analyser};
    updateProcessing();visualize();
  }
  function updateProcessing(){
    const freqs=[],gains=[],qs=[];
    [0,1,2,3].forEach(i=>{
      const f=freqFromSlider(document.querySelector('[data-aa-frequency="'+i+'"]').value);
      const g=Number(document.querySelector('[data-aa-gain="'+i+'"]').value);
      const q=Number(document.querySelector('[data-aa-q="'+i+'"]').value);
      freqs.push(f);gains.push(g);qs.push(q);
      document.querySelector('[data-aa-frequency-out="'+i+'"]').textContent=f+" Hz";
      document.querySelector('[data-aa-gain-out="'+i+'"]').textContent=g+" dB";
      document.querySelector('[data-aa-q-out="'+i+'"]').textContent=q.toFixed(1);
    });
    $("#aa-hpf-out").textContent=$("#aa-hpf").value+" Hz";$("#aa-lpf-out").textContent=$("#aa-lpf").value+" Hz";
    if(nodes){
      ramp(nodes.hpf.frequency,Number($("#aa-hpf").value));
      ramp(nodes.lpf.frequency,Number($("#aa-lpf").value));
      nodes.bands.forEach((b,i)=>{ramp(b.frequency,freqs[i]);ramp(b.gain,gains[i]);ramp(b.Q,qs[i]);});
      const bypass=$("#aa-bypass").getAttribute("aria-pressed")==="true";
      ramp(nodes.dry.gain,bypass?1:0);ramp(nodes.wet.gain,bypass?0:1);
      if(!$("#aa-mute")||$("#aa-mute").getAttribute("aria-pressed")!=="true")ramp(nodes.master.gain,Number($("#aa-master").value));
    }
    drawResponse(freqs,gains,qs);
  }
  function drawResponse(freqs,gains,qs){
    const canvas=$("#aa-response");if(!canvas)return;
    const c=canvas.getContext("2d");if(!c)return;
    const w=canvas.width,h=canvas.height;
    c.clearRect(0,0,w,h);c.fillStyle="#131f34";c.fillRect(0,0,w,h);
    c.strokeStyle="#3c4960";c.lineWidth=1;
    [20,100,1000,10000,20000].forEach(f=>{const x=(Math.log10(f/20)/3)*w;c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();c.fillStyle="#d1d8ea";c.fillText(f>=1000?(f/1000)+"k":String(f),Math.min(x+4,w-38),h-8);});
    [-12,0,12].forEach(g=>{const y=h/2-g*5;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();c.fillText(g+" dB",8,Math.max(12,y-5));});
    c.strokeStyle="#83aaff";c.lineWidth=3;c.beginPath();
    // Didaktische Vorschau fuer vier Peaking-Filter. Exakte Filterantwort
    // wird bei aktiven AudioNodes ueber getFrequencyResponse berechnet.
    let total=null;
    if(nodes){
      const xs=new Float32Array(w),mag=new Float32Array(w),phase=new Float32Array(w);
      for(let i=0;i<w;i++)xs[i]=20*Math.pow(1000,i/(w-1));
      total=new Float32Array(w).fill(1);
      for(const filter of [nodes.hpf,...nodes.bands,nodes.lpf]){
        filter.getFrequencyResponse(xs,mag,phase);
        for(let i=0;i<w;i++)total[i]*=mag[i];
      }
    }
    for(let i=0;i<w;i++){
      const f=20*Math.pow(1000,i/(w-1));
      let gain=total?20*Math.log10(Math.max(0.00001,total[i])):freqs.reduce((s,cf,j)=>{
        const ratio=Math.log2(f/cf),width=1/Math.max(.3,qs[j]);return s+gains[j]*Math.exp(-.5*Math.pow(ratio/width,2));
      },0);
      const y=Math.max(4,Math.min(h-5,h/2-gain*5));
      if(i===0)c.moveTo(i,y);else c.lineTo(i,y);
    }
    c.stroke();
  }
  function visualize(){
    stopVisual();
    const canvas=$("#aa-response");if(!canvas||!nodes)return;
    // Keine dauerhafte Animation: die Filterkurve wird nur bei Parameteraenderung neu gezeichnet.
    updateProcessing();
  }
  function beginChallenge(){
    if(!audio?.src){log("Lade zuerst einen Song. Damit lernst du direkt mit deinem eigenen Audiomaterial.");return;}
    const freqs=[160,400,1600,5000];
    const target=Math.floor(Math.random()*freqs.length);
    challenge={freq:freqs[target],index:target};
    const box=$("#aa-challenge-box");
    box.innerHTML='<h3>Hoer-Challenge: Welcher Frequenzbereich wurde angehoben?</h3><p>Hoere auf die Klangfarbe. Schalte zwischen Original und Bearbeitet um.</p><div class="actions">'+freqs.map((f,i)=>'<button class="quiet" data-aa-answer="'+i+'">'+f+' Hz</button>').join("")+'</div><div id="aa-challenge-result"></div>';
    $("#aa-controls").hidden=true;
    [0,1,2,3].forEach(i=>{document.querySelector('[data-aa-gain="'+i+'"]').value=i===0?"9":"0";});
    document.querySelector('[data-aa-frequency="0"]').value=String(Math.round(Math.log(freqs[target]/20)/Math.log(1000)*1000));
    document.querySelector('[data-aa-q="0"]').value="1.2";
    $("#aa-hpf").value="20";$("#aa-lpf").value="20000";
    $("#aa-bypass").setAttribute("aria-pressed","false");$("#aa-bypass").textContent="A/B: Bearbeitet";
    updateProcessing();audio.currentTime=0;audio.play().catch(()=>log("Druecke Play, um die Hoer-Challenge zu starten."));
    box.querySelectorAll("[data-aa-answer]").forEach(b=>b.onclick=()=>answerChallenge(Number(b.dataset.aaAnswer)));
  }
  function answerChallenge(choice){
    if(!challenge)return;
    const right=choice===challenge.index,correctFreq=challenge.freq;
    const record=ctx.state.audioPractice&&typeof ctx.state.audioPractice==="object"?ctx.state.audioPractice:{attempts:0,correct:0};
    record.attempts=(Number(record.attempts)||0)+1;
    record.correct=(Number(record.correct)||0)+(right?1:0);
    record.last=Date.now();ctx.state.audioPractice=record;ctx.save();
    const result=$("#aa-challenge-result");
    if(result)result.innerHTML='<p class="'+(right?"aa-success":"aa-warning")+'">'+(right?"Richtig!":"Noch nicht ganz.")+" Der Boost lag bei "+correctFreq+" Hz. Vergleiche die Klangfarbe mit dem Original und versuche es spaeter erneut.</p>";
    $("#aa-controls").hidden=false;
    document.querySelectorAll("[data-aa-answer]").forEach(b=>b.disabled=true);
    challenge=null;
  }
  function setView(next){
    dispose();view=next;chosenLesson="";render(ctx);
  }
  function render(nextCtx){
    ctx=nextCtx;
    if(view==="overview")ctx.app.innerHTML=overview();
    else if(view==="compare")ctx.app.innerHTML=compare();
    else if(view==="lab")ctx.app.innerHTML=lab();
    else if(view==="mixer")ctx.app.innerHTML=header("Interaktiver 8-Kanal-Mixer","Eigene Multitracks oder synthetische Demo – Balance, EQ und Monitor-Sends praktisch hoeren.")+tabs()+'<div id="aa-mixer-host"></div>';
    else ctx.app.innerHTML=trackPage();
    document.querySelectorAll("[data-aa-view]").forEach(b=>b.onclick=()=>setView(b.dataset.aaView));
    document.querySelectorAll("[data-aa-track]").forEach(b=>b.onclick=()=>{chosenTrack=b.dataset.aaTrack;chosenLesson="";view="track";render(ctx);});
    document.querySelectorAll("[data-aa-lesson]").forEach(b=>b.onclick=()=>{chosenLesson=b.dataset.aaLesson;render(ctx);});
    if($("#aa-back"))$("#aa-back").onclick=()=>setView("overview");
    if($("#aa-back-track"))$("#aa-back-track").onclick=()=>{chosenLesson="";render(ctx);};
    const quiz=(track)=>{
      dispose();
      ctx.start("learn",{subject:"Audio & Live Sound",topic:track||"",limit:10});
    };
    if($("#aa-start"))$("#aa-start").onclick=()=>quiz("");
    if($("#aa-track-quiz"))$("#aa-track-quiz").onclick=()=>quiz(tr(chosenTrack).name);
    if($("#aa-lesson-quiz"))$("#aa-lesson-quiz").onclick=()=>quiz(tr(chosenTrack).name);
    if(view==="lab")setupLab();
    if(view==="mixer")window.AudioMixer?.render($("#aa-mixer-host"));
  }
  window.AudioAcademy={render,dispose,trackCount:()=>TRACKS.length,lessonCount:()=>LESSONS.length};
})();