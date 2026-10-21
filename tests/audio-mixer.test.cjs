const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'../dist');
const src=fs.readFileSync(path.join(base,'mixer-simulator.js'),'utf8');
function fresh(){
  const hooks=new Map();
  const document={
    querySelector(id){return hooks.get(id)||null;},
    querySelectorAll(){return [];}
  };
  const win={};
  vm.runInNewContext(src,{window:win,document,Math,Date,console}, {timeout:3000});
  return {win,hooks};
}
test('mixer module renders exactly 8 separate channels',()=>{
  const {win}=fresh(),host={innerHTML:''};
  win.AudioMixer.render(host);
  assert.equal((host.innerHTML.match(/class="aa-channel"/g)||[]).length,8);
  for(const title of ['Kick','Snare','Bass','Keyboard','Gitarre','Lead Vocal','Backing Vocal','Playback'])assert.ok(host.innerHTML.includes(title),title);
});
test('each channel includes full controls and stem import',()=>{
  const {win}=fresh(),host={innerHTML:''};
  win.AudioMixer.render(host);
  for(const key of ['volume','preamp','hpf','eqFreq','eqGain','ratio','pan','send']){
    assert.equal((host.innerHTML.match(new RegExp('data-mx-key="'+key+'"','g'))||[]).length,8,key);
  }
  assert.equal((host.innerHTML.match(/data-mx-file=/g)||[]).length,8);
  assert.equal((host.innerHTML.match(/data-mx-mute=/g)||[]).length,8);
  assert.equal((host.innerHTML.match(/data-mx-solo=/g)||[]).length,8);
});
test('mixer graph includes audio processing and synchronized start entry point',()=>{
  for(const expected of ['createBufferSource','createBiquadFilter','createGain','createStereoPanner','createDynamicsCompressor','createAnalyser','p.start(when,startOffset)','context','start','stop']){
    assert.ok(src.includes(expected),expected);
  }
});
test('mixer source does not upload audio to a server',()=>{
  assert.doesNotMatch(src,/fetch\(/);
  assert.doesNotMatch(src,/XMLHttpRequest/);
  assert.match(src,/decodeAudioData/);
});
