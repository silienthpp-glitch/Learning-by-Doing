# Learning by Doing

Dein lokaler IHK-Lerntrainer für Fachinformatiker Systemintegration. Die App startet mit **19 selbst erstellten Beispielaufgaben aus acht Themen**. Es sind keine offiziellen IHK-Aufgaben. Du brauchst kein Konto, keinen API-Schlüssel und keine zusätzlichen Python- oder JavaScript-Pakete. Nach dem Start arbeitet die App ohne Internet.

## Start in drei Schritten

1. Falls du die ZIP-Datei verwendest: zuerst vollständig entpacken.
2. Öffne ein Terminal im Ordner `learning-by-doing`.
3. Starte den lokalen Server:

```sh
python3 start.py
```

Unter Windows heißt der Befehl oft `py start.py`. Voraussetzung ist Python 3. Auf diesem Mac ist es bereits vorhanden.

Öffne dann im Browser **http://127.0.0.1:8765**. Lass das Terminal während des Lernens offen. Zum Beenden drückst du dort **Strg+C**. Beim nächsten Start ist dein Fortschritt im selben Browser wieder da.

Auf dem Mac kannst du alternativ `Start.command` öffnen. Das startet die Seite und öffnet deinen Browser automatisch. Falls macOS beim ersten Start nachfragt, bestätige das Öffnen der Datei. Falls macOS die Ausführung weiterhin blockiert, nutze den Terminal-Befehl oben.

Wenn der Port belegt ist:

```sh
python3 start.py --port 8766
```

Dann lautet die Adresse http://127.0.0.1:8766. Achtung: eine andere Portnummer ist für den Browser ein anderer Speicherort. Sichere deinen Fortschritt vor einem Wechsel.

Die Adresse `127.0.0.1` bedeutet „dieser Rechner“. Der Server lauscht nur dort; andere Rechner in deinem Netzwerk erhalten dadurch keinen Zugriff. Du kannst `dist/index.html` auch direkt öffnen, aber für zuverlässige Speicherung empfehlen wir die feste lokale Webadresse.

## So benutzt du die App

- **Dashboard:** Fragen von heute, offene Wiederholungen, sicher gelernte Aufgaben und Themenfortschritt. Alle Werte starten bei null; es gibt keine erfundenen Ergebnisse.
- **Lernen:** Wähle alle Themen oder ein einzelnes Thema. Fällige Aufgaben stehen vor neuen Aufgaben. Jede Antwort zeigt dir direkt die Lösung, eine einfache Erklärung und bei Rechnungen einzelne Schritte.
- **Fehlertraining:** Wiederhole bereits bearbeitete Aufgaben, die noch keine drei richtigen Antworten in Folge haben. Du darfst auch vor ihrer Fälligkeit üben.
- **Themen:** Netzwerktechnik, Subnetting, IPv6, RAID & Speicher, SQL, IT-Sicherheit, Wirtschaft und Projektmanagement. Hier importierst du eigene Aufgaben.
- **Fortschritt:** Thema für Thema sehen, wie viele Aufgaben sicher sitzen. Über „Sicherung herunterladen“ speicherst du Fortschritt und eigene Aufgaben gemeinsam. „Sicherung wiederherstellen“ ersetzt die aktuellen Daten nach einer Bestätigung.
- **Prüfungsmodus:** Zehn zufällige Aufgaben ohne sofortige Hinweise. Am Ende erhältst du Punkte, Lösungen und Erklärungen. Bei vorzeitiger Abgabe zählen offene Aufgaben mit null Punkten. Ein Wechsel über die Navigation bricht den Test ab; noch nicht abgegebene Prüfungsantworten werden dann nicht gespeichert.
- **Darstellung wechseln:** Heller oder dunkler Hintergrund, auch auf kleinen Bildschirmen.

## Warum kommen Fragen wieder?

Bei einer falschen Antwort wird die Serie richtiger Antworten auf null gesetzt. Die Aufgabe wird nach einer Minute fällig und erscheint in der laufenden Lernrunde nach mindestens zwei anderen Aufgaben erneut, sofern genug Aufgaben vorhanden sind. Bei kurzen Runden erscheint sie entsprechend früher. Lies zuerst die Erklärung und versuche den Rechenweg anschließend selbst.

Bei richtigen Antworten wird die nächste Wiederholung nach 1, 3, 7 und danach 14 Tagen geplant. Nach drei richtigen Antworten in Folge gilt eine Aufgabe als „sicher gelernt“. Auch sichere Aufgaben kommen nach Ablauf der Frist wieder dran. Ein späterer Fehler setzt diesen Status zurück.

Eine Lernrunde startet mit bis zu zehn Aufgaben. Durch Wiederholungen kann sie auf maximal zwanzig Antworten wachsen. Danach übst du die offenen Aufgaben in einer neuen Runde weiter. Die App kann nicht beweisen, dass du ein Thema vollständig verstanden hast; der Status ist eine Lernhilfe, keine Prognose für die IHK-Prüfung.

## Aufbau einfach erklärt

```text
learning-by-doing/
├── README.md                 diese Anleitung
├── start.py                  kleiner lokaler Webserver
├── Start.command             Starthelfer für macOS
├── beispiel-import.json      Vorlage für eigene Aufgaben
└── dist/
    ├── index.html            Grundgerüst: Navigation und Inhaltsbereich
    ├── style.css             Farben, Abstände und mobile Darstellung
    ├── questions.js          die eingebauten Beispielaufgaben
    └── app.js                Antworten prüfen, Runden, Fortschritt und Import
```

