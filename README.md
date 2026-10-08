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

Aus Textunterlagen erstellt die App automatisch Lernkarten. Du beantwortest eine Frage zunächst selbst, deckst danach den Originalinhalt auf und wählst **Gewusst** oder **Noch nicht sicher**.

Eine rein lokale Webseite ohne KI kann nicht zuverlässig entscheiden, ob zwei frei formulierte Antworten inhaltlich gleichbedeutend sind. Deshalb vermeidet die App bei solchen Karten absichtlich eine scheinbar genaue automatische Bewertung.

Für PDFs wird PDF.js beim ersten PDF-Import aus einem CDN geladen. Dafür ist beim ersten PDF-Import eine Internetverbindung nötig. Die ausgewählte PDF-Datei wird dabei nicht zu einem Server hochgeladen, sondern im Browser gelesen. TXT, Markdown, JSON und das normale Lernen funktionieren weiterhin lokal.

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
- `selfcheck` – Selbstkontroll-Lernkarte

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

## KI-Lernen: kostenlos lokal mit Ollama

Die Plattform kann jetzt aus deinen **bereits importierten Unterlagen** neue, thematisch passende Lernsets erstellen und Antworten bewerten.

Standardmäßig wird **Ollama lokal auf deinem Rechner** verwendet. Dadurch entstehen keine Kosten pro KI-Anfrage.

Empfohlenes Standardmodell:

```sh
qwen3.5:4b
```

Wenn bereits ein anderes unterstütztes Ollama-Modell installiert ist, kann der lokale Server dieses automatisch verwenden.

### Ollama auf macOS vorbereiten

1. Ollama installieren bzw. die Ollama-App öffnen.
2. Terminal öffnen.
3. Modell einmalig herunterladen:

```sh
ollama pull qwen3.5:4b
```

4. Falls Ollama nicht automatisch läuft:

```sh
ollama serve
```

5. Prüfen:

```sh
ollama list
```

In der Lernplattform unter **Einstellungen** siehst du anschließend:

- 🟢 Lokale KI verbunden
- 🔴 Lokale KI nicht erreichbar
- 🟢 OpenAI verfügbar
- ⚪ OpenAI nicht eingerichtet

## Optional: OpenAI API

OpenAI ist **nicht erforderlich**. Die Plattform funktioniert vollständig mit Ollama.

Wenn du OpenAI ausdrücklich verwenden möchtest, kopiere im Projektordner die Beispielkonfiguration:

```sh
cp .env.example .env
```

Trage anschließend deinen API-Key ausschließlich in `.env` ein:

```text
OPENAI_API_KEY=dein_key_hier
OPENAI_MODEL=gpt-6-luna
```

Der API-Key steht **nicht im Frontend-Code**. `.env` ist in `.gitignore` ausgeschlossen und darf nicht nach GitHub hochgeladen werden.

## KI-Lernset aus vorhandenen Unterlagen

Unter **Fächer & Lernsets** gibt es den Bereich **„KI · Direkt lernen“**.

Ablauf:

1. Fach auswählen, z. B. `Datenbanken`.
2. Thema eingeben, z. B. `SQL` oder `Normalisierung`.
3. 10, 20 oder 30 Fragen auswählen.
4. Optional ein bestehendes Lernset als Quelle auswählen.
5. **„Lernset erstellen & direkt lernen“** drücken.

Die Plattform sammelt zuerst passende Inhalte aus deinen bereits importierten PDF/TXT/MD-Lernkarten bzw. gespeicherten Dokumentauszügen und gibt diesen Kontext an die ausgewählte KI weiter.

Unterstützte KI-Fragetypen:

- Single Choice
- Multiple Choice
- Freitext
- Richtig/Falsch
- Rechenaufgaben
- praxisnahe IHK-Situationen

Bei KI-generierten Fragen wird deine Antwort bewertet als:

- richtig
- teilweise richtig
- falsch

Zusätzlich werden Musterlösung und verständliche Erklärung angezeigt.

## IHK-Prüfungsmodus mit Auswertung

Im Prüfungsmodus werden während der Prüfung keine Lösungen angezeigt.

Am Ende erscheinen:

- Gesamtprozent
- erreichte Punkte
- Ergebnis je Thema
- falsch bzw. teilweise beantwortete Aufgaben
- Empfehlung für Themen unter 70 %

Falsche Antworten werden weiterhin früher zur Wiederholung eingeplant.

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

Der Text einer importierten PDF/TXT-Datei wird in den daraus erzeugten Lernkarten gespeichert. Das Originaldokument selbst wird nicht als Datei im Browser-Speicher abgelegt.

Unter **Fortschritt** kannst du eine JSON-Sicherung herunterladen und später wiederherstellen.

## Hinweise zur KI-Funktion

- Ollama muss für lokale KI-Funktionen auf dem Rechner laufen.
- Das Modell wird beim ersten Mal separat durch Ollama heruntergeladen.
- Die Qualität der erzeugten Fragen hängt von der Qualität der importierten Unterlagen ab.
- Bereits vorhandene Lernsets und Fortschrittsdaten werden durch die KI-Erweiterung nicht automatisch gelöscht oder überschrieben.
- Alte PDF-Imports können als Grundlage dienen, solange die daraus erzeugten Textabschnitte/Lernkarten noch im Browser gespeichert sind.
- OpenAI ist nur eine optionale Alternative und verursacht je nach verwendetem Modell API-Kosten.
- Originale IHK-Prüfungsunterlagen sollten nicht ohne entsprechende Rechte öffentlich im Repository veröffentlicht werden.
