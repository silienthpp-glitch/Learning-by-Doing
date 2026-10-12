# Learning by Doing – Desktop für macOS, Windows und Linux

Die bestehende Webversion bleibt vollständig verfügbar: `python3 start.py`.
Die Desktop-App verwendet **Tauri 2**, die vorhandenen Dateien unter `dist/` und eine schlanke native Rust-Brücke.

## Entwicklungsumgebung: macOS M4

Installiere einmalig Xcode Command Line Tools, Rust und Node.js.

```bash
xcode-select --install
```

Rust: https://rustup.rs/  ·  Node.js: https://nodejs.org/

Im **bestehenden Projektordner**:

```bash
npm install
npm run desktop:icons
npm run desktop:dev
```

Zum Erstellen der `.app` / `.dmg`:

```bash
npm run desktop:build
```

Die Installer liegen anschließend unter `src-tauri/target/release/bundle/`.
Die GitHub Actions unter `.github/workflows/desktop-build.yml` bauen separat unter macOS, Windows und Linux. Für Apple Silicon wird auf einem Apple-Silicon-Runner gebaut, sofern GitHub einen solchen Runner für das Repository zur Verfügung stellt.

## Ollama

Ollama ist eine **separat zu installierende lokale Anwendung**. Ohne Ollama startet die Desktop-App dennoch, aber KI-Funktionen benötigen einen laufenden Modellserver.

```bash
ollama pull qwen3.5:4b
ollama serve
```

Falls Ollama bereits als Anwendung läuft, muss `ollama serve` nicht erneut gestartet werden.

## Optional: OpenAI-Konfiguration

OpenAI ist nicht erforderlich. Für die Desktop-App kann der Schlüssel über `OPENAI_API_KEY` als Umgebungsvariable oder in einer **privaten** `.env` im App-Konfigurationsordner bereitgestellt werden. Beim Entwickeln wird zusätzlich die bestehende Projekt-`.env` gelesen. Der Key wird nicht ans Frontend ausgeliefert.

Die Datenverzeichnisse unterscheiden sich je Betriebssystem. Die Tauri-Kennung lautet `de.learningbydoing.desktop`.

## Datenmigration: bestehende Lernsets behalten

**Wichtig:** Die Desktop-App hat eine eigene WebView und kann die Browserdaten deiner bisherigen Webseite nicht automatisch sehen.

1. Öffne die bisherige Webversion und lade unter **Fortschritt → Sicherung herunterladen** eine Sicherung herunter.
2. Öffne danach die Desktop-App.
3. Verwende dort unter **Fortschritt → Sicherung wiederherstellen** deine JSON-Sicherung.

Damit werden die vorhandenen Lernsets, Fragen, Quellen, Fortschritt und Einstellungen übertragen. Vorhandene Daten nicht manuell löschen.

## Projektaufbau und Ressourcenverbrauch

- `dist/`: die **eine** gemeinsame Web-GUI; keine React-, Angular- oder Electron-Laufzeit.
- `src-tauri/src/lib.rs`: native Rust-Kommandos für Status, Fragengenerierung und Antwortbewertung.
- `dist/desktop-bridge.js`: verbindet dieselbe Oberfläche mit Tauri, wenn sie als Desktop-App läuft.
- `start.py`: bleibt für die normale Webversion erhalten.
- `src-tauri/tauri.conf.json`: Fenstergröße und Desktop-Buildkonfiguration.
- `.github/workflows/desktop-build.yml`: automatische Installationstests/Builds je Betriebssystem.

Die Desktop-App benötigt keinen permanenten Python-Server. Ollama selbst kann abhängig vom Modell viel RAM verwenden.

## Sicherheitsgrenzen

Die Desktop-Brücke erlaubt ausschließlich drei KI-Funktionen. Keine Shell-Befehle und keine beliebigen Netzwerkziele sind aus der Webseite freigegeben. Ollama darf nur lokal unter `localhost` oder `127.0.0.1` angesprochen werden.

Die appweiten Browserdaten werden weiterhin im persistenten WebView-Speicher abgelegt. Für spätere größere PDF-Bestände empfiehlt sich eine gezielte Migration in eine lokale Datenbank; das ist **noch nicht** umgesetzt.
