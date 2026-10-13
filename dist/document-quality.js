/**
 * Quellengebundene Lernfragen – ohne zusätzliche Laufzeit-Bibliotheken.
 * Das Modul speichert keine Original-PDFs und verarbeitet nur bereits extrahierten Text.
 * Es verhindert offensichtlich unbelegte, doppelte und formell fehlerhafte KI-Fragen.
 */
(function (root) {
  'use strict';
  const normalize = text => String(text || '').normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const tokens = text => new Set(normalize(text).split(' ').filter(word => word.length > 3));
  const title = line => /^(?:\d+(?:\.\d+)*[.)]?\s+.{4,100}|(?:aufgabe|handlungsschritt|kapitel|thema|lösung|lösungen|antwort|abschnitt)\b.{0,100})$/i.test(line);
  const junk = text => /(?:copyright|alle rechte vorbehalten|prüflingsnummer|familienname|korrekturrand|bearbeitungshinweise|lösungshinweise|vervielfältigung)/i.test(text) ||
    /^\s*(?:\d+\s*(?:[;,:]\s*\d+)+|\d{1,2}\.\s*(?:aufgabe)?\s*\d{1,2})\s*$/i.test(text);
  const validText = text => text.length >= 95 && (text.match(/[\p{L}]/gu) || []).length >= 60 && !junk(text.slice(0,140));
  function chunks(raw, source, max=1350) {
    const lines=String(raw || '').replace(/\r/g,'').split(/\n/), result=[];
    let heading='',part='',start=1,last=1;
    function flush() {
      if(validText(part.trim())) result.push({
        id:source+':'+result.length, source, heading, text:part.trim(),
        pageStart:start, pageEnd:last
      });
      part='';
    }
    let currentPage=1;
    for (const rawLine of lines) {
      const marker=rawLine.match(/^\s*\[\[SEITE\s+(\d+)\]\]\s*$/i);
      if(marker){flush();currentPage=Number(marker[1]);continue;}
      const line=rawLine.trim();
      if(!line){if(part&&!part.endsWith('\n\n'))part+='\n\n';continue;}
      if(title(line)&&line.length<120){flush();heading=line;start=currentPage;continue;}
      if(!part)start=currentPage;
      // Lange Absätze werden nur als Notlösung an Satzgrenzen getrennt.
      if(part.length+line.length>max&&part.length>120)flush();
      if(!part)start=currentPage;
      part+=(part?'\n':'')+line;
      last=currentPage;
    }
    flush();
    return result.slice(0,220);
  }
  function select(items, topic, limit=5) {
    const t=tokens(topic), query=normalize(topic);
    return items.map(c=>{
      const words=tokens(c.heading+' '+c.text);
      let overlap=0;for(const word of t)if(words.has(word))overlap++;
      const score=overlap*3+(normalize(c.heading).includes(query)?5:0)+
        (/\b(?:berechn|erläuter|beschreib|erklär|vergleich|begründe|unterscheid|fehler|vorteil|nachteil|protokoll)\w*/i.test(c.text)?1:0);
      return {...c,score};
    }).filter(c=>c.score>0&&!junk(c.text)).sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  function similar(a,b) {
    const x=tokens(a),y=tokens(b);if(!x.size||!y.size)return false;
    let same=0;for(const term of x)if(y.has(term))same++;
    return same/Math.max(x.size,y.size)>=.79;
  }
  function validate(item, sources, existing=[]) {
    const fail=reason=>({ok:false,reason});
    if(!item||typeof item!=='object')return fail('Ungültige Frage');
    const prompt=String(item.prompt||'').trim(),answer=String(item.answer||'').trim();
    const explanation=String(item.explanation||'').trim();
    const quote=String(item.evidenceQuote||'').trim();
    if(prompt.length<30||answer.length<8||explanation.length<12)return fail('Frage oder Erklärung unvollständig');
    if(/^(?:was ist|was sind|was bedeutet)\b/i.test(prompt)&&prompt.length<85)return fail('Zu einfache Wissensfrage');
    if(!quote||quote.length<22)return fail('Quellenausschnitt fehlt');
    const match=sources.find(s=>s.id===item.chunkId);
    if(!match)return fail('Abschnitts-ID unbekannt');
    if(!normalize(match.text).includes(normalize(quote)))return fail('Quellennachweis nicht im Originalabschnitt');
    if(existing.some(q=>similar(q.prompt||q,item.prompt)))return fail('Frage bereits vorhanden oder sehr ähnlich');
    if(['choice','multichoice'].includes(item.type)){
      const options=Array.isArray(item.options)?item.options.map(String):[];
      if(options.length<4||new Set(options).size!==options.length)return fail('Antwortoptionen fehlerhaft');
      if(item.type==='choice'&&!options.includes(answer))return fail('Richtige Option fehlt');
      if(item.type==='multichoice'&&(!Array.isArray(item.correctOptions)||!item.correctOptions.length||
        item.correctOptions.some(v=>!options.includes(v))))return fail('Multiple-Choice-Lösung fehlerhaft');
    }
    const difficulty=String(item.difficulty||'mittel').toLowerCase();
    if(!['leicht','mittel','schwer'].includes(difficulty))return fail('Unbekannter Schwierigkeitsgrad');
    // Diese Prüfung verifiziert einen Textbeleg, nicht alle semantischen Aussagen.
    return {ok:true,source:match,quality:'Quellenausschnitt gefunden; fachliche Prüfung durch KI/Lernende weiter erforderlich'};
  }
  root.LearningSourceQuality={chunks,select,validate,similar,normalize};
})(typeof window!=='undefined'?window:globalThis);
