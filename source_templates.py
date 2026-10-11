"""Eigene Lernvorlagen; nur mit einem konkreten passenden lokalen Quellenbeleg."""
import re,unicodedata

def candidates(evidence):
    templates=[
      ('CHAR',('char','fest'), 'choice','Welcher SQL-Datentyp deklariert Zeichenketten fester Länge von 5 Zeichen?',
       'CHAR(5)', ['CHAR(5)','VARCHAR(5)','INTEGER'], [],'CHAR bezeichnet eine feste Zeichenlänge; kürzere Werte werden mit Leerzeichen aufgefüllt.'),
      ('VARCHAR',('varchar','telefonnummer'), 'choice','Welcher SQL-Datentyp deklariert Zeichenketten variabler Länge mit höchstens 16 Zeichen?',
       'VARCHAR(16)', ['CHAR(16)','VARCHAR(16)','DATE'], [],'VARCHAR erlaubt variable Zeichenlängen bis zur angegebenen Grenze.'),
      ('COUNT',('selectcount(*)from','where'), 'calculation','Die SQL-Tabelle Windrad hat die Spalten ID und IDWindpark. Sie enthält genau drei Zeilen: (1, 102), (2, 103), (3, 102). Wie viele Datensätze gehören zum Windpark 102? Schreiben Sie auch die SQL-Abfrage zum Zählen.',
       '2 Datensätze. SELECT COUNT(*) FROM Windrad WHERE IDWindpark = 102;', [], [('Ergebnis: zwei Datensätze.',1),('SELECT COUNT(*) FROM Windrad WHERE IDWindpark = 102; oder sinngleiche korrekte SQL-Abfrage.',1)],'Die erste und dritte Zeile erfüllen IDWindpark = 102. WHERE filtert diese Zeilen; COUNT(*) zählt sie.'),
      ('CREATE',('createtable','erzeugt'), 'selfcheck','Wozu dient CREATE TABLE in SQL?',
       'CREATE TABLE erzeugt eine neue Tabelle mit der angegebenen Spaltenstruktur.', [], [('Neue Tabelle mit vorgegebener Spaltenstruktur erzeugen.',1)],'CREATE TABLE legt die Tabellenstruktur an. Datensätze werden anschließend beispielsweise mit INSERT hinzugefügt.'),
      ('ADD',('altertable','addcolumn'), 'case','In der SQL-Tabelle Kunden fehlt die Spalte Email. Ergänzen Sie eine Spalte Email für Zeichenketten variabler Länge mit höchstens 100 Zeichen. Geben Sie die SQL-Anweisung an.',
       'ALTER TABLE Kunden ADD COLUMN Email VARCHAR(100);', [], [('ALTER TABLE Kunden und ADD COLUMN Email verwenden (ADD Email ebenfalls zulässig).',1),('Datentyp VARCHAR(100) für die vorgegebene Spalte verwenden.',1)],'ALTER TABLE ändert eine bestehende Tabelle. ADD COLUMN fügt die Spalte hinzu; VARCHAR(100) begrenzt ihre Zeichenlänge.'),
      ('FOREIGN',('foreignkey','references'), 'multi','Welche zwei SQL-Bestandteile werden zur Definition eines Fremdschlüssels und seiner Zieltabelle verwendet?',
       'FOREIGN KEY; REFERENCES', ['FOREIGN KEY','REFERENCES','ORDER BY','DROP TABLE'], [],'FOREIGN KEY bezeichnet die Fremdschlüsselspalte; REFERENCES benennt die referenzierte Tabelle und Spalte.'),
      ('DELETE',('deletefrom','datens'), 'choice','Welcher SQL-Befehl löscht Datensätze aus einer Tabelle?',
       'DELETE FROM', ['DELETE FROM','CREATE TABLE','GRANT'], [],'DELETE FROM löscht Datensätze. Ohne WHERE-Bedingung werden alle Datensätze der Tabelle gelöscht; die Tabellenstruktur bleibt bestehen.'),
      ('UPDATE',('update','aktualisiert'), 'choice','Welcher SQL-Befehl verändert Feldwerte bereits vorhandener Datensätze?',
       'UPDATE … SET', ['UPDATE … SET','INSERT INTO','DROP TABLE'], [],'UPDATE mit SET weist Feldern neue Werte zu. Eine WHERE-Bedingung kann die betroffenen Datensätze eingrenzen.'),
      ('DBS',('datenbanksystem(dbs)','datenbankmanagementsystem(dbms)'), 'truefalse','Ein Datenbanksystem besteht aus einem Datenbankmanagementsystem und der eigentlichen Datenbank.',
       'Richtig', ['Richtig','Falsch'], [],'Das Datenbankmanagementsystem verwaltet die Datenbank. Zusammen bilden sie das Datenbanksystem.'),
      ('AVG',('avg(','arithmetischemittel'), 'calculation','Die SQL-Spalte Messung.Wert enthält genau die Werte 10, 20 und 30 (keine NULL-Werte). Welches Ergebnis liefert SELECT AVG(Wert) FROM Messung;? Zeigen Sie den Rechenweg.',
       '20. (10 + 20 + 30) / 3 = 20.', [], [('Summe 60 durch die Anzahl 3 teilen.',1),('Ergebnis 20 nennen.',1)],'AVG bildet das arithmetische Mittel der Werte: Summe geteilt durch Anzahl.'),
      ('SUM',('sum(','summe'), 'calculation','Die SQL-Spalte Bestellung.Menge enthält genau 2, 5 und 3 (keine NULL-Werte). Welches Ergebnis liefert SELECT SUM(Menge) FROM Bestellung;? Zeigen Sie den Rechenweg.',
       '10. 2 + 5 + 3 = 10.', [], [('Die drei Werte addieren: 2 + 5 + 3.',1),('Ergebnis 10 nennen.',1)],'SUM addiert die Werte der ausgewählten Spalte.'),
      ('INTEGER',('integer','ganzzahl'), 'choice','Welcher SQL-Datentyp ist für Ganzzahlen vorgesehen?',
       'INTEGER', ['INTEGER','DATE','VARCHAR(50)'], [],'INTEGER ist ein numerischer Ganzzahltyp. DATE speichert Datumswerte und VARCHAR Zeichenketten.'),
    ]
    return _build(templates,evidence)

