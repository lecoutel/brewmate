## Context

Le thème light actuel utilise 4 couleurs Game Boy DMG (#0F380F, #306230, #8BAC0F, #9BBC0F) — tout est vert. Les CSS variables `:root` contrôlent l'ensemble du thème light. Les composants utilisent ces variables via Tailwind (`calc-*`) et via les classes CSS (`.mac-window`, `.mac-button`, `.mac-input`, `.bg-dither`).

Courier Prime est déjà la police partout. Les thèmes dark et calculator ont leurs propres palettes et ne sont pas touchés.

## Goals / Non-Goals

**Goals:**
- Palette GBC multi-couleurs pour le thème light avec un bon contraste (WCAG AA minimum)
- Garder l'esprit rétro 8-bit — couleurs franches, pas de dégradés subtils
- Différencier visuellement les éléments : fond, cartes, texte, actions, erreurs
- Changement limité aux CSS variables et aux règles `html.light` — aucun composant React modifié

**Non-Goals:**
- Modifier les thèmes dark ou calculator
- Ajouter de nouvelles CSS variables (on réutilise les existantes)
- Changer la typographie (Courier Prime reste)
- Refactorer le système de thème

## Decisions

### Palette GBC choisie

Inspirée des jeux GBC réels (Pokémon, Zelda DX) — couleurs franches et contrastées :

| Variable | Couleur | Hex | Usage |
|---|---|---|---|
| `--calc-bg` | Crème clair | `#F8F0D0` | Fond principal (écran GBC) |
| `--calc-bg-card` | Crème | `#E8D8A8` | Cartes, panneaux |
| `--calc-surface` | Sable | `#D8C888` | Surfaces internes, inputs |
| `--calc-text` | Noir profond | `#1A1A2E` | Texte principal |
| `--calc-text-muted` | Gris-bleu | `#5A5A7A` | Texte secondaire |
| `--calc-border` | Brun rétro | `#8B7355` | Bordures |
| `--calc-accent` | Bleu GBC | `#3A5FC4` | Boutons primaires, liens |
| `--calc-highlight` | Bleu clair | `#5A7FE4` | Hover, focus |
| `--calc-error` | Rouge 8-bit | `#C41A1A` | Erreurs |

**Rationale** : Le fond crème rappelle l'écran LCD de la GBC. Le bleu accent est le bleu signature des menus GBC. Le brun des bordures évoque les coques/boîtiers de la console. Le contraste texte noir sur fond crème dépasse largement WCAG AA (ratio > 12:1).

**Alternative considérée** : Palette NES (gris/bleu foncé) — rejetée car trop froide, la GBC est plus chaleureuse et reconnaissable.

### Dithering adapté

Le pattern dithering light utilisera le brun bordure (`#8B7355`) au lieu du vert DMG, pour garder la cohérence visuelle avec la nouvelle palette.

### Ombres

Les ombres `box-shadow: ... #000` du thème light restent noires — c'est un choix rétro qui fonctionne avec n'importe quelle palette.

### Input light

Le fond blanc des inputs light (`#FFFFFF`) sera remplacé par le fond crème clair (`#F8F0D0`) pour cohérence, avec l'ombre inset conservée.

### Texte des boutons

Les boutons primaires (accent bleu) auront du texte blanc (`#F8F0D0` crème) au lieu de `var(--calc-text)` pour assurer le contraste sur fond bleu. Cela nécessite une règle CSS spécifique `html.light .mac-button` ou un ajustement de la variable `--calc-text` sur les boutons.

## Risks / Trade-offs

- **Contraste bouton accent** → Le texte `--calc-text` (noir) sur `--calc-accent` (bleu) est lisible mais il faudra vérifier visuellement. Mitigation : tester et ajuster si nécessaire en ajoutant une variable `--calc-on-accent` si besoin.
- **Cohérence logo/icônes** → Les icônes Pixelarticons et le logo utilisent `currentColor` donc s'adapteront automatiquement. Le logo SVG splashscreen pourrait avoir des couleurs hardcodées à vérifier.
- **Préférence utilisateur** → C'est un changement visuel significatif. Mitigation : les utilisateurs peuvent toujours basculer vers dark/calculator.
