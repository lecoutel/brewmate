# Spec: Générateur de recettes de kombucha — premier brassage sans starter (delta)

## MODIFIED Requirements

### Requirement: Ratios de sécurité (sucre, starter, thé)

Le générateur SHALL produire des recettes dont les ratios respectent les planchers et fourchettes suivants, pour tout volume demandé et toute combinaison de profil/thé :

- **Sucre** : quantité par litre de volume final ≥ 70 g/L. Aucun profil ne SHALL produire une recette avec moins de 70 g de sucre par litre.
- **Starter (liquide de démarrage)** :
  - **Lorsque « C’est mon premier brassage » est coché** : la recette ne SHALL pas inclure d’ingrédient « Starter liquide (Kombucha non pasteurisé d’un batch précédent) ». Le volume de moût (eau + thé + sucre) SHALL être calculé sur la totalité du volume final désiré (pas de réserve starter). L’utilisateur SHALL être guidé pour se procurer du kombucha non pasteurisé du commerce ou un kit (SCOBY + liquide) pour inoculer ce premier brassin.
  - **Lorsque « Premier brassage » n’est pas coché** : proportion du volume final entre 10 % et 20 % inclus. La proportion SHALL être de 15 %. La quantité calculée ne SHALL jamais être inférieure à 10 % du volume final (plancher pour les grands volumes).
- **Thé** : quantité par litre dans la fourchette 6–9 g/L (référence 7–8 g/L) pour assurer un substrat suffisant au SCOBY. Aucun thé aromatisé aux huiles essentielles (ex. Earl Grey) ne SHALL être proposé comme option.

#### Scenario: Recette avec profil "Léger et Doux"

- **GIVEN** l'utilisateur choisit le volume 2 L, profil Léger et Doux (LIGHT_GENTLE), thé noir
- **WHEN** la recette est générée
- **THEN** la quantité de sucre est ≥ 140 g (2 × 70) et la quantité de thé est dans [12, 18] g (2 × 6 à 2 × 9)

#### Scenario: Premier brassage — pas de starter d’un batch précédent

