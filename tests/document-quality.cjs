// Tests ohne externe Pakete: node tests/document-quality.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(fs.readFileSync('dist/document-quality.js','utf8'),ctx);
const {chunks,select,validate,similar}=ctx.LearningSourceQuality;
const source='Sommer-2024-Netzwerke.pdf';
const text=[
  '[[SEITE 2]]',
  '2. Aufgabe: Fehler bei der IP-Adressvergabe',
  'Auf einem Client ist DHCP aktiviert. Wenn der DHCP-Server nicht antwortet,',
  'erzeugt der Rechner automatisch eine IPv4-Adresse im Bereich 169.254.0.0/16.',
  'Die Verbindung zum gewünschten anderen IP-Netz ist so nicht gewährleistet.',
  '',
  '[[SEITE 3]]',
  '3. Aufgabe: Trunk und VLAN',
  'Beim Transport mehrerer VLANs über eine Switch-Verbindung enthält der Frame',
  'einen IEEE-802.1Q-Tag mit VLAN-ID. Die Zuordnung ist für den Empfänger notwendig.',
  '',
  '[[SEITE 4]]',
  'Allgemeine Bearbeitungshinweise und Prüfungsnummer',
].join('\n');
const cs=chunks(text,source);
assert.equal(cs.length,2,'zwei fachliche Abschnitte, keine organisatorischen Hinweise');
const selected=select(cs,'DHCP IPv4 Adresse',2);
assert.equal(selected[0].pageStart,2);
const base={
  chunkId:selected[0].id,
  evidenceQuote:'Wenn der DHCP-Server nicht antwortet,',
  type:'scenario', difficulty:'mittel',learningObjective:'APIPA erkennen',
  prompt:'Ein Client erhält die Adresse 169.254.10.5. Erläutern Sie eine plausible Ursache und einen ersten Prüfschritt.',
  answer:'Der DHCP-Server antwortet möglicherweise nicht; DHCP-Erreichbarkeit prüfen.',
  explanation:'Ohne DHCP-Antwort wird eine Adresse aus dem APIPA-Bereich zugewiesen.'
};
assert.equal(validate(base,cs).ok,true,'belegte plausible Form');
assert.equal(validate({...base,chunkId:'erfunden'},cs).ok,false);
assert.equal(validate({...base,evidenceQuote:'Ein Paket mit 999 Gbit/s steht hier'},cs).ok,false);
assert.equal(validate(base,cs,[{prompt:base.prompt}]).ok,false,'Dubletten werden abgelehnt');
assert.equal(validate({...base,type:'choice',options:['A','B'],answer:'A'},cs).ok,false,'fehlende Optionen');
assert.equal(chunks('[[SEITE 1]]\n1; 3; 4\n2; 1',source).length,0,'reine Lösungscodes nicht als Lernwissen');
assert.equal(chunks('[[SEITE 1]]\n',source).length,0,'Scans ohne Text erzeugen keine Fragen');
assert.equal(similar('Erklären Sie die Funktion von DHCP im lokalen Netzwerk.',
 'Erläutern Sie die Funktion von DHCP im lokalen Netzwerk.'),true);
const long=chunks('[[SEITE 1]]\n3. Aufgabe: Dokumentation\n'+('Ein Client benötigt eine korrekte Netzwerkkonfiguration. '.repeat(180)),source);
assert.ok(long.length>=2,'große Kapitel begrenzen');
console.log('Dokument-Qualitätsprüfungen erfolgreich:',cs.length,'Abschnitte.');
