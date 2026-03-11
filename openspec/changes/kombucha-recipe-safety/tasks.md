# Tasks: Recettes de kombucha sécurisées

- [x] **T1** Mettre à jour `kombuchaData.ts` : LIGHT_GENTLE `sugar_per_liter` = 70, `tea_per_liter` = 7 (si pas déjà 7).
- [x] **T2** Ajouter `isFirstBatch?: boolean` à `KombuchaRecipeInputs` dans `types.ts`.
- [x] **T3** Dans `kombuchaCalculatorService.ts` : calcul du starter avec plancher 10 % et 20 % si `isFirstBatch`, sinon 15 %. Vérifier que sucre/thé ne descendent jamais sous les seuils (données déjà mises à jour en T1).
- [x] **T4** Ajouter l’étape 0 (eau sans chlore) aux instructions et adapter le libellé de l’ingrédient eau. Mettre à jour l’étape fermentation (température 20–30 °C, 24–29 °C idéal, 7–15 jours, goût dès J+5).
- [x] **T5** Sur `KombuchaGeneratorScreen` : ajouter la checkbox "C’est mon premier brassage", l’inclure dans les inputs et la persistance (usePersistentState). Optionnel : paramètre URL `first=1`.
- [x] **T6** Ajouter un bloc "Sécurité" / "À savoir" sur l’écran avec les trois textes (Eau, Moisissure, Matériel) — visible lorsque la recette est affichée ou en permanence sous le formulaire.
- [x] **T7** Vérifier que toutes les recettes générées respectent sucre ≥ 70 g/L et starter 10–20 % (tests manuels ou unitaires si présents).
