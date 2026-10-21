# Spuren der Steppe 7.5 – Offline-Produktion

**Produktionsstatus: NICHT museumsfertig.**

Das Hauptspiel (`index.html`) lädt nun lokal abgelegte **Originalfotos zuerst** aus `assets/photos/` und nur bei Bedarf online vom Met. Die sieben JPEGs konnten in dieser Entwicklungsumgebung nicht geladen werden und fehlen daher bewusst. KEINE Ersatzillustrationen oder beliebige Suchergebnisbilder wurden eingesetzt.

## Ablauf
1. Auf einem Computer mit Internet `ORIGINALFOTOS_LADEN.py` ausführen (Windows: `ORIGINALFOTOS_LADEN_WINDOWS.bat`).
2. `BILDPRUEFBERICHT.json` prüfen: **7/7 vorhandene JPEG** ist eine technische Mindestanforderung, **keine** Bildrechts- oder Objektfreigabe.
3. Mit `OFFLINE_START_WINDOWS.bat` lokal starten; auf Mac `python3 -m http.server 8765`, dann `http://localhost:8765/index.html?offline=1` öffnen. Anschließend Internet ausschalten und alle sieben Originalbilder aufrufen.
4. Auf jedem Einzelbild Museumsinventarnummer und fotografische Darstellung mit dem Met-Katalog abgleichen.
5. `REDAKTIONSATELIER.html` öffnen und alle Fundpunkte auf genau diesen Bildern kalibrieren. JSON/CSV exportieren. **Exports werden derzeit nicht automatisch in das Hauptspiel übertragen.**
6. Quellen und Hotspot-Texte von qualifizierten Fachleuten freigeben lassen; erst danach ausstellungsfertig kennzeichnen.

## iPad
Das vollständige Projekt inklusive der sieben lokal heruntergeladenen Fotos kann als ZIP veröffentlicht oder auf einem HTTPS-Webhost bereitgestellt werden. Für eine feste, offlinefähige iPad-Web-App benötigt es zusätzlich einen korrekt getesteten Service Worker/PWA-Betrieb; ein ZIP oder eine lokale HTML-Vorschau garantiert das nicht.

## Datenschutz
Besuchertest-Funktionen wie bislang lokal; museumsbezogene Prüfung vor Einsatz notwendig.

## Bildrechte
Met Open Access: https://www.metmuseum.org/hubs/open-access – die konkrete Fotografie und OA-Kennzeichnung einzeln überprüfen. Die Met-Links und Inventarnummern stehen in `BILDQUELLEN.json`.

Konzept & Entwicklung: Paul Fürst.
