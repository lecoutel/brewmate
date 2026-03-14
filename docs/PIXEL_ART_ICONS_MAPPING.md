# Équivalents pixel art pour les icônes de l’app

L’app utilise actuellement **Heroicons** (`@heroicons/react/24/outline`). Voici les équivalents dans **Pixelarticons** (grille 24×24, style pixel art, compatible React).

## Bibliothèque recommandée : Pixelarticons

- **npm** : `pixelarticons`
- **Site** : https://pixelarticons.com
- **Import** : `import { IconName } from 'pixelarticons/react'`
- Taille par défaut 24×24 ; pour du pixel-perfect, utiliser des multiples de 24 (24, 48, 72).

---

## Correspondance Heroicon → Pixelarticons

| Usage dans l'app | Heroicon actuel | Équivalent Pixelarticons | Remarque |
|------------------|-----------------|---------------------------|----------|
| Calculatrices / outils | `CalculatorIcon` | **Calculator** | Même sémantique |
| Densité pré-ébullition | `ScaleIcon` | **Scale** | Balance / mesure |
| Densité post-ébullition | `ScaleIcon` | **Scale** | Idem |
| Réfractomètre | `EyeIcon` | **Eye** | Œil / lecture |
| PH | `SparklesIcon` | **Sparkles** | Effet / précision |
| Qualité de l'eau | `GlobeAltIcon` | **Globe** | Eau / monde |
| Cible / objectif | `TargetIcon` (MapPin) | **Target** | Cible |
| Rafraîchir | `RefreshIcon` (ArrowPath) | **Reload** | Recharger |
| Lien externe | `ArrowTopRightOnSquareIcon` | **ExternalLink** | Ouvrir dans autre fenêtre |
| Info / tooltip | `InformationCircleIcon` | **InfoBox** | Information |
| Retour | `ArrowLeftIcon` | **ArrowLeft** | Navigation retour |
| Suivant / détail | `ChevronRightIcon` | **ChevronRight** | Navigation avant |
| Succès / validation | `CheckCircleIcon` | **Check** | Validé |
| Erreur / attention | `ExclamationTriangleIcon` | **SquareAlert** ou **WarningDiamond** | Alerte |
| Paramètres / options | `CogIcon` (Cog6Tooth) | **Settings2** ou **SettingsCog** | Réglages |
| Fermer / erreur | `XCircleIcon` | **Cancel** | Annuler / fermer |
| Ajouter | `PlusCircleIcon` | **PlusBox** | Ajout |
| Ingrédients / labo (Kombucha) | `BeakerIcon` | **TestTube** | Pas de “Beaker” ; éprouvette proche |

---

## Résumé des imports Pixelarticons

```ts
import {
  Calculator,
  Scale,
  Eye,
  Sparkles,
  Globe,
  Target,
  Reload,
  ExternalLink,
  InfoBox,
  ArrowLeft,
  ChevronRight,
  Check,
  SquareAlert,  // ou WarningDiamond pour ExclamationTriangle
  Settings2,    // ou SettingsCog pour Cog
  Cancel,       // pour XCircle
  PlusBox,      // pour PlusCircle
  TestTube,     // pour Beaker
} from 'pixelarticons/react';
```

---

## Remplacement dans le code

1. **Installer** :  
   `npm install pixelarticons`

2. **Fichier à adapter** : `constants.tsx`  
   - Remplacer les imports `@heroicons/react/24/outline` par les composants listés ci-dessus.
   - Les composants Pixelarticons acceptent `className`, `width`, `height`, etc. Tu peux garder les mêmes `className` (ex. `w-5 h-5`) sur les icônes.

3. **Compatibilité** :  
   Les usages actuels passent des composants (ex. `icon={Icons.BeakerIcon}`) ; en exportant les composants Pixelarticons dans le même objet `Icons` (avec les mêmes clés), le reste de l’app (Cards, SectionHeading, etc.) fonctionne sans changement.

---

## Icônes sans équivalent direct

- **BeakerIcon** → **TestTube** (éprouvette, proche du flacon de labo).
- **ExclamationTriangleIcon** → **SquareAlert** (alerte dans un carré) ou **WarningDiamond** (losange d’avertissement) selon le style voulu.

Tous les autres usages ont un équivalent direct dans Pixelarticons.
