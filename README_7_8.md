# Spuren der Steppe 7.8 — iPad-Touch-Optimierung

Konzept und Entwicklung: Paul Fürst.

## Inhalt
Sieben lokale Originalfoto-Dateien liegen unter `assets/photos/`. Die 30 Touchpunkte sind weiterhin vorläufig und benötigen eine bildgenaue sowie archäologische Fachprüfung. Der Museumsbetrieb ist ein Pilotbetrieb.

## Verbesserungen
- Größere Touchflächen für Hotspots und Lupensteuerung.
- Tablet-/Mobilansicht samt iPad-Safe-Area-Unterstützung verbessert.
- Zoom-/Pan-Begrenzung orientiert sich jetzt an der sichtbaren Fotofläche.
- Doppeltipp in eine freie Fotozone setzt die Vergrößerung auf 1× zurück.
- Veralteter Hinweis auf fehlende sechs Fotos korrigiert.

## Start
ZIP entpacken und auf einem Desktop-Browser `index.html` öffnen. Für das iPad den vollständigen Ordner auf einer HTTPS-Website veröffentlichen; **nicht nur die HTML-Datei**, weil sonst die Bilder fehlen. Beim Upload muss `assets/photos/` mit allen sieben JPEGs erhalten bleiben.

## Vor einem Museumstest prüfen
1. Alle sieben Bilder sichtbar; die angezeigten Objekte mit Katalogdatensätzen abgleichen.
2. Bei jeder Station die Markenpositionen direkt am Foto überprüfen; Ansichten variieren in Seitenverhältnis und Bildausschnitt.
3. Auf einem realen iPad Antippen, Einfinger-Verschieben, Zweifinger-Zoom, Reset und die Forschungsmissionen durchspielen.
4. Bild-/Textfreigabe durch Fachperson. Weitere Rechtefragen je Objektaufnahme prüfen.

## Technischer Prüfumfang
Lokale Fotos vorhanden; eingebettete Skripte syntaktisch mit Node.js geprüft. Der Versuch eines automatisierten Chromium-Tests wurde durch die Netzwerk-/Dateizugriffsbeschränkung dieser Ausführungsumgebung verhindert. Es liegt **kein erfolgreicher iPad-Praxistest** vor.
