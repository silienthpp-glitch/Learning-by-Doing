/* Eigene Beispielaufgaben. Neue Aufgaben: siehe README. */
window.EXAMPLE_QUESTIONS = [
  {
    "id": "net-1",
    "topic": "Netzwerktechnik",
    "prompt": "Welches Gerät verbindet unterschiedliche IP-Netzwerke miteinander?",
    "answer": "Router",
    "explanation": "Ein Switch verbindet Geräte innerhalb eines lokalen Netzwerks. Ein Router leitet IP-Pakete zwischen verschiedenen Netzwerken weiter. Dein Heimrouter verbindet zum Beispiel dein Heimnetz mit dem Netz deines Internetanbieters.",
    "steps": [],
    "type": "choice",
    "options": [
      "Switch",
      "Router",
      "Patchpanel",
      "Access Point"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "net-2",
    "topic": "Netzwerktechnik",
    "prompt": "Welcher Dienst übersetzt einen Domainnamen in eine IP-Adresse?",
    "answer": "DNS",
    "explanation": "DNS ist wie ein Telefonbuch: Du kennst den Namen, dein Computer braucht die passende IP-Adresse. DHCP verteilt dagegen Netzwerkeinstellungen an Geräte.",
    "steps": [],
    "type": "choice",
    "options": [
      "DHCP",
      "DNS",
      "NTP",
      "SSH"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "net-3",
    "topic": "Netzwerktechnik",
    "prompt": "Welches Protokoll vergibt automatisch IP-Adresse, Subnetzmaske und Standardgateway?",
    "answer": "DHCP",
    "explanation": "Ohne DHCP müsstest du die Einstellungen an jedem Gerät von Hand eintragen. Der DHCP-Server vergibt eine Adresse für eine begrenzte Zeit (Lease).",
    "steps": [],
    "type": "choice",
    "options": [
      "DNS",
      "HTTPS",
      "DHCP",
      "SMTP"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sub-1",
    "topic": "Subnetting",
    "prompt": "Wie viele nutzbare Host-Adressen hat ein normales IPv4-/26-Netz?",
    "answer": "62",
    "explanation": "IPv4-Adressen haben 32 Bits. Der Präfix sagt, wie viele davon zum Netz gehören. Die übrigen Bits bestimmen die Anzahl der Adressen. Bei gewöhnlichen IPv4-Netzen reservieren wir Netz- und Broadcastadresse. /31 und /32 sind Sonderfälle.",
    "steps": [
      "32 − 26 = 6 Host-Bits.",
      "2⁶ = 64 Adressen insgesamt.",
      "64 − 2 = 62 nutzbare Host-Adressen."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sub-2",
    "topic": "Subnetting",
    "prompt": "Wie viele nutzbare Host-Adressen hat ein normales IPv4-/27-Netz?",
    "answer": "30",
    "explanation": "Ein längerer Präfix lässt weniger Bits für Hosts übrig. Ein /27-Netz ist daher halb so groß wie ein /26-Netz.",
    "steps": [
      "32 − 27 = 5 Host-Bits.",
      "2⁵ = 32 Adressen insgesamt.",
      "32 − 2 = 30 nutzbare Host-Adressen."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sub-3",
    "topic": "Subnetting",
    "prompt": "Du brauchst mindestens 50 nutzbare Host-Adressen. Welcher kleinste passende IPv4-Präfix ist geeignet?",
    "answer": "/26",
    "explanation": "Du suchst das kleinste Netz, das alle Geräte aufnehmen kann. /27 bietet nur 30 nutzbare Adressen. /26 bietet 62 und reicht aus.",
    "steps": [
      "2⁵ − 2 = 30: zu wenig.",
      "2⁶ − 2 = 62: ausreichend.",
      "32 − 6 = 26, also /26."
    ],
    "type": "choice",
    "options": [
      "/28",
      "/27",
      "/26",
      "/25"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "ip6-1",
    "topic": "IPv6",
    "prompt": "Wie viele Bits hat eine IPv6-Adresse?",
    "answer": "128",
    "explanation": "IPv4 hat 32 Bits, IPv6 hat 128 Bits. IPv6 wird in acht Gruppen aus je vier hexadezimalen Ziffern geschrieben.",
    "steps": [
      "Eine hexadezimale Ziffer entspricht 4 Bits.",
      "8 Gruppen × 4 Ziffern × 4 Bits = 128 Bits."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "ip6-2",
    "topic": "IPv6",
    "prompt": "Was bedeutet „::“ in einer IPv6-Adresse?",
    "answer": "Eine zusammenhängende Folge von Nullgruppen",
    "explanation": "Die Doppelpunkt-Abkürzung spart Platz, wenn mehrere Gruppen nur aus Nullen bestehen. Sie darf pro Adresse nur einmal vorkommen, damit eindeutig bleibt, wie viele Gruppen ergänzt werden müssen.",
    "steps": [],
    "type": "choice",
    "options": [
      "Die Portnummer",
      "Eine zusammenhängende Folge von Nullgruppen",
      "Die Broadcastadresse",
      "Den Netzpräfix"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "raid-1",
    "topic": "RAID & Speicher",
    "prompt": "Ein RAID 1 besteht aus zwei Festplatten mit jeweils 2 TB. Wie viel nutzbare Kapazität hat es in TB?",
    "answer": "2",
    "explanation": "RAID 1 spiegelt Daten. Auf beiden Platten liegt derselbe Inhalt. Deshalb addieren sich die Kapazitäten nicht. RAID schützt vor bestimmten Plattenausfällen, ersetzt aber kein Backup.",
    "steps": [
      "2 Platten × 2 TB = 4 TB Rohkapazität.",
      "Eine vollständige Kopie wird gespiegelt.",
      "Nutzbar sind 2 TB."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "raid-2",
    "topic": "RAID & Speicher",
    "prompt": "Ein RAID 5 nutzt vier gleich große Festplatten mit je 2 TB. Wie viel Kapazität ist in TB nutzbar?",
    "answer": "6",
    "explanation": "Bei RAID 5 ist die Paritätsinformation auf die Platten verteilt. Zusammen verbraucht sie die Kapazität einer Platte. Eine Platte darf ausfallen.",
    "steps": [
      "Nutzbare Kapazität = (Anzahl − 1) × Plattengröße.",
      "(4 − 1) × 2 TB = 6 TB."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "raid-3",
    "topic": "RAID & Speicher",
    "prompt": "Warum ersetzt RAID kein Backup?",
    "answer": "Löschungen und Schadsoftware können alle Kopien betreffen",
    "explanation": "Eine versehentliche Löschung wird auch auf einen Spiegel übernommen. Ein getrenntes, getestetes Backup ermöglicht die Wiederherstellung eines früheren Zustands.",
    "steps": [],
    "type": "choice",
    "options": [
      "RAID funktioniert nur nachts",
      "Löschungen und Schadsoftware können alle Kopien betreffen",
      "RAID speichert keine Dateien",
      "Backups sind immer schneller"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sql-1",
    "topic": "SQL",
    "prompt": "Welche SQL-Anweisung liest Daten aus einer Tabelle?",
    "answer": "SELECT",
    "explanation": "SELECT liest Daten. INSERT fügt Zeilen hinzu, UPDATE ändert sie, DELETE entfernt sie. Beispiel: SELECT name FROM kunden; liest die Namen aus der Tabelle kunden.",
    "steps": [],
    "type": "choice",
    "options": [
      "INSERT",
      "UPDATE",
      "SELECT",
      "DELETE"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sql-2",
    "topic": "SQL",
    "prompt": "Welche Klausel filtert Zeilen in einer SELECT-Abfrage?",
    "answer": "WHERE",
    "explanation": "Mit WHERE beschränkst du das Ergebnis. SELECT name FROM kunden WHERE ort = 'Berlin'; liefert nur Kunden aus Berlin.",
    "steps": [],
    "type": "choice",
    "options": [
      "ORDER BY",
      "WHERE",
      "FROM",
      "CREATE"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sec-1",
    "topic": "IT-Sicherheit",
    "prompt": "Was bedeutet das Prinzip der minimalen Rechte?",
    "answer": "Nur die für die Aufgabe nötigen Rechte vergeben",
    "explanation": "Ein Benutzer erhält nur Rechte, die er für seine Arbeit benötigt. So begrenzt du die Auswirkungen von Fehlern und kompromittierten Konten.",
    "steps": [],
    "type": "choice",
    "options": [
      "Alle Benutzer sind Administratoren",
      "Nur die für die Aufgabe nötigen Rechte vergeben",
      "Passwörter nie ändern",
      "Keine Benutzerkonten verwenden"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "sec-2",
    "topic": "IT-Sicherheit",
    "prompt": "Welche Kombination verwendet zwei unterschiedliche Authentifizierungsfaktoren?",
    "answer": "Passwort und Hardware-Sicherheitsschlüssel",
    "explanation": "Ein Passwort ist Wissen. Ein Hardware-Schlüssel ist Besitz. Zwei Passwörter gehören dagegen beide zum Faktor Wissen.",
    "steps": [],
    "type": "choice",
    "options": [
      "Passwort und PIN",
      "Passwort und Sicherheitsfrage",
      "Passwort und Hardware-Sicherheitsschlüssel",
      "Zwei verschiedene Passwörter"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "wiso-1",
    "topic": "Wirtschaft",
    "prompt": "Ein Produkt kostet netto 100 €. Wie hoch ist der Bruttopreis bei vorgegebenen 19 % Umsatzsteuer in €?",
    "answer": "119",
    "explanation": "Netto bedeutet ohne Umsatzsteuer, brutto bedeutet inklusive Umsatzsteuer. Der Steuersatz ist in dieser Aufgabe ausdrücklich vorgegeben.",
    "steps": [
      "Umsatzsteuer: 100 € × 0,19 = 19 €.",
      "Bruttopreis: 100 € + 19 € = 119 €."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "wiso-2",
    "topic": "Wirtschaft",
    "prompt": "Ein Gerät benötigt 200 W und läuft 5 Stunden. Wie viel Energie verbraucht es in kWh?",
    "answer": "1",
    "explanation": "Watt ist die Leistung, Kilowattstunden sind die verbrauchte Energie. Du multiplizierst die Leistung in kW mit der Laufzeit in Stunden.",
    "steps": [
      "200 W ÷ 1.000 = 0,2 kW.",
      "0,2 kW × 5 h = 1 kWh."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  },
  {
    "id": "proj-1",
    "topic": "Projektmanagement",
    "prompt": "Wofür steht das „M“ in einem SMART formulierten Projektziel?",
    "answer": "Messbar",
    "explanation": "Ein Ziel sollte spezifisch, messbar, akzeptiert bzw. attraktiv, realistisch und terminiert sein. Bei den ausgeschriebenen Begriffen gibt es Varianten. Messbar heißt: Du kannst objektiv prüfen, ob das Ziel erreicht wurde.",
    "steps": [],
    "type": "choice",
    "options": [
      "Modern",
      "Messbar",
      "Monatlich",
      "Minimal"
    ],
    "aliases": [],
    "points": 2
  },
  {
    "id": "proj-2",
    "topic": "Projektmanagement",
    "prompt": "Ein Projekt umfasst 24 Arbeitsstunden. Zwei Personen arbeiten gleich produktiv parallel, ohne Abstimmungsaufwand. Wie viele Stunden dauert es?",
    "answer": "12",
    "explanation": "Arbeitsaufwand und Dauer sind verschiedene Dinge. Der Gesamtaufwand bleibt 24 Personenstunden. Unter den vereinfachten Bedingungen verkürzt sich die Dauer auf 12 Stunden.",
    "steps": [
      "Dauer = Aufwand ÷ Anzahl der Personen.",
      "24 Personenstunden ÷ 2 Personen = 12 Stunden."
    ],
    "type": "number",
    "options": [],
    "aliases": [],
    "points": 2
  }
];
