/* Learning by Doing – lokaler Lerntrainer ohne Framework */
const KEY='learning-by-doing-v2',LEGACY='learning-by-doing-v1',DAY=86400000;
const app=document.querySelector('#app');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id=p=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
const blank=()=>({version:2,records:{},history:[],custom:[],sets:[],sources:[],games:[],theme:'light',quoteShift:0});
let state=blank(),session=null,game=null,message='';

try{
  const v2=JSON.parse(localStorage.getItem(KEY));
  if(v2?.version===2) state={...blank(),...v2};
  else{
    const v1=JSON.parse(localStorage.getItem(LEGACY));
    if(v1?.version===1){state={...blank(),records:v1.records||{},history:v1.history||[],custom:v1.custom||[],theme:v1.theme||'light'};save();}
  }
}catch{warn('Gespeicherte Daten konnten nicht geladen werden.');}

function warn(t){const e=document.querySelector('#storage-warning');if(e)e.innerHTML='<p class="error-banner">'+esc(t)+'</p>'}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{warn('Der Browser kann deinen Fortschritt nicht speichern. Bitte exportiere eine Sicherung.')}}


const MOTIVATION_QUOTES = [
  {category:'Jesus',icon:'✝',text:'Vertraue darauf: Für Gott ist nichts unmöglich.',source:'Sinngemäß nach Matthäus 19,26 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Glaube kann dir neue Möglichkeiten eröffnen, wo du vorher nur Grenzen gesehen hast.',source:'Sinngemäß nach Markus 9,23 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Bitte, suche und klopfe an – gib nicht vorschnell auf.',source:'Sinngemäß nach Matthäus 7,7–8 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Lass dich nicht von Angst bestimmen. Halte am Vertrauen fest.',source:'Sinngemäß nach Markus 5,36 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Wer in kleinen Dingen zuverlässig ist, kann auch größere Verantwortung tragen.',source:'Sinngemäß nach Lukas 16,10 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Sorge dich nicht nur um morgen – konzentriere dich auf das, was heute vor dir liegt.',source:'Sinngemäß nach Matthäus 6,34 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Behandle andere so, wie du selbst behandelt werden möchtest.',source:'Sinngemäß nach Matthäus 7,12 · Hoffnung für alle (HFA)'},
  {category:'Jesus',icon:'✝',text:'Wer bereit ist zu hören, kann wirklich verstehen.',source:'Sinngemäß nach Markus 4,9 · Hoffnung für alle (HFA)'},

  {category:'Bibel',icon:'📖',text:'Sei mutig und entschlossen. Du musst deinen Weg nicht von Angst bestimmen lassen.',source:'Sinngemäß nach Josua 1,9 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Plane deinen Weg sorgfältig und vertraue darauf, dass Gott dich führen kann.',source:'Sinngemäß nach Sprüche 16,9 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Für alles im Leben gibt es die passende Zeit.',source:'Sinngemäß nach Prediger 3,1 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Geduld und Selbstbeherrschung sind wertvoller als bloße Stärke.',source:'Sinngemäß nach Sprüche 16,32 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Guter Rat hilft dir, bessere Entscheidungen zu treffen.',source:'Sinngemäß nach Sprüche 11,14 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Wer Weisheit sucht, gewinnt etwas Wertvolleres als schnellen Erfolg.',source:'Sinngemäß nach Sprüche 3,13–14 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Vertraue nicht nur auf dein eigenes Verständnis – bleib offen für Führung.',source:'Sinngemäß nach Sprüche 3,5–6 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Ausdauer hilft dir, auch schwere Phasen durchzustehen.',source:'Sinngemäß nach Jakobus 1,2–4 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Wenn dir Weisheit fehlt, darfst du darum bitten.',source:'Sinngemäß nach Jakobus 1,5 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Richte deine Gedanken auf das, was wahr, gut und hilfreich ist.',source:'Sinngemäß nach Philipper 4,8 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Gib nicht auf, Gutes zu tun – Ausdauer trägt mit der Zeit Früchte.',source:'Sinngemäß nach Galater 6,9 · Hoffnung für alle (HFA)'},
  {category:'Bibel',icon:'📖',text:'Prüfe Dinge sorgfältig und behalte das Gute.',source:'Sinngemäß nach 1. Thessalonicher 5,21 · Hoffnung für alle (HFA)'},

  {category:'David',icon:'🎵',text:'Auch wenn der Weg dunkel wird, musst du nicht allein durch die Angst gehen.',source:'Sinngemäß nach Psalm 23,4 · David · Hoffnung für alle (HFA)'},
  {category:'David',icon:'🎵',text:'Vertraue Gott deinen Weg an und halte daran fest, auch wenn du das Ergebnis noch nicht siehst.',source:'Sinngemäß nach Psalm 37,5 · David · Hoffnung für alle (HFA)'},
  {category:'David',icon:'🎵',text:'Wenn Angst kommt, kannst du dich entscheiden, dein Vertrauen größer werden zu lassen.',source:'Sinngemäß nach Psalm 56,4 · David · Hoffnung für alle (HFA)'},
  {category:'David',icon:'🎵',text:'Mut heißt nicht, dass der Gegner klein ist. Mut heißt, zu wissen, wem du vertraust.',source:'Sinngemäß nach 1. Samuel 17,45–47 · David · Hoffnung für alle (HFA)'},
  {category:'David',icon:'🎵',text:'Warte nicht nur passiv: Sei mutig, fasse neuen Mut und halte durch.',source:'Sinngemäß nach Psalm 27,14 · David · Hoffnung für alle (HFA)'},

  {category:'Paulus',icon:'✉️',text:'Auch mit wenig Kraft kannst du weitergehen, wenn du deine Stärke nicht nur aus dir selbst erwartest.',source:'Sinngemäß nach Philipper 4,13 · Paulus · Hoffnung für alle (HFA)'},
  {category:'Paulus',icon:'✉️',text:'Lass dich von dem, was hinter dir liegt, nicht festhalten. Richte deinen Blick auf das Ziel vor dir.',source:'Sinngemäß nach Philipper 3,13–14 · Paulus · Hoffnung für alle (HFA)'},
  {category:'Paulus',icon:'✉️',text:'Schwierige Umstände müssen nicht das letzte Wort haben. Gott kann selbst daraus Gutes entstehen lassen.',source:'Sinngemäß nach Römer 8,28 · Paulus · Hoffnung für alle (HFA)'},
  {category:'Paulus',icon:'✉️',text:'Wenn Gott für dich ist, musst du Herausforderungen nicht so behandeln, als wärst du ihnen allein ausgeliefert.',source:'Sinngemäß nach Römer 8,31 · Paulus · Hoffnung für alle (HFA)'},
  {category:'Paulus',icon:'✉️',text:'Schwäche muss dich nicht disqualifizieren. Gerade dort kann neue Kraft sichtbar werden.',source:'Sinngemäß nach 2. Korinther 12,9 · Paulus · Hoffnung für alle (HFA)'},

  {category:'Josua',icon:'🛡️',text:'Sei stark und mutig. Lass dich von Angst nicht davon abhalten, deinen Auftrag anzupacken.',source:'Sinngemäß nach Josua 1,9 · Josua · Hoffnung für alle (HFA)'},
  {category:'Josua',icon:'🛡️',text:'Bleib konsequent bei dem, was du als richtig erkannt hast, auch wenn der Weg anspruchsvoll wird.',source:'Sinngemäß nach Josua 1,7 · Josua · Hoffnung für alle (HFA)'},

  {category:'Salomo',icon:'👑',text:'Verlass dich nicht nur auf das, was du selbst überblickst. Suche Weisheit und Führung.',source:'Sinngemäß nach Sprüche 3,5–6 · Salomo · Hoffnung für alle (HFA)'},
  {category:'Salomo',icon:'👑',text:'Weisheit ist kein Luxus. Sie ist eine Grundlage für gute Entscheidungen.',source:'Sinngemäß nach Sprüche 4,7 · Salomo · Hoffnung für alle (HFA)'},
  {category:'Salomo',icon:'👑',text:'Lege deine Vorhaben bewusst in Gottes Hände und arbeite dann verantwortungsvoll daran.',source:'Sinngemäß nach Sprüche 16,3 · Salomo · Hoffnung für alle (HFA)'},

  {category:'Mose',icon:'🌊',text:'Auch wenn vor dir scheinbar kein Weg ist, muss Panik nicht deine Entscheidung bestimmen.',source:'Sinngemäß nach 2. Mose 14,13–14 · Mose · Hoffnung für alle (HFA)'},
  {category:'Mose',icon:'🌊',text:'Sei mutig und stark. Du musst deinen Weg nicht so gehen, als wärst du verlassen.',source:'Sinngemäß nach 5. Mose 31,6 · Mose · Hoffnung für alle (HFA)'},

  {category:'Jesaja',icon:'🕊️',text:'Wer neue Hoffnung findet, kann auch nach Erschöpfung wieder Kraft bekommen.',source:'Sinngemäß nach Jesaja 40,31 · Hoffnung für alle (HFA)'},
  {category:'Jesaja',icon:'🕊️',text:'Fürchte dich nicht: Auch in Unsicherheit darfst du mit Hilfe und Halt rechnen.',source:'Sinngemäß nach Jesaja 41,10 · Hoffnung für alle (HFA)'},
  {category:'Jesaja',icon:'🕊️',text:'Schwere Zeiten bedeuten nicht automatisch, dass du verlassen bist.',source:'Sinngemäß nach Jesaja 43,2 · Hoffnung für alle (HFA)'},

  {category:'Josef',icon:'🌾',text:'Was andere gegen dich geplant haben, muss nicht bestimmen, wie deine Geschichte endet.',source:'Sinngemäß nach 1. Mose 50,20 · Josef · Hoffnung für alle (HFA)'},
  {category:'Josef',icon:'🌾',text:'Treue in kleinen und schwierigen Situationen kann dich auf Verantwortung vorbereiten, die du heute noch nicht siehst.',source:'Inspiriert von 1. Mose 39–41 · Josef · Hoffnung für alle (HFA)'},

  {category:'Esther',icon:'👑',text:'Vielleicht bist du genau für einen Moment wie diesen an deinem Platz.',source:'Sinngemäß nach Esther 4,14 · Hoffnung für alle (HFA)'},
  {category:'Esther',icon:'👑',text:'Mut bedeutet manchmal, trotz Risiko Verantwortung für andere zu übernehmen.',source:'Inspiriert von Esther 4,15–16 · Hoffnung für alle (HFA)'},

  {category:'Daniel',icon:'🦁',text:'Bleib deinen Überzeugungen treu, auch wenn der Druck von außen größer wird.',source:'Inspiriert von Daniel 6 · Hoffnung für alle (HFA)'},
  {category:'Daniel',icon:'🦁',text:'Eine schwierige Umgebung muss nicht bestimmen, welchen Charakter du entwickelst.',source:'Inspiriert von Daniel 1 · Hoffnung für alle (HFA)'},

  {category:'Petrus',icon:'⚓',text:'Du darfst deine Sorgen abgeben, statt sie allein zu tragen.',source:'Sinngemäß nach 1. Petrus 5,7 · Petrus · Hoffnung für alle (HFA)'},
  {category:'Petrus',icon:'⚓',text:'Nach schwierigen Zeiten kann neue Festigkeit und Stärke entstehen.',source:'Sinngemäß nach 1. Petrus 5,10 · Petrus · Hoffnung für alle (HFA)'},

  {category:'Nehemia',icon:'🧱',text:'Lass dich von Widerstand nicht vom Wiederaufbau abhalten. Arbeite Schritt für Schritt weiter.',source:'Inspiriert von Nehemia 2–6 · Hoffnung für alle (HFA)'},
  {category:'Nehemia',icon:'🧱',text:'Freude und Hoffnung können dir neue Kraft für die nächste Aufgabe geben.',source:'Sinngemäß nach Nehemia 8,10 · Hoffnung für alle (HFA)'},

  {category:'Maria',icon:'🌿',text:'Auch wenn du noch nicht verstehst, wie alles geschehen soll, darfst du Vertrauen wagen.',source:'Inspiriert von Lukas 1,34–38 · Maria · Hoffnung für alle (HFA)'},
  {category:'Maria',icon:'🌿',text:'Große Veränderungen beginnen manchmal mit einem einfachen Ja zum nächsten Schritt.',source:'Inspiriert von Lukas 1,38 · Maria · Hoffnung für alle (HFA)'},

  {category:'Hiob',icon:'🌅',text:'Auch nach Verlust und tiefen Fragen kann Hoffnung bestehen bleiben.',source:'Inspiriert von Hiob 19,25 · Hoffnung für alle (HFA)'},
  {category:'Ruth',icon:'🌾',text:'Treue in kleinen Entscheidungen kann Wege öffnen, die du am Anfang noch nicht sehen kannst.',source:'Inspiriert von Ruth 1–4 · Hoffnung für alle (HFA)'},

  {category:'Philosophie',icon:'🏛',text:'Konzentriere deine Kraft auf das, was du beeinflussen kannst.',source:'Sinngemäß nach Marcus Aurelius'},
  {category:'Philosophie',icon:'🏛',text:'Schwierigkeiten werden kleiner, wenn du ihnen Schritt für Schritt begegnest.',source:'Sinngemäß nach Seneca'},
  {category:'Philosophie',icon:'🏛',text:'Der Anfang einer Veränderung ist, ehrlich zu erkennen, was du noch nicht weißt.',source:'Sinngemäß nach Sokrates'},
  {category:'Philosophie',icon:'🏛',text:'Nicht jedes Hindernis ist ein Stoppschild; manches zwingt dich nur, besser zu denken.',source:'Inspiriert von stoischer Philosophie'},
  {category:'Philosophie',icon:'🏛',text:'Deine Gewohnheiten formen mit der Zeit deinen Charakter.',source:'Sinngemäß nach Aristoteles'},
  {category:'Philosophie',icon:'🏛',text:'Wer lernen will, muss bereit sein, seine erste Meinung zu überprüfen.',source:'Sinngemäß nach Sokrates'},
  {category:'Philosophie',icon:'🏛',text:'Ruhe entsteht, wenn du deine Energie nicht an Unveränderbares verschwendest.',source:'Sinngemäß nach Epiktet'},
  {category:'Philosophie',icon:'🏛',text:'Fortschritt beginnt oft dort, wo Bequemlichkeit endet.',source:'Inspiriert von stoischer Philosophie'},
  {category:'Philosophie',icon:'🏛',text:'Eine große Aufgabe wird machbar, wenn du sie in kleine Handlungen zerlegst.',source:'Inspiriert von praktischer Philosophie'},
  {category:'Philosophie',icon:'🏛',text:'Geduld bedeutet nicht Stillstand, sondern konsequentes Weitergehen ohne Hektik.',source:'Inspiriert von stoischer Philosophie'},

  {category:'Sport',icon:'🏆',text:'Disziplin bedeutet, auch dann weiterzumachen, wenn die Motivation gerade fehlt.',source:'Motivationsgedanke aus dem Leistungssport'},
  {category:'Sport',icon:'🏀',text:'Fehlversuche zeigen dir, woran du als Nächstes arbeiten kannst.',source:'Sinngemäß inspiriert von Michael Jordan'},
  {category:'Sport',icon:'🏆',text:'Fortschritt entsteht nicht durch einen perfekten Tag, sondern durch viele gute Wiederholungen.',source:'Inspiriert vom Trainingsprinzip im Sport'},
  {category:'Sport',icon:'⚽',text:'Trainiere die Grundlagen so lange, bis du sie auch unter Druck abrufen kannst.',source:'Motivationsgedanke aus dem Leistungssport'},
  {category:'Sport',icon:'🥊',text:'Ein harter Tag entscheidet nicht über deinen Weg. Entscheidend ist, ob du wieder antrittst.',source:'Inspiriert vom Boxsport'},
  {category:'Sport',icon:'🏃',text:'Beständigkeit bringt dich oft weiter als ein kurzer Sprint.',source:'Inspiriert vom Ausdauertraining'},
  {category:'Sport',icon:'🏀',text:'Verlorene Punkte gehören zum Spiel. Wichtig ist die nächste Aktion.',source:'Inspiriert vom Basketball'},
  {category:'Sport',icon:'⚽',text:'Gute Vorbereitung gibt dir Sicherheit, wenn der Druck steigt.',source:'Inspiriert vom Profisport'},
  {category:'Sport',icon:'🏆',text:'Vergleiche dich weniger mit anderen und mehr mit deiner Leistung von gestern.',source:'Motivationsgedanke aus dem Sport'},
  {category:'Sport',icon:'🥇',text:'Talent kann dir einen Vorsprung geben. Training entscheidet, was du daraus machst.',source:'Motivationsgedanke aus dem Leistungssport'},

  {category:'Unternehmertum',icon:'🚀',text:'Eine Idee wird erst wertvoll, wenn du beginnst, sie umzusetzen und daraus zu lernen.',source:'Motivationsgedanke aus dem Unternehmertum'},
  {category:'Unternehmertum',icon:'💡',text:'Baue, teste, lerne und verbessere – statt auf den perfekten ersten Versuch zu warten.',source:'Sinngemäß inspiriert von Sara Blakely'},
  {category:'Unternehmertum',icon:'🛠',text:'Gute Arbeit entsteht leichter, wenn du einen Sinn darin siehst und neugierig bleibst.',source:'Sinngemäß inspiriert von Steve Jobs'},
  {category:'Unternehmertum',icon:'🚀',text:'Fehler sind Daten: Nutze sie, verbessere deinen nächsten Versuch und gehe weiter.',source:'Inspiriert von iterativem Arbeiten'},
  {category:'Unternehmertum',icon:'📈',text:'Ein kleines Ergebnis heute ist wertvoller als ein perfekter Plan, den du nie beginnst.',source:'Motivationsgedanke aus dem Unternehmertum'},
  {category:'Unternehmertum',icon:'💼',text:'Wer Probleme gut versteht, findet meist bessere Lösungen als jemand, der nur schnell antwortet.',source:'Inspiriert von Produktentwicklung'},
  {category:'Unternehmertum',icon:'🧪',text:'Teste Annahmen früh, damit du Fehler bemerkst, solange sie noch klein sind.',source:'Inspiriert von Lean-Startup-Prinzipien'},
  {category:'Unternehmertum',icon:'🧭',text:'Ein klares Ziel macht Entscheidungen leichter.',source:'Motivationsgedanke aus Führung und Unternehmertum'},

  {category:'Film',icon:'🎬',text:'Nicht der Rückschlag entscheidet, sondern ob du danach wieder aufstehst.',source:'Inspiriert von Rocky'},
  {category:'Film',icon:'🎬',text:'Große Aufgaben wirken kleiner, wenn du den nächsten machbaren Schritt wählst.',source:'Inspiriert von Abenteuer- und Heldenfilmen'},
  {category:'Film',icon:'🎬',text:'Mut bedeutet nicht, keine Angst zu haben, sondern trotzdem weiterzugehen.',source:'Inspiriert von Heldenreisen im Film'},
  {category:'Film',icon:'🎬',text:'Manchmal verändert nicht die größte Entscheidung dein Leben, sondern die nächste richtige.',source:'Inspiriert von Coming-of-Age-Filmen'},
  {category:'Film',icon:'🎬',text:'Du musst nicht der Beste im Raum sein, um heute etwas dazuzulernen.',source:'Inspiriert von Trainings- und Mentorenfilmen'},

  {category:'Buch',icon:'📚',text:'Wissen wächst, wenn du es anwendest – nicht nur, wenn du es liest.',source:'Inspiriert vom Prinzip Learning by Doing'},
  {category:'Buch',icon:'📚',text:'Kleine Gewohnheiten wirken unscheinbar, können aber langfristig große Veränderungen auslösen.',source:'Sinngemäß inspiriert von Atomic Habits'},
  {category:'Buch',icon:'📚',text:'Ein Problem wird leichter, wenn du es klar benennst und in kleinere Teile zerlegst.',source:'Inspiriert von Problemlösungs-Literatur'},
  {category:'Buch',icon:'📚',text:'Nicht mehr Informationen machen dich automatisch besser – entscheidend ist, was du damit tust.',source:'Inspiriert von Lern- und Sachbüchern'},
  {category:'Buch',icon:'📚',text:'Wer regelmäßig reflektiert, erkennt schneller, was funktioniert und was geändert werden muss.',source:'Inspiriert von Lern- und Entwicklungsbüchern'},

  {category:'Lernen',icon:'🧠',text:'Eine falsche Antwort ist kein Ende. Sie zeigt dir genau, was du als Nächstes lernen kannst.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Verstehen schlägt Auswendiglernen – besonders wenn die Aufgabe plötzlich anders gestellt wird.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Zehn konzentrierte Minuten heute sind besser als zwei Stunden, die du immer wieder verschiebst.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Wenn du eine Sache erklären kannst, ohne in deine Unterlagen zu schauen, bist du dem Verständnis näher.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Wiederholen ist kein Rückschritt. Wiederholen macht Wissen abrufbar.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Rechne den Weg selbst nach – das Ergebnis allein bringt dir in der Prüfung wenig.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Lerne nicht nur die richtige Antwort. Lerne, warum die anderen Antworten falsch sind.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Schwierige Themen werden leichter, wenn du sie oft genug in kleinen Portionen bearbeitest.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Ein guter Lerntag muss nicht lang sein. Er muss konzentriert und ehrlich sein.',source:'Learning by Doing'},
  {category:'Lernen',icon:'🧠',text:'Dein Fortschritt steckt nicht nur in Punkten, sondern in den Dingen, die du heute erklären kannst.',source:'Learning by Doing'}
];

