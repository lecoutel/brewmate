## 1. Paramètres d'URL pour l'eau en bouteille

- [x] 1.1 Au chargement de `WaterQualityScreen`, lire `urlParams.water` et `urlParams.code` ; si `water === 'bottle'` et `code` présent, forcer la source à bouteille, définir `bottleProductCode` (et nom si disponible) et laisser l'effet existant déclencher `getBottledWaterProfile(code)` pour afficher les données.
- [x] 1.2 À chaque sélection d'une eau en bouteille (handleSelectBottle), mettre à jour l'URL avec `setUrlParams({ water: 'bottle', code: hit.code })` et retirer `city` si présent ; s'assurer que le mode robinet continue d'écrire uniquement `city` (sans ajouter water/code).
- [x] 1.3 Lors du passage de la source "bouteille" à "robinet", retirer les paramètres `water` et `code` de l'URL (setUrlParams avec undefined pour ces clés).

## 2. Persistance du texte de recherche bouteille

- [x] 2.1 Remplacer `useState('')` pour `bottleQuery` par `usePersistentState('brewmate:water:bottleQuery', '')` dans `WaterQualityScreen.tsx`.
- [x] 2.2 Lors de l'hydratation depuis le cache ou depuis l'URL (revisite ou ouverture avec ?water=bottle&code=...), préremplir le champ de recherche : si une bouteille est déjà sélectionnée (bottleProductCode + bottleProductName persistés ou venant de l'URL après fetch), afficher le nom dans le champ (bottleQuery initialisé ou mis à jour depuis bottleProductName / result.productName selon le moment).
- [x] 2.3 Dans `handleClearWaterData`, appeler le clear du state persisté pour bottleQuery (ou définir bottleQuery à '') et s'assurer que la clé localStorage est bien supprimée / réinitialisée avec les autres caches eau.

## 3. Vérification

- [ ] 3.1 Vérifier qu'ouvrir `/water-quality?water=bottle&code=<code_valide>` charge et affiche la fiche de l'eau correspondante (y compris en navigation privée).
- [ ] 3.2 Vérifier qu'après sélection d'une eau en bouteille, l'URL contient les paramètres attendus et que le partage du lien affiche les mêmes données pour un autre utilisateur ou onglet.
- [ ] 3.3 Vérifier qu'en revisite (ou après rechargement) avec une bouteille déjà sélectionnée, le champ "Rechercher une eau en bouteille" affiche le nom du produit et que "Effacer les valeurs" réinitialise aussi ce champ et sa persistance.
