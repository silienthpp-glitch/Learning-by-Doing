# Learning by Doing

**Learning by Doing** ist ein lokaler Lerntrainer für IHK-Prüfungen, Klausuren und Tests. Die App läuft im Browser und speichert Lernfortschritt, Lernsets und importierte Fragen standardmäßig nur lokal auf deinem Rechner.

Die eingebaute Beispielsammlung enthält selbst erstellte Aufgaben zur FiSi-/IHK-Vorbereitung. Es sind **keine offiziellen IHK-Prüfungsaufgaben**.

## Mehrere Fächer, Klausuren und Tests

Du kannst jetzt parallel für unterschiedliche Fächer lernen. Beispiele:

- Netzwerktechnik → Klausur 2
- Wirtschaft → Test Freitag
- Datenbanken → SQL-Klausur
- IHK AP2 → Winterprüfung

Dafür gibt es **Lernsets**. Ein Lernset hat einen Namen, ein Fach, eine Art (Klausur, Test, IHK oder Sonstiges), optional einen Termin, eigene Dateien/Fragen und einen eigenen Lernfortschritt.

## Dateien hinzufügen

Unter **Fächer & Lernsets** kannst du mehrere Dateien einem Lernset zuordnen:

- PDF
- TXT
- Markdown (.md)
- JSON mit strukturierten Fragen

### PDF, TXT und Markdown

PDF- und TXT-Unterlagen werden lokal gelesen und nach Themen erschlossen. Scan-PDFs erhalten lokale Texterkennung. Auf dem Dashboard wählst du Thema und 10, 20 oder 30 Fragen. Ollama mit Qwen3 8B ist Standard; OpenAI ist nur nach ausdrücklicher Auswahl möglich. Ohne passende Quellen entstehen keine allgemeinen Ersatzfragen.

Die KI erstellt Aufgaben und prüft sie in einem zweiten Durchgang gegen die Textquellen. Unterstützt werden Single Choice, Mehrfachauswahl, Richtig/Falsch, Freitext, Rechenaufgaben und Praxisfälle. Offene Antworten werden anhand der Punktkriterien bewertet. Im Prüfungsmodus erscheinen Lösungen und Ergebnisse erst am Ende. KI-Prüfung und Texterkennung können Fehler enthalten; Quellenbeleg und Musterlösung bleiben einsehbar.

**Start und Einrichtung:** [LOKAL-LERNEN.md](LOKAL-LERNEN.md). Bestehende Lernsets und Browserdaten bleiben erhalten. Python-Server lokal starten; ein rein statischer Webserver unterstützt die KI-Endpunkte nicht.

### JSON-Fragen

Strukturierte Fragen können automatisch ausgewertet werden. Beispiel:

```json
[
  {
    "id": "sql-select-001",
    "subject": "Datenbanken",
    "topic": "SQL",
    "prompt": "Welche SQL-Anweisung liest Daten aus einer Tabelle?",
    "type": "choice",
    "answer": "SELECT",
    "explanation": "SELECT liest Daten aus Tabellen.",
    "steps": [],
    "options": ["SELECT", "DELETE", "UPDATE", "INSERT"],
    "aliases": [],
    "points": 2
  }
]
```

Unterstützte Typen:

- `choice` – Multiple Choice
- `number` – eindeutige Zahl
- `text` – exakte Textantwort oder Alias
- `selfcheck` – offene Wissensfrage oder bisherige Selbstkontroll-Lernkarte
- `multi` – mehrere richtige Optionen
- `truefalse` – Richtig/Falsch
- `calculation` – Rechenaufgabe mit Punktkriterien
- `case` – Praxisfall mit Punktkriterien

Die neuen KI-Formate verwenden `generatorVersion: 6`, bei Auswahlfragen `correctOptions`, bei offenen Aufgaben `rubric`. Ein selbst verfasstes Importbeispiel für alle sechs Formate liegt unter `tests/fixtures/six-types-import.json`.

## Lernlogik

Die App arbeitet mit Wiederholungen:

- falsch / „noch nicht sicher“ → Aufgabe erscheint bald erneut,
- richtig → Wiederholung nach 1, 3, 7 und später 14 Tagen,
- drei richtige Antworten in Folge → Aufgabe gilt als **sicher gelernt**.

Der Status ist eine Lernhilfe und keine Vorhersage einer echten Prüfungsnote.

## Level und Statistik

Das Dashboard zeigt:

- beantwortete Aufgaben heute,
- offene Wiederholungen,
- Level und XP,
- Lernserie in Tagen,
- Fortschritt je Fach,
- Fortschritt je Lernset,
- sicher gelernte Aufgaben,
- absolvierte Lernspiele.

