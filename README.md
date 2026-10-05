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

- Jesus / Bibel
- klassische Philosophie
- Sport
- Unternehmertum
- Filme
- Bücher
- Lernen

Kurze gemeinfreie Bibelstellen werden mit Quelle angegeben. Bei modernen Personen, Filmen oder Büchern verwendet die App bewusst sinngemäße, als Inspiration gekennzeichnete Formulierungen statt längerer geschützter Originalzitate.

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

Der Text einer importierten PDF/TXT-Datei wird in den daraus erzeugten Lernkarten gespeichert. Das Originaldokument selbst wird nicht als Datei im Browser-Speicher abgelegt.

Unter **Fortschritt** kannst du eine JSON-Sicherung herunterladen und später wiederherstellen.

## Grenzen der aktuellen Version

Die Seite kann PDF-Inhalt lokal lesen und einfache Lernkarten daraus erzeugen, besitzt aber lokal kein Sprachmodell. Deshalb kann sie aus beliebigen Unterlagen noch keine hochwertigen komplexen Klausurfragen inklusive semantischer Freitextbewertung erzeugen.

Für besonders gute Lernsets gibt es zwei Wege:

1. strukturierte Fragen samt Lösungen als JSON importieren,
2. PDFs in ChatGPT bereitstellen und daraus passende Fragen, Erklärungen und Rechenwege erstellen lassen; anschließend kann die erzeugte JSON-Datei importiert werden.

Das ist besonders sinnvoll für alte IHK-Prüfungen, weil Aufgaben, Musterlösungen, Rechenwege und Punkte sauber geprüft werden sollten.
