## Why

Le profil d'eau sur `/water-quality` affiche les 6 ions en grille multi-colonnes avec de gros chiffres sans contexte. Il faut cliquer sur chaque ℹ pour savoir si une valeur est normale ou non. Sur mobile, le grid s'empile en 6 blocs identiques → long défilement sans hiérarchie. Les statistiques (ratio, dureté, AR) sont des chiffres bruts sans interprétation visible. Enfin, les classes CSS dark: sont triplées par endroit (`dark:text-gray-400 dark:text-gray-400 dark:text-gray-100`).

On veut un affichage compact en tableau (1 ion par ligne) avec pastille de couleur + interprétation textuelle inline, lisible d'un coup d'œil dans les 3 thèmes.

## What Changes

- Remplacer le grid `grid-cols-1 sm:grid-cols-3` des ions par un layout **1 ligne par ion** (symbole, nom, valeur, pastille colorée + interprétation, bouton ℹ)
- Ajouter une **pastille colorée** (vert/orange/rouge) et un **label d'interprétation** (normal, bas, élevé) à côté de chaque valeur, en utilisant `interpretIonValue()` de `ionEducation.ts`
- Remplacer le grid `grid-cols-2 md:grid-cols-4` des statistiques par un layout **1 ligne par stat** avec interprétation textuelle inline via `interpretStatValue()`
- Conserver tous les `IonInfoTrigger` et `StatInfoTrigger` existants (panels éducatifs)
- Nettoyer les classes CSS dupliquées (`dark:text-gray-400 dark:text-gray-400 dark:text-gray-100` → `dark:text-gray-100`)
- S'assurer du rendu dans les 3 thèmes (light, dark, calculator)

## Capabilities

### New Capabilities
- `water-profile-display`: Affichage compact du profil d'eau — 1 ligne par ion/stat, pastille de couleur, interprétation inline

### Modified Capabilities

_(aucune capability existante modifiée au niveau spec)_

## Impact

- `screens/WaterQualityScreen.tsx` : refonte de la section ions (cations + anions) et statistiques
- `data/ionEducation.ts` : aucune modification, on consomme les fonctions existantes (`interpretIonValue`, `interpretStatValue`)
- `components/IonInfoPanel.tsx` : aucune modification, les triggers sont conservés tels quels
- `components/IonRangeBar.tsx` : aucune modification (utilisé uniquement dans BrewableStylesSection)
- Aucune dépendance externe ajoutée
