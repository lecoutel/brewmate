# Proposal: URL partageable et persistance de la recherche pour l'eau en bouteille

## Why

Sur l'écran Qualité de l'eau, l'eau du robinet est partageable via l'URL (`?city=...`) et la recherche ville est persistée pour la revisite. Pour l'eau en bouteille, il n'y a **aucun paramètre d'URL** : partager le lien ou ouvrir en navigation privée ne permet pas d'afficher directement les données. De plus, le **texte de recherche** (ex. "Volvic") n'est pas stocké : en revisite, le champ reste vide même si la fiche de l'eau sélectionnée est bien rechargée. Cela crée une asymétrie d'expérience et limite le partage et la reprise de session.

## What Changes

- **Paramètres d'URL pour l'eau en bouteille** : ajouter un (ou des) paramètre(s) d'URL pour la source "bouteille" et le produit sélectionné (ex. `?water=bottle&code=...`), afin que l'ouverture ou le partage de l'URL affiche directement les données de l'eau choisie, y compris en navigation privée.
- **Persistance du texte de recherche** : persister le texte de recherche (bottleQuery) et, en revisite, réafficher ce texte dans le champ "Rechercher une eau en bouteille" lorsque l'utilisateur revient sur l'écran avec une bouteille déjà sélectionnée (cohérence avec l'affichage de la fiche).

## Capabilities

### New Capabilities

- `water-quality-screen`: Écran Qualité de l'eau (route /water-quality) avec source robinet ou bouteille. Ce change ajoute les exigences : (1) URL partageable pour l'eau en bouteille (param(s) reflétant la sélection et hydratation au chargement) ; (2) persistance et réaffichage du texte de recherche bouteille en revisite.

### Modified Capabilities

- Aucune (pas de spec existante pour l'écran Qualité de l'eau dans le dépôt principal).

## Impact

- **Fichiers concernés** : `screens/WaterQualityScreen.tsx`, éventuellement `hooks/useUrlParams.ts` si extension des paramètres (déjà utilisé pour `city`).
- **Comportement** : même route `/water-quality` ; ajout de paramètres d'URL pour le mode bouteille ; lecture/écriture URL au même titre que pour `city` ; persistance supplémentaire (clé type `brewmate:water:bottleQuery` ou réutilisation de l'existant).
- **Non affecté** : écran Correction du pH, APIs Hub'Eau / Open Food Facts, base locale des eaux en bouteille.