function motivationIndex(){
  const slot=Math.floor(Date.now()/(30*60*1000));
  return (slot+(Number(state.quoteShift)||0))%MOTIVATION_QUOTES.length;
}
function motivationCard(){
  const q=MOTIVATION_QUOTES[motivationIndex()];
  return '<section class="motivation-card" id="motivation-card"><div class="motivation-icon">'+esc(q.icon)+'</div><div class="motivation-copy"><div class="motivation-top"><span class="tag">'+esc(q.category)+'</span><span class="small">wechselt automatisch</span></div><blockquote>„'+esc(q.text)+'“</blockquote><p>'+esc(q.source)+'</p></div><button class="quiet motivation-next" id="motivation-next" type="button" title="Anderen Motivationsspruch anzeigen">↻ Neuer Spruch</button></section>';
}
function refreshMotivation(){
  const node=document.querySelector('#motivation-card');
  if(!node)return;
  const q=MOTIVATION_QUOTES[motivationIndex()];
  node.querySelector('.motivation-icon').textContent=q.icon;
  node.querySelector('.tag').textContent=q.category;
  node.querySelector('blockquote').textContent='„'+q.text+'“';
  node.querySelector('.motivation-copy > p').textContent=q.source;
}

function questions(){
  return [...(window.EXAMPLE_QUESTIONS||[]).map(q=>({...q,subject:q.subject||'IHK AP2',setId:q.setId||'',sourceName:q.sourceName||'Beispielaufgaben'})),...(state.custom||[])];
}
function rec(q){return state.records[q.id]||{attempts:0,correct:0,streak:0,due:0,last:0}}
function mastered(q){return rec(q).streak>=3}
function pct(list){return list.length?Math.round(list.filter(mastered).length/list.length*100):0}
function errors(){return questions().filter(q=>rec(q).attempts&&rec(q).streak<3)}
function subjects(){return [...new Set(questions().map(q=>q.subject||'Allgemein'))].sort()}
function topics(){return [...new Set(questions().map(q=>q.topic))].sort()}
function bySet(s){return questions().filter(q=>q.setId===s)}
function setById(s){return state.sets.find(x=>x.id===s)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function formatDate(v){if(!v)return'';const[y,m,d]=v.split('-');return d+'.'+m+'.'+y}
function deadlineText(v){
  if(!v)return'';
  const today=new Date();today.setHours(0,0,0,0);
  const target=new Date(v+'T00:00:00');
  const days=Math.round((target-today)/DAY);
  if(days===0)return'Heute';
  if(days===1)return'Morgen';
  if(days>1)return'In '+days+' Tagen';
  if(days===-1)return'Gestern';
  return'Vor '+Math.abs(days)+' Tagen';
}
function totalXp(){return state.history.reduce((n,x)=>n+(x.correct?12:4),0)+questions().filter(mastered).length*25+(state.games||[]).reduce((n,x)=>n+(x.xp||0),0)}
function level(){const xp=totalXp(),step=250;return{xp,n:Math.floor(xp/step)+1,cur:xp%step,step}}
function streak(){
  const ds=new Set(state.history.map(x=>new Date(x.at).toLocaleDateString('sv-SE')));let n=0,d=new Date();
  while(ds.has(d.toLocaleDateString('sv-SE'))){n++;d.setDate(d.getDate()-1)}return n;
}
function head(t,s,c='Dein Tempo zählt'){return '<div class="heading"><div><h1>'+esc(t)+'</h1><p>'+esc(s)+'</p></div><span class="chip">'+esc(c)+'</span></div>'}
function stats(){
  const today=new Date().toLocaleDateString('sv-SE'),h=state.history.filter(x=>new Date(x.at).toLocaleDateString('sv-SE')===today),l=level();
  return '<div class="grid stats-grid">'+
    '<div class="card stat-card"><div class="stat-label">Heute beantwortet</div><div class="stat">'+h.length+'</div><div class="small">'+h.filter(x=>x.correct).length+' richtig</div></div>'+
    '<div class="card stat-card"><div class="stat-label">Zur Wiederholung</div><div class="stat">'+errors().length+'</div><div class="small">'+errors().filter(q=>rec(q).due<=Date.now()).length+' jetzt fällig</div></div>'+
    '<div class="card stat-card"><div class="stat-label">Level</div><div class="stat">'+l.n+'</div><div class="small">'+l.xp+' XP insgesamt</div></div>'+
    '<div class="card stat-card"><div class="stat-label">Lernserie</div><div class="stat">'+streak()+'</div><div class="small">Tage in Folge</div></div></div>';
}
function rows(key){
  const values=key==='subject'?subjects():topics();
  return values.map(v=>{const list=questions().filter(q=>(key==='subject'?(q.subject||'Allgemein'):q.topic)===v);return '<div class="topic-row"><div class="topic-line"><strong>'+esc(v)+'</strong><small>'+pct(list)+'% sicher · '+list.length+' Aufgaben</small></div><progress max="100" value="'+pct(list)+'"></progress></div>'}).join('');
}
function setCard(s){
  const list=bySet(s.id),sources=state.sources.filter(x=>x.setId===s.id).length,deadline=deadlineText(s.date);
  return '<article class="set-card"><div class="topic-line"><span class="tag">'+esc(s.kind)+'</span>'+(s.date?'<small title="'+esc(formatDate(s.date))+'">'+esc(deadline)+' · '+esc(formatDate(s.date))+'</small>':'')+'</div><h3>'+esc(s.name)+'</h3><p>'+esc(s.subject)+'</p><progress max="100" value="'+pct(list)+'"></progress><div class="small">'+pct(list)+'% sicher · '+list.length+' Karten/Fragen · '+sources+' Dateien</div><div class="actions compact"><button data-set-learn="'+esc(s.id)+'">Lernen</button><button class="quiet" data-set-delete="'+esc(s.id)+'">Löschen</button></div></article>';
}


function render(){
  document.body.classList.toggle('dark',state.theme==='dark');
  const route=location.hash.slice(1)||'dashboard';
  document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+route));
  document.querySelector('#error-count').textContent=errors().length;
  if(session){renderQuestion();return}
  if(game){renderGame();return}
  if(route==='dashboard') dashboard();
  else if(route==='learn'||route==='errors') learn(route);
  else if(route==='library') library();
  else if(route==='games') gamesHome();
  else if(route==='topics') topicsView();
  else if(route==='progress') progress();
  else if(route==='exam') exam();
  else if(route==='guide') guide();
  else{location.hash='dashboard';return}
  bind();
}

