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
import ai_service
import material_store
import base64
import hashlib
import subprocess
import sys

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
        if self.path in ('/api/teacher/status','/api/ai/status'):
            try:return self.send_json(200,{**ai_service.status(),'token':TOKEN,'version':6})
            except (ValueError,OSError):return self.send_json(200,{'ready':False,'provider':'ollama','error':'KI-Einstellungen nicht lesbar.','token':TOKEN,'version':6})
        if self.path == '/api/materials':
            result=material_store.catalog()
            progress=ROOT/'.local-data'/'index-status.json'
            if progress.exists():
                try:result['index']=json.loads(progress.read_text())
                except ValueError:pass
            return self.send_json(200,result)
        if self.path.startswith('/api/jobs/'):
            try:return self.send_json(200,ai_service.job(self.path.rsplit('/',1)[-1]))
            except ValueError as error:return self.send_json(404,{'error':str(error)})
        if self.path.startswith('/api/'):
            return self.send_json(404, {'error': 'Unbekannte Funktion.'})
        super().do_GET()

    def do_POST(self):
        if not self.local_request() or self.headers.get('X-Teacher-Token') != TOKEN:
            return self.send_json(403, {'error': 'Verbindung zum Lernserver wurde erneuert. Seite neu laden und erneut versuchen.'})
        if self.path not in ('/api/teacher/generate','/api/ai/settings','/api/sets','/api/grade','/api/materials/upload'):
            return self.send_json(404, {'error': 'Unbekannte Funktion.'})
        if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
            return self.send_json(415, {'error': 'JSON erforderlich.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 25_000_000:
                raise ValueError('Anfrage zu groß oder leer.')
            self.connection.settimeout(15)
            data = json.loads(self.rfile.read(length))
            if not isinstance(data,dict):raise ValueError()
            if self.path=='/api/teacher/generate':teacher_engine.validate_request(data)
        except (ValueError, OSError):
            return self.send_json(400, {'error': 'Ungültige Anfrage. Textumfang und Freigabe prüfen.'})
        if self.path != '/api/teacher/generate':
            try:
                if self.path=='/api/ai/settings':result=ai_service.select(data)
                elif self.path=='/api/sets':result=ai_service.begin(data)
                elif self.path=='/api/grade':result=ai_service.grade(data)
                else:result=import_material(data)
                return self.send_json(200,result)
            except ValueError as error:return self.send_json(422,{'error':str(error)})
            except Exception:return self.send_json(500,{'error':'Verarbeitung fehlgeschlagen. Deine gespeicherten Daten bleiben erhalten.'})
        if not GENERATION_LOCK.acquire(blocking=False):
            return self.send_json(409, {'error': 'Es läuft bereits eine Erstellung. Bitte deren Ergebnis abwarten.'})
        try:
            pack = teacher_engine.generate(data,caller=lambda cfg,instructions,payload: ai_service.model(cfg,instructions,payload,teacher_engine.schema_for(payload.get('mode','mixed'))),cfg=ai_service.cfg_for(data))
            self.send_json(200, pack)
        except ValueError as error:
            self.send_json(422, {'error': str(error)})
        except Exception:
            self.send_json(500, {'error': 'Erstellung fehlgeschlagen. Es wurden keine Fragen gespeichert. Lokale KI-Konfiguration prüfen.'})
        finally:
            GENERATION_LOCK.release()


def import_material(data):
    name=str(data.get('name','Unterlage'))[:250]
    if 'pdf' in data:
        try:raw=base64.b64decode(data['pdf'],validate=True)
        except Exception:raise ValueError('PDF-Datei nicht lesbar.') from None
        if len(raw)>15_000_000 or not raw.startswith(b'%PDF'):raise ValueError('Bitte eine gültige PDF bis 15 MB wählen.')
        folder=ROOT/'.local-data'/'uploads';folder.mkdir(parents=True,exist_ok=True)
        path=folder/(hashlib.sha256(raw).hexdigest()+'.pdf')
        if not path.exists():path.write_bytes(raw)
        python=ROOT/'.runtime'/'python'/'bin'/'python'
        if not python.exists():raise ValueError('PDF-Texterkennung noch nicht eingerichtet. Bitte TXT importieren oder Ollama-einrichten.command ausführen.')
        try:
            result=subprocess.run([str(python),'-B',str(ROOT/'index_materials.py'),'--pdf',str(path),'--name',name],capture_output=True,text=True,timeout=1200)
            if result.returncode:raise ValueError('PDF konnte nicht ausgelesen werden. Möglicherweise beschädigt oder passwortgeschützt.')
            return json.loads(result.stdout)
        except subprocess.TimeoutExpired:raise ValueError('Texterkennung dauert zu lange. PDF bitte in kleinere Dateien aufteilen.') from None
    doc=material_store.put(name,data.get('pages'))
    return {'id':doc['id'],'name':doc['name'],'pages':len(doc['pages']),'topics':doc['topics']}


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