def _build(templates,evidence):
    result=[]
    for focus,markers,kind,prompt,answer,options,criteria,explanation in templates:
        match=next((e for e in evidence if all(m in re.sub(r'\s+','',unicodedata.normalize('NFKC',e['quote']).casefold()) for m in markers)),None)
        if not match:continue
        correct=answer.split('; ') if kind=='multi' else [answer]
        result.append({'type':kind,'subtopic':focus,'prompt':prompt,'answer':'' if options else answer,
          'choices':[{'text':o,'correct':o in correct} for o in options],
          'criteria':[{'text':t,'points':p} for t,p in criteria], 'explanation':explanation,
          'sourceId':match['sourceId'],'evidence':match['quote'], 'teachingFocus':'Vorlage '+focus,
          'creationMethod':'Quellengebundene Lernvorlage'})
    return result


def storage_candidates(evidence):
    """Eigene Fachaufgaben, ausschließlich bei passendem Beleg aus dem gewählten Set."""
    templates=[
      ('DAS-Anschluss',('punkt-zu-punkt','sas','direkt'), 'choice','Wie wird der Speicher bei Direct Attached Storage (DAS) im beschriebenen Aufbau angeschlossen?',
       'Direkt über SAS an den Server', ['Direkt über SAS an den Server','Ausschließlich über eine SMB-Freigabe','Über einen Fibre-Channel-Switch'], [],'DAS verbindet den Speicher unmittelbar mit dem Server über eine Punkt-zu-Punkt-Verbindung.'),
      ('DAS-Distanz',('sas','zehnmeter'), 'truefalse','Für die im Informationstext beschriebene SAS-Verbindung eines DAS werden maximal zehn Meter Abstand zum Server angegeben.',
       'Richtig', ['Richtig','Falsch'], [],'Der Text nennt für diesen SAS-Aufbau maximal zehn Meter. Die Aussage bezieht sich auf den beschriebenen Aufbau.'),
      ('SAN-Adapter',('fibre-channel-hba','controller'), 'choice','Welcher Adapter übernimmt in der beschriebenen Fibre-Channel-Infrastruktur eines SAN die Anbindung des Servers?',
       'Fibre-Channel-HBA', ['Fibre-Channel-HBA','USB-Hub','WLAN-Repeater'], [],'Der Fibre-Channel-HBA bindet den Server an die Fibre-Channel-Infrastruktur an.'),
      ('NAS-Protokolle',('smb/cifs','nfs'), 'multi','Welche zwei Protokolle beziehungsweise Protokollfamilien nennt der Informationstext für den gemeinsamen Dateizugriff auf NAS?',
       'SMB/CIFS; NFS', ['SMB/CIFS','NFS','SMTP','DNS'], [],'SMB/CIFS und NFS dienen dem Dateizugriff. SMTP überträgt E-Mails; DNS löst Namen auf.'),
      ('RAID-Parität',('xor','parität'), 'calculation','Zwei Datenblöcke lauten A = 01011010 und B = 00111100. Berechne ihre XOR-Parität. Gib das Ergebnis als acht Bits und beschreibe kurz die XOR-Regel.',
       '01100110. XOR ergibt 1 bei unterschiedlichen Bits und 0 bei gleichen Bits.', [], [('Parität 01100110 berechnen.',1),('XOR-Regel: unterschiedliche Bits ergeben 1, gleiche Bits 0.',1)],'Die XOR-Verknüpfung erfolgt bitweise: 01011010 XOR 00111100 = 01100110.'),
      ('RAID-Rekonstruktion',('rekonstruktionvonb','xor'), 'selfcheck','A = 01100001 und die XOR-Parität P = 00000011 sind vorhanden. Der Datenblock B fehlt. Wie rekonstruierst du B? Gib Operation und acht Bits an.',
       'B = A XOR P = 01100010.', [], [('A XOR P als Rekonstruktionsoperation nennen.',1),('Ergebnis 01100010 nennen.',1)],'Erneutes XOR mit A hebt dessen Beitrag auf. Übrig bleibt B.'),
      ('RAID5-Kapazität',('kleinstenfestplatte','2tb','raid5'), 'calculation','Ein klassisches RAID 5 verwendet drei Festplatten mit 1 TB, 2 TB und 3 TB. Alle Platten werden auf die kleinste Kapazität begrenzt; der Gegenwert einer Platte dient der Parität. Berechne den nutzbaren Speicher mit Rechenweg.',
       '2 TB. (3 − 1) × 1 TB = 2 TB.', [], [('Kleinste Kapazität 1 TB und zwei Nutzdatenanteile berücksichtigen.',1),('Nutzbare Kapazität 2 TB nennen.',1)],'Nach Begrenzung auf jeweils 1 TB stehen drei Kapazitätseinheiten zur Verfügung. Eine davon wird für die Parität benötigt.'),
      ('RAID5-Erweiterung',('gleichgrossen','50%','raid5'), 'calculation','Ein RAID 5 wird von drei auf vier gleich große Festplatten mit jeweils 1 TB erweitert. Nutzbar sind jeweils n − 1 Plattenkapazitäten. Um wie viel Prozent steigt die nutzbare Kapazität? Zeige den Rechenweg.',
       '50 %. Vorher 2 TB, danach 3 TB. (3 − 2) / 2 × 100 = 50 %.', [], [('Vorher 2 TB und danach 3 TB berechnen.',1),('Steigerung relativ zum Ausgangswert berechnen: 50 Prozent.',1)],'Der Zuwachs beträgt 1 TB. Bezogen auf ursprünglich 2 TB ergibt das 50 Prozent.'),
      ('RAID10-Ausfall',('spiegelpaar','beideplatten','raid10'), 'case','Ein RAID 10 besteht aus den Spiegelpaaren A1/A2 und B1/B2. A1 und B1 fallen aus. Bleiben die Daten verfügbar? Begründe die Antwort und nenne eine Ausfallkombination aus zwei Platten, die kritisch wäre.',
       'Ja, A2 und B2 enthalten weiterhin die Daten ihrer Spiegelpaare. Kritisch ist der gemeinsame Ausfall von A1 und A2 oder von B1 und B2.', [], [('Je eine intakte Platte pro Spiegelpaar: Daten bleiben verfügbar.',1),('Gemeinsamen Ausfall beider Platten eines Spiegelpaares als kritisch nennen.',1)],'Bei RAID 10 zählt die Verteilung der Ausfälle auf die Spiegelpaare. Zwei Ausfälle sind nur dann tolerierbar, wenn jedes Paar noch eine intakte Platte besitzt.'),
      ('RAID1-Rebuild',('spiegelplatte','rebuild'), 'selfcheck','Eine Festplatte eines RAID 1 ist defekt; die zweite ist intakt. Beschreibe die beiden grundlegenden Schritte zur Wiederherstellung der Spiegelung.',
       'Defekte Festplatte ersetzen. Daten von der intakten Spiegelplatte auf die neue Platte kopieren lassen (Rebuild).', [], [('Defekte Festplatte ersetzen.',1),('Daten von der intakten Spiegelplatte auf die neue Platte durch Rebuild übertragen.',1)],'Die intakte Spiegelplatte liefert die vorhandenen Daten für die Wiederherstellung der zweiten Kopie.'),
    ]
    templates += [
      ('DAS-Hardware',('keinezusätzlichenswitches','server'), 'multi','Welche zwei Eigenschaften des beschriebenen DAS-Aufbaus reduzieren den zusätzlichen Infrastrukturaufwand?',
       'Kein zusätzlicher Storage-Switch nötig; Kein zusätzlicher Protokoll-Stack für ein Speichernetz', ['Kein zusätzlicher Storage-Switch nötig','Kein zusätzlicher Protokoll-Stack für ein Speichernetz','Ein Fibre-Channel-Switch ist zwingend nötig','Ein separates Ethernet-Speichernetz ist zwingend nötig'], [],'Der direkte Anschluss vermeidet die im Informationstext genannten zusätzlichen Netzwerkkomponenten und den zusätzlichen Protokoll-Stack.'),
      ('DAS-Skalierung',('scale-up','eingeschränkteskalierbarkeit'), 'selfcheck','Welche Grenze der Skalierbarkeit nennt der Informationstext für DAS, und welchen Ausbauweg beschreibt er?',
       'Die Kapazität ist nur eingeschränkt skalierbar; beschrieben wird Scale-Up am einzelnen Server.', [], [('Eingeschränkte Kapazitätsskalierung nennen.',1),('Scale-Up am vorhandenen System nennen.',1)],'Der Text stellt die Erweiterung des einzelnen Systems der Skalierung eines Speichernetzes gegenüber.'),
      ('DAS-Einsatz',('kleinesbudget','keinehoheskalierbarkeit'), 'case','Ein einzelner Server benötigt schnellen lokalen Speicher. Das Budget ist klein, Wachstum über mehrere Storage-Systeme ist nicht gefordert und der Speicher steht unmittelbar neben dem Server. Begründe anhand dieser Vorgaben, warum der beschriebene DAS-Aufbau passt.',
       'Der direkte Anschluss bietet geringe Latenzen bei wenig zusätzlicher Hardware. Das kleine Budget und die fehlende Anforderung an hohe Skalierbarkeit passen zu DAS.', [], [('Direkten Anschluss mit geringer Latenz oder wenig zusätzlicher Hardware begründen.',1),('Budget und begrenzten Skalierungsbedarf berücksichtigen.',1)],'Die Vorgaben greifen genau die im Text beschriebenen Stärken und Grenzen von DAS auf.'),
      ('SAN-Skalierung',('mehrerestorage-systeme','skalierbarkeit'), 'selfcheck','Wie ermöglicht die beschriebene SAN-Infrastruktur eine Erweiterung über mehrere Storage-Systeme?',
       'Der Server wird über HBA und Fibre-Channel-Switch an das Speichernetz angebunden und kann dadurch auf mehrere Storage-Systeme zugreifen.', [], [('Anbindung über HBA und Fibre-Channel-Switch beschreiben.',1),('Zugriff auf mehrere Storage-Systeme als Erweiterungsmöglichkeit nennen.',1)],'Die zusätzliche Infrastruktur verbindet Server und mehrere Speichersysteme.'),
      ('SAN-Administration',('zentrale','zusätzlicheinfrastruktur'), 'multi','Welche zwei Aussagen zur SAN-Administration treffen nach dem Informationstext zu?',
       'Storage kann zentral verwaltet werden; Die zusätzliche Infrastruktur verursacht ebenfalls Verwaltungsaufwand', ['Storage kann zentral verwaltet werden','Die zusätzliche Infrastruktur verursacht ebenfalls Verwaltungsaufwand','Die gesamte Administration entfällt','Die Einrichtung erfordert grundsätzlich kein Fachwissen'], [],'Zentralisierung vereinfacht einen Teil der Verwaltung. Die Speichernetz-Infrastruktur muss zusätzlich konfiguriert und betreut werden.'),
      ('SAN-Kosten',('transceiver','hochpreisiger'), 'selfcheck','Nenne zwei Komponenten der beschriebenen Fibre-Channel-Infrastruktur, die bei der Kostenplanung eines SAN berücksichtigt werden müssen.',
       'Zum Beispiel Fibre-Channel-HBAs, Fibre-Channel-Switches und Transceiver-Module.', [], [('Eine passende Komponente nennen: HBA, Fibre-Channel-Switch oder Transceiver.',1),('Eine zweite unterschiedliche passende Komponente nennen.',1)],'Der Text nennt diese Komponenten als Kostenfaktoren gegenüber dem direkten Speicheranschluss.'),
      ('NAS-Anbindung',('ethernet-switch','bestehendeit-'), 'choice','Wie wird das beschriebene NAS in die vorhandene Infrastruktur eingebunden?',
       'Über einen Ethernet-Switch', ['Über einen Ethernet-Switch','Nur direkt über SAS an einen einzelnen Server','Nur über einen Fibre-Channel-HBA'], [],'Das NAS wird über die vorhandene Ethernet-Infrastruktur erreichbar.'),
      ('NAS-LANlast',('hohenbelastung','lans'), 'selfcheck','Warum muss beim Anschluss eines NAS auch die Belastung des vorhandenen LANs geprüft werden?',
       'Die Speicherzugriffe laufen über das Ethernet-Netz und können zusätzliche LAN-Bandbreite beanspruchen.', [], [('Speicherverkehr über das vorhandene Ethernet-Netz beschreiben.',1),('Zusätzliche Bandbreitenbelastung als Grund nennen.',1)],'Speicherzugriffe teilen sich die vorhandene Netzwerk-Infrastruktur mit anderem Verkehr.'),
      ('NAS-JumboFrames',('jumbo-frames','mtu9000'), 'choice','Welche Maßnahme nennt der Informationstext, um den Protokoll-Overhead beim NAS-Speicherverkehr zu verringern?',
       'Jumbo-Frames mit MTU 9000', ['Jumbo-Frames mit MTU 9000','Eine Verringerung der MTU auf 100','Ein Wechsel des Dateiprotokolls zu SMTP'], [],'Größere Frames können den relativen Protokoll-Overhead verringern. Die beteiligten Netzwerkkomponenten müssen die gewählte MTU unterstützen.'),
      ('NAS-Netzplanung',('dediziertesstorage-netz','10gbit/s'), 'case','NAS-Zugriffe belasten das gemeinsam genutzte LAN stark. Die Firma möchte den Speicherverkehr von sonstigem Netzwerkverkehr trennen. Welche im Informationstext beschriebene Netzwerkmaßnahme passt zu diesem Ziel, und welchen Engpass soll sie entschärfen?',
       'Ein dediziertes Storage-Netz mit hoher Bandbreite, im Text 10 Gbit/s oder mehr. Es trennt den Speicherverkehr und entschärft die Belastung des gemeinsamen LANs.', [], [('Dediziertes Storage-Netz mit hoher Bandbreite nennen.',1),('Entlastung des gemeinsam genutzten LANs erklären.',1)],'Der Text schlägt diese Maßnahme gegen die zusätzliche LAN-Belastung vor; die tatsächlich nötige Bandbreite muss geplant werden.'),
      ('Storage-Tiers',('tier0(nvme/ssd)','tier3(band/lto)'), 'choice','Welche Reihenfolge beschreibt der Informationstext als Faustregel für die Tier-Level von schnell nach langsam?',
       'Tier 0, Tier 1, Tier 2, Tier 3', ['Tier 0, Tier 1, Tier 2, Tier 3','Tier 3, Tier 2, Tier 1, Tier 0','Tier 1, Tier 3, Tier 0, Tier 2'], [],'Im beschriebenen hierarchischen Speichermanagement gilt als Faustregel: kleinerer Tier-Level bedeutet höhere Performance.'),
      ('RAID0-Redundanz',('keineausfallsicherheit','striping'), 'truefalse','RAID 0 verteilt Daten per Striping und kann den vollständigen Ausfall einer seiner Festplatten ohne Datenverlust ausgleichen.',
       'Falsch', ['Richtig','Falsch'], [],'Striping erhöht die Parallelität, bietet aber keine Redundanz zur Wiederherstellung nach Plattenausfall.'),
      ('RAID0-Kapazität',('raid0','4tb','kapazitätderkleinsten'), 'calculation','Ein RAID 0 verwendet vier gleich große Festplatten mit jeweils 2 TB. Alle Kapazitäten werden für Nutzdaten eingesetzt. Berechne die nutzbare Gesamtkapazität und zeige den Rechenweg.',
       '8 TB. 4 × 2 TB = 8 TB.', [], [('Vier Plattenkapazitäten multiplizieren: 4 × 2 TB.',1),('Ergebnis 8 TB nennen.',1)],'Bei RAID 0 wird keine Kapazität für Spiegelung oder Parität reserviert.'),
      ('RAID1-Kapazität',('raid1','1tbnutzbar','gespiegelt'), 'calculation','Zwei Festplatten mit jeweils 4 TB bilden ein RAID 1. Beide enthalten dieselben gespiegelten Daten. Berechne die nutzbare Kapazität und erkläre den Unterschied zur Rohkapazität.',
       '4 TB nutzbar bei 8 TB Rohkapazität. Die zweite Platte speichert eine Spiegelkopie.', [], [('Nutzbare Kapazität 4 TB nennen.',1),('Rohkapazität 8 TB und Spiegelkopie erklären.',1)],'Die gleiche Information wird zweimal gespeichert. Dadurch steht nur eine Plattenkapazität für unterschiedliche Nutzdaten bereit.'),
      ('RAID5-Mindestanzahl',('mindestens3festplatten','raid5'), 'choice','Wie viele Festplatten benötigt das im Vergleichsblatt beschriebene RAID 5 mindestens?',
       '3', ['2','3','4'], [],'Das Vergleichsblatt nennt für RAID 5 mindestens drei Festplatten.'),
      ('RAID5-Rebuildrisiko',('zweiteplatte','abschlussdesrebuilds'), 'case','In einem RAID 5 ist eine Festplatte ausgefallen. Vor Abschluss des Rebuilds fällt eine zweite Festplatte vollständig aus. Es stehen keine weiteren Kopien der betroffenen Daten zur Verfügung. Beurteile die Wiederherstellbarkeit allein aus diesem RAID und begründe deine Antwort.',
       'Eine Wiederherstellung allein aus diesem RAID 5 ist nicht möglich. Seine einfache Parität toleriert nur einen vollständigen Plattenausfall.', [], [('Wiederherstellung allein aus dem RAID verneinen.',1),('Grenze von einem Plattenausfall durch einfache Parität begründen.',1)],'Während des Rebuilds ist die Redundanz noch nicht wiederhergestellt. Ein zweiter vollständiger Ausfall überschreitet die Toleranz des RAID 5.'),
      ('RAID5-Schreiben',('paritätsinformationen','schreiben:langsamer'), 'selfcheck','Warum kann das Schreiben bei RAID 5 laut Vergleichsblatt langsamer sein als bei RAID 0?',
       'Bei RAID 5 müssen zusätzlich Paritätsinformationen berechnet beziehungsweise aktualisiert werden.', [], [('Zusätzliche Berechnung oder Aktualisierung der Parität nennen.',1)],'Die Paritätsverarbeitung verursacht zusätzlichen Aufwand; tatsächliche Geschwindigkeit hängt auch von Aufbau und Arbeitslast ab.'),
      ('RAID10-Kapazität',('n÷2','raid10','gespiegelt'), 'calculation','Ein RAID 10 verwendet vier gleich große Festplatten mit jeweils 3 TB als zwei Spiegelpaare. Berechne die nutzbare Kapazität und zeige, welchen Anteil die Spiegelung beansprucht.',
       '6 TB nutzbar. (4 / 2) × 3 TB = 6 TB. Die Hälfte der 12 TB Rohkapazität dient der Spiegelung.', [], [('Nutzbare Kapazität 6 TB berechnen.',1),('Halbe Rohkapazität beziehungsweise 6 TB für Spiegelkopien erklären.',1)],'In jedem Spiegelpaar stehen 3 TB für unterschiedliche Daten zur Verfügung; die zweite Platte enthält die Kopie.'),
      ('RAID10-Aufbau',('raid01(erstverteilen,dannspiegeln)','raid10istbeifestplattenausfällen'), 'selfcheck','Unterscheide den Aufbau von RAID 10 und RAID 01 anhand der Reihenfolge von Spiegelung und Striping.',
       'RAID 10: erst spiegeln, dann die Spiegelpaare per Striping verbinden. RAID 01: erst Striping-Teilverbünde bilden, dann diese spiegeln.', [], [('RAID 10: Spiegelpaare, darüber Striping.',1),('RAID 01: Striping-Teilverbünde, darüber Spiegelung.',1)],'Die Reihenfolge der beiden Verfahren führt zu unterschiedlichen Ausfallkombinationen.'),
      ('RAID-Chargen',('produktionschargen','serienfehler'), 'selfcheck','Warum können Festplatten aus unterschiedlichen Produktionschargen das gemeinsame Ausfallrisiko eines RAID verringern?',
       'Platten derselben Charge können gemeinsame Serienfehler haben. Unterschiedliche Chargen verringern das Risiko gleichartiger, zeitlich naher Ausfälle.', [], [('Gemeinsame Serienfehler einer Charge als Risiko nennen.',1),('Geringeres gemeinsames Ausfallrisiko durch unterschiedliche Chargen erklären.',1)],'Die ergänzende Lösung des Übungsblatts beschreibt ein mögliches gemeinsames Herstellungsrisiko; unabhängige Ausfälle sind damit nicht garantiert.'),
    ]
    return _build(templates,evidence)