function dashboard(){
  const l=level(),today=new Date().toLocaleDateString('sv-SE'),active=[...state.sets].sort((a,b)=>{
    const rank=s=>!s.date?1:(s.date>=today?0:2),ra=rank(a),rb=rank(b);
    if(ra!==rb)return ra-rb;
    return ra===2?(b.date||'').localeCompare(a.date||''):(a.date||'9999').localeCompare(b.date||'9999');
  }).slice(0,4);
  app.innerHTML=head('Dein nächster Aha-Moment.','Lerne für IHK, Klausuren und Tests – Fach für Fach und in deinem Tempo.','Level '+l.n)+
  '<section class="hero"><div><div class="eyebrow">DEINE NÄCHSTE LERNRUNDE</div><h2>Üben, verstehen,<br>noch einmal anwenden.</h2><p>Falsche Antworten werden wiederholt. Eigene Unterlagen kannst du einem Fach und Lernset zuordnen.</p><div class="actions"><button data-start="learn">Lernen starten</button><a class="button quiet" href="#library">Unterlagen hinzufügen</a><a class="button quiet" href="#guide">Guide ansehen</a></div></div><div class="ring" style="--value:'+pct(questions())+'%"><div><strong>'+pct(questions())+'%</strong><small>sicher gelernt</small></div></div></section>'+
  stats()+motivationCard()+
  '<div class="two"><section class="card"><div class="section-head"><h2>Deine Fächer</h2><a href="#library">Verwalten</a></div>'+rows('subject')+'</section><section class="card"><span class="tag">LEVEL '+l.n+'</span><h2>'+l.cur+' / '+l.step+' XP bis Level '+(l.n+1)+'</h2><progress max="'+l.step+'" value="'+l.cur+'"></progress><p>Richtige Antworten, gemeisterte Aufgaben und Lernspiele geben XP.</p><div class="mini-badges"><span>🔥 '+streak()+' Tage</span><span>🧠 '+questions().filter(mastered).length+' gemeistert</span><span>🎮 '+(state.games||[]).length+' Spiele</span></div></section></div>'+
  '<section class="card" style="margin-top:24px"><div class="section-head"><h2>Deine Klausuren & Tests</h2><a href="#library">Neues Lernset</a></div>'+(active.length?'<div class="set-grid">'+active.map(setCard).join('')+'</div>':'<div class="empty-state"><strong>Noch kein eigenes Lernset.</strong><p>Lege zum Beispiel „Netzwerktechnik Klausur 2“ oder „WiSo Test Freitag“ an.</p><a class="button" href="#library">Erstes Lernset anlegen</a></div>')+'</section>';
}

