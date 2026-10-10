/* Ergänzt die vorhandene Plattform; bestehende Lernsets und Speicher bleiben erhalten. */
const LearningAI=(()=>{
  let cfg=null,polling=false;
  const ACTIVE='learning-by-doing-active-v6',JOB='learning-by-doing-job-v6';
  async function status(){
    const r=await fetch('/api/ai/status',{cache:'no-store'});
    if(!r.ok)throw Error('Der Lernserver benötigt ein Update. Im bisherigen Terminal Strg+C drücken und Start.command erneut öffnen.');
    cfg=await r.json();if(!cfg.token)throw Error('Lernserver nicht bereit. Bitte neu starten.');return cfg;
  }
  async function api(path,data){
    if(!cfg)await status();
    const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-Teacher-Token':cfg.token},body:JSON.stringify(data)});
    let result;try{result=await r.json();}catch{throw Error('Der Lernserver hat nicht verständlich geantwortet. Bitte neu starten.');}
    if(!r.ok)throw Error(result.error||'Verarbeitung fehlgeschlagen.');return result;
  }
  function labels(c){return '<p>'+(c.localConnected?'🟢 Lokale KI verbunden':'🔴 Lokale KI nicht erreichbar')+(c.localConnected&&!c.localInstalled?' – Modell noch nicht heruntergeladen':'')+'</p><p>'+(c.openaiAvailable?'🟢 OpenAI verfügbar':'⚪ OpenAI nicht eingerichtet')+'</p>'+(c.localConnected&&c.localInstalled?'<p class="small">Lokales Modell: '+esc(c.localModel)+' · keine Kosten pro Anfrage</p>':'<p>Öffne <strong>Ollama-starten.command</strong> im Projektordner. Falls das Modell fehlt, einmal <strong>Ollama-einrichten.command</strong> öffnen. Danach „Status prüfen“ drücken.</p>');}
  async function settings(){
    app.innerHTML=head('KI-Einstellungen','Lokale KI funktioniert ohne OpenAI-Konto oder API-Schlüssel.')+'<section class="card"><h2>KI-Modell</h2><p id="ai-status" role="status">Verbindung wird geprüft …</p><form id="ai-settings"><label><span><input type="radio" name="provider" value="ollama" checked style="width:auto"> 🟢 Lokale KI – kostenlos</span></label><label><span><input type="radio" name="provider" value="openai" style="width:auto"> 🔵 OpenAI – optional</span></label><p class="hint">OpenAI überträgt ausgewählte Quelltexte und Antworten an den Anbieter und verursacht API-Kosten. Der Schlüssel bleibt ausschließlich auf dem Server. Ohne Schlüssel kannst du lokal weiterlernen.</p><button type="submit">Auswahl speichern</button> <button type="button" id="ai-refresh" class="quiet">Status prüfen</button><p id="ai-settings-result" role="status"></p></form></section>';
    async function refresh(){try{const c=await status();if(!document.querySelector('#ai-status'))return;document.querySelector('#ai-status').innerHTML=labels(c);document.querySelector('#ai-settings input[value="'+c.provider+'"]').checked=true;}catch(e){document.querySelector('#ai-status').textContent=e.message;}}
    document.querySelector('#ai-refresh').onclick=refresh;
    document.querySelector('#ai-settings').onsubmit=async e=>{e.preventDefault();const provider=new FormData(e.currentTarget).get('provider');try{await api('/api/ai/settings',{provider,consent:provider==='openai'});await refresh();document.querySelector('#ai-settings-result').textContent='Auswahl gespeichert.';}catch(e){document.querySelector('#ai-settings-result').textContent=e.message;}};
    await refresh();
  }
  function progressPanel(){
    const section=document.createElement('section');section.className='card';section.style.marginTop='24px';
    const history=state.history,groups={};
    for(const h of history){const q=state.custom.find(q=>q.id===h.id)||(window.EXAMPLE_QUESTIONS||[]).find(q=>q.id===h.id);const t=h.topic||q?.topic||h.subject||'Allgemein';groups[t]??={earned:0,possible:0};groups[t].earned+=h.earned??h.score??Number(h.correct);groups[t].possible+=h.possible||1;}
    const rows=Object.entries(groups).map(([t,r])=>({topic:t,percent:Math.round(r.earned/r.possible*100)}));const last=history.at(-1);
    section.innerHTML='<h2>Dein Lernstand</h2><p>'+history.filter(h=>h.correct).length+' vollständig richtig · '+history.filter(h=>!h.correct&&!(h.earned>0)).length+' falsch · '+history.filter(h=>!h.correct&&h.earned>0).length+' teilweise richtig</p><p>Zuletzt gelernt: '+(last?esc(new Date(last.at).toLocaleString('de-DE')):'noch keine Antworten')+'</p>'+(rows.length?rows.map(r=>'<div class="topic-row"><div class="topic-line"><strong>'+esc(r.topic)+'</strong><span>'+r.percent+' %</span></div><progress max="100" value="'+r.percent+'"></progress></div>').join('')+'<p><strong>Stärken:</strong> '+esc(rows.filter(r=>r.percent>=80).map(r=>r.topic).join(', ')||'Noch nicht genug sichere Antworten')+'</p><p><strong>Diese Themen solltest du noch einmal lernen:</strong> '+esc(rows.filter(r=>r.percent<80).map(r=>r.topic).join(', ')||'Aktuell kein Schwerpunkt erkennbar')+'</p>':'<p>Nach deinen ersten Antworten werden Stärken und Wissenslücken sichtbar.</p>');
    app.append(section);
  }
  async function mount(route){
    if(route==='dashboard'||route==='progress')progressPanel();
    if(!['dashboard','library'].includes(route))return;
    const panel=document.createElement('section');panel.id='ai-quick';panel.className='card';panel.style.marginBottom='24px';
    panel.innerHTML='<h2>Mit deinen IHK-Unterlagen lernen</h2><p>Thema auswählen, Lernset erstellen und üben. Belegte Grundlagen werden mit geprüften Lernvorlagen schnell erstellt. Weitere KI-Fragen können einige Minuten dauern. Alle neuen Aufgaben enthalten Quellenbelege; KI-Entwürfe können dennoch Fehler enthalten.</p><div id="quick-connection" role="status">Lokale KI wird geprüft …</div><form id="quick-form" class="stack-form"><label>Lernset<select id="quick-set" name="targetSetId"><option value="">Neues IHK-Lernset</option></select></label><div class="filter-grid"><label>Thema<select name="topic" id="quick-topic" required><option value="">Unterlagen werden geladen …</option></select></label><label>Fragen<select name="count"><option>10</option><option>20</option><option>30</option></select></label></div><label id="openai-consent" hidden><span><input name="consent" type="checkbox" style="width:auto"> Ich gebe die kostenpflichtige OpenAI-Auswertung der passenden Textauszüge frei.</span></label><button type="submit" id="quick-create" disabled>Lernset erstellen</button><p id="quick-progress" role="status"></p></form><details><summary>Verwendbare Unterlagen ansehen</summary><div id="material-catalog"></div></details><p><a href="#settings">KI-Einstellungen</a> · <a href="#library">Weitere Unterlagen importieren</a></p><div id="resume-session"></div>';
    const first=app.querySelector('.heading');if(first)first.after(panel);else app.prepend(panel);
    try{
      const c=await status();
      panel.querySelector('#quick-set').innerHTML='<option value="">Neues IHK-Lernset</option>'+state.sets.filter(s=>state.sources.some(x=>x.setId===s.id)).map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>').join('');
      // Gespeicherte Textauszüge der bisherigen GitHub-Fassung lokal weiterverwenden.
      for(const source of state.sources.filter(s=>!s.documentId&&typeof s.excerpt==='string'&&s.excerpt.trim().length>=80)){
        const doc=await api('/api/materials/upload',{name:source.name+' (gespeicherter Textauszug)',pages:[{page:1,text:source.excerpt}]});source.documentId=doc.id;save();
      }
      const r=await fetch('/api/materials',{cache:'no-store'});if(!r.ok)throw Error('Unterlagenbibliothek nicht erreichbar.');const catalog=await r.json();if(!panel.isConnected)return;
      panel.querySelector('#quick-connection').innerHTML=labels(c);
      panel.querySelector('#quick-topic').innerHTML=catalog.topics.map(t=>'<option value="'+esc(t.name)+'" '+(!t.documents?'disabled':'')+'>'+esc(t.name)+' · '+t.documents+' Unterlagen</option>').join('');
      const available=catalog.topics.find(t=>t.documents);if(available){panel.querySelector('#quick-topic').value=available.name;panel.querySelector('#quick-topic').dataset.defaultTopic=available.name;}
      panel.querySelector('#quick-create').disabled=!c.ready||!available||Boolean(localStorage.getItem(JOB));
      panel.querySelector('#openai-consent').hidden=c.provider!=='openai';
      panel.querySelector('#material-catalog').innerHTML='<p>'+catalog.documents.length+' Dokumente lokal durchsuchbar.'+(catalog.index?.running?' Texterkennung: '+catalog.index.completed+'/'+catalog.index.total+' Dateien. Nach Abschluss Seite neu laden.':'')+'</p>'+catalog.documents.map(d=>'<p><strong>'+esc(d.name)+'</strong> · '+d.readablePages+'/'+d.pages+' lesbare Seiten<br><span class="small">'+esc(d.topics.join(', ')||'Noch kein Thema zugeordnet')+'</span></p>').join('');
      if(localStorage.getItem(ACTIVE)){panel.querySelector('#resume-session').innerHTML='<button id="resume-ai" class="quiet">Unterbrochene Lernrunde fortsetzen</button>';panel.querySelector('#resume-ai').onclick=()=>{try{session=JSON.parse(localStorage.getItem(ACTIVE));session.aiBusy=false;render();}catch{message='Gespeicherte Runde konnte nicht geladen werden.';render();}};}
      const existing=localStorage.getItem(JOB);if(existing)poll(existing,panel);
    }catch(e){if(panel.isConnected)panel.querySelector('#quick-connection').textContent=e.message;}
    panel.querySelector('#quick-set').onchange=()=>{const target=panel.querySelector('#quick-set').value;selectTarget(panel,Boolean(target));panel.querySelector('#quick-create').disabled=!cfg?.ready||Boolean(localStorage.getItem(JOB))||(!target&&!panel.querySelector('#quick-topic').value);};
    panel.querySelector('form').onsubmit=async e=>{
      e.preventDefault();if(polling)return;const d=new FormData(e.currentTarget),out=panel.querySelector('#quick-progress');
      try{
        const c=await status();if(c.provider==='openai'&&!d.has('consent'))throw Error('Bitte die OpenAI-Auswertung freigeben oder lokale KI auswählen.');
        panel.querySelector('#quick-create').disabled=true;
        const target=setById(d.get('targetSetId'));const documentIds=target?[...new Set(state.sources.filter(s=>s.setId===target.id&&s.documentId).map(s=>s.documentId))]:undefined;
        if(target&&!documentIds.length)throw Error('Keine lesbaren Dateien zugeordnet. Bitte die Dateien erneut in dieses Lernset importieren.');
        const job=await api('/api/sets',{topic:target?(target.name+' · '+target.subject).slice(0,150):d.get('topic'),targetSetId:target?.id||'',documentIds,existingPrompts:target?bySet(target.id).map(q=>q.prompt).slice(0,500):[],count:Number(d.get('count')),provider:c.provider,consent:d.has('consent')});localStorage.setItem(JOB,job.id);poll(job.id,panel);
      }catch(err){out.textContent=err.message;panel.querySelector('#quick-create').disabled=false;}
    };
  }
  async function poll(jid,panel){
    if(polling)return;polling=true;teacherGenerating=true;
    try{
      while(true){
        const r=await fetch('/api/jobs/'+encodeURIComponent(jid),{cache:'no-store'}),job=await r.json();
        if(!r.ok||job.status==='error'){localStorage.removeItem(JOB);const error=Error(job.error||'Lernset-Erstellung fehlgeschlagen.');error.jobRemoved=true;throw error;}
        panel=document.querySelector('#ai-quick')||panel;
        if(panel.isConnected)panel.querySelector('#quick-progress').textContent=job.message||'Erstellung läuft …';
        if(job.status==='done'){
          const result=job.result,setId=result.targetSetId||'set-ai-'+jid;
          if(result.targetSetId&&!setById(setId))throw Error('Das Ziel-Lernset wurde inzwischen gelöscht. Fragen bleiben auf dem Server gespeichert.');
          if(!state.sets.some(s=>s.id===setId)){
            const set={id:setId,name:result.topic+' · IHK-Vorbereitung',subject:'IHK AP2',kind:'IHK',aiGenerated:true,createdAt:Date.now()};
            state.sets.push(set);
          }
          const target=setById(setId);
          if(!target)throw Error('Das Ziel-Lernset wurde inzwischen gelöscht. Fragen bleiben auf dem Server gespeichert.');
          const existingIds=new Set(state.custom.map(q=>q.id));
          state.custom.push(...result.questions.filter(q=>!existingIds.has(q.id)).map(q=>({...q,setId,subject:target.subject})));save();
          const card=[...document.querySelectorAll('.set-card')].find(c=>c.querySelector('[data-set-learn]')?.dataset.setLearn===setId);
          if(card){
            const replacement=document.createElement('div');replacement.innerHTML=setCard(target);const updated=replacement.firstElementChild;card.replaceWith(updated);
            updated.querySelector('[data-set-learn]').onclick=()=>start('learn',{setId});
            updated.querySelector('[data-set-create]')?.addEventListener('click',()=>createFromSet(setId));
            updated.querySelector('[data-set-delete]').onclick=()=>deleteSet(setId);
          }
          localStorage.removeItem(JOB);
          if(panel.isConnected){panel.querySelector('#quick-progress').textContent=result.questions.length+(result.questions.length===1?' Frage gespeichert. ':' Fragen gespeichert. ')+result.warnings.join(' ');panel.querySelector('#quick-progress').insertAdjacentHTML('afterend','<div class="actions"><button type="button" id="quick-learn">Jetzt lernen</button><button type="button" class="quiet" id="quick-exam">Als Probeprüfung starten</button></div>');panel.querySelector('#quick-learn').onclick=()=>start('learn',{setId});panel.querySelector('#quick-exam').onclick=()=>start('exam',{setId});}
          break;
        }
        await new Promise(resolve=>setTimeout(resolve,1800));
      }
    }catch(e){if(panel.isConnected)panel.querySelector('#quick-progress').textContent=e.message+(e.jobRemoved?'':' Bei einem Verbindungsfehler Seite neu laden; der Auftrag bleibt gespeichert.');}
    finally{polling=false;teacherGenerating=false;if(panel.isConnected)panel.querySelector('#quick-create').disabled=false;}
  }
  async function importFiles(form){
    const files=[...document.querySelector('#material-files').files];
    if(files.every(f=>f.name.toLowerCase().endsWith('.json')))return false;
    if(importBusy)return true;importBusy=true;
    const set=setById(String(new FormData(form).get('setId'))),out=document.querySelector('#material-status'),button=form.querySelector('button[type=submit]');button.disabled=true;
    const messages=[];
    try{
      for(const f of files){
        if(f.name.toLowerCase().endsWith('.json')){messages.push(f.name+': JSON-Aufgaben bitte separat importieren.');continue;}
        out.textContent=f.name+' wird lokal gelesen. Scan-PDFs werden automatisch erkannt; das kann einige Minuten dauern.';
        try{
          if(f.size>15000000)throw Error('Datei größer als 15 MB.');let payload={name:f.name};
          if(f.name.toLowerCase().endsWith('.pdf')){const bytes=new Uint8Array(await f.arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));payload.pdf=btoa(raw);}
          else payload.pages=[{page:1,text:await f.text()}];
          const doc=await api('/api/materials/upload',payload);
          if(!state.sources.some(s=>s.documentId===doc.id&&s.setId===(set?.id||'')))state.sources.push({id:id('src'),documentId:doc.id,name:f.name,subject:set?.subject||'IHK AP2',setId:set?.id||'',cards:0,addedAt:Date.now()});save();
          messages.push(f.name+': gespeichert · '+(doc.topics.join(', ')||'kein bekanntes Thema erkannt'));
        }catch(e){messages.push(f.name+': '+e.message);}
      }
      message=messages.join(' | ');render();
    }finally{importBusy=false;button.disabled=false;}
    return true;
  }
  function persist(){try{if(session)localStorage.setItem(ACTIVE,JSON.stringify(session));}catch{warn('Die laufende Runde konnte nicht zwischengespeichert werden.');}}
  async function renderQuestion(q){
    const s=session;const select=['choice','multi','truefalse'].includes(q.type);const multi=q.type==='multi';
    app.innerHTML=head(s.mode==='exam'?'Deine IHK-Probeprüfung':'Lernen mit deinen Unterlagen',s.mode==='exam'?'Antworten abgeben – Lösungen und Bewertung folgen am Ende.':'Antworte selbst. Danach erhältst du Bewertung, Musterlösung und Erklärung.')+'<section class="card question"><div class="topic-line"><span class="tag">'+esc(q.topic)+'</span><small>Aufgabe '+(s.index+1)+' von '+s.queue.length+' · '+q.points+' Punkte</small></div><progress max="'+s.queue.length+'" value="'+s.index+'"></progress><h2>'+esc(q.prompt)+'</h2><p class="small">'+(multi?'Mehrere Antworten sind richtig.':select?'Genau eine Antwort ist richtig.':q.type==='calculation'?'Gib Ergebnis, Einheit und Rechenweg an.':'Erkläre deine Antwort in eigenen Worten.')+'</p><form id="ai-answer-form">'+(select?'<div class="options">'+shuffle(q.options).map(o=>'<label class="option"><input type="'+(multi?'checkbox':'radio')+'" name="answer" value="'+esc(o)+'" '+(!multi?'required':'')+'><span>'+esc(o)+'</span></label>').join('')+'</div>':'<label>Deine Antwort<textarea name="answer" rows="5" maxlength="12000"></textarea></label>')+'<div class="actions"><button type="submit">'+(s.mode==='exam'?'Antwort abgeben':'Antwort bewerten')+'</button><button id="ai-end" type="button" class="quiet">Runde beenden</button></div></form><p id="ai-answer-status" role="status"></p><div id="ai-answer-feedback"></div></section>';
    if(!s.aiProvider){
      try{const c=await status();if(session!==s)return;s.aiProvider=c.provider;if(c.provider==='openai'){s.aiConsent=confirm('Antworten und Quellenbelege dieser Runde kostenpflichtig an OpenAI zur Bewertung übertragen?');if(!s.aiConsent){session=null;location.hash='settings';render();return;}}else s.aiConsent=false;persist();}catch(e){if(session!==s)return;document.querySelector('#ai-answer-status').textContent=e.message;}
    }
    const form=document.querySelector('#ai-answer-form');
    form.onsubmit=async e=>{
      e.preventDefault();if(s.answered||s.aiBusy)return;
      const d=new FormData(form),answer=select?d.getAll('answer'):String(d.get('answer')||'').trim();
      if(select&&!answer.length){document.querySelector('#ai-answer-status').textContent='Bitte eine Antwort auswählen.';return;}
      if(s.mode==='exam'){s.answered=true;s.results.push({q,answer,earned:null,correct:null,aiPending:true});persist();next();return;}
      s.aiBusy=true;form.querySelector('button[type=submit]').disabled=true;document.querySelector('#ai-answer-status').textContent=select?'Antwort wird geprüft …':'Die ausgewählte KI bewertet deine Antwort …';
      try{
        const grade=await api('/api/grade',{question:q,answer,provider:s.aiProvider||'ollama',consent:s.aiConsent===true});if(session!==s)return;
        const ok=grade.earned===q.points;s.answered=true;s.aiBusy=false;s.results.push({q,answer,earned:grade.earned,correct:ok,grade});
        update(q,ok,{topic:q.topic,answer,earned:grade.earned,possible:q.points,assessment:grade.method});save();
        if(!ok&&s.queue.length<60)s.queue.splice(Math.min(s.index+3,s.queue.length),0,q);persist();
        form.querySelectorAll('input,textarea,button[type=submit]').forEach(x=>x.disabled=true);
        document.querySelector('#ai-answer-status').textContent='';document.querySelector('#ai-answer-feedback').innerHTML=feedback(q,answer,grade)+'<button id="ai-next">Nächste Frage</button>';document.querySelector('#ai-next').onclick=next;
      }catch(e){if(session===s){document.querySelector('#ai-answer-status').textContent=e.message+' Deine Antwort bleibt im Eingabefeld.';form.querySelector('button[type=submit]').disabled=false;}s.aiBusy=false;}
    };
    document.querySelector('#ai-end').onclick=()=>{if(s.aiBusy)return;if(s.results.length)summary(true);else{session=null;localStorage.removeItem(ACTIVE);render();}};
    if(s.answered&&s.results.at(-1)?.q.id===q.id){const x=s.results.at(-1);form.querySelectorAll('input,textarea,button[type=submit]').forEach(x=>x.disabled=true);document.querySelector('#ai-answer-feedback').innerHTML=feedback(q,x.answer,x.grade)+'<button id="ai-next">Nächste Frage</button>';document.querySelector('#ai-next').onclick=next;}
  }
  function feedback(q,answer,g){return '<div class="feedback '+(g.earned===q.points?'':g.earned>0?'partial':'wrong')+'"><h3>'+esc(g.verdict)+' · '+g.earned+'/'+q.points+' Punkte</h3><p>'+esc(g.explanation)+'</p>'+(g.method==='ai'?'<p class="small">KI-Einschätzung – prüfe bei Unstimmigkeiten die Musterlösung und Quelle.</p>':'')+'<p><strong>Deine Antwort:</strong> '+esc(Array.isArray(answer)?answer.join('; '):answer||'(keine Antwort)')+'</p>'+solution(q)+(g.criteria?.length?'<ul>'+g.criteria.map(r=>'<li>'+r.earned+' '+(r.earned===1?'Punkt':'Punkte')+': '+esc(r.reason)+'</li>').join('')+'</ul>':'')+'</div>';}
  async function finish(early=false){
    const s=session;if(!s||s.aiBusy)return;s.aiBusy=true;
    app.innerHTML=head(s.mode==='exam'?'Deine Prüfung wird ausgewertet':'Deine Lernrunde wird ausgewertet','Deine abgegebenen Antworten bleiben gespeichert.')+'<section class="card"><p id="exam-grading" role="status">Bewertung läuft …</p></section>';
    try{
      for(let i=0;i<s.results.length;i++){
        const x=s.results[i];if(!x.aiPending&&!(x.q.type==='selfcheck'&&x.earned==null&&x.q.rubric?.length))continue;
        if(session!==s)return;document.querySelector('#exam-grading').textContent='Antwort '+(i+1)+' von '+s.results.length+' wird bewertet …';
        const g=await api('/api/grade',{question:x.q,answer:x.answer,provider:s.aiProvider||'ollama',consent:s.aiConsent===true});x.grade=g;x.earned=g.earned;x.correct=g.earned===x.q.points;x.aiPending=false;persist();
      }
      if(s.mode==='exam'&&!s.aiRecorded){for(const x of s.results)update(x.q,x.correct,{topic:x.q.topic,answer:x.answer,earned:x.earned??(x.correct?(x.q.points||1):0),possible:x.q.points||1,assessment:x.grade?.method||'solution'});save();s.aiRecorded=true;persist();}
      const possible=(s.mode==='exam'?s.queue:s.results.map(x=>x.q)).reduce((n,q)=>n+(q.points||1),0),earned=s.results.reduce((n,x)=>n+(x.earned??(x.correct?(x.q.points||1):0)),0),groups={};
      for(const q of s.mode==='exam'?s.queue:s.results.map(x=>x.q)){groups[q.topic]??={earned:0,possible:0};groups[q.topic].possible+=q.points||1;}
      for(const x of s.results)groups[x.q.topic].earned+=x.earned??(x.correct?(x.q.points||1):0);
      const weak=Object.keys(groups).filter(t=>groups[t].earned/groups[t].possible<0.8);
      app.innerHTML=head(s.mode==='exam'?'Dein Prüfungsergebnis':'Deine Lernergebnisse','Erkenne, was schon sitzt und was du wiederholen solltest.')+'<section class="card question"><div class="big-number">'+(possible?Math.round(earned/possible*100):0)+' %</div><h2>'+earned+' von '+possible+' Punkten</h2><p>'+s.results.length+' von '+s.queue.length+' Aufgaben bearbeitet'+(early?' · vorzeitig beendet':'')+'</p>'+Object.entries(groups).map(([t,r])=>'<p>'+esc(t)+': '+Math.round(r.earned/r.possible*100)+' %</p>').join('')+'<p><strong>Diese Themen solltest du noch einmal lernen:</strong> '+esc(weak.join(', ')||'Kein aktueller Schwerpunkt')+'</p><p class="small">Lernsimulation, keine offizielle IHK-Benotung. Freie Antworten werden von KI eingeschätzt.</p><button id="ai-finish-dashboard">Zum Dashboard</button></section><section class="card" style="margin-top:24px"><h2>Falsche und teilweise richtige Antworten</h2>'+s.results.filter(x=>!x.correct).map(x=>'<h3>'+esc(x.q.prompt)+'</h3>'+feedback(x.q,x.answer,x.grade||{earned:x.earned||0,verdict:'falsch',explanation:x.q.explanation})).join('')+(s.results.every(x=>x.correct)?'<p>Alle bearbeiteten Aufgaben vollständig richtig.</p>':'')+'</section>';
      localStorage.removeItem(ACTIVE);session=null;document.querySelector('#ai-finish-dashboard').onclick=()=>{location.hash='dashboard';render();};
    }catch(e){s.aiBusy=false;persist();document.querySelector('#exam-grading').textContent=e.message;document.querySelector('#exam-grading').insertAdjacentHTML('afterend','<button id="grade-retry">Bewertung erneut versuchen</button>');document.querySelector('#grade-retry').onclick=()=>finish(early);}
  }
  function selectTarget(panel,selected){
    const topic=panel.querySelector('#quick-topic');
    if(!topic.querySelector('option[value="__set__"]'))topic.insertAdjacentHTML('beforeend','<option value="__set__">Fachinhalte aus den Dateien dieses Lernsets</option>');
    topic.disabled=selected;topic.value=selected?'__set__':topic.dataset.defaultTopic||'';
  }
  function createFromSet(setId){
    const panel=document.querySelector('#ai-quick'),select=panel?.querySelector('#quick-set');
    if(!select||!select.querySelector('option[value="'+CSS.escape(setId)+'"]')){message='Bitte die Unterlagenbibliothek öffnen und kurz warten, bis die Dateien geladen sind.';render();return;}
    select.value=setId;selectTarget(panel,true);
    panel.querySelector('#quick-create').disabled=Boolean(localStorage.getItem(JOB))||!cfg?.ready;
    panel.querySelector('#quick-progress').textContent='Es werden ausschließlich die Dateien aus „'+setById(setId).name+'“ verwendet. Anzahl auswählen und „Lernset erstellen“ drücken.';
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
  return {createFromSet,mount,settings,importFiles,renderQuestion,finish,persist};
})();

render();
