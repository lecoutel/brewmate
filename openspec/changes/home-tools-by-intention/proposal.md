# Proposal: Home organisée par intention d'usage

## Why

L'utilisateur ouvre l'app pour **une action précise** (ex. corriger le pH, vérifier l'ABV). La home actuelle affiche une liste plate de six outils sans regroupement ni explication du moment d'usage, ce qui nuit à la **compréhension** : quel outil choisir et pourquoi. Réorganiser la home par intention d'usage, avec des titres et sous-titres explicatifs par section, permet de retrouver rapidement le bon outil et de clarifier son rôle (informatif vs action).

## What Changes

- Regrouper les outils de la home en **sections par intention** (Comprendre mon eau, Ajuster le pH, Atteindre ma densité cible, Mesurer le résultat / ABV, Autres boissons).
- Ajouter pour chaque section un **titre** et une **description courte** (quand / pourquoi utiliser).
- Conserver les cards existantes et leurs descriptions détaillées ; seule la structure d’affichage et les libellés de section changent.
- Placer le **Générateur Kombucha** dans une section dédiée **« Autres boissons »** en bas.
- Traiter **Qualité de l’eau** comme outil informatif (profil Brewfather, styles BJCP) dans sa propre section, distincte de la correction du pH.

## Capabilities

### New Capabilities

- `home-screen`: Écran d’accueil listant les outils BrewMate, organisés par intention d’usage, avec titres et descriptions de section pour faciliter la compréhension et l’accès à l’outil recherché.

### Modified Capabilities

- Aucune (pas de specs existantes dans le projet).

## Impact

- **Fichiers concernés** : `screens/HomeScreen.tsx`, éventuellement `constants.tsx` (structure des sections / métadonnées) et composants communs si extraction de blocs de section.
- **Comportement** : aucun changement de routes ni de fonctionnalités des outils ; seul l’agencement et le libellé de la home changent.
- **Non affecté** : logique des calculateurs, navigation vers chaque outil, thème, splash.
