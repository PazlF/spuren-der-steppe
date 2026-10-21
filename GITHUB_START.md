# Spuren der Steppe – GitHub + Netlify

## Einmalige Einrichtung

1. Neues **privates** GitHub-Repository `spuren-der-steppe` erstellen (ohne automatisch generierte Dateien, falls dieser Ordner hochgeladen wird).
2. Diesen Ordnerinhalt **ins Stammverzeichnis** des Repositorys hochladen. Die `index.html` muss direkt oben liegen, die Fotos unter `assets/photos/`.
3. In Netlify die GitHub-Verbindung herstellen: **Add new project > Import an existing project > GitHub** und das Repository wählen. Build command leer lassen, Publish directory `.`.
4. Wichtig: Ein bereits per Netlify Drop angelegtes Projekt lässt sich je nach aktuellen Netlify-Einstellungen eventuell über **Project configuration > Build & deploy > Continuous deployment** mit Git verbinden. Falls diese Option fehlt, über Git-Import ein neues Projekt anlegen und ggf. Domain bzw. Zugriffsschutz passend umstellen.
5. Das bestehende Site-Passwort bzw. die Site Access-Einstellungen werden in **Netlify**, nicht in GitHub verwaltet. Nicht als Datei oder Klartext ins Repository schreiben.

## Updates
Änderungen am Hauptbranch des Repositories lösen nach erfolgreicher Netlify-Verbindung neue Deployments aus. Vorher Version auf iPad/PC testen.

## Inhalt
Version 8.2, lokale sieben Met-Originalbilder, zusätzliche Dokumentation. Hotspots und historische Aussagen sind noch fachlich freizugeben.
