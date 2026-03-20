## Why

Le thème light actuel utilise la palette Game Boy DMG (4 nuances de vert monochrome). C'est cohérent mais monotone et peu lisible — tous les éléments se fondent dans le vert. On veut passer à une palette inspirée **Game Boy Color** : garder l'esprit rétro 8-bit mais introduire de vraies couleurs pour différencier titres, actions, erreurs et contenu, tout en améliorant les contrastes et la lisibilité.

## What Changes

- Remplacer les CSS variables du thème light (`:root`) par une palette GBC multi-couleurs au lieu du monochrome vert DMG
- Introduire des couleurs 8-bit distinctes pour : fond, cartes, texte, bordures, accents, titres, erreurs
- Adapter le dithering pattern light pour correspondre à la nouvelle palette
- Ajuster les ombres et bordures du thème light si nécessaire pour maintenir la cohérence visuelle
- Conserver Courier Prime comme police (déjà en place)
- Les thèmes dark et calculator ne sont **pas** impactés

## Capabilities

### New Capabilities
- `gbc-light-palette`: Palette de couleurs Game Boy Color pour le thème light — variables CSS, dithering, ombres et contrastes adaptés

### Modified Capabilities

_(aucune capability existante modifiée au niveau spec)_

## Impact

- `public/index.css` : variables `:root`, dithering light, éventuellement `.mac-window`/`.mac-button`/`.mac-input` light
- `index.html` : éventuellement couleurs hardcodées dans le tailwind config (palette `mac`)
- Aucun changement dans les composants React (tout passe par les CSS variables)
- Aucune dépendance externe ajoutée