function learn(route){
  const err=route==='errors';
  app.innerHTML=head(err?'Aus Fehlern wird Verständnis.':'Was möchtest du heute lernen?',err?'Hier wiederholst du Aufgaben, die noch nicht sicher sitzen.':'Wähle Fach, Thema oder Lernset. Du kannst auch alles mischen.')+
  '<section class="card"><h2>'+(err?'Deine Wiederholungsrunde':'Eine Frage nach der anderen')+'</h2><p>'+(err?errors().length+' Aufgaben sind noch in Wiederholung.':'Fällige Wiederholungen kommen zuerst. Lernkarten aus PDFs bewertest du selbst mit „Gewusst“ oder „Noch nicht“.')+'</p>'+
  '<div class="filter-grid"><label>Fach<select id="subject-select"><option value="">Alle Fächer</option>'+subjects().map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label><label>Thema<select id="topic-select"><option value="">Alle Themen</option>'+topics().map(t=>'<option>'+esc(t)+'</option>').join('')+'</select></label><label>Lernset<select id="set-select"><option value="">Alle Lernsets</option>'+state.sets.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+' · '+esc(s.subject)+'</option>').join('')+'</select></label></div>'+
  '<div class="actions"><button data-start="'+route+'">'+(err?'Wiederholung starten':'Lernrunde starten')+'</button></div><div class="hint">Eine Runde enthält bis zu 10 Aufgaben. Falsche Antworten kommen nach einigen anderen Fragen erneut.</div></section>';
}

function library(){
  app.innerHTML=head('Fächer, Klausuren und Tests.','Organisiere mehrere Fächer gleichzeitig und ordne jede Datei dem passenden Lernset zu.',state.sets.length+' Lernsets')+
  '<div class="two library-columns"><section class="card"><span class="tag">1 · LERNSET</span><h2>Neues Lernset anlegen</h2><p>Ein Lernset ist zum Beispiel eine Klausur, ein kurzer Test oder eine IHK-Prüfung.</p><form id="set-form" class="stack-form"><label>Name<input name="name" required maxlength="80" placeholder="z. B. Netzwerktechnik Klausur 2"></label><label>Fach<input name="subject" required maxlength="60" placeholder="z. B. Netzwerktechnik"></label><label>Art<select name="kind"><option>Klausur</option><option>Test</option><option>IHK</option><option>Sonstiges</option></select></label><label>Termin (optional)<input name="date" type="date"></label><button type="submit">Lernset anlegen</button></form></section>'+
  '<section class="card"><span class="tag">2 · DATEIEN</span><h2>Unterlagen hinzufügen</h2><p>PDF, TXT, Markdown oder strukturierte JSON-Fragen. Mehrere Dateien dürfen gleichzeitig gewählt werden.</p><form id="material-form" class="stack-form"><label>Lernset<select name="setId" id="material-set" required><option value="">Bitte wählen</option>'+state.sets.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+' · '+esc(s.subject)+'</option>').join('')+'</select></label><label>Dateien<input id="material-files" type="file" multiple accept=".pdf,.txt,.md,.json,application/pdf,application/json,text/plain,text/markdown" required></label><button type="submit" '+(state.sets.length?'':'disabled')+'>Dateien einlesen</button></form><p id="material-status" class="status-text">'+esc(message)+'</p><div class="hint"><strong>Wichtig:</strong> JSON-Fragen können automatisch geprüft werden. Aus PDF/TXT entstehen Selbstkontroll-Lernkarten. Freie Antworten bewertet die Seite bewusst nicht automatisch.</div></section></div>'+
  '<section class="card" style="margin-top:24px"><div class="section-head"><h2>Deine Lernsets</h2><span class="small">Mehrere Fächer parallel möglich</span></div>'+(state.sets.length?'<div class="set-grid">'+state.sets.map(setCard).join('')+'</div>':'<div class="empty-state"><strong>Noch keine Lernsets.</strong><p>Lege oben dein erstes Lernset an.</p></div>')+'</section>'+
  '<section class="card" style="margin-top:24px"><div class="section-head"><h2>Importierte Dateien</h2><span class="small">'+state.sources.length+' gespeichert</span></div>'+(state.sources.length?'<div class="source-list">'+[...state.sources].reverse().map(s=>'<div><strong>'+esc(s.name)+'</strong><span>'+esc(setById(s.setId)?.name||s.subject)+' · '+(s.cards||0)+' Lernkarten</span></div>').join('')+'</div>':'<p class="muted">Noch keine eigenen Dateien importiert.</p>')+'</section>';
}

function gamesHome(){
  app.innerHTML=head('Spiel dich schlauer.','Kurze Lernspiele greifen auf deine vorhandenen Fragen zurück.','Bonus-XP')+
  '<div class="game-grid"><article class="card game-card"><div class="game-icon">🧠</div><span class="tag">MEMORY</span><h2>Frage & Antwort</h2><p>Finde passende Paare aus Frage und Lösung.</p><button data-game="memory">Memory starten</button></article><article class="card game-card"><div class="game-icon">🕵️</div><span class="tag">DETEKTIV</span><h2>Wissensdetektiv</h2><p>Löse drei Fälle. Jede richtige Antwort bringt einen Hinweis.</p><button data-game="detective">Fall übernehmen</button></article><article class="card game-card"><div class="game-icon">⚠️</div><span class="tag">WAS IST FALSCH?</span><h2>Fehler finden</h2><p>Eine Frage-Antwort-Zuordnung ist absichtlich falsch.</p><button data-game="wrong">Fehlerjagd starten</button></article></div>'+
  '<section class="card" style="margin-top:24px"><h2>Warum Lernspiele?</h2><p>Sie ersetzen keine Prüfungssimulation, helfen aber beim schnellen Abrufen und Erkennen von Zusammenhängen.</p></section>';
}

