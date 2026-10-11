#!/usr/bin/env python3
"""Interaktive Einrichtung: Schlüssel nie als Argument oder Log ausgeben."""
import getpass
import json
import os
from pathlib import Path
import tempfile
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parent
MODEL = 'gpt-5.4-mini'

def write_private(path, text):
    if path.is_symlink():
        raise ValueError('Verknüpfungen werden aus Sicherheitsgründen nicht überschrieben.')
    fd, temporary = tempfile.mkstemp(prefix='.ki-setup-', dir=str(path.parent))
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(text)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):os.unlink(temporary)

def check_access(key, opener=None):
    request=urllib.request.Request('https://api.openai.com/v1/models/'+MODEL,headers={'Authorization':'Bearer '+key})
    try:
        with (opener or urllib.request.urlopen)(request,timeout=20) as response:
            result=json.loads(response.read(200000))
        if result.get('id')!=MODEL:raise ValueError('Der Modellzugriff konnte nicht bestätigt werden.')
    except urllib.error.HTTPError as error:
        if error.code==401:raise ValueError('Der Schlüssel wurde abgelehnt. Bitte einen gültigen OpenAI-API-Schlüssel verwenden.') from None
        if error.code in (403,404):raise ValueError('Kein Zugriff auf das gewählte Modell. Projektberechtigungen im OpenAI-Konto prüfen.') from None
        raise ValueError('OpenAI meldet HTTP '+str(error.code)+'. Bitte später erneut versuchen.') from None
    except (urllib.error.URLError,TimeoutError):
        raise ValueError('OpenAI nicht erreichbar. Internetverbindung prüfen.') from None

def main():
    print('Learning by Doing – OpenAI einrichten\n')
    print('Modell: '+MODEL)
    print('Die API ist kostenpflichtig. Die Einrichtung prüft nur den Modellzugriff; sie erzeugt keine Aufgaben.')
    print('Der Schlüssel wird ausschließlich an die offizielle OpenAI-API zur Anmeldung gesendet.')
    print('Er wird lokal in .openai-api-key mit Zugriff nur für dein Benutzerkonto gespeichert (unverschlüsselt).')
    print('Er gehört weder in den Chat noch in GitHub. Unterrichtstexte werden erst nach Freigabe in der App übertragen.\n')
    print('Schlüssel erstellen: https://platform.openai.com/api-keys')
    if input('OpenAI einrichten und Schlüssel lokal speichern? Tippe ja: ').strip().lower()!='ja':
        print('Abgebrochen. Nichts geändert.');return
    key=getpass.getpass('API-Schlüssel einfügen (Eingabe bleibt unsichtbar): ').strip()
    if not key.startswith('sk-') or any(c.isspace() for c in key):raise ValueError('Das sieht nicht wie ein OpenAI-API-Schlüssel aus.')
    print('Modellzugriff wird geprüft …')
    check_access(key)
    config_path=ROOT/'ai-config.json'
    if config_path.exists():
        old=json.loads(config_path.read_text())
        if old.get('provider') not in ('disabled','openai'):
            if input('Vorhandenen KI-Anbieter durch OpenAI ersetzen? Tippe ja: ').strip().lower()!='ja':return
    write_private(ROOT/'.openai-api-key',key+'\n')
    write_private(config_path,json.dumps({'provider':'openai','model':MODEL},indent=2)+'\n')
    print('\nSchlüssel und Modellzugriff bestätigt. Verfügbares Guthaben und Aufgabenerstellung sind damit noch nicht getestet.')
    print('Jetzt den bisherigen Lernserver mit Strg+C beenden und Start.command doppelt anklicken.')
    print('Danach im bisherigen Browser http://127.0.0.1:8765/#library öffnen.')

if __name__=='__main__':
    try:main()
    except (ValueError,OSError) as error:print('Einrichtung nicht abgeschlossen: '+str(error))
    except (KeyboardInterrupt,EOFError):print('\nAbgebrochen.')
    finally:
        try:input('\nEnter drücken, um dieses Fenster zu schließen …')
        except (EOFError,KeyboardInterrupt):pass
