# Aufgaben wie im Unterricht – Version 5

## Was jetzt anders ist

- Aus Fachtexten sollen verständliche Wissens-, Erklärungs- und Anwendungsaufgaben entstehen, keine zufälligen Beziehungen zwischen Wörtern.
- Jede neue KI-Aufgabe enthält Lernziel, Niveau, Quellenbeleg und Musterlösung.
- Offene Aufgaben haben einzelne Bewertungskriterien und Teilpunkte. Du bewertest deine Antwort selbst; die App behauptet keine automatische Benotung.
- Multiple Choice enthält genau eine richtige Antwort und Begründungen zu allen Optionen. Die Reihenfolge wird beim Üben gemischt.
- Die Probeprüfung nimmt offene Aufgaben mit Kriterien auf und zeigt Lösungen erst nach der Abgabe aller Antworten.
- Alte automatisch erzeugte Karten sind pausiert. Unter „Fächer & Lernsets“ kannst du sie prüfen oder die ursprüngliche Unterlage erneut einlesen. Beim Freigeben einer überarbeiteten alten Aufgabe wird deren Wiederholungsstand zurückgesetzt; ihre bisherigen Versuche bleiben in der Historie.

## Lokal öffnen

Im Projektordner `python3 start.py --port 8765 --open-browser` ausführen. Alternativ auf dem Mac `Start.command` doppelt anklicken. Docker ist dafür nicht erforderlich.

Nach einem Update des Servers den alten Prozess im betreffenden Terminal mit Strg+C beenden und neu starten. Danach dieselbe Adresse **http://127.0.0.1:8765/** im bisherigen Browser neu laden. Browser und Port gehören zum Speicherort deiner Lerndaten. Ein anderer Port oder Browser zeigt deshalb einen anderen Datenbestand. Vor Änderungen unter „Fortschritt“ eine Sicherung exportieren.

Der bestehende Docker-Container ist weiterhin ein statischer Server: Lernen und JSON-Import funktionieren dort, die neue KI-Erstellung erfordert `start.py` direkt auf dem Rechner. Docker und Ollama im Container wurden nicht getestet.

## OpenAI per Doppelklick einrichten

`KI-einrichten.command` öffnen. Der Assistent verwendet GPT-5.4 mini und erklärt die Kostenpflicht und lokale Speicherung. Einen eigenen Schlüssel unter https://platform.openai.com/api-keys erstellen und ausschließlich in die unsichtbare Eingabe des Assistenten einfügen. Die Einrichtung prüft den Modellzugriff ohne kostenpflichtige Aufgabengenerierung. Sie bestätigt weder Guthaben noch fachliche Qualität.

Der Schlüssel liegt unverschlüsselt in `.openai-api-key` außerhalb von `dist`, nur für dein Benutzerkonto lesbar (Dateirechte 600), und wird von Git ausgeschlossen. Er wird nicht vom Webserver ausgeliefert. Zum Entfernen diese lokale Datei löschen. Eine gesetzte `OPENAI_API_KEY`-Umgebungsvariable hat Vorrang. Keine Schlüssel im Chat senden.

Danach den bisherigen Server im Terminal mit Strg+C beenden und `Start.command` starten. Anbieterwahl und Schlüsselprüfung übertragen keine Unterrichtstexte. Erst die Freigabe eines Imports löst zwei kostenpflichtige Modellaufrufe mit den ausgewählten Seiten aus.

## KI einmalig einrichten

Standardmäßig ist die KI deaktiviert. Es wird kein Modell installiert und keine Quelle automatisch übertragen.

1. `ai-config.example.json` als `ai-config.json` im Projektordner kopieren.
2. Als `provider` entweder `openai` oder `ollama` und als `model` den tatsächlich verfügbaren Modellnamen eintragen. Keine Schlüssel in diese Datei oder ins Frontend schreiben.
3. Für OpenAI: `OPENAI_API_KEY` als Umgebungsvariable im Terminal setzen, in dem du den Server startest. Der Schlüssel bleibt im Serverprozess. Das Modell muss die Responses API und strukturierte JSON-Ausgaben unterstützen. Die API verursacht zusätzliche Kosten; zwei Modellaufrufe werden pro Erstellung verwendet. Modellnamen und Preise beim Anbieter prüfen.
4. Für Ollama: Ollama muss lokal auf `127.0.0.1:11434` laufen und das angegebene lokale Modell bereits heruntergeladen sein. Cloud-Modelle sind nicht vorgesehen. Es wird kein automatischer Modelldownload gestartet. Die Qualität hängt stark vom Modell ab.
5. Lernserver starten. Beim Einlesen eines Textes zeigt die App, ob die Konfiguration bereit ist. „Bereit“ prüft Konfiguration und gegebenenfalls das Vorhandensein des API-Schlüssels; Erreichbarkeit und Modellberechtigung werden erst bei einer freigegebenen Erstellung geprüft.

`ai-config.json`, `.env` und persönliche Sicherungen sind von Git ausgeschlossen. Die Originaldateien werden im Browser gelesen. Bei OpenAI werden ausschließlich die ausgewählten Textseiten für Entwurf und Zweitprüfung an OpenAI übertragen. Freigabe nur für Unterlagen erteilen, die du dort verarbeiten lassen darfst. Originale IHK-Prüfungen gehören weiterhin nicht in das öffentliche Repository.

## Aufgaben erstellen

1. Unter „Fächer & Lernsets“ ein Fach und Lernset anlegen oder auswählen.
2. PDF, TXT oder Markdown einlesen und Fragentyp wählen.
3. Die ausgelesenen Seiten prüfen. Einen Themenabschnitt mit 100–40.000 Zeichen auswählen; bei Scans ist vorher Texterkennung erforderlich. Größere Unterlagen abschnittsweise verarbeiten.
4. Auswertung ausdrücklich freigeben. Die KI entwirft Aufgaben und prüft sie in einem zweiten Durchlauf. Belege und Punktzahlen werden zusätzlich technisch geprüft.
5. Jeden Entwurf fachlich gegen die Quelle prüfen, gegebenenfalls Frage, Musterlösung, Kriterien oder Antwortbegründungen bearbeiten. Erst nach Auswahl „Fachlich geprüft“ speichern.
6. Lernrunde oder Probeprüfung für dieses Lernset starten.

Ohne KI kannst du fertige strukturierte JSON-Aufgaben importieren. Ein Beispiel mit offener Aufgabe und Multiple Choice liegt unter `tests/fixtures/teacher-pack.json`. Das sind selbst verfasste Testaufgaben, keine offiziellen IHK-Aufgaben. Auch JSON-Importe über die Lernset-Seite haben eine Vorschau.

## Was geprüft wurde

Automatisierte Tests prüfen unter anderem Quellenzuordnung, Punktesummen, eindeutige Optionen, Freigabe, Anbieterwechsel, zweistufigen Ablauf mit simuliertem Modell und Schutz des lokalen API-Zugangs. Ein Browser-Durchlauf prüft JSON-Import, Lernrunde mit Teilpunkten und gemischte Probeprüfung. Es wurde noch kein echter OpenAI-/Ollama-Durchlauf durchgeführt. Die Qualität auf deinen konkreten Unterlagen muss nach Auswahl und Einrichtung des Modells geprüft werden.

Die KI-Zweitprüfung ist keine unabhängige Lehrkraft und garantiert keine Fehlerfreiheit. Bei unklaren oder widersprüchlichen Unterlagen soll die Erstellung weniger oder keine Aufgaben liefern. Die App ist ein Lernwerkzeug, kein Nachweis der Prüfungsreife.
