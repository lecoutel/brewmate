## 1. Données des sections

- [ ] 1.1 Dans `constants.tsx`, ajouter une constante `HOME_SECTIONS` (ou équivalent) : tableau de sections avec pour chacune un id, un titre, une description courte et la liste des `id` d'outils (`CALCULATORS`) appartenant à la section, dans l'ordre : Comprendre mon eau (water-quality), Ajuster le pH (ph-correction), Atteindre ma densité cible (pre-boil-density, post-boil-density), Mesurer le résultat (abv-calculator), Autres boissons (kombucha-generator).
- [ ] 1.2 S'assurer que les libellés des titres et descriptions de section reflètent le design (Comprendre mon eau / minéraux, BJCP, Brewfather ; Ajuster le pH ; densité avant ou après ébullition ; ABV densimètre ou réfractomètre ; Autres boissons).

## 2. Écran d'accueil

- [ ] 2.1 Dans `HomeScreen.tsx`, remplacer le texte d'en-tête « Sélectionnez un outil pour démarrer votre session » par un libellé orienté intention (ex. « Choisissez un outil selon ce que vous voulez faire »).
- [ ] 2.2 Remplacer l'affichage de la liste plate des `CALCULATORS` par une boucle sur les sections : pour chaque section, afficher un bloc avec le titre de la section, la description courte, puis les cards des outils de la section (en résolvant les ids de la section vers les entrées de `CALCULATORS` pour garder nom, description, icon, route).
- [ ] 2.3 Conserver le bandeau « Bonjour, brasseur » et le composant `Card` existant pour chaque outil ; ne pas modifier les routes ni le comportement au clic.

## 3. Vérification

- [ ] 3.1 Vérifier que les cinq sections s'affichent dans le bon ordre avec les bons outils et que la navigation vers chaque outil fonctionne comme avant.
