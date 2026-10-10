# Mit deinen Unterlagen lernen

Projektordner auf diesem Mac: `/Users/akwesi/Desktop/Learning-by-Doing-neu`

## Jeden Tag starten

1. Im Projektordner `Ollama-starten.command` doppelklicken. Das Terminal offen lassen.
2. `Start.command` doppelklicken. Auch dieses Terminal offen lassen.
3. Im bisherigen Browser **http://127.0.0.1:8765** öffnen.
4. Im Dashboard Thema und 10, 20 oder 30 Fragen auswählen → **Lernset erstellen**.
5. Nach der Erstellung **Jetzt lernen** oder **Als Probeprüfung starten** wählen.

Belegte Datenbank-Grundlagen werden mit geprüften Lernvorlagen sofort erstellt. Weitere KI-Aufgaben können je nach Anzahl und nötigen Korrekturen etwa 10–30 Minuten dauern. Quellen werden ausgewählt,
Aufgaben entworfen und anschließend mit einem zweiten KI-Aufruf geprüft. Wenn die
Unterlagen nicht genügend belegbare Aufgaben hergeben, zeigt die Plattform die
kleinere Anzahl ausdrücklich an. Fertige Lernsets bleiben im bisherigen Browser
verfügbar. Nicht für jede Wiederholung ein neues Set erstellen.

Im Lernmodus gibt es sofort Punkte, Erklärung und Musterlösung. Freie Antworten
bewertet die gewählte KI anhand einzelner Kriterien. Im Prüfungsmodus erfolgt die
Bewertung erst am Ende. Mehrfachauswahl: richtige Auswahl gibt Teilpunkte, falsche
Auswahl zieht Punkte ab, mindestens 0 Punkte. KI-Bewertungen sind Lernhilfen und
können Fehler enthalten; Quellenbeleg und Musterlösung sind einsehbar.

## Nach diesem Update

Wenn noch ein alter Lernserver läuft: In dessen Terminal **Strg+C** drücken und
`Start.command` erneut öffnen. Anschließend im Browser **Cmd+Shift+R** drücken.
Immer denselben Browser und dieselbe Adresse mit Port 8765 verwenden: Lernsets und
Fortschritt werden im Browser gespeichert. Ein anderer Port oder Browser besitzt
einen eigenen Speicher. Keine Browserdaten löschen. Sicherung unter „Fortschritt“
exportieren. Lokale Dokumente liegen unabhängig davon im Projektordner.

Alternativ genaue Befehle, jeweils in einem eigenen Terminal:

```sh
cd "/Users/akwesi/Desktop/Learning-by-Doing-neu"
./Ollama-starten.command
```

```sh
cd "/Users/akwesi/Desktop/Learning-by-Doing-neu"
python3 -B start.py --port 8765 --open-browser
```

Für dieses Vorgehen ist Docker nicht erforderlich. Das Terminal von VS Code geht ebenfalls.

## Einmalige Einrichtung auf einem neuen Mac

`Ollama-einrichten.command` öffnen. Das Skript lädt die offizielle Ollama-Version,
prüft deren SHA-256-Prüfsumme und lädt Qwen3 8B (quantisiert, etwa 5,2 GB).
Es richtet außerdem eine abgeschlossene Python-Umgebung für die PDF-Texterkennung ein.
Python 3 muss vorhanden sein. Während des Downloads ist Internet nötig; anschließend
laufen lokale Fragen und Bewertungen ohne Kosten pro Anfrage auf dem eigenen Rechner.

Qwen3 8B wird auf diesem MacBook Air M4 mit 16 GB Arbeitsspeicher lokal verwendet.
Ist in deinem laufenden Ollama nur `qwen3:4b-instruct-2507-q4_K_M` oder `qwen3.5:4b` vorhanden, wird dieses lokale
Modell ebenfalls erkannt und verwendet. Der Modellname steht in den KI-Einstellungen.
Bei knappem Arbeitsspeicher andere größere Anwendungen schließen. Ollama auf diesem
Mac über das Terminal starten, damit die macOS-Grafikbeschleunigung verfügbar ist.

