const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../dist/study-import.js');
test('Formularkopf erzeugt keine Lernfrage',()=>{
 assert.equal(api.analyze('Fachinformatiker/in Klasse: EVP10b Datum: 07.10.2026\nName: Max Beispiel').cards.length,0);
});
test('Fachliche Definition bleibt trotz Formularfeldern erhalten',()=>{
 const r=api.analyze('Fachinformatiker/in\nKlasse: EVP10b\nName: Beispiel\n\nEine Firewall ist ein System zur Kontrolle des Netzwerkverkehrs.');
 assert.equal(r.cards.length,1);assert.match(r.cards[0].prompt,/Firewall/);assert.equal(r.cards[0].answer,'Eine Firewall ist ein System zur Kontrolle des Netzwerkverkehrs.');
});
test('Keine aus beliebigen Substantiven erfundenen Beziehungen',()=>assert.equal(api.analyze('Netzwerk Kabel Rechner Daten Übertragung Klasse Information').cards.length,0));
test('Funktion und Quellseite bleiben nachvollziehbar',()=>{
 const r=api.analyze([{page:4,text:'DNS ermöglicht die Auflösung von Domainnamen in IP-Adressen.'}]);
 assert.equal(r.cards[0].page,4);assert.match(r.cards[0].prompt,/Funktion/);assert.equal(r.cards[0].answer,r.cards[0].evidence);
});
test('Explizite Frage-Antwort-Zuordnung',()=>{
 const r=api.analyze('Frage: Wozu wird DHCP verwendet?\nAntwort: DHCP weist Clients automatisch eine IP-Konfiguration zu.');
 assert.equal(r.cards.length,1);assert.equal(r.cards[0].prompt,'Wozu wird DHCP verwendet?');
});
test('Aufzählungen werden als vollständige Antwort erhalten',()=>{
 const r=api.analyze('Schutzziele:\n- Vertraulichkeit\n- Integrität\n- Verfügbarkeit');
 assert.equal(r.cards.length,1);assert.match(r.cards[0].answer,/Vertraulichkeit; Integrität; Verfügbarkeit/);
});
test('Wiederholte Definitionen werden nur einmal vorgeschlagen',()=>{
 const t='Ein Switch ist ein Netzwerkgerät zur Verbindung von Endgeräten.';
 assert.equal(api.analyze(t+'\n\n'+t).cards.length,1);
});
test('Unaufgelöste Pronomen und reine Fragen werden ausgelassen',()=>{
 assert.equal(api.analyze('Es ist ein Gerät zur sicheren Kommunikation.\n\nWelche Funktion hat eine Firewall?').cards.length,0);
});
test('Scans ohne Text erzeugen keine Fantasiefragen',()=>assert.equal(api.analyze([{page:1,text:''}]).cards.length,0));
test('Bekannte alte Kopfzeilenfragen werden ausgeblendet',()=>{
 assert.equal(api.legacyNoise({type:'selfcheck',prompt:'Erkläre den Zusammenhang zwischen „Fachinformatiker/in“ und „Klasse“.'}),true);
 assert.equal(api.legacyNoise({type:'selfcheck',prompt:'Erkläre den Zusammenhang zwischen „IP-Adresse“ und „Subnetzmaske“.'}),false);
});
const definitions='DNS ist ein Dienst zur Auflösung von Domainnamen.\n\nDHCP ist ein Dienst zur automatischen Vergabe der IP-Konfiguration.\n\nHTTP ist ein Protokoll zur Übertragung von Webseiten.';
test('Auswahlfragen haben eindeutige Optionen und eine enthaltene Lösung',()=>{
 const cards=api.analyze(definitions,'choice').cards;
 assert.equal(cards.length,3);
 for(const q of cards){assert.equal(q.type,'choice');assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert.equal(q.options.filter(x=>x===q.answer).length,1);assert.ok(!q.prompt.includes(q.answer));}
});
test('Gemischte Vorbereitung enthält beide Fragetypen',()=>{
 const cards=api.analyze(definitions).cards;
 assert.ok(cards.some(q=>q.type==='choice'));assert.ok(cards.some(q=>q.type!=='choice'));
});
test('Offener Modus erzeugt keine Auswahlfragen',()=>assert.ok(api.analyze(definitions,'selfcheck').cards.every(q=>q.type!=='choice')));
test('Zu wenige Alternativen bleiben offene Fragen',()=>assert.ok(api.analyze(definitions.split('\n\n').slice(0,2).join('\n\n'),'choice').cards.every(q=>q.type!=='choice')));
test('Gleichlautende Beschreibungen werden nicht als eindeutige Auswahl bewertet',()=>{
 const t='DNS ist ein Dienst zur Auflösung von Domainnamen.\n\nNamensauflösung ist ein Dienst zur Auflösung von Domainnamen.\n\nDHCP ist ein Dienst zur automatischen Vergabe der IP-Konfiguration.';
 assert.ok(api.analyze(t,'choice').cards.filter(q=>q.evidence.includes('Auflösung')).every(q=>q.type!=='choice'));
});
