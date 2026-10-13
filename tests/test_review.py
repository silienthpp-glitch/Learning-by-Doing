"""Tests für die zweite Modellkontrolle, ohne Ollama oder API-Key."""
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


spec = importlib.util.spec_from_file_location("learning_start", Path("start.py"))
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)


class ReviewTest(unittest.TestCase):
    def setUp(self):
        self.questions = [{"prompt": f"Prüfungsfrage {i}", "answer": "Fachliche Lösung"} for i in range(12)]

    def test_only_approved_questions_are_returned(self):
        with patch.object(app, "run_ai", return_value={"acceptedIndices": [1, 3, 99, -1, "4"]}) as mocked:
            output = app.review_generated_questions("ollama", "Originalabschnitt", self.questions)
        self.assertEqual(output, [self.questions[1], self.questions[3]])
        self.assertEqual(mocked.call_count, 1)  # Batch, nicht eine Anfrage pro Frage.

    def test_invalid_review_is_rejected(self):
        with patch.object(app, "run_ai", return_value={"summary": "Keine verlässliche Bewertung"}):
            with self.assertRaises(app.ApiError):
                app.review_generated_questions("ollama", "Originalabschnitt", self.questions)

    def test_empty_approval_does_not_pass_unchecked_questions(self):
        with patch.object(app, "run_ai", return_value={"acceptedIndices": []}):
            self.assertEqual(app.review_generated_questions("ollama", "Text", self.questions), [])

    def test_at_most_eight_candidates(self):
        with patch.object(app, "run_ai", return_value={"acceptedIndices": list(range(12))}) as mocked:
            out = app.review_generated_questions("ollama", "Text", self.questions)
        self.assertEqual(len(out), 8)
        # Die Anfrage an die KI enthält Kandidat 0 bis 7, nicht Kandidat 8.
        self.assertNotIn("Prüfungsfrage 8", mocked.call_args.args[2])


if __name__ == "__main__":
    unittest.main()
