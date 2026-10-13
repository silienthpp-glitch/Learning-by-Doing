/**
 * Echte Chromium-Integration: lokale Web-API vs. simulierte Tauri-Brücke.
 * Kein Ollama/Key nötig; die Antwort stammt nur aus einem deterministischen Mock.
 * Die separate Rust-Build-Pipeline prüft native Kompilierung (kein WebView-E2E).
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:8765';
const raw = [
  '1. Aufgabe: Fehler bei DHCP im Firmennetz',
  'Ein Client versucht, seine Netzwerkeinstellungen automatisch über DHCP zu beziehen.',
  'Wenn der DHCP-Server nicht antwortet, erhält der Rechner eine Adresse im Bereich 169.254.0.0/16.',
  'Um die Ursache zu finden, prüft die Administration die Verbindung zum DHCP-Server und das DHCP-Relay.',
  'Ein DHCP-Broadcast wird nicht automatisch über einen Router in andere VLANs weitergeleitet.',
  'Durch ein DHCP-Relay werden Anfragen an den zuständigen DHCP-Server weitergegeben.'
].join('\n');
const QUOTE='Wenn der DHCP-Server nicht antwortet, erhält der Rechner eine Adresse im Bereich 169.254.0.0/16.';
const fakeStatus={ollama:{reachable:true,modelReady:true,activeModel:'mock-local',preferredModel:'mock-local'},openai:{available:false},defaultProvider:'ollama'};
let generatedCalls=0;
function responseFor(context, bad=false) {
  const id=context.match(/\[ABSCHNITT (.*?) \|/)?.[1];
  assert(id, 'Der Server muss Abschnitts-IDs statt ungefiltertem Text übermitteln');
  assert(context.includes('DHCP'), 'Der Fachkontext muss vorhanden sein');
  return {
    analysis:{topic:'DHCP',subtopics:['APIPA'],keyTerms:['DHCP','APIPA']},
    questions:[{
      type:'scenario',topic:'DHCP',subtopic:'APIPA',
      prompt:'Ein Client erhält statt seiner Firmenadresse die Adresse 169.254.12.20. Erläutern Sie eine wahrscheinliche Ursache.',
      answer:'Der DHCP-Server hat nicht geantwortet; seine Erreichbarkeit und ein mögliches DHCP-Relay sind zu prüfen.',
      explanation:'Wenn keine Antwort vom DHCP-Server eintrifft, kann der Rechner eine APIPA-Adresse zuweisen.',
      options:[],correctOptions:[],points:2,
      chunkId:id,evidenceQuote:bad?'Dieser Satz steht nicht im Dokument und ist frei erfunden.':QUOTE,
      difficulty:'mittel',learningObjective:'DHCP-Verbindungsfehler anhand einer APIPA-Adresse erkennen'
    }]
  };
}
async function prepare(page, name) {
  await page.goto(BASE+'/#library');
  await page.locator('#show-set-create').click();
  await page.locator('#set-form input[name="name"]').fill(name);
  await page.locator('#set-form input[name="subject"]').fill('Netzwerktechnik');
  await page.locator('#set-form button[type=submit]').click();
  await page.locator('#show-material-import').click();
  await page.locator('#material-set').selectOption({label:name+' · Netzwerktechnik'});
  await page.locator('#material-files').setInputFiles({
    name:'dhcp-unterlagen.txt',mimeType:'text/plain',buffer:Buffer.from(raw,'utf8')
  });
  await page.locator('#material-form button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#material-status')?.textContent.includes('1 Datei(en) importiert'));
  await page.locator('#show-ai-builder').click();
  const options=await page.locator('#ai-set-form select[name=sourceSet] option').allTextContents();
  assert(options.some(x=>x.includes(name)), 'Das importierte reine Text-Lernset muss im KI-Formular auswählbar sein');
  await page.locator('#ai-set-form select[name=sourceSet]').selectOption({label:name+' · Netzwerktechnik'});
  await page.locator('#ai-set-form input[name=subject]').fill('Netzwerktechnik');
  await page.locator('#ai-set-form input[name=topic]').fill('DHCP');
}
async function generate(page, shouldAccept) {
  await page.locator('#ai-set-form button[type=submit]').click();
  if(shouldAccept){
    await page.locator('.question').waitFor({timeout:20000});
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('learning-by-doing-v2')));
    assert(saved.custom.some(q=>q.aiGenerated&&q.chunkId&&q.evidenceQuote===QUOTE));
  } else {
    await page.waitForFunction(()=>document.querySelector('#ai-generate-status')?.textContent.includes('abgelehnt'));
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('learning-by-doing-v2')));
    assert(!saved.custom.some(q=>q.aiGenerated),'Unbelegte Fragen dürfen nicht gespeichert werden');
  }
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const web=await browser.newPage();
    const webErrors=[];web.on('pageerror',e=>webErrors.push(e.message));
    await web.route('https://cdnjs.cloudflare.com/**',route=>route.abort('internetdisconnected'));
    await web.route('**/api/ai/**', async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.pathname==='/api/ai/status')return route.fulfill({json:fakeStatus});
      if(url.pathname==='/api/ai/generate'){
        generatedCalls++;
        const payload=request.postDataJSON();
        assert.equal(payload.provider,'ollama','OpenAI darf nicht automatisch verwendet werden');
        assert(payload.context.length<6100,'Begrenzte KI-Kontextgröße');
        return route.fulfill({json:responseFor(payload.context)});
      }
      return route.fulfill({status:503,json:{error:'Ollama zur Bewertung nicht erreichbar'}});
    });
    await prepare(web,'Web-Import');
    // PDF.js muss vollständig aus lokalen Assets ohne CDN geladen werden.
    assert(await web.evaluate(async()=>typeof (await pdfLib()).getDocument==='function'));
    await generate(web,true);
    assert.deepEqual(webErrors,[],'Web-JavaScript darf nicht abstürzen');
    console.log('PASS Web: lokaler PDF-Loader, Import, Auswahl, KI-API, Quellenprüfung, Speichern');

    const reject=await browser.newPage();
    await reject.route('**/api/ai/**',async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.pathname==='/api/ai/status')return route.fulfill({json:fakeStatus});
      if(url.pathname==='/api/ai/generate')return route.fulfill({json:responseFor(req.postDataJSON().context,true)});
      return route.fulfill({status:503,json:{error:'Offline'}});
    });
    await prepare(reject,'Quellen-Prüfung');
    await generate(reject,false);
    console.log('PASS Web: erfundene Quelle wird abgelehnt, Daten bleiben unverändert');

    const desktop=await browser.newPage();
    const native=[];const calls=[];
    await desktop.addInitScript(()=>{
      // Simuliert exakt das öffentliche window.__TAURI__.core.invoke-Interface.
      window.__TAURI__={core:{invoke:async(name,args)=>{
        window.__nativeCalls.push({name,args});
        if(args.endpoint==='/api/ai/status')return window.__fakeStatus;
        if(args.endpoint==='/api/ai/generate')return window.__mockGeneration(args.payload.context);
        throw new Error('Nicht erreichbar');
      }}};
      window.__nativeCalls=[];
    });
    await desktop.exposeFunction('__mockGeneration',context=>responseFor(context));
    await desktop.addInitScript(status=>{window.__fakeStatus=status},fakeStatus);
    // Jede echte HTTP-Anfrage an /api/ai wäre ein Desktop-Brückenfehler.
    await desktop.route('**/api/ai/**',route=>route.fulfill({status:418,body:'Desktop soll native invoke verwenden'}));
    await prepare(desktop,'Desktop-Import');
    await generate(desktop,true);
    const invoked=await desktop.evaluate(()=>window.__nativeCalls.map(x=>x.args.endpoint));
    assert(invoked.includes('/api/ai/generate'),'Tauri invoke muss Generierung übernehmen');
    console.log('PASS Desktop-Bridge: import, native invoke, validate and save');
    assert(generatedCalls===1,'Web und Desktop verwenden unabhängige Transportwege');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
