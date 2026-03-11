## Context

Le générateur de recettes kombucha calcule aujourd’hui, pour tout brassage (y compris « premier brassage »), un volume de starter liquide (10–20 % du volume final) et l’affiche comme ingrédient « Kombucha non pasteurisé d’un batch précédent ». Pour le premier brassage, l’utilisateur n’a par définition pas de batch précédent ; la recette est donc incohérente. Le flux doit distinguer clairement : (1) premier brassage = pas de starter maison → recette sans cet ingrédient, avec guidage pour s’en procurer ; (2) brassages suivants = starter 15 % (plancher 10 %) inchangé.

Contraintes : conserver les ratios sucre/thé et les rappels de sécurité existants ; ne pas modifier le comportement lorsque `isFirstBatch` est false.

## Goals / Non-Goals

**Goals:**

- Lorsque « C’est mon premier brassage » est coché : ne plus afficher de starter liquide issu d’un batch précédent ; calculer eau/thé/sucre sur la totalité du volume désiré ; afficher un guidage pour se procurer du kombucha (commerce ou kit) pour inoculer ce premier batch ; adapter ingrédients et étapes en conséquence.
- Remplacer le message actuel « On a mis plus de liquide de démarrage… » par un message expliquant qu’il faut se procurer du kombucha non pasteurisé (ou un kit) pour ce premier brassin.

**Non-Goals:**

- Changer la logique des brassages suivants (15 % starter, plancher 10 %).
- Introduire un nouveau type de données ou une API externe ; tout reste local (service + écran).

## Decisions

1. **Branche isFirstBatch dans le service**  
   Dans `kombuchaCalculatorService.ts`, lorsque `isFirstBatch === true` :  
   - Ne pas calculer de `starterLiquidL` ; utiliser `totalWaterL = desiredVolumeL` (tout le volume en eau pour le moût).  
   - Ingrédients : eau, thé, sucre, SCOBY, et un libellé du type « Kombucha non pasteurisé du commerce (ou liquide du kit) » avec une quantité indicative (ex. 200–400 mL pour 4 L), au lieu de « Starter liquide (Kombucha non pasteurisé d’un batch précédent) ».  
   - Instructions : étape d’inoculation reformulée pour « une fois à température, ajoutez le kombucha acheté (ou le liquide du kit) et déposez le SCOBY à la surface », sans mention de « starter d’un batch précédent ».  
   **Alternative écartée** : garder le calcul 20 % et afficher « à acheter » — on évite pour ne pas mélanger « volume à réserver » (batch précédent) et « volume à acheter » (premier batch).

2. **Message contextuel sur l’écran**  
   Dans `KombuchaGeneratorScreen.tsx`, lorsque la recette affichée correspond à un premier brassage : supprimer le bloc « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage ». Le remplacer par un encart unique expliquant que pour ce premier brassin il n’y a pas de starter maison, et qu’il faut se procurer du kombucha non pasteurisé en magasin (ou un kit SCOBY + liquide) pour inoculer ; après ce premier batch, l’utilisateur aura du starter pour les prochaines recettes.

3. **Types et structure**  
   Les types existants (`KombuchaIngredient`, `KombuchaInstructionStep`, `KombuchaRecipeResult`) restent suffisants : pas de nouveau champ. La différence premier / suivant est entièrement gérée par le contenu des listes `ingredients` et `instructions` retournées par le service.

4. **Quantité indicative « kombucha à acheter »**  
   Pour le premier batch, afficher une fourchette simple (ex. 200–400 mL pour un volume final typique 2–5 L) dans l’ingrédient ou dans le message contextuel. Valeur fixe ou formule simple (ex. 50–100 mL/L) ; pas de base de données externe.

## Risks / Trade-offs

- **Risque** : Un utilisateur qui a du starter mais coche « premier brassage » par erreur obtiendrait une recette sans starter.  
  **Mitigation** : Libellé clair de la checkbox (« C’est mon premier brassage ») ; le message contextuel rappelle que ce mode est pour ceux qui n’ont pas encore de batch précédent.

- **Trade-off** : On ne gère pas les kits « SCOBY seul » vs « SCOBY + liquide » dans la logique (pas de choix dédié).  
  **Accepté** : Le guidage texte suffit (« kombucha non pasteurisé du commerce ou liquide du kit ») ; pas de branchement métier supplémentaire pour cette itération.
