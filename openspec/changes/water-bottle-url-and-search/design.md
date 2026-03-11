# Design: URL partageable et persistance recherche — eau en bouteille

## Context

- **État actuel** : `WaterQualityScreen.tsx` utilise `useUrlParams()` pour l'eau du robinet uniquement (`city`). L'eau en bouteille repose sur `usePersistentState` pour `bottleProductCode` et `bottleProductName` ; `bottleQuery` est en `useState('')` donc non persisté. Aucun paramètre d'URL pour le mode bouteille.
- **Contraintes** : Conserver la même route `/water-quality` ; réutiliser le hook `useUrlParams` et le pattern déjà en place pour `city` ; pas de changement des APIs externes (Open Food Facts, base locale).
- **Stakeholders** : Utilisateur qui partage un lien vers une eau en bouteille ou revient plus tard et s'attend à voir le champ de recherche prérempli.

## Goals / Non-Goals

**Goals:**

- Rendre l'état "eau en bouteille + produit X" partageable et reproductible en navigation privée via l'URL.
- Persister le texte de recherche bouteille et le réafficher en revisite (champ prérempli quand une bouteille est déjà sélectionnée).

**Non-Goals:**

- Changer le format des données (WaterQualityResult, Open Food Facts).
- Gérer l'historique navigateur au-delà de replace (pas de push par étape pour la bouteille).
- Modifier l'écran Correction du pH (hors scope de ce change).

## Decisions

### 1. Paramètres d'URL pour l'eau en bouteille

- **Choix** : Ajouter un paramètre pour le code produit (ex. `code` ou `bottle`) lorsque la source est bouteille. Pour éviter ambiguïté avec une éventuelle "ville" en mode robinet, on peut soit : (A) utiliser un seul param `code` présent uniquement en mode bouteille, soit (B) ajouter `water=bottle` et `code=...`.
- **Recommandation** : `water=bottle` + `code=<productCode>`. Rationale : lecture claire de l'URL, cohérence avec un paramètre `city` pour le robinet (on peut avoir `water=tap` implicite quand `city` est présent, et `water=bottle` quand `code` est présent). Lorsque l'utilisateur ouvre une URL avec `?water=bottle&code=3017620422003`, l'écran doit passer en mode bouteille, définir le code, et charger les données (comme pour `?city=Lille` côté robinet).
- **Alternative** : Un seul param `bottle=<code>` — plus court mais moins explicite si on ajoute plus tard d'autres types de source.

### 2. Synchronisation URL ↔ état (mode bouteille)

- **Choix** : Lors du chargement, si `urlParams.water === 'bottle'` et `urlParams.code` est défini, forcer la source à `bottle`, définir `bottleProductCode` (et optionnellement `bottleProductName` si on veut l'afficher tout de suite), et déclencher le fetch existant `getBottledWaterProfile(code)`. À chaque changement de sélection bouteille par l'utilisateur, mettre à jour l'URL avec `setUrlParams({ water: 'bottle', code: bottleProductCode })` (et retirer `city` si présent). Lors du passage au robinet, retirer `water` et `code` de l'URL.
- **Rationale** : Même pattern que pour `city` : URL comme reflet de l'état partageable ; `replace: true` déjà utilisé dans `useUrlParams` pour éviter d'empiler les entrées d'historique.

### 3. Persistance du texte de recherche (bottleQuery)

- **Choix** : Persister `bottleQuery` avec `usePersistentState` (clé ex. `brewmate:water:bottleQuery`, valeur string). À l'initialisation, si on a déjà une bouteille sélectionnée (code + nom en persistent state ou depuis l'URL), préremplir `bottleQuery` avec le nom connu (ex. `bottleProductName`) pour que le champ affiche le texte en revisite.
- **Rationale** : Une seule source de vérité pour le nom affiché dans le champ ; en revisite ou après partage, l'utilisateur voit immédiatement "Volvic" (ou le nom) dans le champ tout en ayant la fiche chargée.
- **Alternative** : Ne persister que le code et déduire l'affichage du champ uniquement depuis `result.productName` ou `bottleProductName` au chargement — possible mais le champ serait alors rempli après le fetch, avec un léger délai ; persister le query évite un flash "vide".

### 4. Priorité URL vs localStorage au premier rendu

- **Choix** : Si l'URL contient `water=bottle` et `code=...`, privilégier l'URL : définir la source et le code depuis l'URL et charger les données ; optionnellement écraser les clés localStorage pour cette session (bottleCode, bottleName, bottleQuery) avec les valeurs déduites après fetch réussi, pour que la prochaine visite sans URL reste cohérente.
- **Rationale** : Le partage et la nav privée doivent fonctionner sans dépendre du localStorage ; en nav privée, après chargement depuis l'URL, on peut écrire en session/local pour la suite de la session si souhaité (comportement actuel du hook persistent state dans la même session).

## Risks / Trade-offs

- **Risque** : Longueur d'URL avec code produit (ex. code EAN 13 chiffres) → **Mitigation** : acceptable pour partage ; pas de compression nécessaire pour l’instant.
- **Risque** : Code produit invalide ou supprimé d’Open Food Facts → **Mitigation** : comportement existant déjà (message d’erreur "Impossible de récupérer les données de cette eau") ; l’URL restera mais l’écran affichera l’erreur.
- **Trade-off** : Deux paramètres (`water` + `code`) au lieu d’un seul → meilleure lisibilité et évolutivité (ex. `water=tap` plus tard si on veut être explicite).

## Migration Plan

- Déploiement : déploiement classique (build puis déploiement). Aucune migration de données ; les clés localStorage existantes restent valides ; ajout d’une clé pour `bottleQuery`.
- Rollback : revert du commit ; l’écran redevient sans param URL bouteille et sans persistance du query ; anciennes URLs avec `?city=...` inchangées.

## Open Questions

- Aucune. Libellé exact des paramètres (`water`/`code` vs `bottle`) peut être fixé en implémentation si l’équipe préfère des noms plus courts.
