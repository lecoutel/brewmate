# Proposal: Amélioration UX du générateur de recettes kombucha

## Why

Le générateur de recettes kombucha (KombuchaGeneratorScreen) respecte déjà les ratios de sécurité et affiche les rappels obligatoires (change kombucha-recipe-safety). L’écran montre toute l’information en même temps : formulaire, bloc complet « Conseils de sécurité » (trois paragraphes denses), puis résultat avec un long profil de goût. Pour un débutant, la charge cognitive est élevée, les choix (profil aromatique, type de thé) manquent de guidage, et le « premier brassage » n’est pas mis en avant. L’objectif est d’améliorer l’outil en appliquant le **progressive disclosure** : afficher les bonnes infos au bon moment, guider sans surcharger, tout en conservant les mêmes exigences de sécurité et de contenu.

## What Changes

- **Progressive disclosure de la sécurité** : Ne plus afficher par défaut le bloc complet des trois rappels (eau, moisissure, matériel) sous le formulaire. Le remplacer par une courte phrase d’intro + un bloc « À savoir » / « Conseils de sécurité » **repliable** (fermé par défaut). À l’affichage de la recette : rappel **eau** court à côté des ingrédients ; rappel **moisissure** (résumé) au moment de l’étape fermentation ; contenu complet disponible dans le bloc repliable.
- **Profil de goût** : Afficher par défaut un **résumé court** (1–2 phrases) du profil de goût ; le paragraphe détaillé actuel dans un bloc dépliable « En savoir plus sur ce profil ».
- **Premier brassage** : Rendre la checkbox plus visible (position ou mise en forme) ; lorsque « Premier brassage » est coché, afficher avec la recette un **message contextuel** (ex. « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage »).
- **Aide aux choix** : Sous les selects « Profil aromatique » et « Type de thé », afficher une **phrase d’aide courte** (ex. « Pour commencer : Classique et Équilibré » ; « Thé noir : le plus simple pour le SCOBY. Thé vert : fermentation un peu plus rapide »).
- **Optionnel** : Presets de volume (ex. 1 L, 2 L, 4 L, 1 gallon) + champ libre ; et/ou encart « Astuce » (ex. méthode dilution) dans les instructions à l’étape concernée.

Aucune modification des ratios, des calculs ou des textes réglementaires de sécurité : même contenu, meilleure présentation et moment d’affichage.

## Capabilities

### New Capabilities

*Aucune.* Les changements concernent uniquement l’expérience d’affichage et le guidage du même générateur.

### Modified Capabilities

- **kombucha-generator** : Exigences d’affichage et de structure UX — progressive disclosure (sécurité au bon moment, bloc repliable), résumé du profil de goût avec détail dépliable, mise en avant du premier brassage et message contextuel, aide contextuelle sous les selects. Les exigences de calcul et de contenu sécurité (ratios, textes eau/moisissure/matériel/température) restent inchangées.

## Impact

- **Code** : `screens/KombuchaGeneratorScreen.tsx` (structure du formulaire, blocs repliables, messages contextuels, textes d’aide). Possiblement `components/Common.tsx` si un composant repliable générique est introduit.
- **Données** : Aucune modification des types, du service `kombuchaCalculatorService.ts` ni de `kombuchaData.ts` ; les textes d’aide et le résumé du profil peuvent être des constantes ou dérivés des descriptions existantes.
- **Référence** : Le fichier `infos kombucha.txt` a été modifié (contenu désormais orienté chimie de l’eau / brassage bière). Les ratios et consignes sécurité du générateur restent alignés sur la spec kombucha-recipe-safety et la documentation produit existante ; pas de dépendance au nouveau contenu du fichier pour ce change.
