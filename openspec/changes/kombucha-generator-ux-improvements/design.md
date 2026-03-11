# Design: Amélioration UX du générateur de recettes kombucha

## Context

- **État actuel** : `KombuchaGeneratorScreen.tsx` affiche un formulaire (volume, profil, thé, premier brassage), puis un bloc fixe « Conseils de sécurité » avec les trois paragraphes (eau, moisissure, matériel), puis après génération le résultat avec titre, profil de goût (paragraphe long), ingrédients et instructions. Les ratios et le contenu sécurité sont conformes au change kombucha-recipe-safety.
- **Contrainte** : Ne pas modifier les calculs (`kombuchaCalculatorService.ts`), les données de profils (`kombuchaData.ts`) ni les textes réglementaires de sécurité ; uniquement la structure d’affichage et le moment où l’information est montrée.
- **Cible** : Débutants (noobs) — réduire la charge cognitive, guider les choix, garder les infos essentielles accessibles au bon moment.

## Goals / Non-Goals

**Goals:**

- Appliquer le progressive disclosure : sécurité en bloc repliable (fermé par défaut), rappels courts contextuels (eau près des ingrédients, moisissure à l’étape fermentation).
- Afficher le profil de goût sous forme de résumé court par défaut, avec le détail en dépliable.
- Mettre en avant « Premier brassage » et afficher un message contextuel rassurant lorsque la recette est générée avec cette option.
- Ajouter une phrase d’aide sous les selects Profil et Type de thé pour guider le choix.

**Non-Goals:**

- Changer les ratios, formules ou textes de sécurité existants.
- Ajouter F2, chronologie, galerie photo ou API météo.
- Refactoriser le service ou les types au-delà du strict nécessaire pour l’affichage (ex. résumé de profil).

## Decisions

### 1. Bloc « Conseils de sécurité » repliable

- **Choix** : Remplacer le bloc toujours visible par une ligne d’intro (« On vous rappelle l’eau, le matériel et la moisissure au bon moment. » ou équivalent) + un bloc repliable intitulé « À savoir » ou « Conseils de sécurité », **fermé par défaut**, contenant les trois textes complets (eau, moisissure, matériel). L’utilisateur peut l’ouvrir à tout moment.
- **Rationale** : Réduire la surcharge à l’arrivée tout en gardant le contenu disponible ; conformité avec la spec (les rappels restent présents sur la page).
- **Alternative écartée** : Garder le bloc toujours ouvert — ne résout pas la surcharge pour les débutants.

### 2. Rappels contextuels à l’affichage de la recette

- **Choix** : Lorsqu’une recette est affichée : (1) près de la liste des ingrédients, afficher un rappel **eau** court (1–2 lignes, ex. « Utilisez de l’eau sans chlore (filtrée, source, ou robinet bouilli / repos 24 h). ») ; (2) à l’étape de fermentation (ou immédiatement après la liste des instructions), afficher un rappel **moisissure** résumé (2–3 lignes : à jeter vs normal + en cas de doute ne pas consommer). Le bloc repliable conserve les textes complets.
- **Rationale** : L’info apparaît au moment où elle est pertinente (eau avant de lister les ingrédients, moisissure avant de laisser fermenter).
- **Alternative écartée** : Uniquement le bloc repliable sans rappels contextuels — moins guidant pour un noob qui ne pense pas à ouvrir le bloc.

### 3. Profil de goût : résumé + dépliable

- **Choix** : En tête du résultat, afficher un **résumé court** du profil (1–2 phrases), dérivé des descriptions existantes ou nouvelle clé dans les données. Un lien ou bouton « En savoir plus sur ce profil » ouvre un bloc dépliable contenant le paragraphe détaillé actuel (`expectedTasteProfile`).
- **Implémentation** : Soit une clé `summary` par profil/thé dans les données (idéal pour i18n), soit une fonction qui tronque/synthétise la description (plus simple, moins précis). Préférer une clé `summary` si on ajoute peu de constantes.
- **Rationale** : Éviter le mur de texte au premier coup d’œil tout en conservant le détail pour qui le souhaite.

### 4. Premier brassage : visibilité et message contextuel

- **Choix** : (1) Garder la checkbox « C’est mon premier brassage » mais la rendre plus visible (déplacer en haut du formulaire ou la mettre en évidence visuellement). (2) Lorsque la recette est générée avec « Premier brassage » coché, afficher un message contextuel court au-dessus ou juste après le titre de la recette, du type : « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage. »
- **Rationale** : Renforce la confiance et explique pourquoi les chiffres diffèrent (20 % starter) sans toucher au calcul.

### 5. Aide aux choix (Profil et Type de thé)

- **Choix** : Sous chaque select, afficher un texte d’aide statique (non éditable) : sous « Profil aromatique », ex. « Pour commencer : Classique et Équilibré. » ; sous « Type de thé », ex. « Thé noir : le plus simple pour le SCOBY. Thé vert : fermentation un peu plus rapide. » Texte court (< 1 ligne si possible), en style hint (couleur secondaire, petite taille).
- **Rationale** : Réduit l’indécision sans surcharger ; pas de logique dynamique (reste simple).

### 6. Composant repliable / dépliable

- **Choix** : Réutiliser un pattern existant si présent (ex. `<details>` / `<summary>` natif pour accessibilité), sinon implémenter un petit composant local (état ouvert/fermé, aria-expanded). Pas d’obligation de créer un composant générique dans `Common` pour ce change.
- **Rationale** : Simplicité ; `<details>` évite du JS et est accessible par défaut.

## Risks / Trade-offs

- **Risque** : Un utilisateur ne ouvre jamais le bloc sécurité et rate les textes complets.  
  **Mitigation** : Les rappels courts (eau, moisissure) sont affichés avec la recette ; le bloc repliable reste visible et intitulé clairement.

- **Risque** : Le résumé du profil de goût peut être redondant ou trop vague.  
  **Mitigation** : Utiliser une formulation dérivée des descriptions existantes ; garder le détail à un clic.

- **Compromis** : Plus d’éléments UI (repliables, messages) = plus de code à maintenir. Accepté pour le bénéfice UX.

## Migration Plan

- Déploiement : modification uniquement du front (écran kombucha). Pas de migration de données.
- Rollback : revert du commit sur `KombuchaGeneratorScreen.tsx` (et éventuellement constantes / petit composant) ; le comportement revient au bloc sécurité toujours visible et profil long.

## Open Questions

- Aucun blocant. Optionnel : presets de volume (1 L, 2 L, 4 L, 1 gallon) et encart « Astuce » méthode dilution dans les instructions peuvent être traités dans un change ultérieur si le scope doit rester serré.
