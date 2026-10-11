const test=require('node:test'),assert=require('node:assert/strict');
const Teacher=require('../dist/teacher.js');
const pack=require('./fixtures/teacher-pack.json');
test('main-branch AI sets adapt without changing stored IDs answers or scores',()=>{
 for(const [before,after] of [['multichoice','multi'],['text','selfcheck'],['number','calculation'],['scenario','case'],['truefalse','truefalse']]){
  const q={id:'existing',aiGenerated:true,type:before,answer:'Richtig',points:2};const original=JSON.stringify(q);
  const adapted=Teacher.compatible(q);assert.equal(adapted.type,after);assert.equal(adapted.id,q.id);assert.equal(adapted.points,2);assert.equal(Teacher.automatic(adapted),true);assert.equal(JSON.stringify(q),original);
  if(['selfcheck','calculation','case'].includes(after))assert.deepEqual(adapted.rubric,[{text:'Richtig',points:2}]);
 }
 const manual={type:'text',answer:'manual'};assert.equal(Teacher.compatible(manual),manual);
});
test('old heuristic cards paused without modifying stored objects',()=>{
 const q={prompt:'Erkläre den Zusammenhang zwischen „Klasse“ und „Name“.',explanation:'Direkt aus „Test.pdf“ erstellt.'};
 const original=JSON.stringify(q);assert.equal(Teacher.paused(q),true);assert.equal(JSON.stringify(q),original);
 assert.equal(Teacher.paused({...q,reviewed:true}),false);
 assert.equal(Teacher.paused({generatorVersion:4}),true);
 assert.equal(Teacher.paused({prompt:'Eine manuelle Frage'}),false);
});
test('partial scores require explicit valid values',()=>{
 const q=pack.questions[0];assert.equal(Teacher.score(q,[1,1,0]),2);
 assert.equal(Teacher.score(q,[2,1,2]),5);
 for(const values of [[2,1],[2,1,NaN],[2,2,2],[-1,1,2]])assert.throws(()=>Teacher.score(q,values));
});
test('rich import preserves and validates both formats',()=>{
 for(const q of pack.questions)assert.equal(Teacher.validate(q),q);
 assert.throws(()=>Teacher.validate({...pack.questions[0],points:8}));
 assert.throws(()=>Teacher.validate({...pack.questions[1],optionReasons:[]}));
 assert.throws(()=>Teacher.validate({...pack.questions[1],options:['a','a','b']}));
});

 test('local six-format import preserves grading and rejects invalid scoring',()=>{
  const fixture=require('./fixtures/six-types-backup.json');
  for(const q of fixture.custom){assert.equal(Teacher.validateLocal(q),q);}
  assert.throws(()=>Teacher.validateLocal({...fixture.custom[1],correctOptions:['missing']}));
  assert.throws(()=>Teacher.validateLocal({...fixture.custom[5],points:8}));
 });

 test('new question formats use automatic grading even without internal generator metadata',()=>{
  for(const type of ['multi','truefalse','calculation','case'])assert.equal(Teacher.automatic({type}),true);
  assert.equal(Teacher.automatic({type:'selfcheck',generatorVersion:6}),true);
  assert.equal(Teacher.automatic({type:'selfcheck',generatorVersion:5}),false);
  assert.equal(Teacher.automatic({type:'choice'}),false);
 });
