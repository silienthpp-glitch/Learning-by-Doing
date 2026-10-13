"""API-Vertrags-Tests ohne Ollama / OpenAI oder Cloud."""
import importlib.util
import json
import threading
import unittest
import urllib.error
import urllib.request
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

spec=importlib.util.spec_from_file_location("learning_api",Path("start.py"))
app=importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)


class GenerateContract(unittest.TestCase):
    def test_ollama_is_default_and_review_is_mandatory(self):
        sample={"questions":[{"prompt":"Ein Client erhält 169.254.1.22; welche DHCP-Ursache ist möglich?",
                              "answer":"Der DHCP-Server antwortet nicht.","chunkId":"quelle:1",
                              "evidenceQuote":"Wenn DHCP nicht antwortet, wird APIPA verwendet."}]}
        with patch.object(app,"run_ai",side_effect=[sample,{"acceptedIndices":[0]}]) as run:
            result=app.generate_questions({
                "subject":"Netzwerktechnik","topic":"DHCP","count":10,
                "context":"[ABSCHNITT quelle:1] "+("Der DHCP-Server antwortet nicht. "*10)
            })
        self.assertEqual(len(result["questions"]),1)
        self.assertEqual(run.call_count,2,"Generierung und Zweitkontrolle erforderlich")
        self.assertEqual(run.call_args_list[0].args[0],"ollama")
        self.assertEqual(run.call_args_list[1].args[0],"ollama")

    def test_no_unchecked_output_when_review_fails(self):
        with patch.object(app,"run_ai",side_effect=[{"questions":[{"prompt":"ok"}]},
                                                   {"acceptedIndices":[]}]):
            with self.assertRaises(app.ApiError):
                app.generate_questions({"subject":"Netz","topic":"DHCP","count":10,"context":"DHCP "*25})

    def test_no_cloud_if_ollama_unavailable(self):
        with patch.object(app,"call_ollama",side_effect=app.ApiError("Ollama offline",503)), \
             patch.object(app,"call_openai") as cloud:
            with self.assertRaises(app.ApiError):
                app.run_ai("ollama","Test","Test")
            cloud.assert_not_called()


class HttpContract(unittest.TestCase):
    def test_local_server_exposes_status_and_post(self):
        handler=partial(app.LearningHandler,directory=str(app.DIST))
        server=ThreadingHTTPServer(("127.0.0.1",0),handler)
        thread=threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        base=f"http://127.0.0.1:{server.server_address[1]}"
        try:
            with patch.object(app,"ai_status",return_value={"ollama":{"reachable":False,"modelReady":False},
                "openai":{"available":False},"defaultProvider":"ollama"}):
                with urllib.request.urlopen(base+"/api/ai/status",timeout=5) as response:
                    data=json.load(response)
                self.assertEqual(data["defaultProvider"],"ollama")
            with patch.object(app,"generate_questions",return_value={"analysis":{},"questions":[]}) as gen:
                body=json.dumps({"provider":"ollama","topic":"DHCP"}).encode()
                req=urllib.request.Request(base+"/api/ai/generate",data=body,
                    headers={"Content-Type":"application/json"},method="POST")
                with urllib.request.urlopen(req,timeout=5) as response:
                    self.assertEqual(json.load(response)["questions"],[])
                self.assertEqual(gen.call_count,1)
            with self.assertRaises(urllib.error.HTTPError) as exc:
                urllib.request.urlopen(base+"/.env",timeout=5)
            self.assertEqual(exc.exception.code,404)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__=="__main__":
    unittest.main()
