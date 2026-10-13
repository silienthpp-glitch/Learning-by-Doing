# Learning by Doing

**Learning by Doing** ist ein lokaler Lerntrainer für IHK-Prüfungen, Klausuren und Tests. Die App läuft im Browser und speichert Lernfortschritt, Lernsets und importierte Fragen standardmäßig nur lokal auf deinem Rechner.

Die eingebaute Beispielsammlung enthält selbst erstellte Aufgaben zur FiSi-/IHK-Vorbereitung. Es sind **keine offiziellen IHK-Prüfungsaufgaben**.

## Installation für Einsteiger

Eine bebilderbare Schritt-für-Schritt-Anleitung für macOS, Windows und Linux findest du unter **[INSTALLATION.md](INSTALLATION.md)**. Du kannst vorhandene Lernsets ohne Ollama üben; nur neue KI-Fragen und die KI-Bewertung benötigen ein lokales Modell oder optional OpenAI.

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

PDF-, TXT- und Markdown-Unterlagen werden zunächst als durchsuchbare Textabschnitte mit Quellenbezug gespeichert. Anschließend kannst du unter **Mit KI lernen** passende Fragen erzeugen und prüfen lassen. Ohne verfügbare KI kannst du vorhandene Beispielfragen sowie manuell/als JSON importierte Fragen weiterhin lernen.

Eine rein lokale Webseite ohne KI kann nicht zuverlässig entscheiden, ob zwei frei formulierte Antworten inhaltlich gleichbedeutend sind. Deshalb vermeidet die App bei solchen Karten absichtlich eine scheinbar genaue automatische Bewertung.

PDF.js wird bei der Desktop-Installation mitgeliefert. Bei der Webversion muss es einmalig mit `npm install` und `npm run prepare:assets` lokal vorbereitet werden. Die eigentliche PDF-Auswertung erfolgt danach ohne Internet. PDFs mit ausschließlich eingescannten Bildern müssen vorher lokal per OCR durchsuchbar gemacht werden.

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

- `choice` – genau eine richtige Auswahl
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

## Moderne GUI (Feature-Branch)

Diese Überarbeitung nutzt weiterhin HTML, CSS und JavaScript. Es wurden **keine neuen Laufzeit-Abhängigkeiten** eingeführt.

- Kompaktes Dashboard „Heute lernen“ mit fälligen Wiederholungen, nächstem Termin und vorsichtiger datenbasierter Empfehlung.
- Lernrunden einschließlich angefangener Antworten pausieren und mit „Weiterlernen“ fortsetzen.
- Lernsets zuerst anzeigen und nach Name, Fach und Prüfungsart suchen/filtern/sortieren; Erstellung, Import und KI-Lernen öffnen sich bei Bedarf.
- Verknüpfte Fach-/Themen-/Lernsetfilter mit Anzahl passender Aufgaben und Schutz vor leeren Runden.
- Mobilmenü, zugängliche Navigation, Dark Mode, Fokusmodus, reduzierte Animationen, dezente 3D-Neigung.
- KI-Status und transparente Fehlertexte, Abbrechen laufender Browseranfragen, Selbstkontrolle bei nicht verfügbarer Freitextbewertung.
- Begriffe getrennt: sichere Aufgaben (Lernfortschritt), anteilige Antwortquote und XP/Level.

Die Daten behalten den vorhandenen Schlüssel `learning-by-doing-v2` und die Version `2`. Alte Lernsets werden **nicht automatisch gelöscht oder konvertiert**. Eine pausierte Runde wird separat unter `learning-by-doing-round-v1` gespeichert.

### macOS: nur den neuen Branch in deinem bestehenden Projekt laden

Vor der Aktualisierung empfohlen: **Fortschritt → Sicherung herunterladen**.

Terminal im bestehenden lokalen Hauptordner öffnen (Beispiel):

```sh
cd ~/Desktop/Learning-by-Doing
git fetch origin
git switch --track origin/feat/modern-learning-gui
python3 start.py --open-browser
```

Falls der Branch lokal schon existiert:

```sh
git switch feat/modern-learning-gui
git pull origin feat/modern-learning-gui
python3 start.py --open-browser
```

Die Datei `.env` bleibt lokal und darf nicht ins Repository gelangen. Ollama ist weiterhin Standard. OpenAI wird ausschließlich bei bewusster Auswahl verwendet.

### Tests

Automatischer Browser-Test: `tests/ui-smoke.cjs`, ausgeführt durch `.github/workflows/ui-browser.yml`. Er prüft Desktop/Mobil, Hell/Dunkel, Lernsets, Datenkompatibilität, Pausieren/Fortsetzen, Navigation, Layout-Overflow und reduzierte Bewegung. Screenshots werden als GitHub-Actions-Artefakte abgelegt.