## Unterlagen

PDF- oder TXT-Dateien unter „Fächer & Lernsets“ importieren. PDFs bis 15 MB werden
lokal gelesen; bei gescannten Seiten folgt Texterkennung. OCR kann Zeichen oder Zahlen
falsch erkennen. Unklare Originale prüfen und ggf. besser lesbare Dateien importieren.
Neue Unterlagen erscheinen danach in der Themenauswahl auf dem Dashboard.

Vorhandene Originalprüfungen liegen unter `.local-data/originals`, der durchsuchbare
Text unter `.local-data/materials`. Nichts davon wird durch den Webserver direkt
bereitgestellt. Bei einem abgebrochenen erstmaligen Indexlauf fortsetzen mit:

```sh
cd "/Users/akwesi/Desktop/Learning-by-Doing-neu"
./.runtime/python/bin/python -B index_materials.py
```

Nur einen Indexlauf gleichzeitig starten. Bestehende Indexdateien werden übersprungen;
die Originale werden nicht verändert. Kopiere bei einem Rechnerwechsel auch den
privaten Ordner `.local-data` außerhalb von Git und importiere deine Browser-Sicherung.
Originalprüfungen, Textauszüge, erzeugte Aufgaben und persönliche Daten bleiben von
Git ausgeschlossen. Sie gehören nicht in ein öffentliches Repository.

## OpenAI ist optional

In **KI-Einstellungen** bleibt standardmäßig **Lokale KI – kostenlos** aktiv.
OpenAI muss dort ausdrücklich ausgewählt werden; vor Übertragung von Unterlagen
gibt es eine Freigabe. Kein automatischer Wechsel zu OpenAI bei lokalen Fehlern.

API-Key ausschließlich serverseitig in `.env` im Projektordner setzen:

```text
OPENAI_API_KEY=dein_schluessel
```

Oder den vorhandenen Assistenten `KI-einrichten.command` verwenden, der den Schlüssel
in einer geschützten lokalen Datei speichert. `.env` und Schlüsseldatei werden nicht
an den Browser ausgeliefert und sind in Git ausgeschlossen. Schlüssel niemals in
Chat, JavaScript oder GitHub einfügen. OpenAI-API-Nutzung kann Kosten verursachen.
Ohne Schlüssel funktioniert der lokale Weg vollständig. „OpenAI verfügbar“ bedeutet,
dass ein Schlüssel eingerichtet ist; Gültigkeit/Guthaben werden erst beim API-Aufruf geprüft.

## Fehler

- **Lokale KI nicht erreichbar:** `Ollama-starten.command` öffnen, dann in den
  KI-Einstellungen „Status prüfen“ drücken und zum Dashboard zurückkehren.
- **Modell fehlt:** `Ollama-einrichten.command` ausführen.
- **Port 8765 belegt:** vorhandenen Lernserver mit Strg+C beenden und neu starten.
- **Keine passenden Unterlagen:** Texterkennung abwarten oder passende PDF/TXT importieren.
- **KI konnte keine belegten Fragen erstellen:** besser lesbare Lösungstexte importieren;
  es werden keine themenfremden Ersatzfragen erzeugt.
- **Bewertung fehlgeschlagen:** Antwort bleibt im Feld, Prüfung bleibt zwischengespeichert;
  Ollama-Verbindung prüfen und erneut bewerten.

## Bestehender GitHub-Stand

Die bisherigen KI-Frageformate aus `main` werden beim Lernen angepasst, ohne gespeicherte IDs, Antworten oder Punkte zu verändern. Bereits gespeicherte Textauszüge werden beim Öffnen des Dashboards in den lokalen Dokumentindex übernommen und ausdrücklich als Textauszug bezeichnet. Vollständige Original-PDFs sind genauer und können zusätzlich importiert werden. Die separate KI-Oberfläche aus `main` wird durch den geprüften gemeinsamen Lernablauf ersetzt; Spiele, Lernsets, Sicherungen und Design bleiben erhalten.
