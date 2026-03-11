# Proposal: Recettes de kombucha sécurisées

## Contexte

Le générateur de recettes de kombucha (KombuchaGeneratorScreen, kombuchaCalculatorService, kombuchaData) produit des recettes F1 (fermentation primaire) à partir du volume, du type de thé et du profil aromatique. Un document de référence méthodologique et scientifique (infos kombucha.txt) définit des ratios et des consignes de sécurité pour garantir des recettes sûres pour les débutants.

## Problème

- Certains ratios actuels sortent des fourchettes recommandées (ex. sucre 60 g/L pour LIGHT_GENTLE, en dessous du plancher 70 g/L).
- Aucune prise en compte du "premier brassage" (starter à 20 % recommandé).
- Les rappels obligatoires (eau sans chlore, moisissure vs normal, matériel) ne sont pas intégrés dans la recette ou l’écran.
- Le starter est fixe à 15 % sans plancher explicite pour les grands volumes.

## Objectif

Aligner le générateur sur une **charte sécurité** : toutes les recettes générées respectent des ratios sécurisés, et l’utilisateur voit systématiquement les consignes de sécurité indispensables (eau, moisissure, matériel, température).

## Scope

**In scope**

- Ratios : sucre ≥ 70 g/L, starter 10–20 % (20 % si premier brassage), thé dans une fourchette sûre (6–9 g/L).
- Nouvel input "Premier brassage" → starter 20 %.
- Règle de calcul : starter = max(10 %, 20 % si premier brassage sinon 15 %) du volume final.
- Rappels obligatoires dans l’UI : eau sans chlore ; moisissure vs normal (texte) ; matériel (verre/inox) ; température 20–30 °C (idéal 24–29 °C).
- Ajustement des données du profil LIGHT_GENTLE (sucre à 70 g/L minimum).
- Instructions mises à jour (étape eau, phrase température, matériel).

**Out of scope**

- F2 (fermentation secondaire), bouteilles, aromatisation.
- Chronologie / alertes (J+5, J+7…).
- Galerie photo moisissure vs normal.
- API météo ou saisie de température ambiante pour personnaliser les durées.

## Critères de succès

- Aucune recette générée avec &lt; 70 g/L de sucre.
- Toutes les recettes avec "Premier brassage" coché ont 20 % de starter ; sinon 15 %, jamais en dessous de 10 %.
- Chaque recette affichée est accompagnée des rappels sécurité (eau, moisissure, matériel, température) visibles sans action supplémentaire (ou dans un bloc dédié sur la même page).
