# Analyse und erste Umsetzung: quellengebundene Lernfragen

## Festgestellte Ursachen

1. `pdfText()` liest ausschließlich vorhandene PDF-Textebenen aus. Mehrere der vom Nutzer bereitgestellten Prüfungsunterlagen (beispielsweise WiSo- und u-form-Scans) liefern keine durchsuchbaren Zeichen. **OCR ist derzeit noch nicht integriert.** Die neue Importlogik verweigert solche PDFs jetzt mit einer klaren Meldung, statt daraus erfundene Karten abzuleiten.
2. `makeStudyCard()` konstruierte die Frage »Erkläre den Zusammenhang zwischen X und Y«, sobald zwei großgeschriebene Begriffe im gleichen Abschnitt standen. Der fachliche Zusammenhang wurde nicht bewiesen. Neue Importe benutzen diesen Weg nicht mehr.
3. `materialContext()` mischte zuvor Textauszüge unterschiedlicher Quellen und unkontrolliert vorhandene Lernkarten. Nun werden begrenzte relevante Abschnitte mit ID, Dateiname und Seitenzahl ausgewählt.
4. `normalizeAiQuestions()` prüfte zuvor vor allem das Feldformat. Nun müssen von der KI erstellte Fragen ein `chunkId` und `evidenceQuote` besitzen. Die neue Prüffunktion lehnt fehlende/nicht vorhandene Zitate, unzulässige Antwortoptionen und sehr ähnliche Fragen ab.
5. Eine unabhängige fachliche Zweitbewertung fehlte. Neu prüft Ollama nach der Generierung in einer **einzigen zusätzlichen Batch-Anfrage** maximal acht Kandidaten; nur von dieser Zweitprüfung akzeptierte Vorschläge gehen zur abschließenden Textbeleg-/Duplikatprüfung. Dennoch ist auch eine KI-Zweitprüfung nicht beweissicher – fachliche Stichproben bleiben nötig.

## Verarbeitung (neue erste Stufe)

`PDF-Text / TXT` → `[[SEITE n]]` → `Abschnitte` → `Themenrelevanz` → `4 kurze Abschnitte (maximal 6.000 Zeichen)` → `Ollama oder explizit OpenAI` → `zweite fachliche Batch-Prüfung` → `Textbeleg- und Dublettenprüfung` → `Lernset speichern`.

Importierte Originaldateien werden nicht in GitHub hochgeladen. Die Abschnitte liegen wie bisher nur in den lokalen Browserdaten der App.

### Wichtige Einschränkungen

- Das neue Chunking ist heuristisch und kein vollständiges Layout-/Tabellenverständnis. Bilder, Netzwerkdiagramme und komplexe Tabellen bleiben ohne OCR/Layout-Analyse nicht zuverlässig auswertbar.
- Große Scans über 15 MB brauchen weiterhin eine lokale Aufbereitung.
- Eine automatisch bestätigte wörtliche Textstelle ist ein Herkunftsnachweis, **keine fachliche Verifikation** der Antwort.
- Alte Lernsets bleiben vorhanden; für ältere `sources` ohne strukturierte `chunks` muss die betreffende Datei erneut importiert werden, um die neue Quellenprüfung nutzen zu können.
- Es wurden **keine persönlichen IHK-PDF-Dateien** in dieses öffentliche Repository aufgenommen.
- Das Qwen-Modell wurde nicht automatisch ausgewechselt. OpenAI bleibt opt-in.

## Fünf nachvollziehbare Beispiele aus vorhandenen echten Prüfungsunterlagen

Die Beispiele sind **redaktionell aus den Unterlagen abgeleitet** und KEINE tatsächlich aufgezeichneten Ollama-Ausgaben. Ein echter Vergleich mit vorherigen Ollama-Ausgaben setzt ein lokales Testprotokoll voraus.

