# Spec: Générateur de recettes de kombucha (recettes sécurisées)

## ADDED Requirements

### Requirement: Ratios de sécurité (sucre, starter, thé)

Le générateur SHALL produire des recettes dont les ratios respectent les planchers et fourchettes suivants, pour tout volume demandé et toute combinaison de profil/thé :

- **Sucre** : quantité par litre de volume final ≥ 70 g/L. Aucun profil ne SHALL produire une recette avec moins de 70 g de sucre par litre.
- **Starter (liquide de démarrage)** : proportion du volume final entre 10 % et 20 % inclus. La proportion SHALL être de 20 % lorsque l’utilisateur indique que c’est son premier brassage ; sinon 15 %. La quantité calculée ne SHALL jamais être inférieure à 10 % du volume final (plancher pour les grands volumes).
- **Thé** : quantité par litre dans la fourchette 6–9 g/L (référence 7–8 g/L) pour assurer un substrat suffisant au SCOBY. Aucun thé aromatisé aux huiles essentielles (ex. Earl Grey) ne SHALL être proposé comme option.

#### Scenario: Recette avec profil "Léger et Doux"

- **GIVEN** l’utilisateur choisit le volume 2 L, profil Léger et Doux (LIGHT_GENTLE), thé noir
- **WHEN** la recette est générée
- **THEN** la quantité de sucre est ≥ 140 g (2 × 70) et la quantité de thé est dans [12, 18] g (2 × 6 à 2 × 9)

#### Scenario: Premier brassage → starter 20 %

- **GIVEN** l’utilisateur choisit 4 L et coche "C’est mon premier brassage"
- **WHEN** la recette est générée
- **THEN** le starter liquide est 0,80 L (20 % de 4 L)

#### Scenario: Brassage habituel → starter 15 %, plancher 10 %

- **GIVEN** l’utilisateur choisit 4 L et ne coche pas "Premier brassage"
- **WHEN** la recette est générée
- **THEN** le starter liquide est 0,60 L (15 % de 4 L)

- **GIVEN** l’utilisateur choisit 20 L et ne coche pas "Premier brassage"
- **WHEN** la recette est générée
- **THEN** le starter liquide est au moins 2,00 L (10 % de 20 L). Si la règle métier impose 15 %, alors 3,00 L ; le plancher 10 % s’applique si un calcul donnerait moins (ici 15 % = 3 L ≥ 2 L, donc 3 L).

#### Scenario: Aucune recette en dessous de 70 g/L de sucre

- **WHEN** une recette est générée pour n’importe quel profil (Léger, Classique, Intense) et n’importe quel volume
- **THEN** sugarGrams / desiredVolumeL ≥ 70

---

### Requirement: Input "Premier brassage"

L’écran du générateur de kombucha SHALL proposer un moyen de signaler que c’est le premier brassage de l’utilisateur (checkbox ou équivalent). La valeur SHALL être incluse dans les entrées du calcul de recette et SHALL être persistée avec les autres paramètres (ex. localStorage) pour réutilisation. La recette générée SHALL utiliser 20 % de starter lorsque "Premier brassage" est coché, et 15 % sinon (sous réserve du plancher 10 %).

#### Scenario: Premier brassage coché puis recette générée

- **GIVEN** "C’est mon premier brassage" est coché
- **WHEN** l’utilisateur demande la recette
- **THEN** la liste des ingrédients affiche un volume de starter égal à 20 % du volume final souhaité

#### Scenario: Persistance du choix premier brassage

- **GIVEN** l’utilisateur a coché "Premier brassage" et quitté l’écran
- **WHEN** l’utilisateur revient sur le générateur de kombucha
- **THEN** la case "Premier brassage" est encore cochée (si la persistance est implémentée pour ce champ)

---

### Requirement: Rappels de sécurité affichés

L’écran du générateur de kombucha SHALL afficher les rappels de sécurité suivants lorsque la recette est affichée (ou en permanence dans un bloc dédié à côté du formulaire). Les textes SHALL être ceux définis ci‑dessous (ou équivalents validés).

#### 1. Eau (sans chlore)

Texte exact à afficher (ou équivalent) :

