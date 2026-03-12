## Context

BrewMate est une SPA React (Vite) 100 % frontend, sans backend. Le layout commun est `PageLayout` (header + main + footer). Le footer actuel affiche uniquement le copyright. La Home affiche des sections d'outils par intention. Aucun envoi d'email ni formulaire externe n'existe aujourd'hui.

## Goals / Non-Goals

**Goals:**

- Permettre aux utilisateurs d'envoyer du feedback (message, amélioration, j'aime, j'aime pas) sans ajouter de backend.
- Afficher un point d'entrée sur la Home (4 entrées selon le type) et un lien dans un footer commun (Home + écrans outils).
- Faire arriver les soumissions par email à gavelle.simon@gmail.com via un service formulaire tiers.

**Non-Goals:**

- Backend maison, base de données, tableau de bord de feedback.
- Authentification ou identification des utilisateurs.
- Modération ou réponse in-app.

## Decisions

### 1. Service formulaire tiers (Formspree / Getform / Web3Forms)

**Choix :** Utiliser un service type Formspree, Getform ou Web3Forms qui accepte un POST depuis le front et envoie un email.

**Rationale :** L'app reste statique ; pas d'API à héberger. Configuration limitée à une URL d'endpoint (et éventuellement une clé en variable d'environnement au build). Alternative rejetée : mailto (pas de typage structuré, dépend du client mail).

**Implémentation :** Un formulaire HTML avec `action` pointant vers l'URL du service et `method="POST"`. Champs envoyés : type (message | amelioration | j_aime | j_aime_pas), message (texte), optionnellement page/contexte. Le choix du fournisseur (Formspree vs autres) reste ouvert ; documenter la config (env ou constantes) pour l'URL et le mapping des champs.

### 2. Formulaire : page dédiée avec type en query

**Choix :** Une route dédiée (ex. `/feedback`) avec paramètre optionnel `?type=message|amelioration|j_aime|j_aime_pas` pour pré-remplir le type. Pas de modal pour garder l'UX simple et le partage de lien possible.

**Rationale :** Plusieurs entrées (Home + footer) peuvent pointer vers la même page avec des query différentes (ex. `/feedback?type=amelioration`). Un seul composant formulaire, une seule spec.

**Alternative considérée :** Modal depuis Home/footer — rejetée pour éviter la gestion d'état modal et pour permettre de partager un lien direct vers le formulaire.

### 3. Footer commun

**Choix :** Enrichir le footer existant dans `PageLayout` (déjà utilisé sur Home et tous les écrans outils) avec un lien « Donner mon avis » vers `/feedback` (sans type, ou type par défaut « message »). Pas de nouveau layout : réutiliser `PageLayout` et son footer.

**Rationale :** Le footer est déjà commun ; il suffit d'ajouter le lien. Pas besoin d'un composant footer séparé si le contenu reste minimal (copyright + lien feedback).

### 4. Home : section ou liens « Donner mon avis »

**Choix :** Sur la Home, une section « Donner mon avis » avec 4 liens/boutons : Message, Amélioration, J'aime, J'aime pas — chacun naviguant vers `/feedback?type=...`. Placement en bas de la page (après les sections d'outils) ou bloc discret cohérent avec le reste du design.

**Rationale :** Plusieurs entrées comme demandé, sans dupliquer la logique du formulaire.

## Risks / Trade-offs

- **Service tiers :** Dépendance au fournisseur (disponibilité, quota, évolution de l'API). Mitigation : choisir un service répandu, documenter l'URL et le mapping des champs pour pouvoir changer de fournisseur en ne modifiant que la config.
- **Spam :** Un formulaire public peut être ciblé par des bots. Mitigation : selon le service, activer captcha/honeypot si disponible ; sinon accepter le risque en v1 et ajouter une protection plus tard si nécessaire.
- **Pas de confirmation serveur côté app :** La confirmation de succès dépend de la réponse du service (redirection ou message de succès fourni par le service). Mitigation : soit soumission dans une iframe/target du service, soit POST puis affichage d’une page de remerciement locale si le service renvoie un redirect ou un JSON de succès qu’on peut gérer en JS.

## Migration Plan

- Déployer le formulaire et les liens ; configurer l’endpoint du service formulaire (env ou constantes) pour pointer vers gavelle.simon@gmail.com.
- Aucune migration de données. Rollback : retirer la route `/feedback`, les liens Home et le lien footer.

## Open Questions

- Quel service exact utiliser (Formspree vs Getform vs Web3Forms) et comment gérer la page après envoi (redirect du service vs page de remerciement locale) — à trancher à l’implémentation.
