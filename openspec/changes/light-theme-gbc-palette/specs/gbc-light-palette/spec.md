## ADDED Requirements

### Requirement: Palette GBC multi-couleurs pour le thème light
Le thème light (`:root`) SHALL utiliser une palette inspirée Game Boy Color avec des couleurs distinctes pour fond, cartes, texte, bordures, accents et erreurs. La palette SHALL remplacer la palette monochrome verte DMG actuelle.

#### Scenario: Variables CSS du thème light
- **WHEN** le thème light est actif (`html.light`)
- **THEN** les CSS variables `:root` MUST définir : un fond crème clair, un fond carte crème, une surface sable, un texte noir profond, un texte muted gris-bleu, des bordures brun rétro, un accent bleu GBC, un highlight bleu clair, et une erreur rouge 8-bit

#### Scenario: Contraste texte principal
- **WHEN** le thème light est actif
- **THEN** le ratio de contraste entre `--calc-text` et `--calc-bg` MUST être supérieur à 7:1 (WCAG AAA)

#### Scenario: Contraste texte muted
- **WHEN** le thème light est actif
- **THEN** le ratio de contraste entre `--calc-text-muted` et `--calc-bg` MUST être supérieur à 4.5:1 (WCAG AA)

### Requirement: Dithering adapté à la palette GBC
Le pattern de dithering du thème light SHALL utiliser les couleurs de la nouvelle palette GBC au lieu du vert DMG.

#### Scenario: Dithering light utilise les couleurs GBC
- **WHEN** le thème light est actif et un élément a la classe `.bg-dither`
- **THEN** le pattern de dithering MUST utiliser la couleur de bordure/surface de la palette GBC

### Requirement: Input light cohérent avec la palette
Les champs input du thème light SHALL utiliser la couleur de fond de la palette au lieu du blanc pur.

#### Scenario: Fond des inputs light
- **WHEN** le thème light est actif et un élément a la classe `.mac-input`
- **THEN** le fond de l'input MUST être la couleur `--calc-bg` (crème clair) au lieu de `#FFFFFF`

### Requirement: Isolation des thèmes
Les modifications SHALL concerner uniquement le thème light. Les thèmes dark et calculator NE DOIVENT PAS être impactés.

#### Scenario: Thème dark inchangé
- **WHEN** le thème dark est actif (`html.dark`)
- **THEN** toutes les CSS variables et règles de style MUST rester identiques à leur état actuel

#### Scenario: Thème calculator inchangé
- **WHEN** le thème calculator est actif (`html.calculator`)
- **THEN** toutes les CSS variables et règles de style MUST rester identiques à leur état actuel