- **GIVEN** l'utilisateur choisit 4 L et coche "C'est mon premier brassage"
- **WHEN** la recette est générée
- **THEN** la liste des ingrédients ne contient pas d’ingrédient libellé « Starter liquide (Kombucha non pasteurisé d'un batch précédent) »
- **AND** le volume d’eau totale (moût) correspond au volume final désiré (4 L) sans soustraction d’un volume starter
- **AND** un message ou un ingrédient guide l’utilisateur pour se procurer du kombucha non pasteurisé (commerce ou kit) pour ce premier batch

#### Scenario: Brassage habituel → starter 15 %, plancher 10 %

- **GIVEN** l'utilisateur choisit 4 L et ne coche pas "Premier brassage"
- **WHEN** la recette est générée
- **THEN** le starter liquide est 0,60 L (15 % de 4 L)

- **GIVEN** l'utilisateur choisit 20 L et ne coche pas "Premier brassage"
- **WHEN** la recette est générée
- **THEN** le starter liquide est au moins 2,00 L (10 % de 20 L). Si la règle métier impose 15 %, alors 3,00 L ; le plancher 10 % s'applique si un calcul donnerait moins (ici 15 % = 3 L ≥ 2 L, donc 3 L).

#### Scenario: Aucune recette en dessous de 70 g/L de sucre

- **WHEN** une recette est générée pour n'importe quel profil (Léger, Classique, Intense) et n'importe quel volume
- **THEN** sugarGrams / desiredVolumeL ≥ 70

---

### Requirement: Input "Premier brassage"

L’écran du générateur de kombucha SHALL proposer un moyen de signaler que c’est le premier brassage de l’utilisateur (checkbox ou équivalent). La valeur SHALL être incluse dans les entrées du calcul de recette et SHALL être persistée avec les autres paramètres (ex. localStorage) pour réutilisation.

- **Lorsque « C’est mon premier brassage » est coché** : la recette générée SHALL ne pas lister d’ingrédient « Starter liquide (Kombucha non pasteurisé d’un batch précédent) » ni d’instruction demandant d’ajouter « les X L de starter liquide » d’un batch précédent. La recette SHALL inclure un guidage (message contextuel et/ou ingrédient) pour se procurer du kombucha non pasteurisé du commerce ou un kit de démarrage (SCOBY + liquide) pour inoculer ce premier brassin. L’écran SHALL ne pas afficher le message « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage ».
- **Lorsque « Premier brassage » n’est pas coché** : la recette SHALL utiliser 15 % de starter (plancher 10 %) comme aujourd’hui.

#### Scenario: Premier brassage coché — recette sans starter maison

- **GIVEN** "C'est mon premier brassage" est coché
- **WHEN** l'utilisateur demande la recette
- **THEN** la liste des ingrédients ne contient pas « Starter liquide (Kombucha non pasteurisé d'un batch précédent) »
- **AND** un message ou un ingrédient indique de se procurer du kombucha non pasteurisé (commerce ou kit) pour ce premier batch
- **AND** le message « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage » n’est pas affiché

#### Scenario: Persistance du choix premier brassage

- **GIVEN** l'utilisateur a coché "Premier brassage" et quitté l'écran
- **WHEN** l'utilisateur revient sur le générateur de kombucha
- **THEN** la case "Premier brassage" est encore cochée (si la persistance est implémentée pour ce champ)

---

### Requirement: Instructions de la recette (étape eau et fermentation)

Les instructions générées SHALL inclure :

- Une **étape 0** (ou première étape) dédiée à l’eau : préparation de l’eau sans chlore (filtrée, source, ou robinet bouilli / repos 24 h). Texte suggéré : "Préparez l’eau : utilisez de l’eau filtrée ou de source, ou de l’eau du robinet bouillie ou laissée 24 h à l’air libre (sans chlore)."
- Dans la liste des **ingrédients**, l’eau SHALL être libellée de façon à rappeler l’absence de chlore, par ex. "Eau totale (pour infusion et dilution) — sans chlore" ou une note équivalente.
- **Étape d’inoculation** :
  - **Lorsque « C’est mon premier brassage » est coché** : l’instruction SHALL décrire d’attendre que le moût soit à température (ex. 20–30 °C), puis d’ajouter le kombucha non pasteurisé obtenu (commerce ou kit) et de déposer le SCOBY à la surface. Elle ne SHALL pas mentionner « starter liquide d’un batch précédent » ni un volume « X L de starter liquide » issu d’un batch précédent.
  - **Lorsque « Premier brassage » n’est pas coché** : l’instruction SHALL indiquer d’ajouter les X L de starter liquide et de déposer le SCOBY à la surface (comportement actuel).
- L’**étape de fermentation** (couvrir, température, durée) SHALL inclure la plage "entre 20 et 30 °C (idéalement 24–29 °C)", la durée "7 à 15 jours (jusqu’à 21 jours si la pièce est plus froide)" et l’invitation à goûter dès le 5ᵉ jour (voir texte température dans les rappels de sécurité).

#### Scenario: Étape 0 présente

- **WHEN** une recette est générée
- **THEN** la première étape (ou étape 0) des instructions concerne la préparation de l'eau sans chlore

#### Scenario: Premier brassage — étape d’inoculation sans « starter d’un batch précédent »

- **GIVEN** "C'est mon premier brassage" est coché et l’utilisateur génère la recette
- **WHEN** les instructions sont affichées
- **THEN** l’étape d’inoculation ne contient pas la phrase « ajoutez les X L de starter liquide » (volume de batch précédent) et guide l’utilisateur pour ajouter le kombucha obtenu (commerce ou kit) et le SCOBY

#### Scenario: Étape fermentation avec température et durée

- **WHEN** une recette est générée
- **THEN** une étape contient les termes "20 et 30 °C", "24–29 °C", "7 à 15 jours" et une mention du goût dès le 5ᵉ jour
