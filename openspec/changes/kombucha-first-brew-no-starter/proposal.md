# Proposal: Premier brassage kombucha — ne pas demander de starter

## Why

Aujourd’hui, si l’utilisateur coche « C’est mon premier brassage », l’app lui génère quand même une recette qui inclut du **starter liquide** (kombucha d’un batch précédent) et une étape « ajoutez le starter ». Or, par définition, au premier brassage on n’a pas de batch précédent : on n’a pas de starter. La recette devient contradictoire et frustrante. Il faut adapter le flux « premier brassage » pour ne pas exiger du starter qu’on n’a pas, et à la place guider l’utilisateur (où s’en procurer, comment démarrer sans stock maison).

## What Changes

- **Premier brassage sans starter** : Quand « C’est mon premier brassage » est coché, la recette ne doit plus lister d’ingrédient « Starter liquide (Kombucha non pasteurisé d’un batch précédent) » ni d’instruction « ajoutez les X L de starter liquide ». Le volume de moût est calculé sur la totalité du volume désiré (eau + thé + sucre), sans réserver de partie « starter ».
- **Guidage pour le premier batch** : À la place, afficher un **message explicatif** : l’utilisateur doit se procurer du kombucha non pasteurisé du commerce (ou un kit de démarrage avec SCOBY + liquide) pour inoculer ce premier brassin ; après ce premier batch, il aura du starter pour les suivants. Optionnel : mentionner une quantité indicative de kombucha à acheter (ex. 200–400 mL pour 4 L) si pertinent.
- **Ingrédients et étapes** : Pour le premier brassage, la liste d’ingrédients inclut eau, thé, sucre, SCOBY (ou « SCOBY + liquide de démarrage » si on recommande un kit), et éventuellement « Kombucha non pasteurisé du commerce » en remplacement du « starter d’un batch précédent ». Les étapes décrivent refroidir le moût, puis ajouter le kombucha acheté (ou le contenu du kit) + SCOBY, sans mention de « starter d’un batch précédent ».
- **Suppression du message actuel** : Ne plus afficher le message « On a mis plus de liquide de démarrage pour sécuriser votre premier brassage » lorsqu’on passe au mode « premier brassage sans starter », car il n’y a plus de « plus de liquide de démarrage » calculé côté app — le message serait remplacé par le guidage « où se procurer du starter pour ce premier batch ».

Aucun changement pour les brassages suivants (isFirstBatch = false) : la logique actuelle (15 % starter, plancher 10 %) reste inchangée.

## Capabilities

### New Capabilities

*Aucune.*

### Modified Capabilities

- **kombucha-generator** : Comportement et contenu de la recette lorsque « C’est mon premier brassage » est coché : ne plus inclure de starter liquide issu d’un batch précédent ; calculer le moût sur tout le volume ; fournir un guidage pour se procurer du kombucha/liquide de démarrage pour ce premier batch ; adapter ingrédients et étapes en conséquence.

## Impact

- **Code** : `services/kombuchaCalculatorService.ts` (branche isFirstBatch : calcul sans starter, ingrédients et instructions différents), `screens/KombuchaGeneratorScreen.tsx` (message contextuel pour premier brassage remplacé par le nouveau guidage), éventuellement `types.ts` si la structure des ingrédients/étapes doit refléter une variante « premier batch ».
- **Données** : Pas de nouveau fichier de données ; textes du guidage « premier batch » peuvent être en constantes ou dans le service.
- **Référence** : Aligné avec la logique métier « premier brassage = pas de stock de starter » ; cohérent avec la doc / infos kombucha (démarrage avec achat de kombucha non pasteurisé ou kit).
