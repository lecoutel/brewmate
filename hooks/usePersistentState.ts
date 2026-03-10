import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export function usePersistentState<T>(
  storageKey: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error(`Erreur de lecture du cache local pour "${storageKey}"`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur d'écriture du cache local pour "${storageKey}"`, error);
    }
  }, [storageKey, value]);

  const clear = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Erreur de suppression du cache local pour "${storageKey}"`, error);
    }
    setValue(initialValue);
  };

  return [value, setValue, clear];
}
