#!/usr/bin/env python3
"""Lokaler Lernserver; Schlüssel und Originaldateien werden nicht als API veröffentlicht."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import errno
import json
import secrets
import threading
import webbrowser
from urllib.parse import urlsplit
import teacher_engine

ROOT = Path(__file__).resolve().parent
TOKEN = secrets.token_urlsafe(32)
GENERATION_LOCK = threading.Lock()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'dist'), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def local_request(self):
        host = self.headers.get('Host', '')
        try:
            parsed = urlsplit('http://' + host)
            valid = parsed.hostname in ('localhost', '127.0.0.1') and parsed.port is not None
        except ValueError:
            valid = False
        origin = self.headers.get('Origin')
        return valid and (origin is None or origin == 'http://' + host)

    def send_json(self, status, data):
        raw = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.end_headers()
        try:
            self.wfile.write(raw)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        if not self.local_request():
            return self.send_json(403, {'error': 'Nur über localhost oder 127.0.0.1 öffnen.'})
        if self.path == '/api/teacher/status':
            try:
                return self.send_json(200, {**teacher_engine.config(), 'token': TOKEN, 'version': 5})
            except (ValueError, OSError):
                return self.send_json(200, {'ready': False, 'provider': 'disabled', 'error': 'ai-config.json ist nicht lesbar oder ungültig.', 'version': 5})
        if self.path.startswith('/api/'):
            return self.send_json(404, {'error': 'Unbekannte Funktion.'})
        super().do_GET()

    def do_POST(self):
        if not self.local_request() or self.headers.get('X-Teacher-Token') != TOKEN:
            return self.send_json(403, {'error': 'Freigabe abgelaufen. Seite neu laden.'})
        if self.path != '/api/teacher/generate':
            return self.send_json(404, {'error': 'Unbekannte Funktion.'})
        if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
            return self.send_json(415, {'error': 'JSON erforderlich.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 400000:
                raise ValueError('Anfrage zu groß oder leer.')
            self.connection.settimeout(15)
            data = json.loads(self.rfile.read(length))
            teacher_engine.validate_request(data)
        except (ValueError, OSError):
            return self.send_json(400, {'error': 'Ungültige Anfrage. Textumfang und Freigabe prüfen.'})
        if not GENERATION_LOCK.acquire(blocking=False):
            return self.send_json(409, {'error': 'Es läuft bereits eine Erstellung. Bitte deren Ergebnis abwarten.'})
        try:
            pack = teacher_engine.generate(data)
            self.send_json(200, pack)
        except ValueError as error:
            self.send_json(422, {'error': str(error)})
        except Exception:
            self.send_json(500, {'error': 'Erstellung fehlgeschlagen. Es wurden keine Fragen gespeichert. Lokale KI-Konfiguration prüfen.'})
        finally:
            GENERATION_LOCK.release()


def main():
    parser = argparse.ArgumentParser(description='Learning by Doing lokal starten')
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--open-browser', action='store_true')
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    except OSError as error:
        if error.errno == errno.EADDRINUSE:
            raise SystemExit(f'Port {args.port} belegt. Vorhandene Seite öffnen: http://127.0.0.1:{args.port}\nFür ein Update den bisherigen Server mit Strg+C beenden und erneut starten.')
        raise SystemExit('Server konnte nicht starten: ' + str(error))
    url = f'http://127.0.0.1:{args.port}'
    print(f'Learning by Doing: {url}\nZum Beenden Strg+C drücken.', flush=True)
    if args.open_browser:
        threading.Timer(0.5, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
