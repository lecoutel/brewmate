## Context

BrewMate est une SPA React (Vite) 100 % frontend, sans backend. Le layout commun est `PageLayout` (header + main + footer). Le footer affiche déjà « Donner mon avis » et le copyright. La Home affiche des sections d'outils et une section « Donner mon avis ». Public cible : surtout France, montants en euros. Pour l'instant, le don se fait via PayPal (compte existant ou PayPal.me).

## Goals / Non-Goals

**Goals:**

- Permettre aux utilisateurs de faire un don volontaire via PayPal avec le libellé « Offrir une bière ».
- Proposer des montants prédéfinis (2 €, 5 €, 15 €, 25 €) et un montant personnalisé (saisie libre).
- Exposer l’entrée depuis la Home et depuis le footer commun (un seul flux réutilisable).

**Non-Goals:**

- Backend, traitement des paiements côté app, suivi des dons in-app.
- Autre plateforme que PayPal en v1 (Stripe, Ko-fi, etc. restent possibles plus tard).
- Authentification ou identification des donateurs.

## Decisions

### 1. PayPal.me comme URL de base

**Choix :** Utiliser une URL PayPal.me (ex. `https://paypal.me/TonPseudo`) configurée en constante. Pour les montants prédéfinis et le custom, construire l’URL avec le montant : `https://paypal.me/TonPseudo/<montant>` (PayPal pré-remplit le montant en €).

**Rationale :** Pas de backend ; un seul compte PayPal ; custom amount possible sans serveur. Alternative : lien « Don » PayPal classique — moins flexible pour le montant variable. Si le compte n’est pas encore en PayPal.me, documenter la création et utiliser en attendant un lien don PayPal classique avec boutons prédéfinis + lien générique pour « autre montant » (sans pré-remplissage).

**Implémentation :** Une constante (ex. `PAYPAL_ME_BASE` ou `DONATION_PAYPAL_URL`) pour l’URL de base. Pour custom, valider que le montant est un nombre > 0 (optionnel : plafond raisonnable côté UI) puis ouvrir `paypal.me/.../montant`.

### 2. Point d’entrée : écran dédié vs uniquement liens directs

**Choix :** Une destination commune (écran dédié ou modal) « Offrir une bière » qui affiche les 4 boutons (2 €, 5 €, 15 €, 25 €) et le champ « Autre montant » + bouton. Clic sur un montant → ouverture de l’URL PayPal correspondante. Depuis la Home et le footer, on navigue vers cette destination (même route ou même composant).

**Rationale :** Une seule UI pour les montants et le custom ; pas de duplication de logique ; expérience cohérente. Alternative : uniquement des liens directs depuis la Home (4 liens + 1 « autre ») — rejetée pour garder une UX claire et un seul endroit à maintenir.

**Implémentation :** Route dédiée (ex. `/don` ou `/offrir-une-biere`) ou section full-page dans le layout ; les boutons et le champ custom ouvrent la même fenêtre (ou nouvel onglet) vers PayPal.

### 3. Footer commun

**Choix :** Ajouter dans le footer existant de `PageLayout` un lien « Offrir une bière » à côté de « Donner mon avis » (même style : lien + séparateur). Le lien mène vers l’écran/destination « Offrir une bière ».

**Rationale :** Cohérent avec le feedback ; footer déjà commun à Home et écrans outils.

### 4. Home : section « Offrir une bière »

**Choix :** Sur la Home, une section « Offrir une bière » (titre + courte description) avec un lien ou bouton qui mène vers la même destination que le footer (écran avec montants + custom). Pas de duplication des 4 boutons sur la Home : un seul CTA « Offrir une bière » qui ouvre la page de choix du montant.

**Rationale :** Visibilité sur la Home sans surcharger ; une seule source de vérité pour la sélection du montant.

## Risks / Trade-offs

- **PayPal.me non configuré :** Si le compte n’est pas encore en PayPal.me, utiliser un lien don PayPal classique ; les montants prédéfinis peuvent être des URLs avec paramètres si supporté, sinon un seul lien « Don » et le custom ouvre le même lien (sans montant pré-rempli). Documenter la migration vers PayPal.me quand le compte est prêt.
- **Ouverture externe :** Les dons ouvrent PayPal (nouvel onglet ou fenêtre). Pas de retour automatique dans l’app ; comportement attendu pour un don.
- **Validation custom :** Montant saisi libre ; côté UI, accepter les décimales (ex. 1,5 ou 1.5) et un plafond optionnel pour éviter erreurs de saisie (ex. 9999 €). Pas de validation côté serveur (pas de backend).

## Migration Plan

- Ajouter la constante d’URL PayPal (PayPal.me ou lien don).
- Déployer l’écran « Offrir une bière », le lien footer et la section Home. Aucune migration de données. Rollback : retirer la route, la section Home et le lien footer.

## Open Questions

- Aucun pour la v1. Évolution possible : Stripe ou Ko-fi si besoin d’une expérience différente ou d’un autre canal.
