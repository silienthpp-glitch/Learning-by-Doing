# Learning by Doing – Installation und erste Schritte

Diese Anleitung ist für Freunde, Familie und Personen ohne IT-Vorkenntnisse gedacht.

## 1. Die passende Anwendung herunterladen

Öffne die **GitHub Actions** des Projekts und wähle einen **erfolgreichen Desktop-Build**:
https://github.com/silienthpp-glitch/Learning-by-Doing/actions/workflows/desktop-build.yml

Unter **Artifacts** gibt es die Pakete für dein Betriebssystem. Zum Herunterladen ist gegebenenfalls ein GitHub-Login erforderlich.

| Betriebssystem | Datei | Installation |
| --- | --- | --- |
| macOS M1/M2/M3/M4/M5 | `.dmg` | Öffnen, die App in **Programme** ziehen |
| Windows 10/11 x64 | `.exe` oder `.msi` | Installer starten und Anweisungen folgen |
| Ubuntu / Debian x64 | `.deb` | Mit der Paketverwaltung installieren |
| Andere unterstützte Linux-Systeme x64 | `.AppImage` | Datei ausführbar machen und starten |

**Wichtig:** Die derzeitigen Test-Builds sind nicht für öffentliche Verteilung signiert/notarisiert. Bei Sicherheitswarnungen zuerst die Datei und die Herkunft überprüfen. Freigabe des Builds erfolgt erst nach manueller Prüfung auf den jeweiligen Zielsystemen.

Die Desktop-App benötigt zum Öffnen keinen Python-Server, kein Node.js und kein Rust.

## 2. Erste Schritte – ohne KI

1. **Learning by Doing** starten.
2. Unter **Fächer & Lernsets** ein Lernset anlegen.
3. PDF-, TXT-, Markdown- oder JSON-Unterlagen hinzufügen.
4. Im Bereich **Lernen** vorhandene Aufgaben üben.
5. Unter **Fortschritt** eine JSON-Sicherung herunterladen.

Du kannst die enthaltenen Lernfragen auch ohne Ollama und ohne Internetverbindung verwenden.

## 3. Optional: kostenlose KI mit Ollama

Für das automatische Erstellen und Bewerten freier Antworten wird ein lokales Modell benötigt:

1. Ollama von https://ollama.com/ installieren.
2. Ollama starten.
3. Im Terminal bzw. in PowerShell einmalig ausführen:

```sh
ollama pull qwen3.5:4b
```

4. In Learning by Doing unter **Einstellungen** prüfen, ob **Ollama** erreichbar ist.
5. Ein Lernset mit auslesbaren Dokumenten öffnen, **Mit KI lernen** auswählen und ein Thema eingeben.

Das Modell wird auf jedem Computer **einmalig separat** heruntergeladen. Für diesen ersten Download wird eine Internetverbindung benötigt. Danach läuft die lokale KI ohne kostenpflichtigen API-Key. Die Anzahl der akzeptierten Fragen kann niedriger sein als angefordert – fachliche Qualität geht vor.

**OpenAI ist freiwillig und kann zusätzliche Kosten verursachen.** Ohne bewusste Auswahl verwendet die Anwendung kein OpenAI.

## 4. Dokumente importieren

**Unterstützt:** PDF mit lesbarer Textebene, TXT, Markdown (.md) und strukturierte JSON-Lernkarten.

**Nicht direkt unterstützt:** DOCX, reine Bilddateien sowie Bilder oder Diagramme ohne erkannten Text. DOCX bitte zunächst als PDF exportieren.

**Gescannte PDFs:** Ohne OCR sind diese häufig nicht auslesbar. Das lokale Hilfsprogramm im Projektordner heißt `scripts/ocr_local.py`; auf macOS zunächst `brew install ocrmypdf`, danach beispielsweise:

```sh
python3 scripts/ocr_local.py "/Pfad/zur/Pruefung.pdf"
```

Das Original wird nicht überschrieben. Anschließend die Datei `.durchsuchbar.pdf` importieren.

