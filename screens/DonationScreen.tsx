import React, { useState } from 'react';
import { PageLayout } from '../components/Common';
import { COMMON_CLASSES } from '../constants';
import { getDonationPayPalUrl, DONATION_PAYPAL_ME_BASE } from '../donationConfig';

const PRESET_AMOUNTS = [2, 5, 15, 25] as const;

const DonationScreen: React.FC = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const openPayPal = (amount: number) => {
    const url = getDonationPayPalUrl(amount);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePresetClick = (amount: number) => {
    if (!DONATION_PAYPAL_ME_BASE) return;
    openPayPal(amount);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const raw = customAmount.replace(',', '.').trim();
    const value = parseFloat(raw);
    if (Number.isNaN(value) || value <= 0) {
      setCustomError('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }
    const url = getDonationPayPalUrl(value);
    if (!url) {
      setCustomError("Le lien de don n'est pas configuré (VITE_DONATION_PAYPAL_ME).");
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isConfigured = Boolean(DONATION_PAYPAL_ME_BASE);

  return (
    <PageLayout title="Offrir une bière 🍻" showBackButton>
      <div className="space-y-6">
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 calculator:text-calc-text-muted leading-relaxed">
          <p>
            {"Je m'appelle Simon Gavelle, brasseur amateur depuis 2016. Comme beaucoup d'entre vous, j'ai tout appris grâce au "}
            <a
              href="https://www.brassageamateur.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text hover:underline"
            >
              forum brassageamateur
            </a>
            {" et à sa communauté Facebook — des ressources précieuses que je consulte encore régulièrement."}
          </p>
          <p>
            {"J'ai développé WortLab pour m'accompagner pendant mes sessions de brassage : quelques calculs rapides, accessibles d'un coup d'œil sur le téléphone. Rien de plus, rien de moins. Ce n'est pas un Beersmith ou un Brewfather — juste un petit compagnon de poche, gratuit et sans fioritures."}
          </p>
          <p>
            {"Si ça vous plaît et que vous souhaitez soutenir le projet, n'hésitez pas à me payer une bière — ça fait toujours plaisir et ça m'encourage à continuer !"}<span className="calculator:hidden"> 🍻</span>
          </p>
        </div>

        <p className={COMMON_CLASSES.textMuted}>
          Choisissez un montant ou saisissez le vôtre (en €).
        </p>

        {!isConfigured && (
          <p className={COMMON_CLASSES.errorText}>
            Le lien de don n'est pas configuré. Définissez VITE_DONATION_PAYPAL_ME (ex. https://paypal.me/VotrePseudo).
          </p>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 calculator:text-calc-text">Montant</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                disabled={!isConfigured}
                className="flex items-center justify-center py-4 px-4 rounded-xl calculator:rounded-none border border-gray-200 dark:border-gray-600 calculator:border-calc-border bg-white dark:bg-gray-800 calculator:bg-calc-bg-card hover:border-[#2563FF] dark:hover:border-[#6b99ff] calculator:hover:border-calc-accent hover:shadow-md calculator:shadow-mac transition-all duration-200 font-semibold text-gray-900 dark:text-gray-100 calculator:text-calc-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {amount} €
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 calculator:text-calc-text">Autre montant</h2>
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="custom-amount" className="sr-only">
                Montant en euros
              </label>
              <input
                id="custom-amount"
                type="text"
                inputMode="decimal"
                placeholder="Ex. 10"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setCustomError(null);
                }}
                className={`${COMMON_CLASSES.input} ${customError ? 'border-red-500 dark:border-red-400' : ''}`}
                disabled={!isConfigured}
              />
              {customError && <p className={`mt-1 ${COMMON_CLASSES.errorText}`}>{customError}</p>}
            </div>
            <button
              type="submit"
              disabled={!isConfigured}
              className={`${COMMON_CLASSES.buttonPrimary} sm:w-auto`}
            >
              Payer avec PayPal
            </button>
          </form>
          <p className={COMMON_CLASSES.textMuted}>Indiquez le montant en euros (ex. 1, 10, 100).</p>
        </section>
      </div>
    </PageLayout>
  );
};

export default DonationScreen;
