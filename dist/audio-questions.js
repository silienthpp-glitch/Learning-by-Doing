/* Eigene Lehrfragen: Audio, Recording & Live Sound; keine Hersteller-Pruefungsaufgaben. */
window.AUDIO_QUESTIONS = [
  {
    "id": "audio-001",
    "subject": "Audio & Live Sound",
    "topic": "Audiogrundlagen",
    "prompt": "Was beschreibt die Frequenz eines Tons?",
    "answer": "Schwingungen pro Sekunde",
    "type": "choice",
    "options": [
      "Schwingungen pro Sekunde",
      "Dezibel des Ausgangssignals",
      "Anzahl der Lautsprecher",
      "Kabellänge"
    ],
    "explanation": "Die Frequenz wird in Hertz (Hz) gemessen. 1.000 Hz entsprechen 1.000 Schwingungen je Sekunde.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-002",
    "subject": "Audio & Live Sound",
    "topic": "Audiogrundlagen",
    "prompt": "Was bedeutet 0 dBFS bei digitalem PCM-Audio?",
    "answer": "Der höchste darstellbare Samplewert",
    "type": "choice",
    "options": [
      "Eine leise Aufnahme",
      "Der höchste darstellbare Samplewert",
      "0 dB Schalldruck",
      "Die optimale Aussteuerung"
    ],
    "explanation": "0 dBFS entspricht dem digitalen Vollaussteuerungspegel. Überschreitungen bei fester PCM-Wortbreite führen zu Clipping.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-003",
    "subject": "Audio & Live Sound",
    "topic": "Audiogrundlagen",
    "prompt": "Welche Aussage zu Gain und Fader stimmt?",
    "answer": "Gain wirkt meist früh, der Fader später im Signalweg",
    "type": "choice",
    "options": [
      "Beide sind immer dieselbe Stufe",
      "Gain wirkt meist früh, der Fader später im Signalweg",
      "Der Fader erhöht die Mikrofonempfindlichkeit",
      "Gain ist nur für Stereo"
    ],
    "explanation": "Die Eingangsverstärkung bestimmt die Pegelung vor weiterer Bearbeitung; der Fader regelt typischerweise den Kanalpegel später im Signalweg.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-004",
    "subject": "Audio & Live Sound",
    "topic": "Audiogrundlagen",
    "prompt": "Warum wird eine DI-Box bei Instrumenten eingesetzt?",
    "answer": "Zur Anpassung und symmetrischen Übertragung",
    "type": "choice",
    "options": [
      "Um automatisch Hall einzufügen",
      "Zur Anpassung und symmetrischen Übertragung",
      "Um Samplingraten zu verdoppeln",
      "Als Ersatz für Kopfhörer"
    ],
    "explanation": "Eine DI-Box hilft häufig, Instrumentensignale für einen Mikrofoneingang aufzubereiten und längere symmetrische Leitungen zu nutzen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-005",
    "subject": "Audio & Live Sound",
    "topic": "Recording",
    "prompt": "Eine Gesangsaufnahme verzerrt bereits am Eingang. Was ist zuerst sinnvoll?",
    "answer": "Eingangsverstärkung verringern",
    "type": "choice",
    "options": [
      "Masterfader absenken",
      "Eingangsverstärkung verringern",
      "Mehr Hall geben",
      "Samplerate erhöhen"
    ],
    "explanation": "Clipping am Vorverstärker oder A/D-Wandler wird nicht durch einen späteren Fader behoben.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-006",
    "subject": "Audio & Live Sound",
    "topic": "Recording",
    "prompt": "Wozu dient Direct Monitoring am Audio-Interface?",
    "answer": "Eingang ohne großen Softwareweg abhören",
    "type": "choice",
    "options": [
      "Audio komprimieren",
      "Eingang ohne großen Softwareweg abhören",
      "Automatisch quantisieren",
      "Spuren löschen"
    ],
    "explanation": "Direct Monitoring kann die wahrgenommene Verzögerung beim Aufnehmen reduzieren.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-007",
    "subject": "Audio & Live Sound",
    "topic": "Recording",
    "prompt": "Was ist ein Take?",
    "answer": "Ein einzelner Aufnahmeversuch",
    "type": "choice",
    "options": [
      "Ein Equalizerfilter",
      "Ein einzelner Aufnahmeversuch",
      "Ein Routingbus",
      "Ein Exportformat"
    ],
    "explanation": "Mehrere Takes ermöglichen es, später passende Passagen auszuwählen (Comping).",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-008",
    "subject": "Audio & Live Sound",
    "topic": "Recording",
    "prompt": "Welche Option mindert Poppgeräusche bei Gesangsaufnahmen häufig?",
    "answer": "Popfilter und passende Mikrofonposition",
    "type": "choice",
    "options": [
      "Höhere Bildschirmauflösung",
      "Popfilter und passende Mikrofonposition",
      "Mehr Höhen-EQ",
      "Lautere Monitorbox"
    ],
    "explanation": "Plosive entstehen durch Luftstöße. Ein Popfilter und leicht versetzte Mikrofonposition helfen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-009",
    "subject": "Audio & Live Sound",
    "topic": "Mixing",
    "prompt": "Was ist Masking im Mix?",
    "answer": "Ein Signal verdeckt ein anderes im ähnlichen Frequenzbereich",
    "type": "choice",
    "options": [
      "Ein Signal verdeckt ein anderes im ähnlichen Frequenzbereich",
      "Ein stummer Kanal",
      "Eine kürzere Aufnahme",
      "Ein kaputtes Mikrofon"
    ],
    "explanation": "Maskierung entsteht durch überlappende Klanganteile und deren Pegelverhältnis; Balance, Arrangement und EQ können helfen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-010",
    "subject": "Audio & Live Sound",
    "topic": "Mixing",
    "prompt": "Welche Maßnahme sollte häufig vor komplexem Processing kommen?",
    "answer": "Pegelbalance und Referenzhören",
    "type": "choice",
    "options": [
      "Alle EQ-Bänder anheben",
      "Pegelbalance und Referenzhören",
      "Jede Spur auf -30 dB stellen",
      "Reverb auf Maximum"
    ],
    "explanation": "Eine ausgewogene Balance und ein klares Ziel helfen, unnötige Bearbeitung zu vermeiden.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-011",
    "subject": "Audio & Live Sound",
    "topic": "Mixing",
    "prompt": "Was verändert ein Hochpassfilter primär?",
    "answer": "Es dämpft tiefe Frequenzen unterhalb der Grenzfrequenz",
    "type": "choice",
    "options": [
      "Es dämpft tiefe Frequenzen unterhalb der Grenzfrequenz",
      "Es hebt alle Höhen an",
      "Es verschiebt die Tonhöhe",
      "Es entfernt Hall vollständig"
    ],
    "explanation": "Ein Hochpass schwächt tiefe Frequenzen ab; der Verlauf hängt von Filtertyp und Flankensteilheit ab.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-012",
    "subject": "Audio & Live Sound",
    "topic": "Mixing",
    "prompt": "Was bewirkt ein enger Q-Faktor beim parametrischen EQ?",
    "answer": "Einen schmaleren Frequenzbereich bearbeiten",
    "type": "choice",
    "options": [
      "Einen schmaleren Frequenzbereich bearbeiten",
      "Immer lauteren Bass",
      "Automatisch weniger Verzerrung",
      "Nur den linken Kanal ändern"
    ],
    "explanation": "Bei Peaking-EQs bedeutet höheres Q typischerweise eine schmalere Bandbreite.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-013",
    "subject": "Audio & Live Sound",
    "topic": "Effekte",
    "prompt": "Was gibt das Kompressor-Ratio 4:1 oberhalb des Thresholds ungefähr an?",
    "answer": "4 dB Pegelanstieg am Eingang ergeben 1 dB am Ausgang",
    "type": "choice",
    "options": [
      "4 dB Pegelanstieg am Eingang ergeben 1 dB am Ausgang",
      "4 dB werden immer abgesenkt",
      "Das Signal wird viermal schneller",
      "Vier Kanäle werden verbunden"
    ],
    "explanation": "Bei einem idealisierten Kompressor gilt oberhalb des Thresholds etwa 4:1, abhängig von Knee/Attack/Release.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-014",
    "subject": "Audio & Live Sound",
    "topic": "Effekte",
    "prompt": "Was beschreibt die Attack eines Kompressors?",
    "answer": "Wie schnell die Pegelreduktion einsetzt",
    "type": "choice",
    "options": [
      "Wie schnell die Pegelreduktion einsetzt",
      "Wie lange die Datei ist",
      "Wie breit ein EQ-Band ist",
      "Die Anzahl der Mikrofone"
    ],
    "explanation": "Attack beeinflusst, wie stark Transienten zunächst durchgelassen werden.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-015",
    "subject": "Audio & Live Sound",
    "topic": "Effekte",
    "prompt": "Wofür eignet sich ein Reverb-Send?",
    "answer": "Mehrere Spuren mit einem gemeinsamen Hallanteil mischen",
    "type": "choice",
    "options": [
      "Den Gain des Vorverstärkers erhöhen",
      "Mehrere Spuren mit einem gemeinsamen Hallanteil mischen",
      "Bit-Tiefe ändern",
      "Panning abschalten"
    ],
    "explanation": "Ein Send/Return-Weg erlaubt mehrere Quellen in einem gemeinsamen Hallraum.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-016",
    "subject": "Audio & Live Sound",
    "topic": "Effekte",
    "prompt": "Wodurch entsteht bei sehr viel Delay-Feedback Gefahr?",
    "answer": "Wiederholungen können sich aufschaukeln",
    "type": "choice",
    "options": [
      "Die WAV-Datei wird kleiner",
      "Wiederholungen können sich aufschaukeln",
      "Die Sample-Rate halbiert sich",
      "Die Stimme wird automatisch lauter"
    ],
    "explanation": "Hohe Rückkopplung im Delay-Netzwerk kann Pegel aufbauen. Mit niedriger Lautstärke beginnen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-017",
    "subject": "Audio & Live Sound",
    "topic": "DAWs",
    "prompt": "Welche Grundfunktion ist DAW-unabhängig?",
    "answer": "Gain, EQ und Bus-Routing",
    "type": "choice",
    "options": [
      "Gain, EQ und Bus-Routing",
      "Nur Logic-Pro-Shortcuts",
      "Nur die Farbe der Tracks",
      "Nur ein spezielles Hersteller-Menü"
    ],
    "explanation": "DAWs unterscheiden sich in Workflows, aber grundlegende Audiokonzepte gelten systemübergreifend.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-018",
    "subject": "Audio & Live Sound",
    "topic": "DAWs",
    "prompt": "Was ist eine MIDI-Spur?",
    "answer": "Steuerdaten für Noten und Controller statt aufgezeichnetem Klang",
    "type": "choice",
    "options": [
      "Eine Audioaufnahme als WAV",
      "Steuerdaten für Noten und Controller statt aufgezeichnetem Klang",
      "Immer ein Stereo-Bus",
      "Eine fertige MP3"
    ],
    "explanation": "MIDI enthält Ereignisse wie Note-on/off, Velocity oder Controller, nicht den eigentlichen Klang.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-019",
    "subject": "Audio & Live Sound",
    "topic": "DAWs",
    "prompt": "Wofür steht Bounce oder Export?",
    "answer": "Aus Spuren ein Audiosignal beziehungsweise eine Datei erzeugen",
    "type": "choice",
    "options": [
      "Aus Spuren ein Audiosignal beziehungsweise eine Datei erzeugen",
      "Automatisches Muten",
      "Neues Mikrofon koppeln",
      "Clipping verstecken"
    ],
    "explanation": "Beim Bounce wird die Produktion zu einer Audioausgabe gerendert.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-020",
    "subject": "Audio & Live Sound",
    "topic": "DAWs",
    "prompt": "Was ist Automation in einer DAW?",
    "answer": "Zeitabhängige Änderung von Parametern",
    "type": "choice",
    "options": [
      "Zeitabhängige Änderung von Parametern",
      "Automatisches Stimmen aller Noten",
      "Nur das Speichern",
      "Ein anderes Wort für Sampling"
    ],
    "explanation": "Automation kann z. B. Lautstärke, Panorama oder Effektparameter über die Zeit ändern.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-021",
    "subject": "Audio & Live Sound",
    "topic": "Digitale Mischpulte",
    "prompt": "Was beschreibt Patching an digitalen Mischpulten?",
    "answer": "Zuordnung physischer oder digitaler Signale zu Kanälen",
    "type": "choice",
    "options": [
      "Zuordnung physischer oder digitaler Signale zu Kanälen",
      "Reparatur des Bildschirms",
      "Nur den Fader bewegen",
      "Eine Frequenz anheben"
    ],
    "explanation": "Beim Patching werden Ein- und Ausgänge auf Kanal- und Busstrukturen geroutet.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-022",
    "subject": "Audio & Live Sound",
    "topic": "Digitale Mischpulte",
    "prompt": "Wofür nutzt man Sends on Fader?",
    "answer": "Pegel eines gewählten Monitor- oder Bus-Mixes einstellen",
    "type": "choice",
    "options": [
      "Die Lautstärke aller Kanäle löschen",
      "Pegel eines gewählten Monitor- oder Bus-Mixes einstellen",
      "Den Pultspeicher formatieren",
      "Nur Haupt-LR muten"
    ],
    "explanation": "Sends on Fader zeigt Kanalanteile für einen ausgewählten Aux/Monitor-Bus auf Fadern.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-023",
    "subject": "Audio & Live Sound",
    "topic": "Digitale Mischpulte",
    "prompt": "Was ist eine DCA-Gruppe?",
    "answer": "Gemeinsame Steuerung mehrerer Kanalpegel ohne eigenen Audio-Bus",
    "type": "choice",
    "options": [
      "Eine andere XLR-Buchse",
      "Gemeinsame Steuerung mehrerer Kanalpegel ohne eigenen Audio-Bus",
      "Ein spezieller Equalizer",
      "Ein Hallalgorithmus"
    ],
    "explanation": "DCA/VCA erlaubt gemeinsame Pegelsteuerung, ohne dass zwingend die Audiosignale in einer Summenstufe zusammenlaufen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-024",
    "subject": "Audio & Live Sound",
    "topic": "Digitale Mischpulte",
    "prompt": "Was unterscheidet eine Scene von einem einzelnen EQ-Preset?",
    "answer": "Eine Scene kann zahlreiche Einstellungen des Mischpults speichern",
    "type": "choice",
    "options": [
      "Eine Scene kann zahlreiche Einstellungen des Mischpults speichern",
      "Sie ist immer analog",
      "Sie ändert nur das Mikrofonkabel",
      "Sie löscht den Masterbus"
    ],
    "explanation": "Scenes können Routing, Kanalparameter und weitere Einstellungen umfassen; Umfang und Recall-Safe variieren.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-025",
    "subject": "Audio & Live Sound",
    "topic": "Analoge Mischpulte",
    "prompt": "Wofür steht PFL?",
    "answer": "Pre-Fader Listen",
    "type": "choice",
    "options": [
      "Post-Fader Limiter",
      "Pre-Fader Listen",
      "Parallel Frequency Loop",
      "Peak Filter Level"
    ],
    "explanation": "PFL erlaubt meist Vorhören eines Signals vor dem Kanalfader, etwa zum Einpegeln.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-026",
    "subject": "Audio & Live Sound",
    "topic": "Analoge Mischpulte",
    "prompt": "Was ist ein Aux-Send?",
    "answer": "Ein separater Abzweig eines Kanals zu einem zusätzlichen Mix",
    "type": "choice",
    "options": [
      "Ein separater Abzweig eines Kanals zu einem zusätzlichen Mix",
      "Ein analoger Hauptstromstecker",
      "Immer ein EQ-Band",
      "Ein digitaler Taktgenerator"
    ],
    "explanation": "Aux-Sends dienen unter anderem Monitorwegen und Effektgeräten.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-027",
    "subject": "Audio & Live Sound",
    "topic": "Analoge Mischpulte",
    "prompt": "Warum ist der Signalfluss bei analogen Pulten wichtig?",
    "answer": "Man muss wissen, an welcher Stelle ein Signal verändert wird",
    "type": "choice",
    "options": [
      "Man muss wissen, an welcher Stelle ein Signal verändert wird",
      "Weil sie keine Fader besitzen",
      "Weil XLR nicht symmetrisch ist",
      "Weil sie immer verzerrungsfrei sind"
    ],
    "explanation": "Ein Verständnis von Insert, EQ, Aux und Faderposition hilft Fehler und Pegelprobleme einzugrenzen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-028",
    "subject": "Audio & Live Sound",
    "topic": "Analoge Mischpulte",
    "prompt": "Wozu dienen Subgruppen?",
    "answer": "Mehrere Kanalsignale zusammenfassen und gemeinsam bearbeiten",
    "type": "choice",
    "options": [
      "Mehrere Kanalsignale zusammenfassen und gemeinsam bearbeiten",
      "Ein Signal in MIDI umwandeln",
      "Nur Kopfhörer anschließen",
      "Sample-Rate verdoppeln"
    ],
    "explanation": "Subgruppen führen Audio zusammen und erlauben gemeinsames Bearbeiten bzw. Regeln.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-029",
    "subject": "Audio & Live Sound",
    "topic": "Live-Sound-Praxis",
    "prompt": "Welche Reihenfolge ist beim Soundcheck sinnvoll?",
    "answer": "Signalwege und Gain prüfen, danach Balance und Bearbeitung",
    "type": "choice",
    "options": [
      "Erst alle Effekte maximal einstellen",
      "Signalwege und Gain prüfen, danach Balance und Bearbeitung",
      "Ohne Signal alle Fader hochziehen",
      "Alle Monitore zuerst voll aufdrehen"
    ],
    "explanation": "Erst ein funktionierender und sicher gepegelter Signalweg, dann Klangbearbeitung und musikalische Balance.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-030",
    "subject": "Audio & Live Sound",
    "topic": "Live-Sound-Praxis",
    "prompt": "Was ist eine häufige Ursache für Feedback?",
    "answer": "Mikrofon nimmt verstärktes Lautsprechersignal erneut auf",
    "type": "choice",
    "options": [
      "Mikrofon nimmt verstärktes Lautsprechersignal erneut auf",
      "Der Computer hat zu wenig RAM",
      "Die Songdatei ist komprimiert",
      "Ein DI-Kabel ist zu kurz"
    ],
    "explanation": "Akustische Rückkopplung entsteht durch eine geschlossene Mikrofon-Lautsprecher-Schleife bei ausreichend hoher Verstärkung.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-031",
    "subject": "Audio & Live Sound",
    "topic": "Live-Sound-Praxis",
    "prompt": "Warum werden Monitor-Mixe oft separat erstellt?",
    "answer": "Musiker benötigen andere Mischungsverhältnisse als das Publikum",
    "type": "choice",
    "options": [
      "Musiker benötigen andere Mischungsverhältnisse als das Publikum",
      "Damit PA aus ist",
      "Weil Monitore kein EQ haben",
      "Um mehr Bit-Tiefe zu bekommen"
    ],
    "explanation": "Ein Sänger benötigt etwa mehr eigene Stimme, während Publikumsmix und Monitorbalance unterschiedliche Ziele haben.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-032",
    "subject": "Audio & Live Sound",
    "topic": "Live-Sound-Praxis",
    "prompt": "Was ist beim Aufbau eines großen Live-Systems besonders wichtig?",
    "answer": "Signalrouting, Pegel, Stromsicherheit und Hörschutz",
    "type": "choice",
    "options": [
      "Nur die Farbe der Kabel",
      "Signalrouting, Pegel, Stromsicherheit und Hörschutz",
      "Alle Lautsprecher maximal laut",
      "EQ immer aus"
    ],
    "explanation": "Zusätzlich sind sicherer Aufbau, passende Beschallung und qualifiziertes Fachpersonal entscheidend.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-033",
    "subject": "Audio & Live Sound",
    "topic": "Fehlersuche",
    "prompt": "Ein Mikrofon liefert keinen Pegel. Was prüfst du zuerst?",
    "answer": "Signalweg, Kabel, Eingang und Vorverstärkung",
    "type": "choice",
    "options": [
      "Signalweg, Kabel, Eingang und Vorverstärkung",
      "Die Farbe der Bühne",
      "Nur den Reverb",
      "Die Exportbitrate"
    ],
    "explanation": "Systematisch von der Quelle zum Ausgang prüfen: Kabel, Patching, Eingang, Gain, Mute und Routing.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-034",
    "subject": "Audio & Live Sound",
    "topic": "Fehlersuche",
    "prompt": "Es ist nur links Ton zu hören. Was kann helfen?",
    "answer": "Panorama und Kanal-/Ausgangsrouting kontrollieren",
    "type": "choice",
    "options": [
      "Nur Bass erhöhen",
      "Panorama und Kanal-/Ausgangsrouting kontrollieren",
      "Ein Delay einschalten",
      "Alle EQ-Bänder boosten"
    ],
    "explanation": "Panorama, Stereo-Kanalbelegung, defekte Leitungen und Ausgangsrouting können zu einseitigem Ton führen.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-035",
    "subject": "Audio & Live Sound",
    "topic": "Fehlersuche",
    "prompt": "Das FOH-Signal clippt trotz niedrigem Masterfader. Wo prüfen?",
    "answer": "Frühere Stufen wie Preamp, Inserts und interne Busse",
    "type": "choice",
    "options": [
      "Frühere Stufen wie Preamp, Inserts und interne Busse",
      "Nur die Bühnenbeleuchtung",
      "Nur die Boxenfarbe",
      "Nur die Sample-Rate"
    ],
    "explanation": "Clipping kann vor dem Master-Fader entstehen und wird durch späteres Absenken nicht rückgängig gemacht.",
    "steps": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "audio-036",
    "subject": "Audio & Live Sound",
    "topic": "Fehlersuche",
    "prompt": "Monitor ist stumm, obwohl der Hauptmix funktioniert. Was prüfen?",
    "answer": "Aux-Send, Monitor-Bus, Routing und Mute",
    "type": "choice",
    "options": [
      "Nur die Haupt-LR-Fader",
      "Aux-Send, Monitor-Bus, Routing und Mute",
      "Die Mikrofonfarbe",
      "Der EQ-Frequenzbereich"
    ],
    "explanation": "Monitor-Mixe haben eigene Signalpfade. Prüfe Abgriffpunkt, Sends, Bus-Mute und Ausgangspatch.",
    "steps": [],
    "aliases": [],
    "points": 2
  }
];
