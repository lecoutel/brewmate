# Design: Home organisée par intention d'usage

## Context

- **État actuel** : `HomeScreen.tsx` affiche une liste plate de `CALCULATORS` (6 entrées) dans un `grid grid-cols-1 gap-4`, avec un bandeau d’accueil « Bonjour, brasseur » et le texte « Sélectionnez un outil pour démarrer votre session ». Les métadonnées (id, name, description, icon, route) sont dans `constants.tsx` ; chaque outil est rendu via le composant `Card` existant.
- **Contraintes** : Pas de changement de routes ni de comportement des écrans cibles ; pas de nouvelle dépendance ; l’app reste React + Tailwind, offline-first.
- **Stakeholders** : Utilisateur final (brasseur) qui ouvre l’app pour une action précise et doit comprendre quel outil utiliser.

## Goals / Non-Goals

**Goals:**

- Afficher les outils regroupés en sections par intention (Comprendre mon eau, Ajuster le pH, Atteindre ma densité cible, Mesurer le résultat, Autres boissons).
- Afficher pour chaque section un titre et une description courte (quand / pourquoi).
- Conserver les cards et la navigation existantes ; seule la structure de la page et les libellés de section changent.

**Non-Goals:**

- Changer les routes, les écrans des outils ou la logique des calculateurs.
- Ajouter favoris, raccourcis ou « récemment utilisés ».
- Modifier le splash, le thème ou le footer.

## Decisions

### 1. Source de vérité des sections

- **Choix** : Définir les sections (id, titre, description, liste d’IDs d’outils) soit dans `constants.tsx`, soit en dur dans `HomeScreen.tsx`.
- **Recommandation** : Constante dédiée dans `constants.tsx` (ex. `HOME_SECTIONS`) qui référence les `id` des entrées de `CALCULATORS`. Rationale : un seul endroit pour l’ordre et le regroupement, plus simple pour faire évoluer les libellés ou l’ordre des sections sans toucher à la logique du composant.
- **Alternative** : Tout en dur dans `HomeScreen` — acceptable pour un nombre de sections fixe et peu de changements attendus.

### 2. Structure des sections (ordre et contenu)

- **Choix** : Cinq sections dans l’ordre : (1) Comprendre mon eau → Qualité de l’eau ; (2) Ajuster le pH → Correction du pH ; (3) Atteindre ma densité cible → Densité pré-ébullition, Densité post-ébullition ; (4) Mesurer le résultat (alcool) → Calcul ABV ; (5) Autres boissons → Générateur Kombucha.
- **Rationale** : Aligné avec la proposition (intention informatif d’abord, puis actions par phase, Kombucha à part).

### 3. Rendu des sections

- **Choix** : Dans `HomeScreen`, itérer sur les sections ; pour chaque section, afficher un bloc (titre + description) puis les `Card` des outils de la section (en réutilisant `CALCULATORS` pour les métadonnées). Pas de nouveau composant obligatoire : un fragment ou un div par section suffit.
- **Alternative** : Extraire un composant `HomeSection` (titre, description, children) pour clarté et réutilisation — à faire si le JSX devient lourd.

### 4. Micro-copy d’en-tête

- **Choix** : Remplacer « Sélectionnez un outil pour démarrer votre session » par un texte orienté intention, ex. « Choisissez un outil selon ce que vous voulez faire. »
- **Rationale** : Cohérent avec l’organisation par intention et la compréhension.

## Risks / Trade-offs

- **Risque** : Duplication entre libellés de section et descriptions des cards → **Mitigation** : les descriptions de section expliquent le « quand/pourquoi » du bloc ; les descriptions des cards restent techniques (ce que fait l’outil). Pas de suppression des descriptions de cards.
- **Risque** : Évolution future (nouvel outil, nouvelle section) → **Mitigation** : une structure `HOME_SECTIONS` dans constants rend les ajouts prévisibles (nouvelle section ou ajout d’un id à une section existante).

## Migration Plan

- Déploiement : déploiement classique (build puis déploiement statique). Aucune donnée persistée côté home.
- Rollback : revert du commit ; la home redevient la liste plate sans impact sur les routes ou les écrans des outils.

## Open Questions

- Aucune ; les libellés exacts des titres et descriptions de section peuvent être ajustés en implémentation (ex. mention explicite de Brewfather pour « Comprendre mon eau »).
