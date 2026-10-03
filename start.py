#!/usr/bin/env python3
"""Lokaler Server: nur auf diesem Rechner erreichbar, ohne zusätzliche Pakete."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse
import threading
import webbrowser
parser = argparse.ArgumentParser(description='Learning by Doing lokal starten')
parser.add_argument('--port', type=int, default=8765)
parser.add_argument('--open-browser', action='store_true', help='öffnet die Lernseite nach dem Start automatisch')
args = parser.parse_args()
folder = Path(__file__).resolve().parent / 'dist'
try:
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(folder)))
except OSError:
    raise SystemExit('Port belegt. Versuche: python3 start.py --port 8766')
print(f'Learning by Doing: http://127.0.0.1:{args.port}', flush=True)
print('Zum Beenden Strg+C drücken.', flush=True)
if args.open_browser:
    threading.Timer(1.0, webbrowser.open, args=(f'http://127.0.0.1:{args.port}',)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
