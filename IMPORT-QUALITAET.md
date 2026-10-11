# Qualitätsstand des Imports

Die frühere regelbasierte Erzeugung wurde im Importablauf ersetzt. Sie war für realistische Klausurfragen nicht zuverlässig genug. Der Quellcode `study-import.js` bleibt für die Regressionstests vorhanden, wird aber nicht mehr für neue Textimporte aufgerufen.

Version 5 verwendet einen ausdrücklich freizugebenden, zweistufigen KI-Entwurf mit strukturierten Aufgaben und Quellenvalidierung. Ohne eingerichtete KI werden keine automatischen Ersatzfragen erzeugt. Fertige JSON-Fragen können weiterhin importiert werden.

Vollständiger Ablauf, Einrichtung, Datenverarbeitung und bekannte Grenzen: [LEHRER-AUFGABEN.md](LEHRER-AUFGABEN.md).
