#!/usr/bin/env python3
"""Lokaler Server: nur auf diesem Rechner erreichbar, ohne zusätzliche Pakete."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse
parser = argparse.ArgumentParser(description='Learning by Doing lokal starten')
parser.add_argument('--port', type=int, default=8765)
args = parser.parse_args()
folder = Path(__file__).resolve().parent / 'dist'
try:
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(folder)))
except OSError:
    raise SystemExit('Port belegt. Versuche: python3 start.py --port 8766')
print(f'Learning by Doing: http://127.0.0.1:{args.port}', flush=True)
print('Zum Beenden Strg+C drücken.', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