**HTML** beschreibt die Bestandteile der Seite. **CSS** bestimmt ihr Aussehen. **JavaScript** reagiert auf Klicks, prüft Antworten und speichert den Fortschritt. **Python** liefert diese Dateien lokal an deinen Browser aus; es verarbeitet keine Antworten und speichert keine Lerndaten.

`dist` enthält hier direkt die fertige Webseite, keine generierten Zwischenstände. Es ist kein Build-Schritt nötig. Du kannst den Projektordner später als Git-Repository verwalten.

Die sechs Ansichten verwenden Adressen wie `#learn` und `#topics`. Dadurch bleibt alles in einer Seite und der lokale Server benötigt keine besondere Routen-Konfiguration.

### Die wichtigsten Stellen in app.js

- `render()` zeichnet die aktuelle Ansicht.
- `start()` stellt eine Runde zusammen.
- `isCorrect()` prüft eine Antwort.
- `submit()` verarbeitet die Abgabe und zeigt die Erklärung.
- `updateRecord()` aktualisiert die Wiederholungsfrist.
- `validateQuestions()` prüft importierte Aufgaben vor dem Speichern.
- `save()` speichert unter dem Browser-Schlüssel `learning-by-doing-v1`.

## Echte Prüfungsfragen später ergänzen

Nutze `beispiel-import.json` als Vorlage. Im Bereich „Themen“ kannst du eine JSON-Datei importieren. Der Inhalt ist eine Liste von Aufgaben:

```json
[
  {
    "id": "eigene-subnetting-001",
    "topic": "Subnetting",
    "prompt": "Wie viele nutzbare Hosts hat ein normales IPv4-/28-Netz?",
    "type": "number",
    "answer": "14",
    "explanation": "Vier Host-Bits ergeben 16 Adressen. Netz- und Broadcastadresse sind reserviert.",
    "steps": ["32 − 28 = 4", "2⁴ = 16", "16 − 2 = 14"],
    "options": [],
    "aliases": [],
    "points": 2
  }
]
```

Für Multiple Choice verwendest du `"type": "choice"` und zum Beispiel `"options": ["Switch", "Router", "Patchpanel"]`. `answer` muss exakt einer Option entsprechen.

- Jede `id` muss eindeutig sein. Verwende nur Buchstaben, Zahlen, Bindestriche und Unterstriche. Ändere bestehende IDs nicht, sonst geht die Zuordnung zum Fortschritt verloren.
- `answer` ist immer ein Text. Bei Zahlenaufgaben enthält er nur die Zahl. Die Einheit gehört in die Frage. Dezimalkomma und Dezimalpunkt werden bei Antworten akzeptiert. Es werden keine Näherungen oder Einheiten geraten.
- `steps` ist eine Liste; ohne Rechenweg verwendest du `[]`.
- `points` ist eine ganze Zahl von 1 bis 100. In der Prüfung erhält eine richtige Antwort alle Punkte, sonst null. Teilpunkte sind noch nicht vorgesehen.
- `aliases` enthält optional alternative akzeptierte Antworten für Auswahlaufgaben; normalerweise genügt `[]`.
- Ein Import enthält maximal 1.000 Aufgaben und die Datei darf höchstens 5 MB groß sein. Bereits importierte IDs werden abgelehnt; es findet kein stilles Überschreiben statt.
- Texte werden als Text ausgegeben, nicht als HTML ausgeführt.

Alternativ kannst du weitere Aufgaben direkt in `questions.js` zur Liste hinzufügen. Nach dem Speichern lade die Seite neu. Für normale Ergänzungen ist der JSON-Import einfacher.

**PDFs werden noch nicht automatisch eingelesen.** Deine späteren IHK-Fragen müssen mit passenden Lösungen und verständlichen Erklärungen in das Schema übertragen werden. Der Trainer bewertet derzeit Auswahl- und Zahlenaufgaben; offene Texte, mehrteilige Originalaufgaben, Bilder, Teilpunkte, Prüfungsjahrgänge und Zeitlimits benötigen eine spätere Erweiterung. Die vorhandene Probeprüfung dient bereits zum Üben am Stück.

## Speicherung und Sicherung

Alles liegt in `localStorage` dieses Browsers für genau diese Webadresse. Es wird nichts an externe Dienste geschickt. Ein anderer Browser, ein privates Fenster, eine andere Portnummer oder gelöschte Browserdaten können einen leeren Fortschritt zeigen. Private Fenster speichern häufig nur vorübergehend.

Lade regelmäßig eine Sicherung herunter. Sie enthält die Aufgaben-IDs, Versuche, richtigen Antworten, aktuelle Antwortserie, nächste Frist, Lernverlauf, eigene Aufgaben und Darstellung. Laufende Runden werden nicht gesichert. Normale Lernantworten werden sofort gespeichert; Prüfungsantworten erst beim Abschluss oder bei vorzeitiger Abgabe. Wenn Browser-Speicherung blockiert ist, erscheint ein Hinweis und du kannst die aktuellen Daten trotzdem exportieren.

## Überprüfung dieser Version

Geprüft wurden Zahlen mit Dezimalkomma, falsche und richtige Auswahlantworten, Wiederholungsreihenfolge, Rücksetzen der Antwortserie, Schutz gegen doppelte Abgabe, Prüfungsbewertung, Importvalidierung und alle sechs Ansichten. Zusätzlich wurden Erklärung und Speicherung im Browser kontrolliert. Es gibt keine externen Schriften, Bilder oder Bibliotheken, die für die Seite geladen werden müssen.
