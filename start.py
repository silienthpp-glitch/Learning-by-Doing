#!/usr/bin/env python3
"""Learning by Doing: lokaler Webserver mit optionaler KI-Anbindung.

- Statische Lernplattform unter http://127.0.0.1:8765
- Ollama bleibt lokal auf diesem Rechner.
- OpenAI ist optional und wird nur serverseitig über .env gelesen.
- Keine zusätzlichen Python-Pakete erforderlich.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import threading
import urllib.error
import urllib.request
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
DIST = BASE / "dist"


def load_env(path: Path) -> None:
    """Liest eine einfache .env-Datei, ohne vorhandene Umgebungsvariablen zu überschreiben."""
    if not path.exists():
        return
    try:
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key:
                os.environ.setdefault(key, value)
    except OSError:
        pass


load_env(BASE / ".env")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3.5:4b").strip() or "qwen3.5:4b"
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-6-luna").strip() or "gpt-6-luna"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
AI_TIMEOUT = max(30, int(os.getenv("AI_TIMEOUT", "180") or "180"))
MAX_CONTEXT_CHARS = 32000


class ApiError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


def request_json(
    url: str,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: int = AI_TIMEOUT,
) -> dict[str, Any]:
    data = None
    final_headers = {"Accept": "application/json"}
    if headers:
        final_headers.update(headers)
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        final_headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=final_headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(body).get("error") or body
            if isinstance(detail, dict):
                detail = detail.get("message") or str(detail)
        except Exception:
            detail = body
        raise ApiError(f"KI-Dienst antwortet mit Fehler {exc.code}: {detail}", 502) from exc
    except urllib.error.URLError as exc:
        raise ApiError(f"KI-Dienst ist nicht erreichbar: {exc.reason}", 503) from exc
    except TimeoutError as exc:
        raise ApiError("Die KI-Antwort hat zu lange gedauert. Bitte erneut versuchen.", 504) from exc

    try:
        return json.loads(raw) if raw else {}
    except json.JSONDecodeError as exc:
        raise ApiError("Der KI-Dienst hat keine gültige JSON-Antwort geliefert.", 502) from exc


def ollama_models() -> list[dict[str, Any]]:
    response = request_json(f"{OLLAMA_URL}/api/tags", timeout=5)
    models = response.get("models", [])
    return models if isinstance(models, list) else []


def model_name(model: dict[str, Any]) -> str:
    return str(model.get("name") or model.get("model") or "").strip()


def choose_ollama_model(models: list[dict[str, Any]]) -> str:
    names = [model_name(model) for model in models if model_name(model)]
    if not names:
        return OLLAMA_MODEL
    if OLLAMA_MODEL in names:
        return OLLAMA_MODEL

    desired_base = OLLAMA_MODEL.split(":", 1)[0]
    for name in names:
        if name.split(":", 1)[0] == desired_base:
            return name

    preferred = ("qwen3.5", "qwen3", "qwen2.5", "llama3.2", "llama3", "gemma3", "mistral")
    for family in preferred:
        for name in names:
            if name.lower().startswith(family):
                return name
    return names[0]


def ai_status() -> dict[str, Any]:
    try:
        models = ollama_models()
        names = [model_name(model) for model in models if model_name(model)]
        active = choose_ollama_model(models)
        ollama = {
            "reachable": True,
            "modelReady": bool(names),
            "preferredModelInstalled": OLLAMA_MODEL in names,
            "preferredModel": OLLAMA_MODEL,
            "activeModel": active if names else "",
            "installedModels": names,
            "message": (
                f"Lokale KI verbunden · {active}"
                if names
                else f"Ollama läuft, aber es ist noch kein Modell installiert. Installiere {OLLAMA_MODEL}."
            ),
        }
    except Exception:
        ollama = {
            "reachable": False,
            "modelReady": False,
            "preferredModelInstalled": False,
            "preferredModel": OLLAMA_MODEL,
            "activeModel": "",
            "installedModels": [],
            "message": "Lokale KI nicht erreichbar. Öffne Ollama oder starte im Terminal: ollama serve",
        }

    return {
        "ollama": ollama,
        "openai": {
            "available": bool(OPENAI_API_KEY),
            "model": OPENAI_MODEL,
            "message": "OpenAI verfügbar" if OPENAI_API_KEY else "OpenAI nicht eingerichtet",
        },
        "defaultProvider": "ollama",
    }


def extract_json_text(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.I)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        value = json.loads(cleaned)
        if isinstance(value, dict):
            return value
    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start >= 0 and end > start:
        try:
            value = json.loads(cleaned[start : end + 1])
            if isinstance(value, dict):
                return value
        except json.JSONDecodeError:
            pass
    raise ApiError("Die KI hat kein gültiges JSON erzeugt. Bitte erneut versuchen.", 502)


def call_ollama(system: str, user: str) -> dict[str, Any]:
    try:
        models = ollama_models()
    except ApiError as exc:
        raise ApiError(
            "Ollama ist nicht erreichbar. Öffne die Ollama-App oder führe 'ollama serve' aus.",
            503,
        ) from exc

    names = [model_name(model) for model in models if model_name(model)]
    if not names:
        raise ApiError(
            f"Ollama läuft, aber es ist kein Modell installiert. Führe 'ollama pull {OLLAMA_MODEL}' aus.",
            503,
        )

    selected = choose_ollama_model(models)
    response = request_json(
        f"{OLLAMA_URL}/api/chat",
        method="POST",
        payload={
            "model": selected,
            "stream": False,
            "format": "json",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "options": {"temperature": 0.2},
        },
    )
    message = response.get("message") or {}
    content = message.get("content") if isinstance(message, dict) else ""
    if not isinstance(content, str) or not content.strip():
        raise ApiError("Ollama hat keine nutzbare Antwort geliefert.", 502)
    result = extract_json_text(content)
    result["_provider"] = "ollama"
    result["_model"] = selected
    return result


def openai_output_text(response: dict[str, Any]) -> str:
    parts: list[str] = []
    for item in response.get("output", []) if isinstance(response.get("output"), list) else []:
        if not isinstance(item, dict):
            continue
        for content in item.get("content", []) if isinstance(item.get("content"), list) else []:
            if isinstance(content, dict) and content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str):
                    parts.append(text)
    return "\n".join(parts).strip()


def call_openai(system: str, user: str) -> dict[str, Any]:
    if not OPENAI_API_KEY:
        raise ApiError(
            "OpenAI ist nicht eingerichtet. Trage OPENAI_API_KEY nur lokal in die .env-Datei ein oder nutze Ollama.",
            400,
        )
    response = request_json(
        "https://api.openai.com/v1/responses",
        method="POST",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        payload={
            "model": OPENAI_MODEL,
            "instructions": system,
            "input": user,
        },
    )
    text = openai_output_text(response)
    if not text:
        raise ApiError("OpenAI hat keine Textantwort geliefert.", 502)
    result = extract_json_text(text)
    result["_provider"] = "openai"
    result["_model"] = OPENAI_MODEL
    return result


def run_ai(provider: str, system: str, user: str) -> dict[str, Any]:
    provider = (provider or "ollama").strip().lower()
    if provider == "ollama":
        return call_ollama(system, user)
    if provider == "openai":
        return call_openai(system, user)
    raise ApiError("Unbekannte KI-Auswahl.", 400)


def clipped_context(value: Any) -> str:
    text = str(value or "").strip()
    if len(text) > MAX_CONTEXT_CHARS:
        text = text[:MAX_CONTEXT_CHARS] + "\n[Kontext wurde aus Speichergründen gekürzt.]"
    return text


def generate_questions(payload: dict[str, Any]) -> dict[str, Any]:
    provider = str(payload.get("provider") or "ollama")
    subject = str(payload.get("subject") or "").strip()
    topic = str(payload.get("topic") or "").strip()
    try:
        count = int(payload.get("count") or 10)
    except (TypeError, ValueError):
        count = 10
    count = count if count in (10, 20, 30) else 10
    context = clipped_context(payload.get("context"))

    if not subject:
        raise ApiError("Bitte wähle ein Fach aus.")
    if not topic:
        raise ApiError("Bitte wähle ein Thema aus.")
    if len(context) < 80:
        raise ApiError(
            "Zu diesem Thema wurden noch nicht genug Lernunterlagen gefunden. Importiere zuerst passende Unterlagen oder wähle ein anderes Thema."
        )

    system = """Du bist ein präziser IHK-Lerntrainer für Fachinformatiker/in Systemintegration.
