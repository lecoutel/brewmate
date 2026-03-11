# Spec: Home Screen (écran d'accueil)

## ADDED Requirements

### Requirement: Outils présentés par intention d'usage

L'écran d'accueil SHALL afficher les outils BrewMate regroupés en sections. Chaque section SHALL correspondre à une intention d'usage (Comprendre mon eau, Ajuster le pH, Atteindre ma densité cible, Mesurer le résultat, Autres boissons) et SHALL afficher un titre et une description courte expliquant quand et pourquoi utiliser les outils de la section.

#### Scenario: Affichage des cinq sections

- **WHEN** l'utilisateur accède à l'écran d'accueil
- **THEN** les outils sont regroupés dans exactement cinq sections, dans l'ordre : Comprendre mon eau, Ajuster le pH, Atteindre ma densité cible, Mesurer le résultat (alcool), Autres boissons

#### Scenario: Section "Comprendre mon eau"

- **WHEN** l'utilisateur consulte la première section
- **THEN** la section affiche le titre "Comprendre mon eau" et une description courte (minéraux, styles BJCP, profil Brewfather), et contient uniquement l'outil Qualité de l'eau

#### Scenario: Section "Ajuster le pH"

- **WHEN** l'utilisateur consulte la section dédiée au pH
- **THEN** la section affiche un titre relatif à l'ajustement du pH de la maische et une description courte, et contient uniquement l'outil Correction du pH

#### Scenario: Section "Atteindre ma densité cible"

- **WHEN** l'utilisateur consulte la section densité
- **THEN** la section affiche un titre et une description relatifs à la correction de densité avant/après ébullition, et contient les outils Densité Pré-Ébullition et Densité Post-Ébullition

#### Scenario: Section "Mesurer le résultat (alcool)"

- **WHEN** l'utilisateur consulte la section résultat
- **THEN** la section affiche un titre et une description relatifs à la densité finale et à l'ABV (densimètre ou réfractomètre), et contient uniquement l'outil Calcul ABV

#### Scenario: Section "Autres boissons"

- **WHEN** l'utilisateur consulte la dernière section
- **THEN** la section affiche le titre "Autres boissons" et contient uniquement l'outil Générateur Kombucha

### Requirement: Navigation inchangée vers les outils

Chaque outil SHALL rester accessible par un clic (ou tap) sur sa card. Le clic SHALL naviguer vers la route existante de l'outil sans modification des URLs ou du comportement des écrans cibles.

#### Scenario: Clic sur un outil

- **WHEN** l'utilisateur clique sur la card d'un outil (ex. Correction du pH)
- **THEN** l'application navigue vers la route associée à cet outil (ex. /ph-correction) et l'écran de l'outil s'affiche comme avant le change

### Requirement: En-tête orienté intention

L'écran d'accueil SHALL afficher un court texte d'en-tête orienté vers le choix d'outil selon l'action souhaitée (intention), et non plus uniquement "Sélectionnez un outil pour démarrer votre session".

#### Scenario: Libellé d'en-tête

- **WHEN** l'utilisateur accède à l'écran d'accueil
- **THEN** le bandeau d'accueil contient un texte invitant à choisir un outil selon ce que l'utilisateur veut faire (ou équivalent orienté intention)
