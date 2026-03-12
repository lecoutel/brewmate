## 1. Configuration et route

- [x] 1.1 Ajouter une constante pour l’URL PayPal (PayPal.me, ex. `DONATION_PAYPAL_ME_BASE` ou `DONATION_PAYPAL_URL`) et documenter son usage (construction des URLs avec montant)
- [x] 1.2 Ajouter la route « Offrir une bière » dans `types.ts` (ex. `CalculatorRoute.Don` ou `Donation`) et la route correspondante dans `App.tsx` pointant vers un écran dédié

## 2. Écran Offrir une bière

- [x] 2.1 Créer l’écran (ex. `DonationScreen` ou `OffrirUneBiereScreen`) avec `PageLayout`, titre « Offrir une bière », et quatre boutons pour les montants 2 €, 5 €, 15 €, 25 € ; chaque clic ouvre l’URL PayPal avec le montant (nouvel onglet/fenêtre)
- [x] 2.2 Ajouter le champ « Autre montant » (saisie numérique) et un bouton de validation ; à la validation, si le montant est valide (nombre > 0), ouvrir l’URL PayPal avec ce montant ; sinon afficher une erreur ou désactiver l’envoi

## 3. Footer commun

- [x] 3.1 Ajouter dans le footer de `PageLayout` (Common.tsx) un lien « Offrir une bière » vers la route de l’écran de don (à côté de « Donner mon avis »), avec le même style que les liens existants

## 4. Section sur la Home

- [x] 4.1 Ajouter sur la Home une section « Offrir une bière » (titre + courte description) avec un lien ou bouton menant vers l’écran de don (même destination que le footer)