Erstelle ausschließlich fachlich passende Lernfragen zum angeforderten Thema.
Die bereitgestellten Lernunterlagen sind die wichtigste Wissensquelle. Vermische keine fremden Themen.
Wenn ein Textabschnitt offensichtlich Kopfzeile, Seitenzahl, organisatorischer Hinweis oder fachfremd ist, ignoriere ihn.
Formuliere auf Ausbildungsniveau, praxisnah und verständlich.

Erlaubte Fragetypen:
- choice: genau eine richtige Antwort, mindestens 4 Optionen
- multichoice: mehrere richtige Antworten, mindestens 4 Optionen und correctOptions
- text: kurze fachliche Freitextantwort
- truefalse: Antwort exakt "Richtig" oder "Falsch"
- number: Rechenaufgabe mit eindeutiger Lösung; steps enthält den Rechenweg
- scenario: praxisnahe IHK-Situation mit begründeter Musterlösung

Verteile die Fragetypen sinnvoll. Nutze Definitionen, Zusammenhänge, typische Fehler, Rechenaufgaben und Praxisfälle, soweit die Unterlagen das hergeben.
Jede Frage muss eindeutig zum ausgewählten Thema passen. Keine Fantasiequellen erfinden.
Gib NUR ein JSON-Objekt zurück, ohne Markdown:
{
  "analysis": {
    "topic": "...",
    "subtopics": ["..."],
    "keyTerms": ["..."]
  },
  "questions": [
    {
      "type": "choice|multichoice|text|truefalse|number|scenario",
      "topic": "...",
      "subtopic": "...",
      "prompt": "...",
      "answer": "...",
      "options": [],
      "correctOptions": [],
      "aliases": [],
      "explanation": "...",
      "steps": [],
      "points": 1
    }
  ]
}"""

    user = f"""Fach: {subject}
