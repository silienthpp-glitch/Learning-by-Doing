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