XP erhältst du durch Lernen, gemeisterte Aufgaben und Lernspiele. Ein Level benötigt aktuell 250 XP.

## Motivation auf dem Dashboard

Das Dashboard zeigt zusätzlich einen wechselnden Motivationsspruch. Die Karte rotiert automatisch ungefähr alle **30 Minuten** und kann mit **„Neuer Spruch“** sofort gewechselt werden.

Die Sammlung enthält mehrere Kategorien:

- Jesus und weitere biblische Personen wie David, Paulus, Josua, Salomo, Mose, Jesaja, Josef, Esther, Daniel, Petrus, Nehemia, Maria, Hiob und Ruth
- klassische Philosophie
- Sport
- Unternehmertum
- Filme
- Bücher
- Lernen

Für Bibelstellen verwendet die App jetzt die Übersetzung **Hoffnung für alle (HFA)** als Grundlage. Da HFA urheberrechtlich geschützt ist, werden die Aussagen überwiegend sinngemäß formuliert und mit der jeweiligen Bibelstelle sowie „HFA“ gekennzeichnet. Bei modernen Personen, Filmen oder Büchern nutzt die App ebenfalls bewusst sinngemäße, als Inspiration gekennzeichnete Formulierungen statt längerer geschützter Originalzitate.

Die Sprüche liegen lokal im Projekt und benötigen beim normalen Anzeigen keine Internetverbindung.

## Lernspiele

### Memory – Frage & Antwort
Finde die passenden Frage-/Antwort-Paare.

### Wissensdetektiv
Löse drei Multiple-Choice-Fälle. Bei einem Fehler bekommst du eine Erklärung und darfst erneut versuchen.

### Was ist falsch?
Vier Frage-/Antwort-Zuordnungen werden gezeigt. Eine Antwort gehört absichtlich zur falschen Frage.

Die Spiele ergänzen normales Lernen und Prüfungssimulationen, ersetzen sie aber nicht.

## Start

1. Repository herunterladen oder klonen.
2. Terminal im Projektordner öffnen.
3. Server starten:

```sh
python3 start.py
```

Unter Windows oft:

```powershell
py start.py
```

Danach öffnen:

```text
http://127.0.0.1:8765
```

Auf macOS kannst du alternativ `Start.command` öffnen.

## Projektaufbau

```text
Learning-by-Doing/
├── README.md
├── start.py
├── Start.command
├── beispiel-import.json
└── dist/
    ├── index.html
    ├── style.css
    ├── questions.js
    └── app.js
```

- **index.html**: Grundgerüst und Navigation.
- **style.css**: Aussehen und mobile Darstellung.
- **questions.js**: eingebaute Beispielaufgaben.
- **app.js**: Lernlogik, Lernsets, Datei-Import, Fortschritt, Spiele und Speicherung.
- **start.py**: lokaler Webserver.

## Datenschutz und Sicherung

Lerndaten werden mit `localStorage` im Browser gespeichert. Dazu gehören Lernfortschritt, Wiederholungsstände, eigene Fragen, Lernsets, Datei-Metadaten sowie Level-/Spielhistorie.

Neue PDF/TXT-Texte und importierte PDFs werden im privaten Projektordner `.local-data` gespeichert; Lernsets und Fortschritt bleiben im Browser. Das Originaldokument wird nicht als Datei im Browser-Speicher abgelegt. Beide Speicherbereiche sollten für einen Rechnerwechsel gesichert werden.

Unter **Fortschritt** kannst du eine JSON-Sicherung herunterladen und später wiederherstellen.

## Grenzen der aktuellen Version

Die Seite verwendet ein separat gestartetes lokales Sprachmodell über Ollama. Texterkennung, Fragen und KI-Bewertungen können fachliche Fehler enthalten. Technische Prüfungen und ein zweiter KI-Durchgang reduzieren diese Fehler, ersetzen aber keine Prüfung anhand deiner Unterlagen. Werden nicht genügend belegte Fragen gefunden, wird die kleinere Zahl ausdrücklich angezeigt.

Zusätzlich zur lokalen Erstellung kannst du selbst geprüfte strukturierte Fragen als JSON importieren. Dafür gibt es zwei Wege:

1. strukturierte Fragen samt Lösungen als JSON importieren,
2. PDFs in ChatGPT bereitstellen und daraus passende Fragen, Erklärungen und Rechenwege erstellen lassen; anschließend kann die erzeugte JSON-Datei importiert werden.

Das ist besonders sinnvoll für alte IHK-Prüfungen, weil Aufgaben, Musterlösungen, Rechenwege und Punkte sauber geprüft werden sollten.
