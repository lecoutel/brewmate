## Architecture

Changement purement UI dans `WaterQualityScreen.tsx`. Pas de nouveau composant, pas de nouvelle dépendance. On réutilise les fonctions d'interprétation existantes de `ionEducation.ts`.

## Layout ions — 1 ligne par ion

Chaque ion est affiché sur une ligne avec la structure :

```
symbole   nom complet        valeur ppm   ● interprétation   ℹ
```

- **Symbole** : `Ca²⁺`, `SO₄²⁻`, etc. — font-mono, largeur fixe, muted
- **Nom** : Calcium, Sulfate, etc. — texte principal
- **Valeur** : alignée à droite, font-mono tabular-nums, bold
- **Pastille + interprétation** : couleur selon `interpretIonValue()` :
  - `ok` → emerald (vert) + "normal"
  - `low` → amber (orange) + texte court du threshold
  - `high` → amber ou red selon sévérité + texte court du threshold
- **ℹ** : `IonInfoTrigger` existant, inchangé

### Responsive

1 ion par ligne à toutes les tailles d'écran. Sur mobile, le nom complet peut être tronqué ou passé en dessous du symbole si nécessaire, mais le layout reste lisible.

### Sections Cations / Anions

Les en-têtes "Cations" et "Anions" restent avec le total mEq/L. L'équilibre ionique reste affiché sur la ligne Cations.

## Layout statistiques — 1 ligne par stat

```
nom stat              valeur    interprétation
```

- **Nom** : SO₄²⁻/Cl⁻, Dureté, Alcalinité, Alc. résiduelle
- **Valeur** : font-mono tabular-nums, bold
- **Interprétation** : texte de `interpretStatValue()`, couleur contextuelle
- **ℹ** : `StatInfoTrigger` existant, inchangé

## Couleurs des pastilles — mapping thèmes

| Status | Light | Dark | Calculator |
|--------|-------|------|------------|
| ok (normal) | `text-emerald-600 bg-emerald-50` | `text-emerald-400 bg-emerald-900/30` | `text-calc-text bg-calc-bg-surface` |
| low/high (attention) | `text-amber-600 bg-amber-50` | `text-amber-400 bg-amber-900/30` | `text-calc-text bg-calc-bg-surface` |
| critical | `text-red-600 bg-red-50` | `text-red-400 bg-red-900/30` | `text-calc-error bg-calc-bg-surface` |

Note : en mode calculator, on reste sobre (pas de couleurs vives) pour respecter l'esthétique rétro. On distingue via le texte d'interprétation plutôt que par la couleur de la pastille.

## Nettoyage CSS

Suppression des classes dark: dupliquées dans toute la section profil d'eau. Exemples :
- `dark:text-gray-400 dark:text-gray-400 dark:text-gray-100` → `dark:text-gray-100`
- `dark:bg-gray-800 dark:bg-gray-900 dark:bg-gray-800` → `dark:bg-gray-800`

## Ce qui ne change PAS

- Header du profil (nom, type, pH, source, badge data source)
- Warning mineral completeness (Open Food Facts)
- `BrewableStylesSection` et son usage de `IonRangeBar`
- `FormulaInfoSection` en bas
- `IonInfoPanel` (overlay éducatif)
- Note disclaimer en bas
