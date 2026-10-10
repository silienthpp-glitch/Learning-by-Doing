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
    return _build(templates,evidence)
