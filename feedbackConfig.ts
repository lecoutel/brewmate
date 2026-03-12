/**
 * Configuration du formulaire de feedback.
 *
 * Envoi vers un service formulaire tiers (Formspree, Getform, Web3Forms, etc.)
 * qui transmet les données par email à gavelle.simon@gmail.com.
 *
 * Pour Formspree :
 * 1. Créer un formulaire sur https://formspree.io
 * 2. Récupérer l'URL du formulaire (ex. https://formspree.io/f/xxxxxxxx)
 * 3. Définir la variable d'environnement VITE_FEEDBACK_FORM_URL (ou la mettre en build)
 *
 * Champs envoyés au service (mapping pour l'email) :
 * - type: 'message' | 'amelioration' | 'j_aime' | 'j_aime_pas'
 * - email: adresse de l'utilisateur (pour lui répondre)
 * - message: texte libre
 * - _replyto: même que email (Formspree utilise ce champ pour le Reply-To)
 */
export const FEEDBACK_FORM_ACTION_URL: string = import.meta.env.VITE_FEEDBACK_FORM_URL ?? '';

export type FeedbackType = 'message' | 'amelioration' | 'j_aime' | 'j_aime_pas';

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  message: 'Un message',
  amelioration: 'Proposer une amélioration',
  j_aime: "Ce que j'aime",
  j_aime_pas: "Ce que j'aime pas",
};
