/**
 * Configuration des dons « Offrir une bière » (PayPal).
 *
 * Utilisation :
 * - URL de base : PayPal.me (ex. https://paypal.me/VotrePseudo) ou lien don PayPal classique.
 * - Avec montant : pour PayPal.me, l’URL avec montant est <base>/<montant> (ex. https://paypal.me/VotrePseudo/5 pour 5 €).
 * - Définir VITE_DONATION_PAYPAL_ME avec l’URL de base (sans slash final). Ex. : https://paypal.me/VotrePseudo
 *
 * Si non configuré, les liens de don ne mènent nulle part ; définir la variable au build ou en .env.
 */
const base = import.meta.env.VITE_DONATION_PAYPAL_ME ?? '';

export const DONATION_PAYPAL_ME_BASE = base;

/**
 * Retourne l’URL PayPal pour un don du montant donné (en euros).
 * Format PayPal.me : <base>/<montant> (ex. https://paypal.me/VotrePseudo/5).
 * Si la base n’est pas configurée, retourne une chaîne vide.
 */
export function getDonationPayPalUrl(amountEur: number): string {
  if (!DONATION_PAYPAL_ME_BASE) return '';
  const clean = String(amountEur).replace(',', '.');
  const normalized = clean.endsWith('.') ? clean.slice(0, -1) : clean;
  return `${DONATION_PAYPAL_ME_BASE.replace(/\/$/, '')}/${normalized}`;
}