Die vorhandenen Python-/KI-Smoke-Tests bleiben unverändert. Ein Test mit dem tatsächlich auf deinem Mac laufenden Ollama und deinen persönlichen Lernunterlagen muss lokal erfolgen.

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


## So funktioniert dein Projekt (einfach erklärt)

Deine Webseite verwendet bewusst **kein großes Framework**. Dadurch läuft sie ressourcensparend direkt über einen kleinen Python-Webserver.

| Datei | Aufgabe |
| --- | --- |
| `start.py` | Startet den lokalen Server und stellt die KI-Schnittstellen bereit. |
| `dist/index.html` | Grundgerüst: Navigation, Seitenleiste und Platz für die aktuelle Seite. |
| `dist/style.css` | Farben, Abstände, Dark Mode, mobile Ansicht und dezente Effekte. |
| `dist/app.js` | Lernsets, Import, Lernablauf, Antworten, Fortschritt, lokale Speicherung und Einstellungen. |
| `dist/questions.js` | Mitgelieferte Beispielfragen, die auch ohne KI verfügbar sind. |
| `.env` | **Nur auf deinem Rechner:** optionale Zugangsdaten, niemals ins öffentliche GitHub-Repository laden. |
| `tests/ui-smoke.cjs` | Überprüft die Oberfläche im automatisierten Testbrowser. |

### Die wichtigsten Funktionen in app.js

- `render()` zeigt die passende Seite an, zum Beispiel Dashboard oder Lernsets.
- `questions()` stellt Beispiel- und eigene Lernfragen zusammen.
- `importMaterials()` liest deine Dateien ein und erstellt Lernkarten.
- `materialContext()` stellt einen begrenzten Textkontext für die lokale KI zusammen. So werden die KI-Anfragen nicht unnötig groß.
- `generateAiSet()` erstellt Fragen zu deinem gewählten Fach und Thema.
- `submit()` verarbeitet die eingegebene Antwort; `evaluateQuestion()` kümmert sich um die Bewertung.
- `update()` plant die nächste Wiederholung der Frage.
- `save()` speichert deinen Lernstand im Browser.
- `persistRound()` merkt sich eine pausierte Runde. Dafür werden nur Frage-IDs und kleine Ergebnisdaten gespeichert, **nicht alle Fragen doppelt**.
- `savedRound()` stellt die Runde wieder her und unterstützt weiterhin das vorherige Speicherformat.

### Warum diese Optimierungen?

Die Textzusammenstellung für die KI hat ein festes Limit von **30.000 Zeichen**. Dadurch wächst eine Anfrage nicht unbegrenzt an und fordert weniger Arbeitsspeicher sowie Rechenzeit. Bei pausierten Runden werden nur die nötigen Informationen gespeichert. Die eigentlichen Lernkarten bleiben weiterhin unter dem bestehenden Browser-Speicherschlüssel `learning-by-doing-v2` liegen.

**Wichtig:** Die lokale KI benötigt trotzdem Arbeitsspeicher für das von Ollama geladene Modell. Wie viel RAM Ollama verwendet, hängt hauptsächlich von Modellgröße, Kontextlänge und deinem Mac ab. Diese Frontend-Optimierungen beseitigen diesen Modell-RAM-Bedarf nicht.

### Tests und Fehlerbenachrichtigungen

GitHub Actions kann dir zu Zwischenständen fehlgeschlagene Jobs melden. Die Fehlermeldung gehört immer zu **einem konkreten Commit**. Spätere erfolgreiche Runs beheben nicht rückwirkend den Status eines älteren Runs.

Prüfe unter GitHub → Actions den **neuesten Lauf deines Branches**. Die GUI-Tests überprüfen unter anderem das Speichern einer Lernrunde, einen vollständigen Browser-Neustart und die Kompatibilität mit älteren Browserdaten.


## Offline-PDF-Import für Web und Desktop

Die Web- und Desktop-Version verwenden dieselbe lokal gebündelte PDF.js-Bibliothek. Zur **einmaligen Vorbereitung im Projektordner**:

```bash
npm install
npm run prepare:assets
```

Anschließend läuft auch `python3 start.py --open-browser` beim PDF-Import ohne CDN-Verbindung. In der installierten Tauri-App liegen die PDF.js-Dateien automatisch im Programm. **Ollama bleibt die Standard-KI**, OpenAI wird nicht automatisch verwendet. Scans ohne Textebene müssen vorher per lokalem OCR-Hilfsprogramm vorbereitet werden (siehe `DOCUMENT_PIPELINE.md`).

Die Tests `tests/integration-browser.cjs` und `tests/test_api_contract.py` decken zusätzlich den Web-API-Vertrag, KI-Ausfälle, Quellenablehnung, importierte Quellen und eine simulierte Tauri-Brücke ab. Eine simulierte Brücke ersetzt keine Prüfung des tatsächlichen installierten Tauri-Fensters.