> Utilisez de l’eau filtrée ou de source. Si vous n’avez que l’eau du robinet : faites-la bouillir ou laissez-la reposer 24 h à l’air libre avant de l’utiliser.

#### 2. Moisissure vs normal

Texte exact à afficher (ou équivalent) :

> **Moisissure (à jeter)** : en surface du liquide ou du SCOBY, aspect sec, duveteux, velu ou poudreux ; couleurs blanc vif, vert, bleu, gris ou noir. **Normal** : sédiments bruns, nouvelle membrane translucide (bébé SCOBY). En cas de moisissure, jetez tout (liquide + SCOBY) et désinfectez le matériel. En cas de doute, ne pas consommer.

#### 3. Matériel

Texte exact à afficher (ou équivalent) :

> Privilégiez un récipient en verre ou en inox alimentaire (304/316). Évitez les récipients en métal non alimentaire ou en céramique émaillée non garantie sans plomb.

#### 4. Température de fermentation

La consigne de température SHALL figurer dans les instructions de la recette (étape de fermentation) avec la formulation suivante ou équivalente :

> Laissez fermenter dans un endroit sombre, entre 20 et 30 °C (idéalement 24–29 °C), pendant 7 à 15 jours (jusqu’à 21 jours si la pièce est plus froide). Dès le 5ᵉ jour vous pouvez goûter à la paille pour ajuster.

#### Scenario: Recette affichée → rappels visibles

- **WHEN** l’utilisateur a généré une recette et que le résultat est affiché
- **THEN** au moins un bloc "Sécurité" ou "À savoir" (ou équivalent) est visible sur la même page, contenant les rappels Eau, Moisissure et Matériel (texte identique ou équivalent à ceux ci‑dessus). La consigne Température est présente dans la liste des étapes de la recette.

---

### Requirement: Instructions de la recette (étape eau et fermentation)

Les instructions générées SHALL inclure :

- Une **étape 0** (ou première étape) dédiée à l’eau : préparation de l’eau sans chlore (filtrée, source, ou robinet bouilli / repos 24 h). Texte suggéré : "Préparez l’eau : utilisez de l’eau filtrée ou de source, ou de l’eau du robinet bouillie ou laissée 24 h à l’air libre (sans chlore)."
- Dans la liste des **ingrédients**, l’eau SHALL être libellée de façon à rappeler l’absence de chlore, par ex. "Eau totale (pour infusion et dilution) — sans chlore" ou une note équivalente.
- L’**étape de fermentation** (couvrir, température, durée) SHALL inclure la plage "entre 20 et 30 °C (idéalement 24–29 °C)", la durée "7 à 15 jours (jusqu’à 21 jours si la pièce est plus froide)" et l’invitation à goûter dès le 5ᵉ jour (voir texte température ci‑dessus).

#### Scenario: Étape 0 présente

- **WHEN** une recette est générée
- **THEN** la première étape (ou étape 0) des instructions concerne la préparation de l’eau sans chlore

#### Scenario: Étape fermentation avec température et durée

- **WHEN** une recette est générée
- **THEN** une étape contient les termes "20 et 30 °C", "24–29 °C", "7 à 15 jours" et une mention du goût dès le 5ᵉ jour

---

### Requirement: Données des profils (sécurité sucre et thé)

Les données des profils (ex. `kombuchaData.ts`) SHALL être telles que :

- Pour le profil **LIGHT_GENTLE** (Léger et Doux) : `sugar_per_liter` ≥ 70, `tea_per_liter` dans [6, 9] (recommandé 7 pour cohérence avec la référence 7–8 g/L).
- Pour les profils **CLASSIC_BALANCED** et **INTENSE_VINEGARY** : `sugar_per_liter` reste ≥ 70, `tea_per_liter` dans [6, 9].

Aucune donnée de profil ne SHALL permettre de générer une recette avec &lt; 70 g de sucre par litre.

#### Scenario: Données LIGHT_GENTLE conformes

- **WHEN** le code charge les profils pour le générateur
- **THEN** LIGHT_GENTLE.sugar_per_liter ≥ 70 et LIGHT_GENTLE.tea_per_liter est entre 6 et 9
