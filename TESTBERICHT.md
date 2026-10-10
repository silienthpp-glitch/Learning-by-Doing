# Prüfstand vom 10. Oktober 2026

## Getestete Fassungen

- GitHub PR #2, unveränderte Revision `26a4d3d8075c0c7b8f2fad95efd769f3b0db66d1`: 18 Python- und 18 JavaScript-Tests bestanden. Lernen, Weiterblättern, Speicher nach Neuladen und zehn Aufgaben im Prüfungsmodus im Browser geprüft. Lösungen erschienen erst nach Abschluss. Ein fehlerhafter Zähler für Fehlertraining wurde in der Erweiterung korrigiert.
- Lokale Erweiterung: 51 Python- und 21 JavaScript-Tests bestanden. Geprüft werden unter anderem Anbieterfreigabe, kein kostenpflichtiger Rückfall, Quellenbelege, Themenfilter, 10/20/30 angeforderte Fragen, Punktgrenzen und Teilbewertung.

## Echte kostenlose KI- und Anwendungstests

Ollama war auf diesem Mac erreichbar. Alle echten KI-Aufrufe verwendeten lokale Modelle. Keine OpenAI-Anfrage wurde ausgeführt; deren Gültigkeit, Guthaben und Antwortqualität sind daher nicht bestätigt. Die Anwendung wurde ohne OpenAI-Schlüssel getestet.

Ein echter Lernset-Auftrag wurde im Browser erstellt, gespeichert, gelernt und bewertet; Ergebnis und Fortschritt blieben nach Neuladen erhalten. Einfache Auswahltypen werden regelbasiert bewertet. Freitext, Rechnung und Praxisfall wurden mit der lokalen KI geprüft. Eine nur teilweise beantwortete Praxisfrage erhielt 1 von 2 Punkten.

Eine separate Browser-Probeprüfung mit sechs selbst verfassten Aufgaben (alle sechs Formate) lieferte 7/9 Punkte = 78 %, vier vollständig richtige Antworten, eine falsche und eine teilweise richtige. Die Teilantwort im Praxisfall erhielt 1/2 Punkte. Lösungen wurden bis zur letzten Abgabe verborgen. Nach Neuladen waren alle sechs Antworten und das Themen-Ergebnis gespeichert. Der reguläre additive JSON-Import wurde dabei repariert: alle Fragetypen und Antwortalternativen bleiben erhalten. Es wurden keine vorhandenen Browserdaten durch eine Sicherung ersetzt.

Der abschließende Browser-Auftrag erstellte zehn passende Datenbankfragen mit allen sechs Formaten und nachvollziehbaren lokalen Belegen. Die Fragen wurden einzeln fachlich kontrolliert. Für belegte Datenbank-Grundlagen werden selbst verfasste, geprüfte Lernvorlagen verwendet; hier war keine KI-Generierung erforderlich. Weitere Themen und zusätzliche Fragen werden von der lokalen KI entworfen und erneut geprüft. Frühere reale Modellaufträge lieferten zu wenige oder unzureichende Entwürfe. Unzureichende Entwürfe werden verworfen; eine kleinere Zahl wird angezeigt. Reale vollständige 20- und 30-Fragen-Aufträge sind nicht bestätigt; die Tests dafür verwenden simulierte KI-Antworten.

## Lokale Dokumente und Zugriffsschutz

88 vorhandene PDF-Unterlagen wurden indexiert: 1026 Seiten, davon 932 mit OCR; 954 Seiten enthalten mindestens 80 Zeichen. Der Indexlauf meldete keine Fehler. Das bestätigt die Verarbeitung, nicht die fehlerfreie Erkennung jeder Zahl oder jedes Zeichens.

PDF-Import, ungültige PDFs, ungültige Themen, fehlende Aufträge und verständliche Fehlermeldungen wurden geprüft. Der Server liefert `.env`, lokale Schlüsseldateien und private Originale nicht aus; fremde Web-Ursprünge werden abgewiesen.

Private Unterlagen, extrahierte Texte, KI-Entwürfe, Schlüssel und Modellgewichte dürfen nicht in die Git-Veröffentlichung aufgenommen werden. Vorhandene Browserdaten und Originaldokumente werden nicht durch das Update ersetzt.

Die kleineren Modelle wurden zusätzlich mit realen Quellseiten geprüft. Auch Qwen3 8B erzeugte anfangs unzulässige Verallgemeinerungen. Neue Schutzprüfungen verwerfen solche SQL-Datentyp-Behauptungen, zu ähnliche Antwortalternativen, fehlende Zeichenlängen im Fragetext und themenfremde Quellenbelege. OCR-Zusammenschreibungen werden bei der Themenzuordnung besser erkannt; gemischte Seiten mit überwiegend anderem Thema werden niedriger priorisiert. Fehlerhafte Entwürfe können einmal anhand konkreter Fehlermeldungen korrigiert werden und durchlaufen danach erneut die Validierung und Quellenprüfung.