function topicsView(){
  app.innerHTML=head('Themen im Blick.','Sieh, welche Inhalte schon sicher sitzen und wo Wiederholung sinnvoll ist.')+
  '<div class="topic-cards">'+topics().map(t=>{const list=questions().filter(q=>q.topic===t);return '<section class="card"><span class="tag">'+list.length+' Aufgaben</span><h2>'+esc(t)+'</h2><p>'+list.filter(mastered).length+' sicher gelernt · '+list.filter(q=>!rec(q).attempts).length+' noch neu</p><progress max="100" value="'+pct(list)+'"></progress><button data-topic="'+esc(t)+'">Dieses Thema lernen</button></section>'}).join('')+'</div>'+
  '<section class="card" style="margin-top:24px"><h2>Strukturierte Fragen als JSON</h2><p>JSON eignet sich besonders für automatische Auswertung mit eindeutiger Lösung.</p><input id="import" type="file" accept=".json,application/json"><p id="import-status">'+esc(message)+'</p></section>';
}

function progress(){
  const n=state.history.length,acc=n?Math.round(state.history.filter(x=>x.correct).length/n*100):0,l=level();
  app.innerHTML=head('Du kommst voran.','Level, Fächer und Lernsets zeigen dir, wo du stehst.','Level '+l.n)+stats()+
  '<div class="two"><section class="card"><h2>Fortschritt je Fach</h2>'+rows('subject')+'</section><section class="card"><h2>Dein Lernprofil</h2><div class="big-number">'+acc+'%</div><p>Richtige Antworten bei '+n+' Versuchen.</p><p>'+questions().filter(q=>rec(q).attempts).length+' von '+questions().length+' Aufgaben ausprobiert.</p><h3>Level '+l.n+'</h3><progress max="'+l.step+'" value="'+l.cur+'"></progress><p class="small">'+l.cur+' von '+l.step+' XP bis zum nächsten Level.</p></section></div>'+
  '<section class="card" style="margin-top:24px"><h2>Lernsets</h2>'+(state.sets.length?'<div class="set-grid">'+state.sets.map(setCard).join('')+'</div>':'<p class="muted">Noch keine eigenen Lernsets vorhanden.</p>')+'</section>'+
  '<section class="card" style="margin-top:24px"><h2>Fortschritt sichern</h2><div class="actions"><button id="export">Sicherung herunterladen</button><label class="file-button">Sicherung wiederherstellen<input id="restore" type="file" accept=".json,application/json"></label></div><p id="restore-status"></p></section>';
}

function guide(){
  const steps=[
    {n:'01',icon:'▣',title:'Fach & Lernset anlegen',text:'Öffne „Fächer & Lernsets“. Lege für eine Klausur, einen Test oder die IHK ein Lernset an. Fach, Name und optionales Prüfungsdatum helfen dir, alles sauber zu trennen.',link:'#library',action:'Lernset anlegen'},
    {n:'02',icon:'⇧',title:'Unterlagen hinzufügen',text:'Ordne PDF-, TXT-, Markdown- oder JSON-Dateien einem Lernset zu. Aus PDF/TXT/MD erstellt die App Selbstkontroll-Lernkarten; JSON kann fertige Fragen enthalten.',link:'#library',action:'Unterlagen öffnen'},
    {n:'03',icon:'▷',title:'Lernrunde starten',text:'Unter „Lernen“ kannst du nach Fach, Thema oder Lernset filtern. Eine Runde enthält bis zu 10 Aufgaben. Fällige Wiederholungen werden bevorzugt.',link:'#learn',action:'Lernen starten'},
    {n:'04',icon:'↻',title:'Fehler gezielt wiederholen',text:'Falsche oder noch unsichere Aufgaben landen im Fehlertraining. Beantworte sie erneut, bis das Wissen sicherer sitzt.',link:'#errors',action:'Fehlertraining'},
    {n:'05',icon:'♟',title:'Mit Lernspielen festigen',text:'Memory, Wissensdetektiv und „Was ist falsch?“ bringen Abwechslung hinein. Spiele geben zusätzlich XP und helfen beim Wiederholen.',link:'#games',action:'Lernspiele öffnen'},
    {n:'06',icon:'◴',title:'Fortschritt beobachten',text:'Im Fortschritt siehst du Erfolgsquote, gemeisterte Aufgaben, Fachfortschritt, Lernsets, XP und Level. Dort kannst du deine Daten auch sichern.',link:'#progress',action:'Fortschritt ansehen'},
    {n:'07',icon:'▤',title:'Prüfung simulieren',text:'Im Prüfungsmodus bekommst du keine direkte Hilfe. Die Auswertung erfolgt am Ende. So kannst du testen, was unter Prüfungsbedingungen wirklich sitzt.',link:'#exam',action:'Prüfungsmodus'},
    {n:'08',icon:'✦',title:'Dranbleiben',text:'Motivationssprüche wechseln automatisch und können manuell weitergeschaltet werden. Lernserie, XP und Level machen deinen regelmäßigen Fortschritt sichtbar.',link:'#dashboard',action:'Zum Dashboard'}
  ];
  app.innerHTML=head('Guide & Hilfe.','So nutzt du Learning by Doing vom ersten Lernset bis zur Probeprüfung.','8 SCHRITTE')+
  '<section class="guide-intro"><div><span class="eyebrow">SCHNELLSTART</span><h2>In wenigen Minuten startklar.</h2><p>Du musst nicht jede Funktion sofort benutzen. Für den Anfang reichen ein Lernset, deine Unterlagen und eine erste Lernrunde.</p><div class="actions"><a class="button" href="#library">Jetzt Lernset anlegen</a><a class="button quiet" href="#learn">Direkt lernen</a></div></div><div class="guide-flow"><span>1</span><b>Lernset</b><i>→</i><span>2</span><b>Import</b><i>→</i><span>3</span><b>Lernen</b><i>→</i><span>4</span><b>Wiederholen</b></div></section>'+
  '<section class="guide-section"><div class="section-head"><div><span class="eyebrow">SCHRITT FÜR SCHRITT</span><h2>So funktioniert die Plattform</h2></div></div><div class="guide-grid">'+steps.map(s=>'<article class="guide-card"><div class="guide-card-top"><span class="guide-number">'+s.n+'</span><span class="guide-icon">'+s.icon+'</span></div><h3>'+s.title+'</h3><p>'+s.text+'</p><a href="'+s.link+'">'+s.action+' →</a></article>').join('')+'</div></section>'+
  '<section class="guide-section guide-explain"><div class="card"><span class="tag">LERNLOGIK</span><h2>Warum falsche Antworten wiederkommen</h2><p>Learning by Doing arbeitet mit Wiederholungen. Wenn du eine Aufgabe falsch oder als „noch nicht gewusst“ bewertest, wird sie erneut eingeplant. Mehrere richtige Antworten hintereinander zeigen der App, dass das Thema sicherer sitzt.</p><div class="guide-mini-flow"><span>❌ Noch unsicher</span><i>→</i><span>↻ Wiederholen</span><i>→</i><span>✓ richtig</span><i>→</i><span>🧠 gemeistert</span></div></div>'+
  '<div class="card"><span class="tag">XP & LEVEL</span><h2>Was bedeuten XP und Level?</h2><p>Richtige Antworten, gemeisterte Aufgaben und Lernspiele geben XP. Die Level sollen motivieren; wichtiger als die Zahl ist aber, welche Themen du wirklich erklären und anwenden kannst.</p><div class="hint">Tipp: Nutze XP als Motivation – nicht als Ersatz für echtes Verständnis.</div></div></section>'+
  '<section class="guide-section"><div class="card"><span class="tag">DATEIEN</span><h2>Welche Dateien kann ich verwenden?</h2><div class="guide-file-grid"><div><strong>PDF</strong><small>Text wird lokal gelesen und in Selbstkontroll-Karten aufgeteilt.</small></div><div><strong>TXT / MD</strong><small>Notizen und Lerntexte werden ebenfalls in Lernkarten umgewandelt.</small></div><div><strong>JSON</strong><small>Importiert strukturierte Fragen mit Antworten und Fragetypen.</small></div></div><p class="small">Die Originaldateien werden nicht auf einen Server hochgeladen. Die erzeugten Lerndaten werden im Browser gespeichert.</p></div></section>'+
  '<section class="guide-section"><div class="card"><span class="tag">DATENSICHERUNG</span><h2>Dein Fortschritt bleibt lokal</h2><p>Deine Lernsets, Ergebnisse und Fortschritte liegen im lokalen Browserspeicher. Deshalb solltest du regelmäßig unter „Fortschritt“ eine Sicherung herunterladen – besonders bevor du Browserdaten löschst oder den Rechner wechselst.</p><div class="actions"><a class="button" href="#progress">Sicherung & Fortschritt</a></div></div></section>'+
  '<section class="guide-section"><div class="card"><span class="tag">EMPFOHLENER ABLAUF</span><h2>So würde ich für eine Klausur lernen</h2><ol class="guide-routine"><li><b>7–14 Tage vorher:</b> Lernset anlegen und Unterlagen importieren.</li><li><b>Jeden Lerntag:</b> Erst Fehlertraining, danach neue Aufgaben.</li><li><b>Schwierige Themen:</b> In kleinen Runden wiederholen und in eigenen Worten erklären.</li><li><b>2–3 Tage vorher:</b> Mehrere gemischte Lernrunden durchführen.</li><li><b>Am Ende:</b> Prüfungsmodus ohne Hilfen starten und anschließend Fehler gezielt nacharbeiten.</li></ol></div></section>'+
  '<section class="guide-section"><div class="card guide-help"><div><span class="eyebrow">WENN ETWAS NICHT KLAPPT</span><h2>Keine Panik – deine Daten zuerst sichern.</h2><p>Wenn Import, Anzeige oder Lernen unerwartet reagiert, sichere zuerst deinen Fortschritt. Danach kannst du die Seite neu laden und den betroffenen Schritt erneut testen.</p></div><a class="button quiet" href="#progress">Zur Sicherung</a></div></section>';
}