Gewähltes Thema: {topic}
Gewünschte Anzahl: {count}

WICHTIG:
1. Nutze nur Inhalte, die zum Thema "{topic}" passen.
2. Bevorzuge Aussagen aus den Unterlagen.
3. Wenn Unterlagen mehrere Themen enthalten, filtere streng auf "{topic}".
4. Erzeuge bis zu {count} hochwertige Fragen; Qualität ist wichtiger als künstliches Auffüllen.

Lernunterlagen:
--- BEGINN UNTERLAGEN ---
{context}
--- ENDE UNTERLAGEN ---"""

    result = run_ai(provider, system, user)
    questions = result.get("questions")
    if not isinstance(questions, list) or not questions:
        raise ApiError("Die KI konnte aus diesen Unterlagen keine passenden Fragen erzeugen.", 502)
    result["questions"] = questions[:count]
    return result


def evaluate_answer(payload: dict[str, Any]) -> dict[str, Any]:
    provider = str(payload.get("provider") or "ollama")
    question = payload.get("question")
    if not isinstance(question, dict):
        raise ApiError("Die Frage fehlt.")
    user_answer = payload.get("answer")
    if isinstance(user_answer, list):
        answer_text = ", ".join(str(item) for item in user_answer)
    else:
        answer_text = str(user_answer or "").strip()
    if not answer_text:
        raise ApiError("Bitte gib zuerst eine Antwort ein.")

    compact_question = {
        "type": question.get("type"),
        "prompt": question.get("prompt"),
        "answer": question.get("answer"),
        "correctOptions": question.get("correctOptions"),
        "aliases": question.get("aliases"),
        "explanation": question.get("explanation"),
        "steps": question.get("steps"),
        "topic": question.get("topic"),
        "subtopic": question.get("subtopic"),
        "points": question.get("points"),
    }

    system = """Du bewertest Antworten eines Fachinformatiker-Auszubildenden für die IHK-Vorbereitung.
