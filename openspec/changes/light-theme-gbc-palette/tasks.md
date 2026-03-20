## 1. Palette CSS variables

- [x] 1.1 Remplacer les valeurs des CSS variables dans `:root` (public/index.css) par la palette GBC : --calc-bg (#F8F0D0), --calc-bg-card (#E8D8A8), --calc-surface (#D8C888), --calc-text (#1A1A2E), --calc-text-muted (#5A5A7A), --calc-border (#8B7355), --calc-accent (#3A5FC4), --calc-highlight (#5A7FE4), --calc-error (#C41A1A)

## 2. Dithering light

- [x] 2.1 Mettre à jour le pattern `html.light .bg-dither` pour utiliser la couleur bordure GBC (#8B7355) au lieu du vert DMG (#8BAC0F)

## 3. Input light

- [x] 3.1 Remplacer le fond blanc `#FFFFFF` de `html.light .mac-input` par `var(--calc-bg)` pour cohérence avec la palette crème

## 4. Bouton accent — contraste texte

- [x] 4.1 Ajouter une couleur de texte claire sur les boutons accent light si nécessaire (vérifier contraste texte noir sur bleu GBC, ajuster avec une règle `html.light .mac-button { color: ... }` si le contraste est insuffisant)

## 5. Vérification visuelle

- [x] 5.1 Vérifier que le thème dark n'est pas impacté (variables `html.dark` inchangées)
- [x] 5.2 Vérifier que le thème calculator n'est pas impacté (variables `html.calculator` inchangées)
- [x] 5.3 Vérifier visuellement le rendu light : contraste texte, lisibilité, cohérence de la palette GBC
