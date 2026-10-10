#!/usr/bin/env python3
"""Lokale PDF-Texterkennung, mit fortsetzbarem Index; Originale bleiben unverändert."""
import argparse,hashlib,json,os,time
from pathlib import Path
import material_store
ROOT=Path(__file__).resolve().parent
ENGINE=None

def extract(path):
    import fitz
    global ENGINE
    pages=[]
    with fitz.open(path) as doc:
        for i,page in enumerate(doc):
            text=page.get_text('text');ocr=False
            if len(text.strip())<100:
                if ENGINE is None:
                    from rapidocr_onnxruntime import RapidOCR
                    ENGINE=RapidOCR(intra_op_num_threads=2,inter_op_num_threads=1)
                import numpy as np
                pix=page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
                arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)
                result,_=ENGINE(arr)
                # Niedrig bewertete OCR-Zeilen nicht als vermeintlich sichere Quelle übernehmen.
                text='\n'.join(r[1] for r in (result or []) if r[2]>=0.65);ocr=True
            pages.append({'page':i+1,'text':text,'ocr':ocr})
    return pages

def import_pdf(path,name=None):
    path=Path(path);digest=hashlib.sha256(path.read_bytes()).hexdigest()
    return material_store.put(name or path.name,extract(path),digest)

def run():
    root=ROOT/'.local-data'/'originals';catalog=json.loads((root/'catalog.json').read_text())
    # Lösungstexte zuerst: höhere Verlässlichkeit der erzeugten Musterlösungen.
    catalog.sort(key=lambda d:('Lösung' not in d.get('kind',''),d['name']))
    progress=ROOT/'.local-data'/'index-status.json';errors=[]
    def report(n,name):
        tmp=progress.with_suffix('.tmp');tmp.write_text(json.dumps({'completed':n,'total':len(catalog),'current':name,'errors':errors,'running':n<len(catalog)}));os.replace(tmp,progress)
    for i,doc in enumerate(catalog):
        report(i,doc['name'])
        if (material_store.folder()/(doc['sha256']+'.json')).exists():continue
        try:
            result=import_pdf(root/doc['file'],doc['name']);print(str(i+1)+'/'+str(len(catalog))+' '+doc['name']+' · '+str(len(result['pages']))+' Seiten',flush=True)
        except Exception as e:errors.append({'name':doc['name'],'error':type(e).__name__});print('Nicht lesbar: '+doc['name'],flush=True)
    report(len(catalog),'Abgeschlossen')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--pdf');p.add_argument('--name');args=p.parse_args()
    if args.pdf:
        result=import_pdf(args.pdf,args.name);print(json.dumps({'id':result['id'],'name':result['name'],'pages':len(result['pages']),'topics':result['topics']}))
    else:run()
