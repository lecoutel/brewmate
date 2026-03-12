## ADDED Requirements

### Requirement: Formulaire de feedback avec type et message

Le système SHALL fournir un formulaire permettant d'envoyer un feedback avec un type (message, amélioration, j'aime, j'aime pas) et un message texte. Le type peut être pré-rempli via un paramètre d'URL. L'envoi SHALL être effectué vers un service formulaire tiers configuré pour transmettre les données par email à gavelle.simon@gmail.com.

#### Scenario: Ouverture du formulaire sans type

- **WHEN** l'utilisateur accède à la page de feedback sans paramètre type (ex. `/feedback`)
- **THEN** le formulaire affiche un champ type sélectionnable (message, amélioration, j'aime, j'aime pas) et un champ message

#### Scenario: Ouverture du formulaire avec type pré-rempli

- **WHEN** l'utilisateur accède à la page de feedback avec un paramètre type (ex. `/feedback?type=amelioration`)
- **THEN** le formulaire affiche le type correspondant déjà sélectionné et le champ message

#### Scenario: Envoi réussi du feedback

- **WHEN** l'utilisateur remplit le message et soumet le formulaire
- **THEN** les données (type + message) sont envoyées au service formulaire configuré et l'utilisateur reçoit une indication de succès (page de remerciement ou message affiché)

### Requirement: Accès au feedback depuis la Home

Le système SHALL proposer sur la Home au moins une section ou des liens « Donner mon avis » offrant quatre entrées : Message, Amélioration, J'aime, J'aime pas. Chaque entrée SHALL mener vers la page de feedback avec le type correspondant pré-rempli.

#### Scenario: Navigation depuis la Home vers le formulaire avec type

- **WHEN** l'utilisateur clique sur une des entrées (Message, Amélioration, J'aime, J'aime pas) sur la Home
- **THEN** l'utilisateur est dirigé vers la page de feedback avec le paramètre type approprié

### Requirement: Lien feedback dans le footer commun

Le système SHALL afficher un footer commun sur la Home et les écrans outils (via le layout existant). Ce footer SHALL contenir un lien « Donner mon avis » (ou équivalent) vers la page de feedback.

#### Scenario: Accès au feedback depuis le footer sur la Home

- **WHEN** l'utilisateur est sur la Home et clique sur le lien feedback dans le footer
- **THEN** l'utilisateur est dirigé vers la page de feedback

#### Scenario: Accès au feedback depuis le footer sur un écran outil

- **WHEN** l'utilisateur est sur un écran outil (ex. calculateur pH, kombucha) et clique sur le lien feedback dans le footer
- **THEN** l'utilisateur est dirigé vers la page de feedback