function exam(){
  app.innerHTML=head('Prüfungsmodus.','Teste dich ohne direkte Hinweise und werte erst am Ende aus.')+
  '<section class="card"><span class="tag">PROBELAUF</span><h2 style="margin-top:20px">Ohne Hinweise. Mit ehrlichem Feedback.</h2><p>Wähle optional ein Lernset. Selbstkontroll-Lernkarten aus PDFs werden hier ausgelassen.</p><label>Lernset<select id="exam-set"><option value="">Alle automatisch bewertbaren Fragen</option>'+state.sets.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+' · '+esc(s.subject)+'</option>').join('')+'</select></label><div class="actions"><button data-start="exam">Probeprüfung starten</button></div></section>';
}

function start(mode,opt={}){
  let list=questions(),subject=opt.subject||document.querySelector('#subject-select')?.value||'',topic=opt.topic||document.querySelector('#topic-select')?.value||'',setId=opt.setId||document.querySelector('#set-select')?.value||(mode==='exam'?document.querySelector('#exam-set')?.value||'':'');
  if(subject)list=list.filter(q=>q.subject===subject);
  if(topic)list=list.filter(q=>q.topic===topic);
  if(setId)list=list.filter(q=>q.setId===setId);
  if(mode==='errors')list=list.filter(q=>rec(q).attempts&&rec(q).streak<3);
  if(mode==='exam')list=shuffle(list.filter(q=>q.type!=='selfcheck'));
  else list.sort((a,b)=>{const rank=q=>rec(q).attempts&&rec(q).due<=Date.now()?0:!rec(q).attempts?1:2;return rank(a)-rank(b)||rec(a).due-rec(b).due});
  session={mode,queue:list.slice(0,10),index:0,answered:false,results:[]};render();
}

function renderQuestion(){
  const s=session,q=s.queue[s.index];
  if(!q){summary();return}
  const self=q.type==='selfcheck';
  app.innerHTML=head(s.mode==='exam'?'Deine Probeprüfung':s.mode==='errors'?'Du kannst das verstehen.':'Zeit für einen Aha-Moment.',s.mode==='exam'?'Die Auswertung folgt nach der letzten Antwort.':self?'Formuliere erst selbst und decke dann die Lösung auf.':'Denk in Ruhe nach. Es geht ums Verstehen.')+
  '<section class="card question"><div class="topic-line"><div><span class="tag">'+esc(q.subject||'Allgemein')+'</span> <span class="tag soft">'+esc(q.topic)+'</span></div><small>Aufgabe '+(s.index+1)+' von '+s.queue.length+'</small></div><progress value="'+s.index+'" max="'+s.queue.length+'"></progress><h2>'+esc(q.prompt)+'</h2>'+
  (self?'<div class="self-check-box"><label>Deine Antwort in eigenen Worten (optional)<textarea id="thoughts" rows="4" placeholder="Schreibe auf, was du weißt."></textarea></label><div class="actions"><button id="reveal">Antwort aufdecken</button><button class="quiet" id="end">Runde beenden</button></div></div>':
  '<form id="answer-form">'+(q.type==='choice'?'<div class="options">'+q.options.map(o=>'<label class="option"><input type="radio" name="answer" value="'+esc(o)+'" required><span>'+esc(o)+'</span></label>').join('')+'</div>':'<label>Deine Antwort<input name="answer" type="text" required autocomplete="off" placeholder="Antwort eingeben"></label>')+'<div class="actions"><button type="submit">'+(s.mode==='exam'?'Antwort abgeben':'Antwort prüfen')+'</button><button type="button" class="quiet" id="end">Runde beenden</button></div></form>')+
  '<div id="feedback"></div></section>';
  if(self)document.querySelector('#reveal').onclick=()=>reveal(q);
  else document.querySelector('#answer-form').onsubmit=e=>{e.preventDefault();submit(new FormData(e.target).get('answer'))};
  document.querySelector('#end').onclick=()=>{if(s.mode==='exam'&&s.results.length)summary(true);else{session=null;render()}};
}
function norm(v){return String(v??'').trim().toLowerCase().replace(/,/g,'.').replace(/\s+/g,' ')}
function numericValue(v){
  const n=norm(v),m=n.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*[a-zäöüßµ%€$\/²³.-]+)?$/i);
  return m?Number(m[1]):NaN;
}
function correct(q,v){
  const n=norm(v);
  if(q.type==='number'){
    const given=numericValue(n),expected=numericValue(q.answer);
    return Number.isFinite(given)&&Number.isFinite(expected)&&given===expected;
  }
  return [q.answer,...(q.aliases||[])].some(a=>norm(a)===n);
}
function update(q,ok){
  const r={...rec(q)};r.attempts++;r.correct+=Number(ok);r.streak=ok?r.streak+1:0;r.last=Date.now();r.due=r.last+(ok?[1,3,7,14][Math.min(r.streak-1,3)]*DAY:60000);
  state.records[q.id]=r;state.history.push({id:q.id,at:r.last,correct:ok,subject:q.subject||'Allgemein',setId:q.setId||''});
}
function explain(q,ok,answer){
  return '<div class="feedback '+(ok?'':'wrong')+'"><h3>'+(ok?'Richtig. Gut gemacht!':'Noch nicht ganz – schauen wir es uns an.')+'</h3>'+(answer!==undefined?'<p>Deine Antwort: <strong>'+esc(answer)+'</strong></p>':'')+'<p>Die Lösung: <strong>'+esc(q.answer)+'</strong></p><p>'+esc(q.explanation||'')+'</p>'+(q.steps?.length?'<h3>Schritt für Schritt</h3><ol>'+q.steps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'')+'</div>';
}
function submit(answer){
  const s=session;if(!s||s.answered||!String(answer??'').trim())return;const q=s.queue[s.index],ok=correct(q,answer);s.answered=true;s.results.push({q,answer,correct:ok});
  if(s.mode==='exam'){next();return}
  update(q,ok);save();if(!ok&&s.queue.length<20)s.queue.splice(Math.min(s.index+3,s.queue.length),0,q);
  document.querySelectorAll('#answer-form input,#answer-form button[type=submit]').forEach(x=>x.disabled=true);
  document.querySelector('#feedback').innerHTML=explain(q,ok)+'<div class="hint">'+(ok?'Gut – die nächste Wiederholung kommt später.':'Diese Aufgabe kommt in der Runde noch einmal.')+'</div><button id="next">Weiter</button>';
  document.querySelector('#next').onclick=next;
}
function reveal(q){
  document.querySelector('#reveal').disabled=true;
  document.querySelector('#feedback').innerHTML='<div class="feedback"><h3>Vergleiche mit deinen Unterlagen</h3><p>'+esc(q.answer)+'</p><p class="small">'+esc(q.explanation||'')+'</p></div><div class="actions"><button id="knew">✓ Gewusst</button><button id="not-knew" class="danger-soft">↻ Noch nicht sicher</button></div>';
  document.querySelector('#knew').onclick=()=>selfDone(q,true);document.querySelector('#not-knew').onclick=()=>selfDone(q,false);
}
function selfDone(q,ok){
  if(session.answered)return;session.answered=true;session.results.push({q,answer:'Selbstkontrolle',correct:ok});update(q,ok);save();if(!ok&&session.queue.length<20)session.queue.splice(Math.min(session.index+3,session.queue.length),0,q);
  document.querySelector('#feedback').innerHTML+='<div class="hint">'+(ok?'Gut. Die Karte kommt später wieder.':'Die Karte taucht in dieser Runde erneut auf.')+'</div><button id="next">Weiter</button>';document.querySelector('#next').onclick=next;
}
function next(){session.index++;session.answered=false;renderQuestion();window.scrollTo({top:0,behavior:'smooth'})}
function summary(early=false){
  const s=session,res=s.results;if(s.mode==='exam'){res.forEach(x=>update(x.q,x.correct));save()}
  const right=res.filter(x=>x.correct).length,possible=s.queue.reduce((n,q)=>n+(q.points||1),0),earned=res.reduce((n,x)=>n+(x.correct?(x.q.points||1):0),0);
  app.innerHTML=head(res.length?'Eine Runde weiter.':'Hier ist gerade nichts zu üben.',res.length?'Nimm das Verständnis mit in deinen nächsten Versuch.':'Wähle ein anderes Fach, Thema oder Lernset.')+
  '<section class="card question empty"><span class="tag">'+(s.mode==='exam'?'PRÜFUNGSAUSWERTUNG':'LERNRUNDE')+'</span><div class="big-number">'+right+' / '+res.length+'</div><h2>Antworten richtig</h2>'+(s.mode==='exam'?'<p>'+earned+' von '+possible+' Punkten'+(early?' · vorzeitig beendet':'')+'</p>':'')+'<button id="finish">Zum Dashboard</button></section>'+
  (s.mode==='exam'?res.map(x=>'<section class="question" style="margin-top:20px"><h3>'+esc(x.q.prompt)+'</h3>'+explain(x.q,x.correct,x.answer)+'</section>').join(''):'');
  session=null;document.querySelector('#finish').onclick=()=>{location.hash='dashboard';render()};
}

