import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/Common';
import { COMMON_CLASSES } from '../constants';
import {
  FEEDBACK_FORM_ACTION_URL,
  FEEDBACK_TYPE_LABELS,
  type FeedbackType,
} from '../feedbackConfig';

const QUERY_TYPE_KEY = 'type';
const VALID_TYPES: FeedbackType[] = ['message', 'amelioration', 'j_aime', 'j_aime_pas'];

function parseFeedbackType(value: string | null): FeedbackType | null {
  if (value && VALID_TYPES.includes(value as FeedbackType)) {
    return value as FeedbackType;
  }
  return null;
}

const FeedbackScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = useMemo(
    () => parseFeedbackType(searchParams.get(QUERY_TYPE_KEY)),
    [searchParams]
  );

  const [type, setType] = useState<FeedbackType>(typeFromUrl ?? 'message');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (typeFromUrl) setType(typeFromUrl);
  }, [typeFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!FEEDBACK_FORM_ACTION_URL) {
      setError('Le formulaire de feedback n’est pas configuré (VITE_FEEDBACK_FORM_URL).');
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch(FEEDBACK_FORM_ACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          email,
          message,
          _replyto: email, // Formspree: Reply-To = adresse de l'utilisateur
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string })?.error ?? `Erreur ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <PageLayout title="Feedback" showBackButton>
        <div className="rounded-xl calculator:rounded-none bg-green-50 dark:bg-gray-800 dark:bg-gray-800 calculator:bg-calc-bg-card border border-green-200 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border p-6 text-center">
          <p className="text-lg font-medium text-green-800 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text">
            Merci, votre message a bien été envoyé.
          </p>
          <p className={COMMON_CLASSES.textMuted + ' mt-2'}>
            Une réponse vous sera envoyée à l’adresse indiquée si nécessaire.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Donner mon avis" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-100 dark:text-gray-400 calculator:text-calc-text-muted leading-relaxed">
          <p>
            {"Votre retour compte vraiment. Que vous ayez repéré un bug, une idée d'amélioration ou juste envie de dire bonjour — tous les messages sont lus et pris en compte."}
          </p>
          <p>
            {"WortLab est un projet développé dans mon garage, en dehors des heures de brassage. Il peut donc arriver qu'un petit bug se glisse quelque part. Si vous en croisez un, signalez-le : je m'en occupe dès que possible."}
          </p>
          <p>
            {"Mon objectif est de faire évoluer l'app selon vos besoins réels. Vos suggestions sont donc les bienvenues !"}
          </p>
        </div>
        <div>
          <label htmlFor="feedback-type" className={COMMON_CLASSES.label}>
            Type de feedback
          </label>
          <select
            id="feedback-type"
            value={type}
            onChange={(e) => setType(e.target.value as FeedbackType)}
            className={COMMON_CLASSES.input}
            required
          >
            {(VALID_TYPES as FeedbackType[]).map((t) => (
              <option key={t} value={t}>
                {FEEDBACK_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="feedback-email" className={COMMON_CLASSES.label}>
            Votre adresse email
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={COMMON_CLASSES.input}
            placeholder="vous@exemple.com"
            required
            autoComplete="email"
          />
          <p className={COMMON_CLASSES.textMuted + ' mt-1'}>
            Pour pouvoir vous répondre
          </p>
        </div>
        <div>
          <label htmlFor="feedback-message" className={COMMON_CLASSES.label}>
            Message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={COMMON_CLASSES.input + ' min-h-[120px] resize-y'}
            placeholder="Votre message..."
            required
            rows={4}
          />
        </div>
        {error && (
          <p className={COMMON_CLASSES.errorText}>{error}</p>
        )}
        <button
          type="submit"
          disabled={sending}
          className={COMMON_CLASSES.buttonPrimary}
        >
          {sending ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
    </PageLayout>
  );
};

export default FeedbackScreen;
