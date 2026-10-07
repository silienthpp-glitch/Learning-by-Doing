# Fragen aus Informationstexten

Unter „Fächer & Lernsets“ ein Lernset auswählen, PDF/TXT/Markdown oder JSON einlesen und die Vorschau prüfen. Frage und Musterlösung können bearbeitet, einzelne Vorschläge abgewählt werden. Erst „Ausgewählte Fragen speichern“ übernimmt die Auswahl. Identische Fragen und Lösungen im selben Lernset werden übersprungen.

Die lokale Verarbeitung erkennt Definitionen, Funktionen, Bestandteile, Listen und explizite Frage-Antwort-Paare. Sie verwendet keine zufälligen Substantivpaare und sendet Text nicht an einen KI-Dienst. Jeder automatisch erstellte Vorschlag hat einen Originalauszug; PDFs behalten ihre Seitenangabe. Formularköpfe wie Name/Klasse/Datum werden herausgefiltert. Erkennbare alte Kopfzeilenfragen bleiben gespeichert, werden aber nicht mehr zum Lernen angeboten.

Diese Regeln ersetzen keine semantische KI oder fachliche Prüfung. Nicht eindeutig verwertbare Abschnitte werden ausgelassen. Scan-PDFs benötigen vorher OCR. Die Obergrenze beträgt 80 Vorschläge pro Textdatei und 15 MB pro Datei. Freie Antworten werden durch Vergleich mit der Musterlösung selbst bewertet und nicht in eine automatische Richtig/Falsch-Bewertung gezwungen. Solche Fragen sind weiterhin vom automatisch benoteten Prüfungsmodus ausgeschlossen.

Vorhandene Karten lassen sich ohne ihren ursprünglichen Informationstext nicht vollständig neu erstellen. Betroffene Unterlagen erneut einlesen und die Vorschau kontrollieren. Lernfortschritte bleiben erhalten.

Tests: `node --test tests/study-import.test.cjs`
