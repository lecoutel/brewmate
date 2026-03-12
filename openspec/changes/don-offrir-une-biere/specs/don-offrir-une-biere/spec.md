## ADDED Requirements

### Requirement: Don avec montants prédéfinis

Le système SHALL proposer un moyen de faire un don via PayPal avec des montants prédéfinis : 2 €, 5 €, 15 € et 25 €. Chaque choix SHALL ouvrir l’URL PayPal (PayPal.me ou lien don) avec le montant correspondant, en euros.

#### Scenario: Clic sur un montant prédéfini

- **WHEN** l’utilisateur clique sur l’un des montants prédéfinis (2 €, 5 €, 15 €, 25 €)
- **THEN** le système ouvre l’URL PayPal avec ce montant (nouvel onglet ou fenêtre), en euros

### Requirement: Don avec montant personnalisé

Le système SHALL proposer une option « Autre montant » (ou équivalent) permettant de saisir un montant libre. L’ouverture vers PayPal SHALL utiliser ce montant en euros.

#### Scenario: Saisie et validation d’un montant personnalisé

- **WHEN** l’utilisateur saisit un montant dans le champ « Autre montant » et valide (bouton ou équivalent)
- **THEN** le système ouvre l’URL PayPal avec ce montant en euros (si la valeur est valide, ex. nombre > 0)

#### Scenario: Montant personnalisé invalide

- **WHEN** l’utilisateur saisit une valeur invalide (vide, négatif, non numérique) et tente de valider
- **THEN** le système n’ouvre pas PayPal et signale l’erreur (message ou état désactivé)

### Requirement: Entrée depuis la Home

Le système SHALL exposer un point d’entrée « Offrir une bière » sur la page d’accueil (Home), menant vers la même interface de choix du montant (prédéfini ou personnalisé).

#### Scenario: Accès depuis la Home

- **WHEN** l’utilisateur est sur la Home et clique sur « Offrir une bière »
- **THEN** il accède à l’écran (ou section) où il peut choisir un montant prédéfini ou personnalisé

### Requirement: Entrée depuis le footer commun

Le système SHALL afficher un lien « Offrir une bière » dans le footer commun (PageLayout), visible sur la Home et les écrans outils, menant vers la même interface de choix du montant.

#### Scenario: Accès depuis le footer

- **WHEN** l’utilisateur clique sur « Offrir une bière » dans le footer
- **THEN** il accède à l’écran (ou section) où il peut choisir un montant prédéfini ou personnalisé

### Requirement: Libellé et devise

L’ensemble de la fonctionnalité SHALL utiliser le libellé « Offrir une bière » pour les entrées utilisateur. Les montants SHALL être affichés et envoyés à PayPal en euros (€).

#### Scenario: Affichage en euros

- **WHEN** l’utilisateur voit les montants prédéfinis ou le champ « Autre montant »
- **THEN** les montants sont affichés en euros (€) et le paiement est effectué en euros
