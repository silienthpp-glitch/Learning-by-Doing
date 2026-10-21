/* Node-only smoke tests: no npm dependencies, no real audio output. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
function file(name){return fs.readFileSync(path.join(root,'dist',name),'utf8');}
function sandbox(){
  const dom={querySelector:()=>null,querySelectorAll:()=>[]};
  const w={};
  const vmContext=vm.createContext({window:w,document:dom,console,Math,Date});
  vm.runInContext(file('audio-questions.js'),vmContext);
  vm.runInContext(file('audio-academy.js'),vmContext);
  return {w,dom,vmContext};
}
test('new navigation and scripts are loaded after legacy questions',()=>{
  const html=file('index.html');
  assert.match(html,/href="#audio"/);
  assert.match(html,/audio-academy\.css/);
  assert.ok(html.indexOf('questions.js')<html.indexOf('audio-questions.js'));
  assert.ok(html.indexOf('audio-questions.js')<html.indexOf('audio-academy.js'));
  assert.ok(html.indexOf('audio-academy.js')<html.indexOf('app.js'));
});
test('all 36 audio questions use the existing grading model',()=>{
  const {w}=sandbox(),q=w.AUDIO_QUESTIONS;
  assert.equal(q.length,36);
  assert.equal(new Set(q.map(x=>x.id)).size,36);
  for(const item of q){
    assert.equal(item.subject,'Audio & Live Sound');
    assert.equal(item.type,'choice');
    assert.ok(item.options.includes(item.answer),item.id);
    assert.ok(item.explanation.length>20,item.id);
    assert.ok(item.options.length>=3,item.id);
    assert.ok(item.points>0,item.id);
  }
  assert.equal(new Set(q.map(x=>x.topic)).size,9);
});
test('audio academy exposes nine tracks and substantive lessons',()=>{
  const {w}=sandbox();
  assert.equal(w.AudioAcademy.trackCount(),9);
  assert.equal(w.AudioAcademy.lessonCount(),13);
});
test('overview renders through existing app node and existing progress',()=>{
  const {w}=sandbox(),app={innerHTML:''};
  const ctx={app,state:{audioPractice:{attempts:3,correct:2}},save(){},esc:x=>String(x),questions:()=>w.AUDIO_QUESTIONS,rec:()=>({streak:3}),start(){}};
  w.AudioAcademy.render(ctx);
  assert.match(app.innerHTML,/Recording/);
  assert.match(app.innerHTML,/36\/36/);
  assert.match(app.innerHTML,/2\/3 Hoer-Challenges richtig/);
  assert.match(app.innerHTML,/EQ-Labor/);
});
test('main app integrates imported questions without modifying original sets',()=>{
  const js=file('app.js');
  assert.match(js,/window\.AUDIO_QUESTIONS/);
  assert.match(js,/route==='audio'/);
  assert.match(js,/window\.AudioAcademy\.render/);
  assert.match(js,/audioPractice/);
  assert.match(js,/window\.AudioAcademy\?\.dispose/);
  // Der regulaere IHK-Pruefungsmodus darf keine Audiofragen ungefragt mischen.
  assert.match(js,/mode==='exam'&&!subject&&!topic&&!setId/);
  assert.match(js,/q\.subject!=='Audio & Live Sound'/);
});
test('EQ uses actual audio processing, local object URL and safe master level',()=>{
  const js=file('audio-academy.js');
  assert.match(js,/createMediaElementSource/);
  assert.match(js,/createBiquadFilter/);
  assert.match(js,/getFrequencyResponse/);
  assert.match(js,/URL\.createObjectURL/);
  assert.match(js,/URL\.revokeObjectURL/);
  assert.match(js,/value="0\.3"/);
  assert.match(js,/120\*1024\*1024/);
  assert.match(js,/ctx\.save\(\)/);
});
test('no external audio upload endpoint in academy',()=>{
  assert.doesNotMatch(file('audio-academy.js'),/fetch\(/);
  assert.doesNotMatch(file('audio-academy.js'),/XMLHttpRequest/);
});