Bewerte fachlich fair. Kleine Rechtschreibfehler und andere Formulierungen sind kein Fehler, wenn der Inhalt stimmt.
Bei Rechenaufgaben zählen korrekter Ansatz, Rechenweg und Ergebnis. Bei Praxisfragen zählen fachlich sinnvolle Begründungen.
Nutze ausschließlich die Frage, Musterlösung und Erklärung als Bewertungsrahmen.
Gib NUR JSON zurück:
{
  "rating": "correct|partial|wrong",
  "score": 0.0,
  "feedback": "kurze verständliche Begründung",
  "modelAnswer": "klare Musterlösung"
}
score muss zwischen 0 und 1 liegen. correct >= 0.85, partial 0.4 bis 0.84, wrong < 0.4."""

    user = (
        "Frage und Bewertungsrahmen:\n"
        + json.dumps(compact_question, ensure_ascii=False)
        + "\n\nAntwort des Lernenden:\n"
        + answer_text
    )
    result = run_ai(provider, system, user)
    rating = str(result.get("rating") or "wrong").lower()
    if rating not in ("correct", "partial", "wrong"):
        rating = "wrong"
    try:
        score = float(result.get("score", 0))
    except (TypeError, ValueError):
        score = 1.0 if rating == "correct" else 0.5 if rating == "partial" else 0.0
    score = min(1.0, max(0.0, score))
    result["rating"] = rating
    result["score"] = score
    result["feedback"] = str(result.get("feedback") or "").strip()
    result["modelAnswer"] = str(result.get("modelAnswer") or question.get("answer") or "").strip()
    return result


class LearningHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        # Beim lokalen Entwickeln sollen JS/CSS-Änderungen nach Neuladen sofort sichtbar sein.
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt: str, *args: Any) -> None:
        if self.path.startswith("/api/"):
            super().log_message(fmt, *args)

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            length = 0
        if length <= 0 or length > 2_000_000:
            raise ApiError("Ungültige Anfrage.", 400)
        raw = self.rfile.read(length).decode("utf-8", errors="replace")
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ApiError("Ungültiges JSON.", 400) from exc
        if not isinstance(value, dict):
            raise ApiError("Ungültige Anfrage.", 400)
        return value

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/api/ai/status":
            self.send_json(200, ai_status())
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = self.path.split("?", 1)[0]
        try:
            payload = self.read_json()
            if path == "/api/ai/generate":
                self.send_json(200, generate_questions(payload))
                return
            if path == "/api/ai/evaluate":
                self.send_json(200, evaluate_answer(payload))
                return
            raise ApiError("API-Endpunkt nicht gefunden.", 404)
        except ApiError as exc:
            self.send_json(exc.status, {"error": str(exc)})
        except Exception as exc:
            self.send_json(500, {"error": f"Unerwarteter Serverfehler: {exc}"})


def main() -> None:
    parser = argparse.ArgumentParser(description="Learning by Doing lokal starten")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument(
        "--open-browser",
        action="store_true",
        help="öffnet die Lernseite nach dem Start automatisch",
    )
    args = parser.parse_args()

    handler = partial(LearningHandler, directory=str(DIST))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError:
        raise SystemExit(f"Port belegt. Versuche: python3 start.py --port {args.port + 1}")

    print(f"Learning by Doing: http://127.0.0.1:{args.port}", flush=True)
    status = ai_status()
    ollama = status["ollama"]
    print(
        f"Ollama: {'verbunden' if ollama['reachable'] else 'nicht erreichbar'}"
        + (f" · Modell {ollama['activeModel']}" if ollama.get("activeModel") else ""),
        flush=True,
    )
    print(
        f"OpenAI: {'eingerichtet' if status['openai']['available'] else 'nicht eingerichtet (optional)'}",
        flush=True,
    )
    print("Zum Beenden Strg+C drücken.", flush=True)

    if args.open_browser:
        threading.Timer(
            1.0,
            webbrowser.open,
            args=(f"http://127.0.0.1:{args.port}",),
        ).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
