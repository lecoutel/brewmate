# Spec: Water Quality Screen (écran Qualité de l'eau)

## ADDED Requirements

### Requirement: URL partageable pour l'eau en bouteille

L'écran Qualité de l'eau SHALL refléter la sélection "eau en bouteille" et le produit choisi dans l'URL via des paramètres (ex. `water=bottle` et `code=<productCode>`). L'ouverture de l'écran avec ces paramètres présents (partage de lien ou navigation privée) SHALL afficher le mode bouteille et charger puis afficher les données du produit correspondant sans dépendre du localStorage.

#### Scenario: Ouverture avec paramètres bouteille dans l'URL

- **WHEN** l'utilisateur ouvre l'écran Qualité de l'eau avec une URL contenant `water=bottle` et `code` égal à un code produit valide (ex. code Open Food Facts)
- **THEN** la source affichée est "Eau en bouteille", le produit est chargé (getBottledWaterProfile), et la fiche de qualité d'eau s'affiche comme si l'utilisateur avait sélectionné cette eau

#### Scenario: Partage du lien après sélection d'une eau en bouteille

- **WHEN** l'utilisateur a sélectionné une eau en bouteille sur l'écran
- **THEN** l'URL de la page contient les paramètres reflétant cette sélection (ex. `water=bottle` et `code=<code du produit>`), de sorte que copier/partager l'URL permet à un tiers d'afficher les mêmes données en ouvrant le lien

#### Scenario: Passage au robinet nettoie les paramètres bouteille

- **WHEN** l'utilisateur bascule de "Eau en bouteille" vers "Eau du robinet"
- **THEN** les paramètres d'URL liés à la bouteille (ex. `water`, `code`) sont retirés de l'URL

### Requirement: Persistance et réaffichage du texte de recherche bouteille

L'écran Qualité de l'eau SHALL persister le texte saisi dans le champ "Rechercher une eau en bouteille" (bottleQuery) et SHALL réafficher ce texte dans le champ lorsque l'utilisateur revient sur l'écran avec une eau en bouteille déjà sélectionnée (revisite ou retour après partage).

#### Scenario: Revisite avec eau en bouteille déjà sélectionnée

- **WHEN** l'utilisateur a précédemment sélectionné une eau en bouteille (ex. Volvic) et revient plus tard sur l'écran Qualité de l'eau (même session ou nouvelle visite, avec état persisté)
- **THEN** le champ "Rechercher une eau en bouteille" affiche le texte correspondant à la sélection (ex. le nom du produit), et la fiche de qualité de l'eau s'affiche comme avant

#### Scenario: Effacer les valeurs réinitialise aussi le texte de recherche persisté

- **WHEN** l'utilisateur clique sur "Effacer les valeurs" alors que la source est "Eau en bouteille" (ou après avoir utilisé la bouteille)
- **THEN** le texte de recherche bouteille persisté est également effacé, de sorte qu'une prochaine visite affiche un champ de recherche vide tant qu'aucune nouvelle sélection n'est faite
