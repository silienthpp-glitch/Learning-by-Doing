import copy
import http.client
import json
from pathlib import Path
import sys
import threading
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import teacher_engine as engine
import start

PACK = json.loads((Path(__file__).parent/'fixtures/teacher-pack.json').read_text())
PAGES = [{'page':1,'text':PACK['questions'][0]['evidence']}]
REQUEST = {'provider':'ollama','consent':True,'pages':PAGES,'count':3,'mode':'mixed'}

class TeacherTests(unittest.TestCase):
    def test_valid_pack(self):
        self.assertEqual(len(engine.validate_pack(PACK,PAGES,3)['questions']),2)
    def test_invented_evidence_rejected(self):
        p=copy.deepcopy(PACK);p['questions'][0]['evidence']='Diese Aussage existiert nicht in der Originalquelle.'
        with self.assertRaisesRegex(ValueError,'Quellenbeleg'):engine.validate_pack(p,PAGES,3)
    def test_false_points_rejected(self):
        p=copy.deepcopy(PACK);p['questions'][0]['points']=6
        with self.assertRaisesRegex(ValueError,'Gesamtpunkte'):engine.validate_pack(p,PAGES,3)
    def test_duplicate_options_rejected(self):
        p=copy.deepcopy(PACK);p['questions'][1]['options'][0]=p['questions'][1]['answer']
        with self.assertRaisesRegex(ValueError,'Antwortoptionen'):engine.validate_pack(p,PAGES,3)
    def test_missing_consent_never_calls_model(self):
        called=[]
        with self.assertRaises(ValueError):engine.generate({**REQUEST,'consent':False},lambda *a:called.append(a))
        self.assertEqual(called,[])
    def test_oversized_source_rejected(self):
        with self.assertRaises(ValueError):engine.validate_request({**REQUEST,'pages':[{'page':1,'text':'x'*40001}]})
    def test_two_pass_review(self):
        calls=[]
        def fake(*args):calls.append(args);return copy.deepcopy(PACK)
        with patch.object(engine,'config',return_value={'provider':'ollama','model':'test','ready':True}):
            result=engine.generate(REQUEST,fake)
        self.assertEqual(len(calls),2);self.assertIn('draft',calls[1][2]);self.assertEqual(result,PACK)
    def test_provider_change_stops_before_call(self):
        with patch.object(engine,'config',return_value={'provider':'openai','model':'test','ready':True}):
            with self.assertRaisesRegex(ValueError,'geändert'):engine.generate(REQUEST,lambda *a:self.fail('must not call'))
    def test_wrong_mode_rejected(self):
        with patch.object(engine,'config',return_value={'provider':'ollama','model':'test','ready':True}):
            with self.assertRaisesRegex(ValueError,'Fragentyp'):engine.generate({**REQUEST,'mode':'choice'},lambda *a:copy.deepcopy(PACK))

class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=start.ThreadingHTTPServer(('127.0.0.1',0),start.Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def request(self,method,path,body=None,headers=None):
        c=http.client.HTTPConnection('127.0.0.1',self.server.server_port)
        c.request(method,path,body,headers or {});r=c.getresponse();raw=r.read();status=r.status;c.close();return status,raw
    def test_no_token_rejected(self):
        self.assertEqual(self.request('POST','/api/teacher/generate','{}')[0],403)
    def test_foreign_origin_rejected(self):
        self.assertEqual(self.request('GET','/api/teacher/status',headers={'Origin':'https://example.com'})[0],403)
    def test_rebinding_host_rejected(self):
        self.assertEqual(self.request('GET','/api/teacher/status',headers={'Host':'evil.test:8765'})[0],403)
    def test_status_contains_no_secret(self):
        status,raw=self.request('GET','/api/teacher/status');data=json.loads(raw)
        self.assertEqual(status,200);self.assertIn('token',data);self.assertNotIn('OPENAI_API_KEY',raw.decode())
    def test_post_success_without_real_model(self):
        with patch.object(engine,'generate',return_value=PACK):
            status,raw=self.request('POST','/api/teacher/generate',json.dumps(REQUEST),{'Content-Type':'application/json','X-Teacher-Token':start.TOKEN})
        self.assertEqual(status,200);self.assertEqual(json.loads(raw),PACK)
    def test_private_config_not_served(self):
        self.assertEqual(self.request('GET','/ai-config.json')[0],404)

if __name__=='__main__':unittest.main()
