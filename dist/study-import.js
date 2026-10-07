/* Conservative, source-grounded study prompts. No external text transmission. */
(function(root){
  const metadata = /^(?:(?:vorname|nachname|familienname|name|klasse|kurs|datum|lehrkraft|lehrer|schule|schuljahr|fachinformatiker(?:\/in|in)?|berufsschule|arbeitsblatt|lernfeld|fach)\b\s*[:_]|(?:fachinformatiker(?:\/in|in)?|klasse|datum|name)\s*$|seite\s*\d+|\d+\s*(?:\/|von)\s*\d+|©|copyright|https?:\/\/|www\.)/i;
  const fieldRow = /(?:fachinformatiker(?:\/in|in)?|name\s*:)\s*.*\b(?:klasse|datum)\b/i;
  const flat = s => String(s||'').replace(/\s+/g,' ').trim();
  function isNoise(line){return metadata.test(line.trim()) || fieldRow.test(line);}
  function clean(text){
    return String(text||'').normalize('NFC').replace(/\u0000|\u00ad/g,'').replace(/\r\n?/g,'\n')
      .replace(/([a-zäöüß])-\n([a-zäöüß])/g,'$1$2').split('\n')
      .map(l=>l.trim()).filter(l=>!isNoise(l)).join('\n');
  }
  function termOK(term){
    return term.length>=2 && term.length<=75 && term.split(/\s+/).length<=9 &&
      /[a-zäöüß]/i.test(term) && !/[?!:;]/.test(term) && !isNoise(term) &&
      !/^(?:er|sie|es|dies|diese|dieser|dieses|das|dabei|hier|dort|man|wir|ich|du)$/i.test(term);
  }
  function analyze(input){
    const pages=Array.isArray(input)?input:[{page:null,text:String(input||'')}];
    const cards=[],seen=new Set();let skipped=0;
    function add(prompt,answer,evidence,page,kind){
      answer=flat(answer);prompt=flat(prompt);
      if(answer.length<12||answer.length>900||isNoise(answer))return;
      const key=prompt.toLocaleLowerCase('de')+'|'+answer.toLocaleLowerCase('de');
      if(seen.has(key))return;seen.add(key);
      cards.push({prompt,answer,evidence:flat(evidence),page,kind});
    }
    for(const page of pages){
      const text=clean(page.text);
      const blocks=text.split(/\n\s*\n/).filter(x=>x.trim());
      for(const block of blocks){
        const before=cards.length;
        const qa=block.match(/^\s*(?:Frage|Aufgabe)\s*(?:\d+)?\s*[:.)-]?\s*([\s\S]{8,260}?)\s*\n\s*(?:Antwort|Lösung)\s*:\s*([\s\S]{12,900})$/i);
        if(qa){add(qa[1],qa[2],block,page.page,'Frage und Antwort');continue;}
        const lines=block.split('\n').filter(Boolean);
        if(lines.length>=3 && /:\s*$/.test(lines[0]) && lines.slice(1).every(l=>/^[-•▪]\s+/.test(l))){
          const topic=lines[0].replace(/:\s*$/,'');
          if(termOK(topic))add('Nenne die im Text aufgeführten Punkte zum Thema „'+topic+'“.',lines.slice(1).map(l=>l.replace(/^[-•▪]\s+/, '')).join('; '),block,page.page,'Aufzählung');
        }
        // Segment sentences, keeping wrapped lines together and headings separate.
        const prose=lines.filter(l=>!/^#{1,6}\s|^[-•▪]\s|:\s*$/.test(l)).join(' ');
        const sentences=prose.match(/[^.!?]+(?:[.!?](?=\s|$)|$)/g)||[];
        for(let sentence of sentences){
          sentence=flat(sentence).replace(/^\d+[.)]\s*/, '');
          if(sentence.length<25||sentence.length>600||/[?]$/.test(sentence)||isNoise(sentence))continue;
          const match=sentence.match(/^(.{2,75}?)\s+(ist|sind|bezeichnet|bedeutet|beschreibt|dient|dienen|ermöglicht|ermöglichen|besteht|bestehen|verhindert|verhindern|schützt|schützen)\s+(.{12,})$/i);
          if(!match || !termOK(match[1]))continue;
          const term=match[1].replace(/^(?:ein|eine|der|die|das)\s+/i,''),verb=match[2].toLowerCase();let prompt,kind;
          if(/^(ist|sind|bezeichnet|bedeutet|beschreibt)$/.test(verb)){
            prompt='Erkläre anhand des Textes: Was versteht man unter „'+term+'“?';kind='Begriff erklären';
          }else if(/^(besteht|bestehen)$/.test(verb)){
            if(!/^aus\s/i.test(match[3]))continue;
            prompt='Aus welchen Bestandteilen besteht „'+term+'“ laut Text?';kind='Bestandteile';
          }else{
            prompt='Welche Funktion erfüllt „'+term+'“ laut Text?';kind='Funktion erklären';
          }
          add(prompt,sentence,sentence,page.page,kind);
        }
        if(cards.length===before)skipped++;
      }
    }
    return {cards:cards.slice(0,80),skipped,truncated:cards.length>80};
  }
  function legacyNoise(q){
    return q.type==='selfcheck' && /^(?:Erkläre den Zusammenhang|Was ist bei|Was solltest du zu|Erkläre „)/.test(q.prompt||'') &&
      /„(?:Fachinformatiker\/in|Klasse|Datum|Name|Vorname|Nachname)“/i.test(q.prompt||'');
  }
  const api={analyze,clean,isNoise,legacyNoise};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.StudyImport=api;
})(typeof window!=='undefined'?window:globalThis);
