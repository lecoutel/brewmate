# Design: Recettes de kombucha sécurisées

## Contexte

- **Code actuel** : `kombuchaCalculatorService.ts` calcule starter à 15 % fixe, sucre/thé depuis `KOMBUCHA_PROFILES` (LIGHT 60 g/L, CLASSIC 70, INTENSE 80). Pas d’input "premier brassage". Instructions sans étape eau ni encart sécurité.
- **Référence** : infos kombucha.txt — sucre 70–100 g/L, starter 10–20 % (20 % premier lot), thé 7–8 g/L, eau sans chlore, distinction moisissure/normal, matériel verre/inox, température 24–29 °C idéal.

## Décisions

### 1. Ratios imposés (sécurité)

| Paramètre | Règle | Implémentation |
|-----------|--------|----------------|
| **Sucre** | ≥ 70 g/L pour toute recette | Dans `kombuchaData.ts`, LIGHT_GENTLE.sugar_per_liter passe de 60 à 70. Aucun profil ne peut avoir &lt; 70. Optionnel : clamp dans le service si une donnée externe fournit une valeur plus basse. |
| **Starter** | 10–20 % ; 20 % si premier brassage | Nouveau champ `isFirstBatch` dans `KombuchaRecipeInputs`. Formule : `starterRatio = isFirstBatch ? 0.20 : 0.15` ; `starterLiquidL = max(desiredVolumeL * 0.10, desiredVolumeL * starterRatio)`. Ainsi plancher 10 % garanti, 20 % si premier brassage, sinon 15 %. |
| **Thé** | 6–9 g/L (référence 7–8) | Conserver les valeurs actuelles (5 → 7 pour LIGHT, 7 CLASSIC, 9 INTENSE). Pour sécurité SCOBY : LIGHT à 6 ou 7 g/L (on choisit 7 pour cohérence avec la référence). Donc LIGHT_GENTLE.tea_per_liter = 7. |

### 2. Input "Premier brassage"

- **Choix** : Checkbox ou toggle "C’est mon premier brassage" sur le formulaire du générateur.
- **Stockage** : Inclus dans `KombuchaRecipeInputs` (ex. `isFirstBatch: boolean`) et persisté avec les autres champs (usePersistentState).
- **URL** : Optionnel — paramètre `first=1` pour partage de lien "premier brassage". À traiter dans useUrlParams si on veut cohérence avec les autres écrans.

### 3. Rappels sécurité (contenu et emplacement)

- **Eau** : Texte unique à afficher : "Utilisez de l’eau filtrée ou de source. Si vous n’avez que l’eau du robinet : faites-la bouillir ou laissez-la reposer 24 h à l’air libre avant de l’utiliser."
- **Moisissure** : "Moisissure (à jeter) : surface du liquide ou du SCOBY, aspect sec/duveteux, couleurs blanc vif, vert, bleu, gris ou noir. Normal : sédiments bruns, nouvelle membrane translucide (bébé SCOBY). En cas de moisissure, jetez tout (liquide + SCOBY) et désinfectez le matériel. En cas de doute, ne pas consommer."
- **Matériel** : "Privilégiez un récipient en verre ou en inox alimentaire (304/316). Évitez les récipients en métal non alimentaire ou en céramique émaillée non garantie sans plomb."
- **Température** : Inclure dans l’étape fermentation : "Laissez fermenter dans un endroit sombre, entre 20 et 30 °C (idéalement 24–29 °C), pendant 7 à 15 jours…"

- **Emplacement** : Bloc "Sécurité" ou "À savoir" sur l’écran du générateur, visible une fois la recette affichée (ou toujours visible en dessous du formulaire). Les 4 textes peuvent être dans une section repliable "Conseils de sécurité" pour ne pas surcharger.

### 4. Instructions recette (modifications)

- **Étape 0 (nouvelle)** : "Préparez l’eau : utilisez de l’eau filtrée ou de source, ou de l’eau du robinet bouillie ou laissée 24 h à l’air libre (sans chlore)."
- **Ingrédient eau** : Libellé inclure "(eau sans chlore)" ou la même précision en note.
- **Étape fermentation (actuelle 6)** : Remplacer "à température ambiante" par "entre 20 et 30 °C (idéalement 24–29 °C)" et "7 à 21 jours" par "7 à 15 jours (jusqu’à 21 jours si la pièce est plus froide)". Ajouter "Dès le 5ᵉ jour vous pouvez goûter à la paille pour ajuster."
- **Matériel** : Soit une étape "Utilisez un bocal en verre ou en inox alimentaire" en début, soit intégré dans l’étape 0.

### 5. Pas de thés à risque

- Les types de thé restent BLACK_TEA, GREEN_TEA, MIXED_TEA (thés sans huiles essentielles). Aucun Earl Grey ou thé aromatisé aux huiles dans les options. Rien à coder si les options ne changent pas ; la spec rappelle la règle pour les évolutions futures.

## Risques / compromis

- **LIGHT_GENTLE plus "sucré"** : Passer à 70 g/L peut rendre le profil un peu moins "léger" en goût. Accepté pour la sécurité ; la description du profil reste "délicat et accessible".
- **Starter 20 % pour premier brassage** : Légèrement moins de volume de "nouveau" thé par batch ; bénéfice sécurité (pH bas rapidement) jugé prioritaire.

## Plan de migration

- Données : mise à jour de `kombuchaData.ts` (sugar_per_liter et tea_per_liter pour LIGHT_GENTLE).
- Types : ajout `isFirstBatch` à `KombuchaRecipeInputs`.
- Service : formule starter avec plancher 10 % et 20 % si premier brassage.
- UI : checkbox "Premier brassage", bloc Sécurité avec les 4 textes, instructions régénérées (étape 0, étape 6 mise à jour).
- Pas de migration de données utilisateur ; anciennes recettes en cache restent valides, les nouvelles générations respecteront les nouvelles règles.
