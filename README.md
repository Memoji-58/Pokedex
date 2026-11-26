# Pokédex

Eine Pokémon-Webseite für Einsteiger. Das Projekt verwendet nur HTML, CSS und JavaScript. Die Pokémon-Daten kommen über das Internet von der öffentlichen PokéAPI.

## Dateien im Projekt

- `index.html` enthält den sichtbaren Seitenaufbau.
- `css/style.css` enthält Farben, Layout und Darstellung für verschiedene Bildschirmgrößen.
- `js/main.js` verbindet Suche, Pokémon-Liste und Detailfenster.
- `js/api.js` lädt Pokémon-Daten von der PokéAPI und speichert bereits geladene Daten im Cache.
- `js/ui.js` erstellt und aktualisiert die Pokémon-Karten.
- `js/modal.js` steuert das Detailfenster und seine Navigation.
- `assets/pokeball.svg` ist das Pokéball-Logo und Favicon.

## Funktionen

- Lädt beim Start 30 Pokémon und ermöglicht das Nachladen weiterer Pokémon.
- Zeigt ab drei Buchstaben alle Pokémon an, deren Namen mit diesen Buchstaben beginnen.
- Sucht Pokémon anhand ihres Namens oder ihrer Pokédex-ID.
- Zeigt Pokémon-Typen und Details in einem Dialogfenster.
- Unterstützt Tastaturbedienung und verschiedene Bildschirmgrößen.
- Lädt Evolutionsketten erst bei Bedarf.
