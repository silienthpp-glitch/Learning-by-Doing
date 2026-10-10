import unittest,tempfile,json
from pathlib import Path
from unittest.mock import patch
import ai_service as ai
import material_store as ms

class LocalAI(unittest.TestCase):
 def test_sql_function_keyword_boundary(self):
  self.assertGreater(ms.score('SUM(Menge) AVG(Wert)','Datenbanken'),0)
  self.assertEqual(ms.score('Sommer im Park','Datenbanken'),0)
 def test_templates_require_local_evidence_and_keep_all_formats(self):
  text='SQL: CHAR hat feste Länge; VARCHAR für Telefonnummer. SELECT COUNT(*) FROM Windrad WHERE IDWindpark = 102; CREATE TABLE erzeugt Tabellen. ALTER TABLE Kunden ADD COLUMN Email VARCHAR(100). FOREIGN KEY REFERENCES Ziel. DELETE FROM löscht Datensätze. UPDATE aktualisiert Daten. Ein Datenbanksystem(DBS) besteht aus Datenbankmanagementsystem(DBMS) und Datenbank. AVG(Wert) berechnet das arithmetische Mittel. SUM(Wert) berechnet die Summe.'
  sources=[{'text':text,'sourceName':'Selbst verfasster SQL-Testtext','sourcePage':1,'documentId':'test'}]
  evidence=[{'sourceId':1,'quote':text}]
  raw=ai.source_templates.candidates(evidence);questions=[ai.validate(ai.canonical(q,'Datenbanken'),sources,'Datenbanken') for q in raw]
  self.assertGreaterEqual(len(questions),10)
  self.assertEqual({q['type'] for q in questions},{'choice','multi','selfcheck','truefalse','calculation','case'})
  self.assertEqual(ai.source_templates.candidates([{'sourceId':1,'quote':'DHCP vergibt Netzwerkadressen.'}]),[])
 def test_sql_count_case_supplies_schema_in_task(self):
  q=ai.canonical({'type':'case','prompt':'Wie viele Windräder?', 'answer':'SELECT count(*) FROM Windrad WHERE IDWindpark = 102;', 'criteria':[{'text':'Datensätze zählen und Windpark filtern','points':2}],'choices':[]},'Datenbanken')
  for required in ('Windrad','IDWindpark','102'):self.assertIn(required,q['prompt'])
  truefalse=ai.canonical({'type':'truefalse','prompt':'SELECT COUNT(*) FROM Windrad WHERE IDWindpark = 102; zählt diese Datensätze.','answer':'','choices':[{'text':'Richtig','correct':True},{'text':'Falsch','correct':False}],'criteria':[]},'Datenbanken')
  self.assertEqual(q['teachingFocus'],truefalse['teachingFocus'])
 def test_rephrased_task_instruction_is_same_learning_question(self):
  a='Erkläre, warum Änderungen in Transaktionen durchgeführt werden. Benutze die Quellenangaben.'
  b='Erklären Sie, warum Änderungen in Transaktionen durchgeführt werden. Geben Sie eine Begründung für Ihre Antwort.'
  self.assertEqual(ai.question_fingerprint(a),ai.question_fingerprint(b))
  self.assertNotEqual(ai.question_fingerprint(a),ai.question_fingerprint('Erkläre, wie Änderungen in Transaktionen zurückgenommen werden.'))
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  self.patches=[patch.object(ai,'ROOT',self.root),patch.object(ms,'ROOT',self.root)]
  for p in self.patches:p.start()
 def tearDown(self):
  for p in self.patches:p.stop()
  self.tmp.cleanup()
 def test_default_no_key(self):
  with patch.object(ai,'key',return_value=''),patch.object(ai,'json_request',return_value={'models':[{'name':ai.LOCAL_MODEL}]}):
   s=ai.status();self.assertEqual(s['provider'],'ollama');self.assertTrue(s['ready']);self.assertFalse(s['openaiAvailable'])
 def test_unreachable_never_falls_back(self):
  with patch.object(ai,'key',return_value='test-key'),patch.object(ai,'json_request',side_effect=ValueError('offline')):
   self.assertFalse(ai.status()['ready'])
   with self.assertRaises(ValueError):ai.cfg_for({'provider':'ollama'})
 def test_existing_local_model(self):
  with patch.object(ai,'key',return_value=''),patch.object(ai,'json_request',return_value={'models':[{'name':'qwen3.5:4b'}]}):
   s=ai.status();self.assertTrue(s['ready']);self.assertEqual(s['localModel'],'qwen3.5:4b');self.assertEqual(s['model'],'qwen3.5:4b')
 def test_explicit_openai(self):
  with self.assertRaises(ValueError):ai.select({'provider':'openai'})
 def test_topic_false_positives(self):
  self.assertEqual(ms.score('Die Klasse wird bewertet. Das wird erklärt und werden wir üben.','Datenbanken'),0)
  ms.put('Netzwerk', [{'text':'DHCP vergibt Netzwerkadressen. Ein Router verbindet Netzwerke. '*6}])
  with self.assertRaises(ValueError):ms.retrieve('Datenbanken')
  ms.put('Datenbank', [{'text':'Ein Primärschlüssel identifiziert jeden Datensatz eindeutig. SQL dient der Abfrage von Datenbanken. '*6}])
  self.assertEqual(ms.retrieve('Datenbanken')[0]['sourceName'],'Datenbank')
 def test_persistence(self):
  d=ms.put('SQL', [{'page':3,'text':'SQL und Datenbanken '*20}]);self.assertEqual(ms.all_docs()[0]['id'],d['id'])
  self.assertEqual(ms.retrieve('Datenbanken')[0]['sourcePage'],3)
 def test_solution_gets_matching_task_context(self):
  ms.put('Prüfung_2022.pdf',[{'page':4,'text':'Die SQL-Tabelle Kunde enthält Kundennummer und Kundenname. '*8}])
  ms.put('Andere_Prüfung.pdf',[{'page':1,'text':'Die SQL-Tabelle Kunde enthält Kundennummer und Kundenname. '*8}])
  solution=ms.put('Prüfung_2022_Lösungen.pdf',[{'page':2,'text':'SQL Tabelle Kunde Kundennummer Kundenname SELECT WHERE '*8}])
  context=ms.related_context({'documentId':solution['id'],'sourceName':solution['name'],'text':solution['pages'][0]['text']},'Datenbanken')
  self.assertEqual(context[0]['document'],'Prüfung_2022.pdf');self.assertEqual(context[0]['page'],4)
 def test_multi_grades(self):
  q={'type':'multi','points':1,'options':['a','b','c','d'],'correctOptions':['a','b']}
  for answer,points in [(['a','b'],1),(['a'],.5),(['a','c'],0),(['a','b','c','d'],0)]:
   self.assertEqual(ai.grade({'question':q,'answer':answer})['earned'],points)
 def test_open_grade_and_overaward(self):
  q={'type':'selfcheck','points':2,'rubric':[{'text':'Eindeutige Identifikation','points':2}]}
  with patch.object(ai,'cfg_for',return_value={'provider':'ollama'}),patch.object(ai,'model',return_value={'criteria':{'c0':{'earned':1}},'explanation':'Details fehlen'}):
   self.assertEqual(ai.grade({'question':q,'answer':'identifiziert'})['verdict'],'teilweise richtig')
  with patch.object(ai,'cfg_for',return_value={}),patch.object(ai,'model',return_value={'criteria':{'c0':{'earned':3}}}):
   with self.assertRaises(ValueError):ai.grade({'question':q,'answer':'x'})
 def test_empty_no_ai(self):
  with patch.object(ai,'model',side_effect=AssertionError('must not call')):
   self.assertEqual(ai.grade({'question':{'type':'case','points':2},'answer':''})['earned'],0)
 def test_fabricated_evidence(self):
  source={'text':'Ein Primärschlüssel identifiziert Datensätze eindeutig.','sourceName':'SQL','sourcePage':1,'documentId':'abc'}
  q={'type':'choice','prompt':'Was kennzeichnet einen Primärschlüssel?','answer':'Eindeutig','subtopic':'Schlüssel','objective':'Schlüssel erklären','explanation':'Identifiziert eindeutig','evidence':'Eine erfundene nicht belegte Erklärung.','sourceId':1,'points':1,'options':['Eindeutig','Doppelt','Leer'],'correctOptions':['Eindeutig'],'optionReasons':['Stimmt.','Falsch.','Falsch.'],'rubric':[]}
  with self.assertRaises(ValueError):ai.validate(q,[source],'Datenbanken')
 def test_evidence_typography_preserves_math(self):
  text="SELECT COUNT(*) WHERE Ort = ’Augsburg‘ AND aktiv = true"
  self.assertEqual(ai.evidence_span("SELECT COUNT(*) WHERE Ort = 'Augsburg' AND aktiv = true",text),text)
  self.assertIsNone(ai.evidence_span('Der Wert ist 120 + 30 = 150','Der Wert ist 120 - 30 = 150'))

 def test_server_supplies_original_evidence(self):
  text='Ein Primärschlüssel identifiziert jeden Datensatz eindeutig. '+('SQL Datentypen und feste Werte. '*30)
  choices=[{'evidenceId':i+1,'sourceId':1,'quote':q} for i,q in enumerate(ai.evidence_choices_for(text))]
  self.assertTrue(all(c['quote'] in text for c in choices))
  q=ai.with_evidence({'evidenceId':1,'sourceId':999,'evidence':'Erfundener Inhalt'},choices)
  self.assertEqual(q['evidence'],choices[0]['quote']);self.assertEqual(q['sourceId'],1)
  for invalid in (0,999,True,None):
   with self.assertRaises(ValueError):ai.with_evidence({'evidenceId':invalid},choices)

 def test_open_question_ignores_unused_choice_metadata(self):
  raw={'type':'selfcheck','subtopic':'Primärschlüssel','answer':'Identifiziert einen Datensatz eindeutig.','choices':[{'text':'Irrelevante alternative Darstellung','correct':True}],'criteria':[{'text':'Eindeutige Identifikation nennen','points':1}]}
  q=ai.canonical(raw)
  self.assertEqual(q['options'],[]);self.assertEqual(q['correctOptions'],[])
  self.assertEqual(q['answer'],raw['answer']);self.assertEqual(q['rubric'],raw['criteria'])

 def test_selection_schema_keeps_prompt_and_options_nonempty(self):
  schema=ai.generation_schema(['choice','multi'],2,[{'evidenceId':1}],1)
  for branch in schema['properties']['questions']['items']['anyOf']:
   fields=branch['properties']
   self.assertEqual(fields['answer']['maxLength'],0)
   for field in ('prompt','subtopic'):
    self.assertNotIn('maxLength',fields[field])
   self.assertNotIn('maxLength',fields['choices']['items']['properties']['text'])
  self.assertNotIn('maxLength',ai.WIRE['properties']['prompt'])

 def test_nearly_identical_options_are_rejected(self):
  source={'text':'Ein Primärschlüssel identifiziert Datensätze eindeutig.','sourceName':'SQL','sourcePage':1,'documentId':'abc'}
  q={'type':'choice','prompt':'Was kennzeichnet einen Primärschlüssel?','answer':'Eindeutig','subtopic':'Schlüssel','objective':'Schlüssel erklären','explanation':'Identifiziert eindeutig','evidence':source['text'],'sourceId':1,'points':1,'options':['Der Schlüssel identifiziert jeden Datensatz eindeutig.','Der Schlüssel identifiziert einen Datensatz eindeutig.','Der Schlüssel sortiert die Namen.'],'correctOptions':['Der Schlüssel identifiziert jeden Datensatz eindeutig.'],'optionReasons':[],'rubric':[]}
  with self.assertRaisesRegex(ValueError,'zu ähnlich'):ai.validate(q,[source],'Datenbanken')

 def test_sql_storage_claim_rejected_despite_ai_approval(self):
  source={'text':'PLZ 01234 char(5). PLZ hat feste Länge.','sourceName':'SQL','sourcePage':1,'documentId':'abc'}
  q={'type':'choice','prompt':'Welcher SQL-Datentyp hat eine feste Länge?','answer':'CHAR','subtopic':'Datentypen','objective':'Datentypen verstehen','explanation':'VARCHAR wäre Platzverschwendung und nicht zulässig.','evidence':source['text'],'sourceId':1,'points':1,'options':['CHAR','INTEGER','DATE'],'correctOptions':['CHAR'],'optionReasons':[],'rubric':[]}
  with self.assertRaisesRegex(ValueError,'Verallgemeinerung'):ai.validate(q,[source],'Datenbanken')

 def test_form_footer_is_not_valid_topic_evidence(self):
  source={'text':'Ein Primärschlüssel identifiziert Datensätze eindeutig. Dieses Blatt gehört zur Klasse 10.','sourceName':'SQL','sourcePage':1,'documentId':'abc'}
  q={'type':'choice','prompt':'Was ist ein Primärschlüssel?','answer':'Identifiziert','subtopic':'Schlüssel','objective':'Schlüssel erklären','explanation':'Identifiziert eindeutig','evidence':'Dieses Blatt gehört zur Klasse 10.','sourceId':1,'points':1,'options':['Identifiziert','Sortiert','Verschlüsselt'],'correctOptions':['Identifiziert'],'optionReasons':[],'rubric':[]}
  with self.assertRaisesRegex(ValueError,'fachlichen Bezug'):ai.validate(q,[source],'Datenbanken')

 def test_ocr_compound_terms_and_topic_purity(self):
  self.assertGreater(ms.score('DieMulti-FaktorAuthentifizierung(MFA) erhöht dieSicherheit.','IT-Sicherheit'),0)
  self.assertGreater(ms.score('Inventardatenbanken mitKundentabellen','Datenbanken'),0)
  ms.put('Gemischte_Lösungen.pdf',[{'text':'SQL Datenbank. MFA XSS Injection Authentifizierung Sicherheit Firewall. '*4}])
  ms.put('SQL-Theorie.pdf',[{'text':'SQL Datenbank Tabellen Primärschlüssel. '*4}])
  self.assertEqual(ms.retrieve('Datenbanken',1)[0]['sourceName'],'SQL-Theorie.pdf')

 def test_sql_length_requires_standalone_context(self):
  source={'text':'SQL Telefonnummer varchar(16).','sourceName':'SQL','sourcePage':1,'documentId':'abc'}
  q={'type':'choice','prompt':'Welcher SQL-Datentyp eignet sich für Telefonnummern?','answer':'VARCHAR(16)','subtopic':'Datentypen','objective':'Datentypen erklären','explanation':'Variable Länge','evidence':source['text'],'sourceId':1,'points':1,'options':['VARCHAR(16)','INT','DATE'],'correctOptions':['VARCHAR(16)'],'optionReasons':[],'rubric':[]}
  with self.assertRaisesRegex(ValueError,'Zeichenlängen'):ai.validate(q,[source],'Datenbanken')

 def test_ambiguous_datatype_choice_is_rejected(self):
  source={'text':'Der SQL-Datentyp für PLZ 01234 ist CHAR(5).','sourceName':'SQL','sourcePage':1,'documentId':'abc'}
  q={'type':'choice','prompt':'Welcher SQL-Datentyp ist für die Speicherung einer PLZ mit 5 Stellen geeignet?','answer':'CHAR(5)','subtopic':'Datentypen','objective':'Datentypen erklären','explanation':'Feste Länge','evidence':source['text'],'sourceId':1,'points':1,'options':['CHAR(5)','VARCHAR(5)','DATE'],'correctOptions':['CHAR(5)'],'optionReasons':[],'rubric':[]}
  with self.assertRaisesRegex(ValueError,'Mehrere Optionen'):ai.validate(q,[source],'Datenbanken')
  q.update(answer='CHAR',options=['CHAR','VARCHAR','DATE'],correctOptions=['CHAR'])
  with self.assertRaisesRegex(ValueError,'Mehrere Optionen'):ai.validate(q,[source],'Datenbanken')
 def test_generated_sql_spacing_corrects_ocr_without_altering_evidence(self):
  q=ai.canonical({'type':'selfcheck','prompt':'Was macht CREATETABLE?','answer':'CREATETABLE erstellt eine Tabelle.','explanation':'CREATEtable erstellt eine Tabelle.','evidence':'CREATETABLE','choices':[],'criteria':[{'text':'CREATETABLE nennen','points':1}]},'Datenbanken')
  self.assertEqual(q['answer'],'CREATE TABLE erstellt eine Tabelle.');self.assertEqual(q['evidence'],'CREATETABLE')
  self.assertEqual(q['rubric'][0]['text'],'CREATE TABLE nennen')

 def test_datatype_question_becomes_unambiguous_from_supported_type(self):
  raw={'type':'choice','subtopic':'Datentypen','prompt':'Welcher Typ eignet sich für eine PLZ?','choices':[{'text':'CHAR(5)','correct':True},{'text':'VARCHAR(5)','correct':False},{'text':'DATE','correct':False}],'answer':'','criteria':[],'explanation':'VARCHAR wäre nicht zulässig.','evidence':'SQL PLZ 01234 CHAR(5).'}
  q=ai.canonical(raw,'Datenbanken')
  self.assertIn('deklariert Zeichenketten fester Länge von 5 Zeichen',q['prompt']);self.assertNotIn('nicht zulässig',q['explanation'])
  self.assertEqual(q['answer'],'CHAR(5)');self.assertEqual(q['evidence'],raw['evidence'])
  other=ai.canonical(raw,'Programmierung');self.assertEqual(other['prompt'],raw['prompt'])
 def test_backup_question_declares_procedure_and_separate_criteria(self):
  raw={'type':'case','subtopic':'Backup','prompt':'Wie läuft jedes Backup?','choices':[],'answer':'Nur Logs werden geändert.','criteria':[{'text':'Logs nennen','points':2}],'explanation':'Immer nur Logs.','evidence':'Während des Backup-Vorgangs werden Änderungen in Transaktionsprotokolle hinterlegt, aber nicht mehr in die Datenbank übernommen.'}
  q=ai.canonical(raw,'Datenbanken')
  self.assertIn('Prüfungsfall',q['prompt']);self.assertIn('Dateikopie',q['prompt']);self.assertEqual(q['points'],2)
  self.assertEqual([r['points'] for r in q['rubric']],[1,1]);self.assertIn('keine allgemeine Beschreibung',q['explanation'])

 def test_count_validation(self):
  for n in [0,5,11,True,100]:
   with self.assertRaises(ValueError):ai.begin({'topic':'Datenbanken','count':n})
 def test_requested_counts_and_second_review(self):
  text='Ein Primärschlüssel identifiziert jeden Datensatz eindeutig. SQL dient der Abfrage von Datenbanken.'
  ms.put('SQL-Lerntext',[{'text':text+' Ein Datensatz enthält die Werte einer Tabellenzeile.'}])
  calls=[];serial=[0]
  def fake(cfg,instructions,payload,schema):
   calls.append(payload)
   if 'draft' in payload:return {key:{**{k:True for k in ('solutionCorrect','explanationCorrect','sourceSupported','standalone','notDuplicate')},'reason':'Belegt.'} for key in payload['draft']}
   qs=[]
   for i in range(payload['count']):
    serial[0]+=1
    qs.append({'type':'choice','subtopic':'Schlüssel','objective':'Datensätze erkennen','prompt':'SQL '+str(serial[0])+' '+('x'*serial[0])+' '+str(serial[0]**5)+' '+str(serial[0]**7)+'?','answer':'Primärschlüssel','options':['Primärschlüssel','Name','Ort'],'correctOptions':['Primärschlüssel'],'optionReasons':['Eindeutig.','Nicht eindeutig.','Nicht eindeutig.'],'rubric':[],'points':1,'explanation':'Der Primärschlüssel identifiziert eindeutig.','sourceId':1,'evidence':text})
   return {'questions':[{**q,'choices':[{'text':o,'correct':o in q['correctOptions']} for o in q['options']],'criteria':q['rubric'],'evidenceId':1} for q in qs]}
  for count in (10,20,30):
   jid=str(count);ai.JOBS[jid]={'status':'running'}
   with patch.object(ai,'model',side_effect=fake):ai.run_generation(jid,{'topic':'Datenbanken','count':count},{'provider':'ollama'})
   self.assertEqual(ai.JOBS[jid]['status'],'done');self.assertEqual(len(ai.JOBS[jid]['result']['questions']),count)
   del ai.JOBS[jid]
  self.assertEqual(len(calls),60)

 def test_rejected_draft_is_repaired_then_validated_and_audited(self):
  ms.put('SQL',[{'text':'Ein Primärschlüssel identifiziert jeden Datensatz eindeutig. SQL dient der Abfrage von Datenbanken. Eine Tabelle enthält Datensätze.'}])
  serial=[0];repairs=[]
  def fake(cfg,instructions,payload,schema):
   if 'draft' in payload:return {k:{**{f:True for f in ('solutionCorrect','explanationCorrect','sourceSupported','standalone')},'reason':'Belegt.'} for k in payload['draft']}
   if 'corrections' in payload:repairs.append(payload['corrections'])
   qs=[]
   for i in range(payload['count']):
    serial[0]+=1;n=serial[0]
    q={'type':'choice','subtopic':'Schlüssel','prompt':'SQL '+str(n)+' '+('x'*n)+' '+str(n**5)+' '+str(n**7)+'?','answer':'','choices':[{'text':'Primärschlüssel','correct':True},{'text':'Name','correct':False},{'text':'Ort','correct':False}],'criteria':[],'explanation':'Der Primärschlüssel identifiziert eindeutig.','sourceId':1,'evidenceId':1}
    if n==1:q['choices'][0]['text']=''
    qs.append(q)
   return {'questions':qs}
  ai.JOBS['repair']={'status':'running'}
  with patch.object(ai,'model',side_effect=fake):ai.run_generation('repair',{'topic':'Datenbanken','count':10},{'provider':'ollama'})
  job=ai.JOBS.pop('repair');self.assertEqual(job['status'],'done');self.assertEqual(len(job['result']['questions']),10)
  self.assertEqual(len(repairs),1);self.assertTrue(all(q['answer']=='Primärschlüssel' for q in job['result']['questions']))

 def test_job_resume(self):
  folder=self.root/'.local-data'/'generated';folder.mkdir(parents=True);jid='a'*32
  (folder/(jid+'.json')).write_text(json.dumps({'questions':[],'topic':'Datenbanken'}))
  self.assertEqual(ai.job(jid)['status'],'done')

 def test_wrong_explanation_rejects_otherwise_valid_question(self):
  text='Ein Primärschlüssel identifiziert jeden Datensatz eindeutig. SQL dient der Abfrage von Datenbanken.'
  ms.put('SQL-Lerntext',[{'text':text}])
  question={'type':'choice','subtopic':'Schlüssel','prompt':'Was identifiziert in SQL einen Datensatz eindeutig?','answer':'','choices':[{'text':'Primärschlüssel','correct':True},{'text':'Name','correct':False},{'text':'Ort','correct':False}],'criteria':[],'explanation':'Eine unzutreffende Zusatzbehauptung.','sourceId':1,'evidence':text}
  def fake(cfg,instructions,payload,schema):
   if 'draft' not in payload:return {'questions':[{**question,'evidenceId':1}]}
   return {'q0':{'solutionCorrect':True,'explanationCorrect':False,'sourceSupported':False,'standalone':True,'notDuplicate':True,'reason':'Erklärung nicht belegt.'}}
  ai.JOBS['reject-explanation']={'status':'running'}
  with patch.object(ai,'model',side_effect=fake):ai.run_generation('reject-explanation',{'topic':'Datenbanken','count':10},{'provider':'ollama'})
  self.assertEqual(ai.JOBS.pop('reject-explanation')['status'],'error')

if __name__=='__main__':unittest.main()
