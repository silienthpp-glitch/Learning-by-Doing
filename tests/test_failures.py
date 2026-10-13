"""Gezielte API-Fehlertests ohne echte KI oder Benutzerdokumente.

Diese Tests sind wiederholbar, offline und dürfen niemals API-Gebühren auslösen.
"""
import importlib.util
import json
import http.client
import threading
import unittest
import urllib.error
import urllib.request
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("learning_server", Path("start.py"))
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)

QUESTION = {
    "type": "text", "prompt": "Woran erkennt man einen DHCP-Ausfall?",
    "answer": "APIPA-Adresse", "explanation": "169.254.0.0/16",
}


class GradeQuality(unittest.TestCase):
    def check_rejected(self, response):
        with patch.object(app, "run_ai", return_value=response):
            with self.assertRaises(app.ApiError):
                app.evaluate_answer({"question": QUESTION, "answer": "Der DHCP-Server antwortet nicht."})

    def test_missing_grade_rejected(self):
        self.check_rejected({"feedback": "Keine Bewertung"})

    def test_invalid_grade_rejected(self):
        self.check_rejected({"rating": "maybe", "score": 0.7})

    def test_invalid_numeric_score_rejected(self):
        for score in [None, "unbekannt", -0.1, 1.1, "nan", "inf"]:
            with self.subTest(score=score):
                self.check_rejected({"rating": "partial", "score": score})

    def test_contradictory_grade_rejected(self):
        for rating, score in [("wrong", 0.99), ("correct", 0.0), ("partial", 0.9)]:
            with self.subTest(rating=rating):
                self.check_rejected({"rating": rating, "score": score})

    def test_valid_partial_grade(self):
        with patch.object(app, "run_ai", return_value={
            "rating": "partial", "score": 0.6, "feedback": "Schon gut, ergänze APIPA."
        }):
            result = app.evaluate_answer({"question": QUESTION, "answer": "DHCP ist weg."})
        self.assertEqual(result["rating"], "partial")
        self.assertAlmostEqual(result["score"], 0.6)

    def test_empty_user_answer(self):
        with self.assertRaises(app.ApiError):
            app.evaluate_answer({"question": QUESTION, "answer": ""})


class HttpFailures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(
            ("127.0.0.1", 0),
            partial(app.LearningHandler, directory=str(app.DIST))
        )
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=5)

    def post(self, payload, path="/api/ai/generate"):
        req = urllib.request.Request(
            self.base + path, data=payload,
            headers={"Content-Type": "application/json"}, method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.load(res)

    def test_invalid_json_http_400(self):
        with self.assertRaises(urllib.error.HTTPError) as error:
            self.post(b"{bad-json")
        self.assertEqual(error.exception.code, 400)

    def test_oversized_request_http_400(self):
        # Nur den zu großen Content-Length-Wert senden. Beim Senden des ganzen
        # Bodys darf der Testclient sonst mit BrokenPipe abbrechen, weil der
        # Server die Anfrage absichtlich bereits an den Headers ablehnt.
        from urllib.parse import urlsplit
        url = urlsplit(self.base)
        conn = http.client.HTTPConnection(url.hostname, url.port, timeout=5)
        try:
            conn.request("POST", "/api/ai/generate", body=b"{}", headers={
                "Content-Type": "application/json",
                "Content-Length": str(2_000_001)
            })
            response = conn.getresponse()
            self.assertEqual(response.status, 400)
            self.assertIn("Ungültige Anfrage", json.loads(response.read())["error"])
        finally:
            conn.close()

    def test_unknown_api_http_404(self):
        with self.assertRaises(urllib.error.HTTPError) as error:
            self.post(b"{}", path="/api/does-not-exist")
        self.assertEqual(error.exception.code, 404)

    def test_internal_error_is_generic_to_user(self):
        with patch.object(app, "generate_questions", side_effect=RuntimeError("PRIVATE DEBUG TOKEN")):
            with self.assertRaises(urllib.error.HTTPError) as error, \
                 patch.object(app.logging, "exception"):
                self.post(b"{}")
        self.assertEqual(error.exception.code, 500)
        message = json.loads(error.exception.read())["error"]
        self.assertNotIn("PRIVATE DEBUG TOKEN", message)
        self.assertIn("versuche es erneut", message)


if __name__ == "__main__":
    unittest.main()
