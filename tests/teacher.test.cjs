const test=require('node:test'),assert=require('node:assert/strict');
const Teacher=require('../dist/teacher.js');
const pack=require('./fixtures/teacher-pack.json');
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
