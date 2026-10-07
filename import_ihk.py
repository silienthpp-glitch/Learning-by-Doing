#!/usr/bin/env python3
"""Importiert eigene PDF-Unterlagen ausschließlich in das ignorierte lokale Archiv."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import unicodedata
import zipfile

ROOT = Path(__file__).resolve().parent
GROUPS = {'Teil1': 'IT-Systeme', 'Teil2': 'Netzwerke', 'Teil3': 'WiSo', 'U-form': 'Übungsmaterial', 'Alte AO': 'Alte Ausbildungsordnung'}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('zipfile', type=Path)
    args = parser.parse_args()
    folder = ROOT / 'dist' / 'private-ihk'
    folder.mkdir(parents=True, exist_ok=True)
    catalog = folder / 'catalog.json'
    entries = json.loads(catalog.read_text()) if catalog.exists() else []
    known = {x['sha256'] for x in entries}
    added = 0
    with zipfile.ZipFile(args.zipfile) as archive:
        infos = archive.infolist()
        if sum(i.file_size for i in infos) > 2_000_000_000:
            raise ValueError('Archiv ist größer als 2 GB.')
        for info in infos:
            name = unicodedata.normalize('NFC', info.filename)
            path = PurePosixPath(name)
            if path.is_absolute() or '..' in path.parts or '\\' in name:
                raise ValueError('Unsicherer Archivpfad: ' + name)
            if info.is_dir() or path.suffix.lower() != '.pdf':
                continue
            data = archive.read(info)  # ZIP-Prüfsumme wird dabei geprüft.
            if not data.startswith(b'%PDF-'):
                raise ValueError('Keine gültige PDF-Kennung: ' + name)
            digest = hashlib.sha256(data).hexdigest()
            if digest in known:
                continue
            dest = folder / (digest + '.pdf')
            if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest() != digest:
                raise ValueError('Vorhandene Datei stimmt nicht mit Prüfsumme überein.')
            if not dest.exists():
                with dest.open('xb') as output:
                    output.write(data)
            group = next((GROUPS[p] for p in path.parts if p in GROUPS), 'Weitere Unterlagen')
            match = re.search(r'(Sommer|Winter)_(\d{2})', path.name)
            term = f'{match[1]} 20{match[2]}' if match else ''
            solution = 'lösung' in name.lower()
            entries.append({'name': path.name, 'originalPath': name, 'group': group,
                            'term': term, 'kind': 'Lösung' if solution else 'Aufgaben',
                            'sha256': digest, 'bytes': len(data), 'file': digest + '.pdf'})
            known.add(digest)
            added += 1
    temp = catalog.with_suffix('.tmp')
    temp.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')
    temp.replace(catalog)
    print(f'{added} neue PDFs; {len(entries)} eindeutige Dokumente im lokalen Archiv.')

if __name__ == '__main__':
    main()