function createSet(form){
  const d=new FormData(form),s={id:id('set'),name:String(d.get('name')).trim(),subject:String(d.get('subject')).trim(),kind:String(d.get('kind')).trim(),date:String(d.get('date')||''),createdAt:Date.now()};
  if(!s.name||!s.subject)return;state.sets.push(s);save();message='Lernset „'+s.name+'“ wurde angelegt.';render();
}
async function importMaterials(form){
  const d=new FormData(form),set=setById(String(d.get('setId')||'')),files=[...document.querySelector('#material-files').files],notes=[];if(!set||!files.length)return;
  document.querySelector('#material-status').textContent='Dateien werden eingelesen …';let count=0,cards=0;
  for(const file of files)try{
    if(file.size>15000000)throw Error('Datei größer als 15 MB.');
    let added;
    if(file.name.toLowerCase().endsWith('.json')){
      added=validate(JSON.parse(await file.text()),false).map(q=>({...q,subject:q.subject||set.subject,setId:set.id,sourceName:file.name}));
    }else{
      const text=file.name.toLowerCase().endsWith('.pdf')?await pdfText(file):await file.text();added=cardsFromText(text,set,file.name);
      if(!added.length)throw Error('Keine sinnvollen Lernkarten gefunden.');
    }
    state.custom.push(...added);state.sources.push({id:id('src'),name:file.name,subject:set.subject,setId:set.id,cards:added.length,addedAt:Date.now()});count++;cards+=added.length;
  }catch(e){notes.push(file.name+': '+e.message)}
  save();message=count+' Datei(en) eingelesen · '+cards+' neue Karten/Fragen.'+(notes.length?' Hinweise: '+notes.join(' | '):'');render();
}
function cardsFromText(text,set,file){
  const cleaned=String(text||'')
    .replace(/\u0000/g,' ')
    .replace(/[ \t]+/g,' ')
    .replace(/\r\n?/g,'\n')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
  if(cleaned.length<40)return[];

  let chunks=cleaned.split(/\n{2,}/);
  if(chunks.length===1&&cleaned.length>500){
    chunks=(cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[cleaned]);
  }
  chunks=[...new Set(chunks.map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x.length>=30&&x.length<=800))].slice(0,40);

  return chunks.map((chunk,i)=>{
    const m=chunk.match(/^(.{2,80}?)(?:\s+ist\s+|\s+bedeutet\s+|\s+bezeichnet\s+|:\s+)(.{10,700})$/i);
    const lead=chunk.split(/[,:;–-]/)[0].trim().slice(0,90);
    return{
      id:id('card')+'-'+i,
      subject:set.subject,
      setId:set.id,
      sourceName:file,
      topic:set.name,
      prompt:m?'Erkläre „'+m[1].trim()+'“ in eigenen Worten.':'Was solltest du zu „'+lead+(lead.length>=90?'…':'')+'“ wissen?',
      answer:m?m[2].trim():chunk,
      explanation:'Automatisch aus „'+file+'“ erstellt. Vergleiche deine Erklärung mit dem Originaltext.',
      steps:[],
      type:'selfcheck',
      options:[],
      aliases:[],
      points:1
    };
  });
}
let pdfPromise;
function pdfLib(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  if(pdfPromise)return pdfPromise;
  pdfPromise=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload=()=>{
      window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    s.onerror=()=>{
      pdfPromise=null;
      reject(Error('PDF-Modul konnte nicht geladen werden. Prüfe deine Internetverbindung und versuche es erneut.'));
    };
    document.head.appendChild(s);
  });
  return pdfPromise;
}
async function pdfText(file){
  const lib=await pdfLib();
  const pdf=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const out=[];
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i),content=await page.getTextContent();
    out.push(content.items.map(x=>x.str).join(' '));
  }
  return out.join('\n\n');
}
function validate(input,allowEmpty=true){
  if(!Array.isArray(input)||(!allowEmpty&&!input.length)||input.length>2000)throw Error('Erwartet wird eine Liste mit 1 bis 2.000 Aufgaben.');
  const existing=new Set(questions().map(q=>q.id)),local=new Set();
  return input.map(q=>{
    if(!q||typeof q!=='object')throw Error('Jede Aufgabe muss ein Objekt sein.');
    for(const k of ['id','topic','prompt','answer'])if(typeof q[k]!=='string'||!q[k].trim())throw Error('Fehlendes Feld: '+k);
    if(!/^[a-zA-Z0-9_-]{1,120}$/.test(q.id)||local.has(q.id)||existing.has(q.id))throw Error('ID „'+q.id+'“ ist ungültig oder vorhanden.');local.add(q.id);
    const type=q.type||'choice',options=Array.isArray(q.options)?q.options:[];if(!['choice','number','text','selfcheck'].includes(type))throw Error('Unbekannter Fragetyp.');
    if(type==='choice'&&(options.length<2||!options.includes(q.answer)))throw Error('Multiple Choice braucht mindestens zwei Optionen inklusive Lösung.');
    return{id:q.id,subject:String(q.subject||'Eigene Unterlagen'),setId:String(q.setId||''),sourceName:String(q.sourceName||'JSON-Import'),topic:q.topic.trim(),prompt:q.prompt.trim(),answer:q.answer.trim(),explanation:String(q.explanation||''),steps:Array.isArray(q.steps)?q.steps.map(String):[],type,options:options.map(String),aliases:Array.isArray(q.aliases)?q.aliases.map(String):[],points:Number.isInteger(q.points)&&q.points>0?q.points:1};
  });
}
async function importJson(e){
  const target=document.querySelector('#import-status');try{const f=e.target.files[0];if(!f)return;const added=validate(JSON.parse(await f.text()),false);state.custom.push(...added);state.sources.push({id:id('src'),name:f.name,subject:'Eigene Unterlagen',setId:'',cards:added.length,addedAt:Date.now()});save();message=added.length+' Fragen importiert.';render()}catch(err){if(target)target.textContent='Import nicht möglich: '+err.message}
}
function deleteSet(sid){
  const s=setById(sid);if(!s||!confirm('Lernset „'+s.name+'“ samt importierten Fragen und Dateien löschen?'))return;
  const ids=new Set(state.custom.filter(q=>q.setId===sid).map(q=>q.id));state.custom=state.custom.filter(q=>q.setId!==sid);state.sources=state.sources.filter(x=>x.setId!==sid);state.sets=state.sets.filter(x=>x.id!==sid);ids.forEach(x=>delete state.records[x]);state.history=state.history.filter(x=>!ids.has(x.id));save();render();
}

