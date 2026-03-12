## Why

Les utilisateurs de BrewMate n'ont pas aujourd'hui de moyen simple pour envoyer un avis, signaler un bug ou proposer une amélioration. Offrir un canal de feedback dédié améliore la relation utilisateur et permet de prioriser les évolutions en fonction des retours réels.

## What Changes

- **Formulaire de feedback** : les utilisateurs peuvent envoyer un message, proposer une amélioration, ou indiquer ce qu'ils aiment ou n'aiment pas. Un seul formulaire avec type de feedback pré-rempli selon l'entrée choisie.
- **Envoi par email** : les soumissions sont transmises par email à l'adresse du mainteneur (gavelle.simon@gmail.com), sans backend côté app — via un service de formulaire tiers (Formspree, Getform, Web3Forms ou équivalent).
- **Points d'entrée** : accès au feedback depuis la Home (lien ou section « Donner mon avis » avec les 4 types : Message, Amélioration, J'aime, J'aime pas) et depuis un footer commun affiché sur la Home et les écrans outils.
- **Footer commun** : introduction d'un composant footer réutilisé sur les écrans principaux, contenant au minimum le lien vers le feedback.

## Capabilities

### New Capabilities

- `user-feedback`: collecte de feedback utilisateur (message libre, amélioration, j'aime / j'aime pas) avec envoi par service formulaire vers l'email du mainteneur, et points d'entrée sur la Home et dans un footer commun.

### Modified Capabilities

- Aucune (pas de changement de spec existant).

## Impact

- **Frontend** : nouveau formulaire (page ou modal), nouveaux liens/boutons sur la Home, nouveau composant footer et intégration du footer dans le layout des écrans concernés.
- **Dépendances** : aucun package npm supplémentaire requis ; utilisation d'un service formulaire externe (configuration via URL d'endpoint et éventuellement clé API en env/build).
- **Hébergement** : l'app reste 100 % statique ; le service de formulaire est hébergé par le fournisseur choisi.
