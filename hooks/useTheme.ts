import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';

export function useTheme(): [string, (theme: string) => void] {
  // Le dark theme n'est plus supporté, on retourne toujours 'light'
  return ['light', () => {}];
}