function startGame(type){
  if(type==='memory'){
    const list=shuffle(questions().filter(q=>q.type!=='selfcheck'&&String(q.answer).length<=80)).slice(0,6);if(list.length<3)return alert('Mindestens drei kurze Fragen werden benötigt.');
    game={type,pairs:list.length,matched:new Set(),open:[],cards:shuffle(list.flatMap(q=>[{id:q.id+'-q',pair:q.id,text:q.prompt,kind:'Frage'},{id:q.id+'-a',pair:q.id,text:q.answer,kind:'Antwort'}]))};
  }else if(type==='wrong'){
    const list=shuffle(questions().filter(q=>q.type!=='selfcheck')).slice(0,8);if(list.length<4)return alert('Mindestens vier Fragen werden benötigt.');game={type,score:0,round:0,max:5,pool:list};prepareWrong();
  }else{
    const list=shuffle(questions().filter(q=>q.type==='choice')).slice(0,3);if(list.length<3)return alert('Mindestens drei Multiple-Choice-Fragen werden benötigt.');game={type:'detective',index:0,score:0,questions:list,missed:false};
  }render();
}
function renderGame(){if(game.type==='memory')memory();else if(game.type==='wrong')wrong();else detective()}
function reward(type,xp){state.games.push({type,xp,at:Date.now()});save()}
function memory(){
  const done=game.matched.size===game.pairs;
  app.innerHTML=head('Memory: Frage & Antwort',done?'Alle Paare gefunden!':'Finde die passende Lösung zu jeder Frage.',game.matched.size+'/'+game.pairs+' Paare')+
  '<section class="card"><div class="memory-grid">'+game.cards.map(c=>{const open=game.open.includes(c.id)||game.matched.has(c.pair);return '<button class="memory-card '+(open?'open ':'')+(game.matched.has(c.pair)?'matched':'')+'" data-memory="'+esc(c.id)+'" '+(game.matched.has(c.pair)?'disabled':'')+'><span>'+(open?'<small>'+esc(c.kind)+'</small>'+esc(c.text):'?')+'</span></button>'}).join('')+'</div>'+
  (done?'<div class="game-win"><strong>+60 XP</strong><p>Memory abgeschlossen.</p><button id="game-finish">Zurück zu den Lernspielen</button></div>':'')+
  '</section>';
  if(done){
    if(!game.rewarded){reward('memory',60);game.rewarded=true}
    document.querySelector('#game-finish').onclick=finishGame;
  }else{
    document.querySelectorAll('[data-memory]').forEach(b=>b.onclick=()=>flip(b.dataset.memory));
  }
}
function flip(cid){
  if(!game||game.open.length>=2||game.open.includes(cid))return;game.open.push(cid);memory();
  if(game.open.length===2){const current=game,set=[...current.open].map(x=>current.cards.find(c=>c.id===x));setTimeout(()=>{if(game!==current)return;if(set[0].pair===set[1].pair)current.matched.add(set[0].pair);current.open=[];memory()},650)}
}
function prepareWrong(){
  const chosen=shuffle(game.pool).slice(0,4),wi=Math.floor(Math.random()*chosen.length);
  game.current=chosen.map((q,i)=>({q,text:q.prompt+' — '+(i===wi?chosen[(i+1)%chosen.length].answer:q.answer),wrong:i===wi}));game.answered=false;
}
function wrong(){
  if(game.round>=game.max){const xp=20+game.score*10;if(!game.rewarded){reward('wrong',xp);game.rewarded=true}app.innerHTML=head('Fehlerjagd beendet.','Du hast '+game.score+' von '+game.max+' Fehlern gefunden.','+'+xp+' XP')+'<section class="card game-win"><div class="big-number">'+game.score+'/'+game.max+'</div><button id="game-finish">Zurück zu den Lernspielen</button></section>';document.querySelector('#game-finish').onclick=finishGame;return}
  app.innerHTML=head('Was ist falsch?','Eine Zuordnung passt nicht. Klicke auf die falsche Aussage.','Runde '+(game.round+1)+'/'+game.max)+'<section class="card"><div class="wrong-grid">'+game.current.map((x,i)=>'<button data-wrong="'+i+'" class="statement-card">'+esc(x.text)+'</button>').join('')+'</div><div id="game-feedback"></div></section>';
  document.querySelectorAll('[data-wrong]').forEach(b=>b.onclick=()=>answerWrong(Number(b.dataset.wrong)));
}
function answerWrong(i){
  if(game.answered)return;game.answered=true;const ok=game.current[i]?.wrong,real=game.current.find(x=>x.wrong);if(ok)game.score++;
  document.querySelector('#game-feedback').innerHTML='<div class="feedback '+(ok?'':'wrong')+'"><h3>'+(ok?'Genau!':'Noch nicht.')+'</h3><p>Falsch war: <strong>'+esc(real.text)+'</strong></p><p>Richtig ist: <strong>'+esc(real.q.answer)+'</strong>.</p></div><button id="game-next">Nächste Runde</button>';
  document.querySelector('#game-next').onclick=()=>{game.round++;prepareWrong();wrong()};
}
function detective(){
  if(game.index>=game.questions.length){const xp=40+game.score*10;if(!game.rewarded){reward('detective',xp);game.rewarded=true}app.innerHTML=head('Fall gelöst.','Du hast alle Hinweise gesammelt.','+'+xp+' XP')+'<section class="card game-win"><div class="big-number">'+game.score+'/3</div><p>Richtige Antworten beim ersten Versuch.</p><button id="game-finish">Zurück zu den Lernspielen</button></section>';document.querySelector('#game-finish').onclick=finishGame;return}
  const q=game.questions[game.index];
  app.innerHTML=head('Wissensdetektiv','Sammle Hinweis '+(game.index+1)+' von 3. Nach einem Fehler bekommst du eine Erklärung und darfst erneut versuchen.','Hinweis '+(game.index+1))+'<section class="card detective-card"><div class="case-file">AKTE '+String(game.index+1).padStart(2,'0')+'</div><h2>'+esc(q.prompt)+'</h2><div class="options">'+q.options.map(o=>'<button class="option-button" data-detective="'+esc(o)+'">'+esc(o)+'</button>').join('')+'</div><div id="game-feedback"></div></section>';
  document.querySelectorAll('[data-detective]').forEach(b=>b.onclick=()=>answerDetective(q,b.dataset.detective));
}
function answerDetective(q,a){
  const ok=norm(a)===norm(q.answer);
  if(ok){if(!game.missed)game.score++;document.querySelector('#game-feedback').innerHTML='<div class="feedback"><h3>Hinweis gefunden.</h3><p>'+esc(q.explanation)+'</p></div><button id="detective-next">Nächsten Hinweis untersuchen</button>';document.querySelectorAll('[data-detective]').forEach(b=>b.disabled=true);document.querySelector('#detective-next').onclick=()=>{game.index++;game.missed=false;detective()}}
  else{game.missed=true;document.querySelector('#game-feedback').innerHTML='<div class="feedback wrong"><h3>Diese Spur führt noch nicht zum Ziel.</h3><p>'+esc(q.explanation)+'</p><p>Versuche es noch einmal.</p></div>'}
}
function finishGame(){game=null;location.hash='games';render()}

function bind(){
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start));
  document.querySelector('#motivation-next')?.addEventListener('click',()=>{state.quoteShift=(Number(state.quoteShift)||0)+1;save();refreshMotivation();});
  document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>start('learn',{topic:b.dataset.topic}));
  document.querySelectorAll('[data-set-learn]').forEach(b=>b.onclick=()=>start('learn',{setId:b.dataset.setLearn}));
  document.querySelectorAll('[data-set-delete]').forEach(b=>b.onclick=()=>deleteSet(b.dataset.setDelete));
  document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>startGame(b.dataset.game));
  document.querySelector('#set-form')?.addEventListener('submit',e=>{e.preventDefault();createSet(e.currentTarget)});
  document.querySelector('#material-form')?.addEventListener('submit',e=>{e.preventDefault();importMaterials(e.currentTarget)});
  document.querySelector('#import')?.addEventListener('change',importJson);
  document.querySelector('#export')?.addEventListener('click',()=>download('learning-by-doing-sicherung.json',state));
  document.querySelector('#restore')?.addEventListener('change',restore);
}
function download(name,value){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
async function restore(e){
  const t=document.querySelector('#restore-status');
  try{
    const f=e.target.files[0];if(!f)return;
    const v=JSON.parse(await f.text());
    if(![1,2].includes(v.version))throw Error('Unbekannte Sicherungsversion.');
    if(!v.records||typeof v.records!=='object'||Array.isArray(v.records)||!Array.isArray(v.history)||!Array.isArray(v.custom))throw Error('Die Sicherungsdatei ist unvollständig oder beschädigt.');
    if(v.version===2&&(!Array.isArray(v.sets)||!Array.isArray(v.sources)||!Array.isArray(v.games)))throw Error('Die Sicherungsdatei enthält nicht alle benötigten Lernset-Daten.');
    if(!confirm('Aktuelle Lerndaten durch diese Sicherung ersetzen?'))return;
    state=v.version===2?{...blank(),...v}:{...blank(),...v,version:2,sets:[],sources:[],games:[]};
    save();message='Sicherung erfolgreich wiederhergestellt.';render();
  }catch(err){
    if(t)t.textContent='Wiederherstellung nicht möglich: '+err.message;
  }
}

document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',e=>{
  if(session?.mode==='exam'&&session.results.length&&!confirm('Die laufende Probeprüfung wird beendet und noch nicht ausgewertete Antworten gehen verloren. Wirklich verlassen?'))e.preventDefault();
}));
window.addEventListener('beforeunload',e=>{
  if(session?.mode==='exam'&&session.results.length){e.preventDefault();e.returnValue='';}
});
window.addEventListener('hashchange',()=>{session=null;game=null;render()});
document.querySelector('#theme').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save();render()};
setInterval(refreshMotivation,60*1000);
render();
