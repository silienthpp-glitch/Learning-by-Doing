#!/usr/bin/env python3
"""Realtest von lokalem Ollama über die laufende Learning-by-Doing-Web-API.

Nur synthetischer Lernstoff. Kein OpenAI-Key, keine privaten Prüfungsdateien.
Verwende das Skript erst, wenn Ollama und start.py auf deinem Rechner laufen.

Beispiel:
    python3 scripts/test_real_ollama.py
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request


def request(base: str, endpoint: str, payload: dict | None = None) -> dict:
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        base.rstrip("/") + endpoint,
        data=data,
        headers={"Content-Type": "application/json"},
        method="GET" if payload is None else "POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(body).get("error", body)
        except (ValueError, TypeError, AttributeError):
            pass
        raise RuntimeError(f"API-Fehler {exc.code}: {body}") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError("Der lokale Server ist nicht erreichbar oder die KI benötigt zu lange.") from exc


def main() -> int:
    parser = argparse.ArgumentParser(description="Realer, lokaler Ollama-End-to-End-Test ohne externe KI")
    parser.add_argument("--url", default="http://127.0.0.1:8765", help="Lokale Learning-by-Doing-Adresse")
    args = parser.parse_args()

    if not args.url.startswith(("http://127.0.0.1:", "http://localhost:")):
        parser.error("Aus Datenschutzgründen ist nur der eigene Rechner erlaubt.")

    try:
        status = request(args.url, "/api/ai/status")
        local = status.get("ollama") or {}
        print("Ollama:", local.get("message") or "Status unbekannt")
        if not (local.get("reachable") and local.get("modelReady")):
            raise RuntimeError("Ollama oder Modell fehlt. Bitte ollama pull qwen3.5:4b ausführen.")

        quote = "Wenn ein DHCP-Server nicht antwortet, kann ein Client eine Adresse aus 169.254.0.0/16 verwenden."
        context = (
            "[ABSCHNITT qa-demo:1 | synthetisches Beispiel | Seite 1]\n"
            + quote + "\n"
            + "Solche selbst zugewiesenen Adressen helfen nicht beim Erreichen "
            + "anderer Subnetze. Zur Analyse prüft ein Administrator DHCP-Relay, "
            + "VLAN-Zuordnung und die Erreichbarkeit des DHCP-Servers."
        )
        print("Erzeuge und prüfe eine Frage (zwei lokale Ollama-Aufrufe) …")
        generated = request(args.url, "/api/ai/generate", {
            "provider": "ollama", "subject": "Netzwerktechnik",
            "topic": "DHCP", "count": 1, "context": context
        })
        questions = generated.get("questions")
        if not isinstance(questions, list) or not questions:
            raise RuntimeError("Keine nach der Zweitkontrolle akzeptierte KI-Frage erhalten.")
        question = questions[0]
        if question.get("chunkId") != "qa-demo:1":
            raise RuntimeError("Quelle stimmt nicht mit dem Originalabschnitt überein.")
        quote_out = str(question.get("evidenceQuote") or "").lower()
        if len(quote_out) < 22 or quote_out not in context.lower():
            raise RuntimeError("Das KI-Quellenzitat ist im Kontext nicht nachweisbar.")
        print("Frage:", question.get("prompt", "(leer)"))
        print("Quellenprüfung: erfolgreich")
        print("Bitte zusätzlich prüfen, ob die Musterlösung fachlich korrekt ist.")

        print("Bewerte eine Antwort mit Ollama …")
        evaluated = request(args.url, "/api/ai/evaluate", {
            "provider": "ollama", "question": question,
            "answer": "Möglicherweise antwortet DHCP nicht; ich prüfe DHCP-Relay und den Server."
        })
        if evaluated.get("rating") not in {"correct", "partial", "wrong"}:
            raise RuntimeError("Bewertung enthält kein gültiges Ergebnis.")
        score = evaluated.get("score")
        if not isinstance(score, (int, float)) or not 0 <= score <= 1:
            raise RuntimeError("Bewertung enthält keine gültige Punktzahl.")
        print(f"Bewertung: {evaluated['rating']} ({score})")
        print("End-to-End-Aufruf der echten lokalen KI erfolgreich.")
        return 0
    except Exception as exc:
        print("Test nicht bestanden:", exc, file=sys.stderr)
        print("Hinweis: Ein Modell kann ungültige Inhalte liefern; das ist ein Qualitätsbefund.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
