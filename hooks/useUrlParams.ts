import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Retourne les paramètres d'URL courants (query string).
 */
export function getUrlParams(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries([...searchParams.entries()]);
}

/**
 * Hook pour lire les paramètres d'URL et les mettre à jour (remplace l'entrée d'historique).
 * Utilisé pour rendre les valeurs des outils partageables via l'URL.
 */
export function useUrlParams(): [
  Record<string, string>,
  (updates: Record<string, string | number | undefined>) => void
] {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = getUrlParams(searchParams);

  const setParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([k, v]) => {
            if (v === undefined || v === '') next.delete(k);
            else next.set(k, String(v));
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return [params, setParams];
}