| Prüfungsunterlage / Stelle | Ausgangsinformation (paraphrasiert) | Qualitätsziel / neue Lernfrage | Musterlösung in Kurzform |
| --- | --- | --- | --- |
| Netzwerke Sommer 2024, Lösung 2. Aufgabe, aa) | Wenn DHCP keine Antwort liefert, kann der Client automatisch eine 169.254.x.x-Adresse erhalten. | »Ein Notebook erhält 169.254.12.20 statt seiner Firmenadresse. Welche Ursache ist wahrscheinlich? Erläutern Sie zwei sinnvolle Schritte zur Fehleranalyse.« | DHCP-Antwort fehlt oder kann den Client nicht erreichen; Verbindung/VLAN und Erreichbarkeit des DHCP-Diensts bzw. DHCP-Relay prüfen. |
| Netzwerke Sommer 2023, Lösung 1. Aufgabe, bb) | Der DHCP-Broadcast passiert ohne Weiterleitung keine L3-Grenze. | »Ein Client in VLAN 20 erhält keine Lease vom DHCP-Server eines anderen VLANs. Welche Netzfunktion fehlt möglicherweise? Begründen Sie.« | DHCP-Relay / ip helper-address am VLAN-Interface; ein Broadcast wird sonst nicht über L3 weitergeleitet. |
| Netzwerke Sommer 2022, Lösung 1. Aufgabe, aa) | Ein /27-Subnetz führt zu einer Netzadresse .160 und Broadcast .191. | »Ein Netzwerk lautet 203.0.113.160/27. Ermitteln Sie Netz-ID, erste und letzte Hostadresse sowie Broadcast.« | 203.0.113.160, .161, .190, .191. |
| Netzwerke Winter 2023/24, Lösung 1. Aufgabe, ac) | Routingprotokolle nutzen eine Metrik für die Wahl einer Route. | »Zwei Routen führen zum selben Ziel. Beschreiben Sie, wie ein dynamisches Routingprotokoll die bevorzugte Route bestimmt.« | Der Algorithmus bewertet Pfade über die jeweilige Metrik; typischerweise wird die mit dem kleineren Wert bevorzugt. |
| Netzwerke Winter 2024/25, Lösung 1. Aufgabe, ca) und cb) | Native VLAN-Frames bleiben ungetaggt; falsch gewählte VLAN-Konfiguration kann VLAN-Hopping ermöglichen. | »Warum ist die Trennung von Default-VLAN und Native-VLAN auf einem Trunk sinnvoll?« | Es reduziert eine Konstellation, die VLAN-Hopping begünstigen kann. |

**Bisherige Ollama-Fragen:** nicht erhoben – das lokale Modell des Nutzers war in dieser Sitzung nicht erreichbar. Daher ist ein tatsächlicher Vorher-/Nachher-Qualitätsvergleich noch nicht möglich.

## Änderungen

- `dist/document-quality.js`: deterministischer Chunker, relevante Auswahl, Textbeleg-/Formprüfung, Ähnlichkeitsfilter.
- `dist/index.html`: Modul laden.
- `dist/app.js`: Seitentags im PDF-Text, kein automatisches Anlegen fragwürdiger Karten; Quellenabschnitte speichern; relevante Kontextauswahl und Validierung vor persistenter Speicherung.
- `start.py` und `src-tauri/src/lib.rs`: Quellenzitat, Abschnitts-ID, Lernziel und Schwierigkeitsgrad im Modell-Ausgabeformat verpflichtend sowie zweiter Modellaufruf zur fachlichen Batch-Prüfung mit höchstens acht Kandidaten.
- `tests/document-quality.cjs`: Regressionstests.
- `.github/workflows/source-quality.yml`: Checks ohne Ollama- oder API-Kosten.

## Tests

`node --check dist/app.js`, `node --check dist/document-quality.js`, `python3 -m py_compile start.py` und `node tests/document-quality.cjs` liefen in GitHub Actions erfolgreich durch.

Nicht getestet: echter OCR-Lauf, lokale PDF-Dateien auf dem Mac, Browser-End-to-End-Import nach der Änderung, tatsächliche Ollama-JSON-Ausgaben, native Tauri-Laufzeit der neuen Pipeline.

## Mac M4 – Test

Zuerst einen Export deiner Lerndaten anfertigen.

```bash
cd ~/Desktop/Learning-by-Doing
git fetch origin
git switch --track origin/feat/source-grounded-questions
python3 start.py --open-browser
```

Bei existierendem lokalem Branch stattdessen `git switch feat/source-grounded-questions` und `git pull origin feat/source-grounded-questions` verwenden.

Für die Desktop-Version gelten weiterhin die Tauri-Startbefehle aus `DESKTOP.md`. Vorhandene `.env`-Dateien mit API-Schlüsseln niemals hochladen.

## Offline OCR für gescannte PDFs (Mac M4)

Für Scan-PDFs kann das neue Hilfsprogramm `scripts/ocr_local.py` lokal und ohne Cloud genutzt werden. Voraussetzung ist eine installierte OCRmyPDF-/Tesseract-Umgebung.

```bash
brew install ocrmypdf
python3 scripts/ocr_local.py "/Pfad/zur/Pruefung.pdf"
```

Es wird eine neue Datei mit Endung `.durchsuchbar.pdf` erzeugt. Das Original wird nicht überschrieben. Die OCR verwendet höchstens zwei Arbeitsprozesse (`--jobs 2`), um CPU- und RAM-Last zu begrenzen. Anschließend wird **nur die neue PDF** in der Lernplattform importiert.

**Noch offen:** Eine automatisch startende OCR direkt im Web-/Tauri-Dateiimport ist nicht implementiert; dort wird bei fehlender Textebene verständlich abgebrochen. OCR-Ergebnisse müssen bei Netzwerkskizzen, Tabellen und kleinen Scan-Schriften kontrolliert werden.
