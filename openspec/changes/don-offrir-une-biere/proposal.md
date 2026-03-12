## Why

Les utilisateurs de BrewMate n'ont pas aujourd'hui de moyen pour soutenir le projet par un don. Offrir une option « Offrir une bière » permet à ceux qui le souhaitent de contribuer librement, sans engagement, avec des montants en euros adaptés au public français.

## What Changes

- **Don volontaire (PayPal)** : les utilisateurs peuvent faire un don du montant de leur choix via PayPal. Pour l'instant, utilisation de PayPal (compte existant ou PayPal.me) ; pas de backend, uniquement des liens ouverts vers PayPal.
- **Montants** : boutons pour montants prédéfinis (2 €, 5 €, 15 €, 25 €) et option « Autre montant » (saisie libre, ex. 1 € ou 1 000 000 €).
- **Points d'entrée** : accès depuis la Home (section ou bloc « Offrir une bière ») et depuis le footer commun (lien « Offrir une bière » à côté de « Donner mon avis »).
- **Public** : ciblage France, tout en euros (€).

## Capabilities

### New Capabilities

- `don-offrir-une-biere` : permettre aux utilisateurs de faire un don volontaire via PayPal, avec montants prédéfinis (2 €, 5 €, 15 €, 25 €) et montant personnalisé, depuis la Home et le footer commun. Libellé : « Offrir une bière ».

### Modified Capabilities

- Aucune.

## Impact

- **Frontend** : nouveau contenu sur la Home (section ou bloc « Offrir une bière » avec boutons de montant + custom), enrichissement du footer dans `PageLayout` (lien « Offrir une bière »). Option : écran dédié ou modal pour choisir le montant puis redirection PayPal ; aucune logique de paiement côté app.
- **Dépendances** : aucun package supplémentaire ; configuration d'une URL de base PayPal (PayPal.me ou lien don) en constante.
- **Hébergement** : l'app reste 100 % statique.
