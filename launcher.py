"""Ein gemeinsamer lokaler Start; vorhandene Prozesse und Browserdaten behalten."""
from pathlib import Path
import argparse,json,os,subprocess,sys,time,urllib.request,webbrowser
ROOT=Path(__file__).resolve().parent

def fetch(url):
    try:
        with urllib.request.urlopen(url,timeout=2) as r:return json.load(r)
    except (OSError,ValueError):return None

def own_server(port):
    data=fetch('http://127.0.0.1:'+str(port)+'/api/ai/status')
    return isinstance(data,dict) and data.get('projectId')==str(ROOT)

def remembered_port():
    try:
        value=json.loads((ROOT/'.local-data'/'start-settings.json').read_text())['port']
        if type(value)is int and 1024<=value<=65535:return value
    except (OSError,ValueError,KeyError):pass
    return 8765

def start_ollama():
    if fetch('http://127.0.0.1:11434/api/tags') is not None:return True
    runtime=ROOT/'.runtime'/'ollama'/'ollama'
    if not runtime.is_file():
        print('Ollama fehlt. Bitte einmal Ollama-einrichten.command im Projektordner öffnen.');return False
    folder=ROOT/'.local-data';folder.mkdir(exist_ok=True)
    env={**os.environ,'OLLAMA_HOST':'127.0.0.1:11434','OLLAMA_MODELS':str(ROOT/'.runtime'/'models'),'OLLAMA_NO_CLOUD':'1'}
    with (folder/'ollama-start.log').open('ab') as log:
        process=subprocess.Popen([str(runtime),'serve'],cwd=str(ROOT),env=env,stdout=log,stderr=log,start_new_session=True)
    for _ in range(30):
        if fetch('http://127.0.0.1:11434/api/tags') is not None:return True
        if process.poll() is not None:break
        time.sleep(1)
    print('Lokale KI konnte nicht gestartet werden. Öffne Ollama-starten.command; Details stehen lokal in .local-data/ollama-start.log.');return False

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--no-browser',action='store_true');parser.add_argument('--port',type=int);args=parser.parse_args()
    port=args.port or remembered_port()
    if not 1024<=port<=65535:parser.error('Port muss zwischen 1024 und 65535 liegen.')
    start_ollama()
    url='http://127.0.0.1:'+str(port)+'/#dashboard'
    if own_server(port):
        print('Deine Lernplattform läuft bereits: '+url)
        if not args.no_browser:webbrowser.open(url)
        return
    # Keep the same address; do not silently switch to another browser storage origin.
    command=[sys.executable,'-B',str(ROOT/'start.py'),'--port',str(port)]
    if not args.no_browser:command.append('--open-browser')
    raise SystemExit(subprocess.call(command,cwd=str(ROOT)))

if __name__=='__main__':main()
