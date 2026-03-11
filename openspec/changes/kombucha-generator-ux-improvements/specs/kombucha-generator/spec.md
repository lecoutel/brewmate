# Spec: Générateur de recettes de kombucha (améliorations UX)

## MODIFIED Requirements

### Requirement: Rappels de sécurité affichés

L’écran du générateur de kombucha SHALL afficher les rappels de sécurité selon une **disclosure progressive** :

1. **Bloc repliable** : Un bloc intitulé « À savoir » ou « Conseils de sécurité » (ou équivalent) SHALL être présent sur la page, **fermé par défaut**, et contenir les trois textes complets ci‑dessous (Eau, Moisissure, Matériel). Une courte phrase d’intro peut inviter l’utilisateur à l’ouvrir (ex. « On vous rappelle l’eau, le matériel et la moisissure au bon moment. »).
2. **À l’affichage de la recette** : Un rappel **eau** court (1–2 lignes, équivalent à « Utilisez de l’eau sans chlore : filtrée, de source, ou robinet bouilli / repos 24 h. ») SHALL être visible à proximité de la liste des ingrédients. Un rappel **moisissure** résumé (2–3 lignes : à jeter vs normal, et « En cas de doute, ne pas consommer ») SHALL être visible à ou près de l’étape de fermentation des instructions.
3. **Température** : La consigne de température SHALL rester dans les instructions de la recette (étape de fermentation), inchangée.

Textes complets à inclure dans le bloc repliable (ou équivalents validés) :

- **Eau** : « Utilisez de l’eau filtrée ou de source. Si vous n’avez que l’eau du robinet : faites-la bouillir ou laissez-la reposer 24 h à l’air libre avant de l’utiliser. »
- **Moisissure** : « **Moisissure (à jeter)** : en surface du liquide ou du SCOBY, aspect sec, duveteux, velu ou poudreux ; couleurs blanc vif, vert, bleu, gris ou noir. **Normal** : sédiments bruns, nouvelle membrane translucide (bébé SCOBY). En cas de moisissure, jetez tout (liquide + SCOBY) et désinfectez le matériel. En cas de doute, ne pas consommer. »
- **Matériel** : « Privilégiez un récipient en verre ou en inox alimentaire (304/316). Évitez les récipients en métal non alimentaire ou en céramique émaillée non garantie sans plomb. »

#### Scenario: Bloc sécurité repliable fermé par défaut

- **WHEN** l’utilisateur ouvre l’écran du générateur de kombucha
- **THEN** un bloc « À savoir » ou « Conseils de sécurité » est présent et est fermé (replié) par défaut

#### Scenario: Ouverture du bloc affiche les textes complets

- **WHEN** l’utilisateur ouvre (déplie) le bloc « À savoir » / « Conseils de sécurité »
- **THEN** les textes complets Eau, Moisissure et Matériel sont visibles (ou équivalents)

#### Scenario: Recette affichée — rappel eau près des ingrédients

- **WHEN** l’utilisateur a généré une recette et que le résultat est affiché
- **THEN** un rappel court sur l’eau sans chlore est visible à proximité de la liste des ingrédients

#### Scenario: Recette affichée — rappel moisissure à l’étape fermentation

- **WHEN** l’utilisateur a généré une recette et que le résultat est affiché
- **THEN** un rappel résumé (moisissure vs normal, en cas de doute ne pas consommer) est visible à ou près de l’étape de fermentation des instructions

#### Scenario: Température dans les instructions

- **WHEN** une recette est générée
- **THEN** une étape des instructions contient la plage « 20 et 30 °C », « 24–29 °C », « 7 à 15 jours » et une mention du goût dès le 5ᵉ jour

---

## ADDED Requirements

### Requirement: Résumé du profil de goût avec détail dépliable

Lorsqu’une recette est affichée, le **profil de goût attendu** SHALL être présenté en deux niveaux : (1) un **résumé court** (1–2 phrases) visible par défaut ; (2) le **texte détaillé** actuel (paragraphe complet) accessible via un contrôle dépliable ou un lien du type « En savoir plus sur ce profil », sans supprimer le détail.

#### Scenario: Résumé visible par défaut

- **WHEN** l’utilisateur a généré une recette et que le résultat est affiché
- **THEN** un résumé court du profil de goût (1–2 phrases) est visible sans action supplémentaire

#### Scenario: Détail accessible à la demande

- **WHEN** l’utilisateur active le contrôle « En savoir plus sur ce profil » (ou équivalent)
- **THEN** le paragraphe détaillé du profil de goût (contenu actuel) est affiché

---

### Requirement: Message contextuel premier brassage

Lorsque l’utilisateur a coché « C’est mon premier brassage » et qu’une recette est générée, l’écran SHALL afficher un **message contextuel** court (ex. « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage. ») à proximité du titre de la recette ou en tête du résultat, afin de rassurer et d’expliquer la différence (20 % de starter).

#### Scenario: Premier brassage coché — message affiché

- **GIVEN** « C’est mon premier brassage » est coché
- **WHEN** l’utilisateur génère la recette
- **THEN** un message contextuel concernant le liquide de démarrage (ou la sécurisation du premier brassage) est visible avec la recette

#### Scenario: Premier brassage non coché — pas de message

- **GIVEN** « C’est mon premier brassage » n’est pas coché
- **WHEN** l’utilisateur génère la recette
- **THEN** ce message contextuel premier brassage n’est pas affiché

---

### Requirement: Aide contextuelle sous les selects Profil et Type de thé

L’écran du générateur SHALL afficher une **phrase d’aide courte** sous le select « Profil aromatique souhaité » et une sous le select « Type de thé utilisé », afin de guider le choix sans modifier les options. Les textes SHALL être courts (idéalement une ligne), en style hint (couleur secondaire ou taille réduite). Exemples : pour le profil, « Pour commencer : Classique et Équilibré. » ; pour le thé, « Thé noir : le plus simple pour le SCOBY. Thé vert : fermentation un peu plus rapide. »

#### Scenario: Aide sous le select Profil

- **WHEN** l’utilisateur consulte le formulaire du générateur
- **THEN** une phrase d’aide courte est visible sous le select « Profil aromatique souhaité »

#### Scenario: Aide sous le select Type de thé

- **WHEN** l’utilisateur consulte le formulaire du générateur
- **THEN** une phrase d’aide courte est visible sous le select « Type de thé utilisé »
