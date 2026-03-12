## 1. Configuration et route

- [x] 1.1 Ajouter la route Feedback dans `types.ts` (ex. `CalculatorRoute.Feedback = '/feedback'`) et la route dans `App.tsx` pointant vers un écran Feedback
- [x] 1.2 Introduire une config pour l'URL du service formulaire (constante ou variable d'environnement au build) et documenter le mapping des champs (type, message) pour le fournisseur choisi

## 2. Page et formulaire de feedback

- [x] 2.1 Créer `FeedbackScreen` avec `PageLayout`, lecture du paramètre `type` depuis l'URL (useSearchParams) et formulaire avec champ type (select ou radio : message, amélioration, j'aime, j'aime pas) et champ message (textarea)
- [x] 2.2 Implémenter la soumission du formulaire (POST vers l'URL du service) et gérer la confirmation de succès (page de remerciement ou message affiché selon le comportement du service)

## 3. Footer commun

- [x] 3.1 Ajouter dans le footer de `PageLayout` (Common.tsx) un lien « Donner mon avis » vers la page de feedback

## 4. Section Donner mon avis sur la Home

- [x] 4.1 Ajouter sur la Home une section « Donner mon avis » avec quatre entrées (Message, Amélioration, J'aime, J'aime pas) pointant chacune vers `/feedback?type=...` avec le type correspondant