**Grenzen:** Höchstens 15 MB pro Importdatei und höchstens 250 PDF-Seiten. Größere Prüfungsunterlagen vorher teilen. Texte in Tabellen und Abbildungen werden nicht immer korrekt erkannt. Original-PDFs werden nicht automatisch in der Anwendung gespeichert.

## 5. Lernstände sichern und auf ein anderes Gerät übertragen

1. Auf dem bisherigen Gerät die Webseite oder App öffnen.
2. **Fortschritt → Sicherung herunterladen**.
3. JSON-Datei auf den anderen Computer kopieren.
4. Dort **Fortschritt → Sicherung wiederherstellen** wählen.
5. Vorher sichern: Die Wiederherstellung ersetzt die dortigen bisherigen Lernstände.

Die Web-App und Desktop-App nutzen **getrennte lokale Speicher**. Ein Wechsel zwischen Browser und Client übernimmt die Daten nicht automatisch.

## 6. Häufige Fragen und Probleme

| Problem | Das kannst du tun |
| --- | --- |
| Ollama nicht erreichbar | Ollama starten und unter Einstellungen erneut prüfen |
| Ollama-Modell fehlt | `ollama pull qwen3.5:4b` ausführen |
| KI braucht lange | Kleinere Anzahl an Fragen wählen; das Modell benötigt RAM und Rechenzeit |
| PDF liefert keine Inhalte | Die Datei zuerst lokal per OCR durchsuchbar machen |
| Import funktioniert nach fehlerhafter Datei nicht | Lernset prüfen und andere Datei wählen; die Auswahl sollte erhalten bleiben |
| Webversion öffnet nicht | Prüfen, ob der lokale Python-Server läuft und Port 8765 frei ist |
| Lernstand fehlt auf anderem Computer | Sicherung der vorherigen Installation importieren |
| Eine Frage lässt sich nicht zuverlässig bewerten | Musterlösung anzeigen und Selbstkontrolle verwenden |

## 7. Für Entwickler – Webversion auf dem eigenen Rechner

Voraussetzungen: Python 3, Node.js und npm.

```sh
git clone https://github.com/silienthpp-glitch/Learning-by-Doing.git
cd Learning-by-Doing
npm install
npm run prepare:assets
python3 start.py --open-browser
```

Die stabile Hauptversion liegt derzeit auf `main`. Neue Funktionen werden vor der Freigabe auf separaten Branches getestet.

## 8. Sicherheit und Privatsphäre

Deine Dokumente und Lernstände bleiben normalerweise auf deinem Gerät. Eine externe KI wird nur nach bewusster Auswahl verwendet. Lege API-Keys ausschließlich lokal in `.env` ab und niemals im Chat oder auf GitHub. Exportierte JSON-Sicherungen enthalten möglicherweise persönliche Lerninhalte und sollten entsprechend geschützt werden.

**Der aktuelle Stand ist ein Test-Build.** Ein erfolgreicher GitHub-Build ersetzt keine manuelle Prüfung auf dem Zielrechner, insbesondere für Gatekeeper, Windows SmartScreen, Linux-WebKit und Ollama.

## 9. Optionaler Praxistest mit deinem eigenen Ollama

Wenn Ollama, das Modell und die Webversion auf deinem Rechner laufen, kannst du die komplette **echte KI-Verbindung** mit unkritischen Beispieldaten prüfen:

```sh
python3 scripts/test_real_ollama.py
```

Dieser Test erstellt eine synthetische DHCP-Frage, fordert die zweite fachliche Qualitätskontrolle an und bewertet anschließend eine Beispielantwort. Er verwendet ausdrücklich **Ollama**, niemals OpenAI, und keine persönlichen Prüfungsunterlagen. Er dauert je nach Modell und Rechner einige Minuten.

Ein erfolgreiches Ergebnis belegt den lokalen KI-Transport und die grundlegende Ausgabeform, aber nicht die fachliche Korrektheit jeder späteren Prüfungsfrage. Ein fehlgeschlagener Test zeigt dir die konkrete Fehlermeldung; diese kannst du bei Bedarf zur Fehlersuche weitergeben, **ohne** API-Schlüssel.
