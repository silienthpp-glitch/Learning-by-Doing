/* Reine Validierung und Bewertung, unabhängig von Browser und KI-Anbieter. */
(function(root){
  'use strict';
  function paused(q){
    if(q.reviewed===true)return false;
    return Boolean(q.generatorVersion || /^Direkt aus .+ erstellt\./.test(q.explanation||'') ||
      /Erkläre den Zusammenhang zwischen/.test(q.prompt||''));
  }
  function rubric(q){
    return Array.isArray(q.rubric) && q.rubric.length>0;
  }
  function validate(q){
    if(!q||!['choice','selfcheck'].includes(q.type))throw Error('Nur Auswahlfragen oder offene Aufgaben zulässig.');
    for(const k of ['prompt','answer','objective','topic','explanation'])if(typeof q[k]!=='string'||!q[k].trim())throw Error('Fehlendes Feld: '+k);
    if(!['Wissen','Verstehen','Anwenden'].includes(q.level))throw Error('Niveau fehlt.');
    if(!Number.isInteger(q.points)||q.points<1||q.points>18)throw Error('Ungültige Gesamtpunkte.');
    if(q.type==='choice'){
      if(!Array.isArray(q.options)||q.options.length<3||q.options.length>4||q.options.some(o=>typeof o!=='string'||!o.trim())||new Set(q.options.map(o=>o.trim().toLowerCase())).size!==q.options.length||q.options.filter(o=>o===q.answer).length!==1)throw Error('Auswahlfrage braucht 3–4 unterschiedliche Optionen und genau eine Lösung.');
      if(!Array.isArray(q.optionReasons)||q.optionReasons.length!==q.options.length||q.optionReasons.some(r=>typeof r!=='string'||!r.trim())||q.points!==1)throw Error('Jede Antwortoption braucht eine Erklärung; Auswahlfragen zählen einen Punkt.');
    }else{
      if(!rubric(q)||q.rubric.length>6||q.rubric.some(r=>typeof r.text!=='string'||r.text.trim().length<8||!Number.isInteger(r.points)||r.points<1||r.points>3)||q.rubric.reduce((s,r)=>s+r.points,0)!==q.points)throw Error('Bewertungskriterien und Gesamtpunkte passen nicht zusammen.');
    }
    return q;
  }
  function score(q,values){
    if(!rubric(q)||values.length!==q.rubric.length)throw Error('Bewertung unvollständig.');
    return values.reduce((sum,n,i)=>{
      if(!Number.isInteger(n)||n<0||n>q.rubric[i].points)throw Error('Punkte außerhalb des erlaubten Bereichs.');
      return sum+n;
    },0);
  }
  const api={paused,rubric,validate,score};
  if(typeof module!=='undefined')module.exports=api;else root.Teacher=api;
})(typeof window!=='undefined'?window:globalThis);
