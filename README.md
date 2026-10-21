# Spuren der Steppe

Interaktives Museumsspiel für Tablets mit sieben archäologischen Originalfotografien.

**Konzept & Entwicklung: Paul Fürst**

## Hosting

Statische HTML-Seite ohne Build-Schritt. Netlify-Einstellungen:
- Branch: `main`
- Build command: leer
- Publish directory: `.` (Repository-Wurzel)

Die Dateien `index.html` und `assets/photos/` müssen direkt im Repository liegen. Nach der erstmaligen Verbindung mit Netlify lösen Änderungen auf `main` automatisch neue Deployments aus.

## Fachlicher Status

Prototyp. Hotspots und wissenschaftliche Erläuterungen müssen vor einem Museumseinsatz fachlich freigegeben und auf dem Ziel-Tablet getestet werden.
