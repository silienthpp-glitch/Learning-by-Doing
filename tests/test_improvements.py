import unittest,tempfile,json
from pathlib import Path
from unittest.mock import patch
import ai_service as ai
import material_store as ms
import launcher

class Improvements(unittest.TestCase):
 def test_real_subtopics_ignore_class_label(self):
  self.assertEqual(ms.subtopics_for('Fachinformatiker/in Klasse EVP10b Datum'),[])
  self.assertEqual(ms.subtopics_for('Direct Attached Storage nutzt SAS; Storage Area Network verwendet Fibre Channel; Network Attached Storage unterstützt SMB/CIFS. RAID hat Parität.'),['DAS','SAN','NAS','RAID'])
 def test_balance_preserves_every_question_and_cycles_types(self):
  qs=[{'type':kind,'id':str(i)+kind} for kind in ('choice','case','calculation') for i in range(8)]
  result=ai.balanced(qs)
  self.assertEqual(len(result),24);self.assertEqual({q['id'] for q in result},{q['id'] for q in qs})
  self.assertEqual(len({q['type'] for q in result[:3]}),3)
 def test_difficulty_does_not_reveal_solution(self):
  base={'type':'calculation','subtopic':'RAID5-Kapazität','topic':'EVP10b','prompt':'Berechne die Kapazität.','rubric':[{'text':'2 TB nennen','points':1}],'answer':'2 TB'}
  q=ai.prepare_question(dict(base),'Grundlagen');self.assertNotIn('2 TB',q['prompt']);self.assertIn('Orientierung',q['prompt']);self.assertEqual(q['knowledgeTopic'],'RAID')
  self.assertNotIn('Orientierung',ai.prepare_question(dict(base),'Prüfungsniveau')['prompt'])
 def test_invalid_difficulty_rejected_before_model(self):
  with self.assertRaisesRegex(ValueError,'Grundlagen'):ai.begin({'topic':'Datenbanken','count':30,'difficulty':'beliebig'})
 def test_launcher_remembers_valid_port_only(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(launcher,'ROOT',Path(tmp)):
   self.assertEqual(launcher.remembered_port(),8765)
   folder=Path(tmp)/'.local-data';folder.mkdir();f=folder/'start-settings.json';f.write_text(json.dumps({'port':18769}))
   self.assertEqual(launcher.remembered_port(),18769)
   f.write_text(json.dumps({'port':'18769'}));self.assertEqual(launcher.remembered_port(),8765)
 def test_launcher_does_not_start_second_ollama(self):
  with patch.object(launcher,'fetch',return_value={'models':[]}),patch.object(launcher.subprocess,'Popen') as start:
   self.assertTrue(launcher.start_ollama());start.assert_not_called()
 def test_launcher_reuses_only_this_project(self):
  with patch.object(launcher,'fetch',return_value={'projectId':str(launcher.ROOT)}):self.assertTrue(launcher.own_server(8765))
  with patch.object(launcher,'fetch',return_value={'projectId':'other-folder'}):self.assertFalse(launcher.own_server(8765))

 def test_header_and_incomplete_calculation_are_rejected(self):
  source={'text':'RAID 0 verteilt Daten per Striping auf mehrere Festplatten und besitzt keine Redundanz.','sourceName':'Eigener Testtext','sourcePage':1,'documentId':'test'}
  base={'type':'selfcheck','prompt':'Was bedeutet Striping bei RAID 0?','answer':'Daten verteilen','subtopic':'RAID','objective':'Striping erklären','explanation':'Die Daten werden verteilt.','evidence':source['text'],'sourceId':1,'points':1,'options':[],'correctOptions':[],'optionReasons':[],'rubric':[{'text':'Daten verteilen','points':1}]}
  with self.assertRaisesRegex(ValueError,'Dokumentkopf'):ai.validate({**base,'prompt':'Erkläre den Zusammenhang zwischen Fachinformatiker/in und Klasse.'},[source],'EVP10b')
  with self.assertRaisesRegex(ValueError,'konkrete Zahlen'):ai.validate({**base,'type':'calculation','prompt':'Berechne den nutzbaren Speicherplatz.'},[source],'EVP10b')
 def test_ai_grading_explicitly_requires_review(self):
  q={'type':'selfcheck','points':1,'rubric':[{'text':'Daten verteilen','points':1}]}
  with patch.object(ai,'cfg_for',return_value={'provider':'ollama'}),patch.object(ai,'model',return_value={'criteria':{'c0':{'earned':1}}}):
   result=ai.grade({'question':q,'answer':'Daten verteilen'})
   self.assertTrue(result['needsReview']);self.assertEqual(result['confidence'],'provisional')
