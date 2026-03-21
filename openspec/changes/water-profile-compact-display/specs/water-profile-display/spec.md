## water-profile-display

Affichage compact du profil d'eau minéral avec interprétation visuelle inline.

### Ions (Cations + Anions)

- Chaque ion est affiché sur **1 ligne** : symbole chimique, nom français, valeur en ppm, pastille colorée avec interprétation, bouton info ℹ
- Les ions sont groupés en 2 sections : Cations (Ca²⁺, Mg²⁺, Na⁺) et Anions (Cl⁻, SO₄²⁻, HCO₃⁻)
- Chaque section affiche son total en mEq/L dans l'en-tête
- L'équilibre ionique (%) est affiché dans l'en-tête Cations
- L'interprétation (normal / bas / élevé) provient de `interpretIonValue()` de `ionEducation.ts`
- La couleur de la pastille reflète le status : vert (ok), orange (low/high), rouge (critique)
- Le `IonInfoTrigger` reste cliquable et ouvre le panel éducatif existant

### Statistiques

- Chaque statistique est affichée sur **1 ligne** : nom, valeur, interprétation textuelle, bouton info ℹ
- 4 statistiques : ratio SO₄²⁻/Cl⁻, Dureté, Alcalinité, Alcalinité résiduelle
- L'interprétation provient de `interpretStatValue()` de `ionEducation.ts`
- Le `StatInfoTrigger` reste cliquable et ouvre le panel éducatif existant

### Thèmes

- Le rendu doit être cohérent et lisible dans les 3 thèmes : light, dark, calculator
- En mode calculator, les pastilles de couleur sont atténuées pour respecter l'esthétique monochrome rétro
- Aucune classe CSS dark: dupliquée

### Responsive

- Layout 1 ligne par ion/stat à toutes les tailles d'écran (pas de grid multi-colonnes)
- Sur mobile (< 640px), les lignes restent lisibles sans scroll horizontal
