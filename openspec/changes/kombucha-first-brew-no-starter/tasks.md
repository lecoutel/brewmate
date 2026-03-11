## 1. Service — recette premier brassage sans starter

- [ ] 1.1 Dans `kombuchaCalculatorService.ts`, lorsque `isFirstBatch === true` : calculer `totalWaterL = desiredVolumeL` (pas de soustraction de starter) et ne pas ajouter d’ingrédient « Starter liquide (Kombucha non pasteurisé d'un batch précédent) ».
- [ ] 1.2 Pour le premier brassage, ajouter un ingrédient du type « Kombucha non pasteurisé du commerce (ou liquide du kit) » avec une quantité indicative (ex. 200–400 mL ou 50–100 mL/L) et conserver l’ingrédient SCOBY.
- [ ] 1.3 Pour le premier brassage, adapter l’étape d’inoculation des instructions : texte pour refroidir le moût puis ajouter le kombucha acheté (ou du kit) et déposer le SCOBY, sans mention de « X L de starter liquide » d’un batch précédent.
- [ ] 1.4 Vérifier que pour `isFirstBatch === false` le comportement reste inchangé (15 % starter, plancher 10 %, ingrédients et instructions actuels).

## 2. Écran — message contextuel premier brassage

- [ ] 2.1 Dans `KombuchaGeneratorScreen.tsx`, supprimer l’affichage du message « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage » lorsque la recette correspond à un premier brassage.
- [ ] 2.2 Afficher à la place un encart explicatif : pour ce premier brassin il n’y a pas de starter maison ; il faut se procurer du kombucha non pasteurisé en magasin (ou un kit SCOBY + liquide) pour inoculer ; après ce premier batch, l’utilisateur aura du starter pour les prochaines recettes.

## 3. Cohérence et types

- [ ] 3.1 Mettre à jour le commentaire JSDoc de `isFirstBatch` dans `types.ts` pour refléter le nouveau sens : premier brassage = pas de starter maison, recette adaptée (guidage achat/kit).
