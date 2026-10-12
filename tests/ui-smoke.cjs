const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('assert');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:8765';
(async () => {
  fs.mkdirSync('ui-screenshots',{recursive:true});
  const browser = await chromium.launch({headless:true});
  const failures = [];
  async function test(name,run) {
    try { await run(); console.log('PASS',name); }
    catch (e) { failures.push(name+': '+e.message); console.error('FAIL',name,e.message); }
  }
  const desktop = await browser.newPage({viewport:{width:1440,height:900}});
  desktop.on('pageerror',e=>failures.push('desktop pageerror: '+e.message));
  await desktop.goto(BASE+'/#dashboard');
  await test('dashboard is visible', async()=>{
    assert(await desktop.getByText('Heute lernen').first().isVisible());
    assert(await desktop.locator('.today-panel').count()===1);
  });
  await desktop.screenshot({path:'ui-screenshots/dashboard-light.png',fullPage:true});
  await test('settings dark mode persists',async()=>{
    await desktop.locator('#theme').click();
    assert(await desktop.locator('body').evaluate(el=>el.classList.contains('dark')));
    await desktop.reload();
    assert(await desktop.locator('body').evaluate(el=>el.classList.contains('dark')));
  });
  await desktop.screenshot({path:'ui-screenshots/dashboard-dark.png',fullPage:true});
  await test('manual learning set creation and search',async()=>{
    await desktop.goto(BASE+'/#library');
    await desktop.locator('#show-set-create').click();
    await desktop.locator('#set-form input[name="name"]').fill('Netzwerktechnik Probe');
    await desktop.locator('#set-form input[name="subject"]').fill('Netzwerktechnik');
    await desktop.locator('#set-form').getByRole('button',{name:'Lernset anlegen'}).click();
    await desktop.waitForTimeout(150);
    assert(await desktop.getByText('Netzwerktechnik Probe').count()>0);
    await desktop.locator('#library-search').fill('xxxxxx');
    assert(await desktop.getByText('Keine passenden Lernsets').isVisible());
  });
  await desktop.screenshot({path:'ui-screenshots/library-search.png',fullPage:true});
  await test('linked filters and empty round prevention',async()=>{
    await desktop.goto(BASE+'/#learn');
    await desktop.locator('#subject-select').selectOption({label:'Netzwerktechnik'});
    const info=await desktop.locator('#matching-count').innerText();
    assert(info.includes('passende Aufgaben gefunden'));
  });
  await test('round pause and resume with answer draft',async()=>{
    await desktop.goto(BASE+'/#dashboard');
    await desktop.goto(BASE+'/#learn');
    await desktop.locator('#subject-select').selectOption('');
    await desktop.locator('[data-start="learn"]').click();
    assert(await desktop.locator('.question').count()===1);
    const field=desktop.locator('#answer-form input[type=text],#answer-form textarea').first();
    if(await field.count())await field.fill('Testantwort');
    await desktop.locator('#end').click();
    await desktop.goto(BASE+'/#dashboard');
    assert(await desktop.locator('#today-primary').innerText()==='Weiterlernen');
    await desktop.locator('#today-primary').click();
    assert(await desktop.locator('.question').count()===1);
    if(await field.count()) assert(await field.inputValue()==='Testantwort');
  });
  await test('legacy localStorage stays readable',async()=>{
    await desktop.evaluate(()=>localStorage.setItem('learning-by-doing-v2',JSON.stringify({
      version:2,records:{},history:[],custom:[],sets:[{id:'legacy-1',name:'Bestand Lernset',subject:'Alt',kind:'Test',date:'',createdAt:1}],sources:[],games:[],theme:'light',quoteShift:0
    })));
    await desktop.goto(BASE+'/#library');
    await desktop.reload();
    assert(await desktop.getByText('Bestand Lernset').count()>0);
  });
  const mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>failures.push('mobile pageerror: '+e.message));
  await mobile.goto(BASE+'/#dashboard');
  await test('mobile menu navigation and theme toggle',async()=>{
    assert(await mobile.locator('#menu-toggle').isVisible());
    await mobile.locator('#menu-toggle').click();
    assert(await mobile.locator('#menu-toggle').getAttribute('aria-expanded')==='true');
    await mobile.locator('#main-sidebar a[href="#library"]').click();
    assert(new URL(mobile.url()).hash==='#library');
    await mobile.waitForFunction(()=>document.querySelector('#menu-toggle')?.getAttribute('aria-expanded')==='false');
    await mobile.locator('#mobile-theme').click();
    assert(await mobile.locator('body').evaluate(x=>x.classList.contains('dark')));
  });
  await mobile.screenshot({path:'ui-screenshots/mobile-dark.png',fullPage:true});
  await test('mobile no horizontal overflow',async()=>{
    assert(await mobile.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+2));
  });
  await test('reduced motion preference',async()=>{
    await mobile.emulateMedia({reducedMotion:'reduce'});
    const val=await mobile.evaluate(()=>getComputedStyle(document.querySelector('.today-panel')||document.querySelector('.card')).transitionDuration);
    assert(['1e-05s','0.00001s','0s','0.01ms'].includes(val));
  });
  await browser.close();
  if(failures.length){console.error(failures.join('\n'));process.exit(1)}
  console.log('All UI smoke tests passed');
})().catch(e=>{console.error(e);process.exit(1)});