## Abgleich mit GitHub main

Die neuere main-Fassung hatte einen separaten KI-Ablauf und andere Bezeichnungen für Fragetypen. Diese werden beim Lernen ohne Veränderung der gespeicherten Objekte angepasst. IDs und Punktwerte bleiben erhalten; frühere Teilpunkt-Verlaufswerte werden berücksichtigt. Gespeicherte Textauszüge werden lokal indexiert. Bestehende Stile bleiben erhalten. Der bisherige Smoke-Test wird durch die geprüften API-, Sicherheits- und Format-Tests ersetzt und auch für Pull Requests ausgeführt.

## Abschließender Durchlauf im Hauptordner

Die Webseite lief mit den Dateien aus `Schreibtisch/Learning-by-Doing-neu`. Der reguläre Browser-Button erzeugte zehn Datenbankfragen aus den vorhandenen Unterlagen, mit Single Choice, Multiple Choice, Richtig/Falsch, Freitext, Rechnung und Praxisfall. Alle zehn wurden in einer vollständigen Probeprüfung beantwortet: absichtlich eine falsche Auswahl und eine unvollständige COUNT-Antwort. Ollama bewertete die vier offenen Aufgaben. Das erwartete Ergebnis war 11/13 Punkte = 85 %, acht richtige, eine teilweise richtige und eine falsche Antwort. Die Teilantwort erhielt 1/2 Punkte. Nach Neuladen blieben das neue Lernset und alle zehn Antworten erhalten; der Dashboard-Zähler stieg von 9 auf 19 Antworten und von 4 auf 12 richtige. Fehlertraining stieg von 3 auf 5. Keine kostenpflichtige Anfrage wurde ausgeführt.

## Reparatur: Fragen aus vorhandenen Schul-Lernsets (10.10.2026)

Ursache: PDF/TXT-Import speicherte Dateien, aber die allgemeine IHK-Erstellung konnte keine Fragen direkt in bestehende Lernsets mit eigenen Fachnamen wie EVP10b schreiben.

Die Reparatur ergänzt eine Lernset-Auswahl und „Fragen erstellen“ am bestehenden Set. Die ausgewählten Dokument-IDs begrenzen die Auswertung; keine anderen Bibliotheksdokumente oder Aufgabenblätter werden beigefügt. Formularfelder werden entfernt. Resultate werden mit stabilen IDs ergänzend gespeichert; vorhandene Fragen, Namen, Termine und Lernstände werden erhalten. Bereits vorhandene Fragestellungen werden ausgeschlossen. Erneutes Öffnen fertiger Aufträge fügt keine Duplikate hinzu. Gelesene PDFs werden wiederverwendet; Zuordnung derselben Datei zu mehreren Lernsets funktioniert. Bereits geprüfte Fragen bleiben bei späteren KI-Ausfällen als Teilergebnis verfügbar.

Validierung: 59 Python-Tests, 21 JavaScript-Tests sowie Syntaxprüfungen bestanden. Echter kostenloser Ollama-Test mit den vier RAID-/Speichernetz-Dateien: zunächst zehn KI-Entwürfe erstellt und geprüft; dabei verbliebene Unklarheiten in Aufgaben führten zu strengeren Regeln und eigenen quellengebundenen Speichertemplates. Endfassung: zehn belegte Aufgaben in allen sechs Formaten im selben Schul-Lernset erstellt. Im Browser fünf Aufgaben beantwortet (Single Choice, Richtig/Falsch, weitere Auswahl, Multiple Choice, XOR-Rechnung). Freie Rechnung tatsächlich mit qwen3:8b bewertet: 2/2 Punkte. „Nächste Frage“ funktioniert; nach Neuladen bleiben zehn Fragen, vier Dateizuordnungen und fünf richtige Antworten erhalten. Ein vorheriger Test-Lernset bleibt separat unverändert. OpenAI wurde nicht aufgerufen.

20/30 Fragen wurden in dieser Reparatur nicht erneut mit echten Dokumenten vollständig erzeugt; die automatischen Mengenprüfungen bestehen. Falls weitere Quellen keine belegten Aufgaben tragen, wird die kleinere Anzahl ausdrücklich angegeben. KI-Bewertungen bleiben Einschätzungen, keine Garantie fehlerfreier Benotung. Private Dokumente, Belege, Browserdaten, Schlüssel und Modelle werden nicht veröffentlicht.
