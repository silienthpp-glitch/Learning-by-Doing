"""Persistente lokale Textbibliothek. Keine Originale oder Auszüge an GitHub."""
from pathlib import Path
import hashlib,json,re,threading,os
ROOT=Path(__file__).resolve().parent
LOCK=threading.RLock()
TOPICS={
'Datenbanken':['datenbank','sql','normalform','normalisier','primärschlüssel','primary key','foreign key','fremdschlüssel','entität','entity','relationale','referenzielle','select ','erd','tabelle','datentyp','varchar','char','char(','sql-abfrage','normalformen','count(','sum(','avg('],
'Netzwerktechnik':['netzwerk','subnetz','subnet','ipv4','ipv6','routing','router','vlan','switch','dhcp','dns','tcp','udp','cidr','ethernet'],
'IT-Sicherheit':['sicherheit','firewall','verschlüssel','schutzziel','authentifiz','authentisier','zertifikat','angriff','datenschutz','malware','vpn','berechtigung','mfa','multi-faktor','xss','injection'],
'IT-Systeme':['raid','server','virtualisierung','hypervisor','backup','sicherung','speicher','betriebssystem','prozessor','verfügbarkeit','cloud'],
'Wirtschaft und Soziales':['arbeitsvertrag','tarifvertrag','betriebsrat','sozialversicherung','kündigung','ausbildung','markt','wirtschaft','kaufvertrag'],
'Projektmanagement':['projekt','lastenheft','pflichtenheft','meilenstein','netzplan','gantt','amortisation','kalkulation','kostenvergleich'],
'Programmierung':['algorithmus','pseudocode','programmierung','schleife','variable','funktion','array','objektorient','uml']}
def folder():
    p=ROOT/'.local-data'/'materials';p.mkdir(parents=True,exist_ok=True);return p

def normalize(text):return re.sub(r'\s+',' ',text).strip()
def keyword_pattern(term):
    short=len(term.strip())<=4
    return (r'(?<![a-zäöüß])' if short else '')+re.escape(term)+(r'(?![a-zäöüß])' if short and term[-1].isalpha() else '')
def score(text,topic):
    lower=text.lower()
    return sum(min(len(re.findall(keyword_pattern(term),lower)),8) for term in TOPICS.get(topic,[topic.lower()]) if len(term)>2)
def topics_for(text):return [t for t in TOPICS if score(text,t)>=2]
def put(name,pages,document_id=None):
    if not isinstance(name,str) or not name.strip() or not isinstance(pages,list) or not 1<=len(pages)<=500:raise ValueError('Dokumentname und 1–500 Seiten erforderlich.')
    clean=[]
    for i,p in enumerate(pages):
        if not isinstance(p,dict) or not isinstance(p.get('text'),str) or len(p['text'])>100000:raise ValueError('Ungültiger Dokumenttext.')
        page=p.get('page',i+1)
        if type(page)is not int or page<1:raise ValueError('Ungültige Seitennummer.')
        clean.append({'page':page,'text':p['text'],'ocr':bool(p.get('ocr'))})
    if len(json.dumps(clean))>12_000_000:raise ValueError('Dokument zu groß.')
    digest=hashlib.sha256(json.dumps(clean,sort_keys=True).encode()).hexdigest()
    did=document_id or digest[:24]
    if not re.fullmatch(r'[a-f0-9]{16,64}',did):raise ValueError('Ungültige Dokument-ID.')
    value={'id':did,'name':name[:250],'pages':clean,'digest':digest,'topics':topics_for(' '.join(p['text'] for p in clean))}
    with LOCK:
        path=folder()/(did+'.json');tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False));os.replace(tmp,path)
    return value

def all_docs():
    with LOCK:
        result=[]
        for path in folder().glob('*.json'):
            try:result.append(json.loads(path.read_text()))
            except (ValueError,OSError):continue
        return result

TOPIC_CACHE={}
def document_topics(doc):
    key=(doc['id'],doc['digest'])
    if key not in TOPIC_CACHE:TOPIC_CACHE[key]=topics_for(' '.join(p['text'] for p in doc['pages']))
    return TOPIC_CACHE[key]

def catalog():
    docs=all_docs();topics=[document_topics(d) for d in docs]
    return {'documents':[{'id':d['id'],'name':d['name'],'pages':len(d['pages']),'topics':ts,'readablePages':sum(len(p['text'].strip())>=80 for p in d['pages'])} for d,ts in zip(docs,topics)],
        'topics':[{'name':t,'documents':sum(t in ts for ts in topics)} for t in TOPICS]}

def retrieve(topic,limit=20):
    if topic not in TOPICS:raise ValueError('Bitte ein vorhandenes Thema auswählen.')
    ranked=[]
    for doc in all_docs():
        for page in doc['pages']:
            text=normalize(page['text'])
            # Überlappende Abschnitte halten Aufgaben und ihre Kontextangaben zusammen.
            anchors=sorted({m.start() for term in TOPICS[topic] for m in re.finditer(keyword_pattern(term),text.lower())})
            for offset in anchors:
                chunk=text[max(0,offset-120):offset+1800];rank=score(chunk,topic)
                if rank>=2 and len(chunk)>=100:
                    ranked.append({'text':chunk,'rank':rank,'documentId':doc['id'],'sourceName':doc['name'],'sourcePage':page['page'],'sourceOffset':offset,'digest':doc['digest']})
    def relevance(p):
        other=max((score(p['text'],t) for t in TOPICS if t!=topic),default=0)
        purity=p['rank']/max(p['rank'],other,1)
        bonus=3 if re.search(r'(lsg|lösung|_l\.pdf)',p['sourceName'].lower()) else 0
        return (p['rank']+bonus)*purity
    ranked.sort(key=relevance,reverse=True)
    selected=[];seen=set()
    for p in ranked:
        # Ein Abschnitt je Quellseite verhindert überlappende Doppelaufgaben.
        k=(p['documentId'],p['sourcePage'])
        if k in seen:continue
        seen.add(k);selected.append(p)
        if len(selected)>=limit:break
    if not selected:raise ValueError('Keine ausreichend lesbaren Unterlagen zu „'+topic+'“ gefunden. Passende Unterlagen importieren oder die lokale Texterkennung abwarten.')
    return selected

def related_context(source,topic):
    """Passendes Aufgabenblatt ergänzt eine Lösungsseite, ohne die Belege zu ersetzen."""
    def exam_key(name):
        name=re.sub(r'(lösungen?|lsg|aufgaben|_l(?=\.pdf$))','',name.lower())
        return re.sub(r'[^a-z0-9äöüß]','',name)
    key=exam_key(source['sourceName'])
    words=set(re.findall(r'[a-zäöüß_][a-zäöüß_0-9]{3,}',source['text'].lower()))
    candidates=[]
    for doc in all_docs():
        if doc['id']==source['documentId'] or exam_key(doc['name'])!=key:continue
        for page in doc['pages']:
            text=normalize(page['text'])
            if len(text)<100 or not score(text,topic):continue
            overlap=len(words & set(re.findall(r'[a-zäöüß_][a-zäöüß_0-9]{3,}',text.lower())))
            candidates.append((overlap,score(text,topic),doc,page,text))
    if not candidates:return []
    _,_,doc,page,text=max(candidates,key=lambda item:(item[0],item[1]))
    return [{'document':doc['name'],'page':page['page'],'text':text[:4000]}]
