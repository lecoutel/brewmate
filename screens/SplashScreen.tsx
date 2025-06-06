
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrewMateCircularLogo, SPLASH_DURATION, APP_TITLE } from '../constants';
import { CalculatorRoute } from '../types';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(CalculatorRoute.Home, { replace: true });
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-background dark:bg-dark-background p-4">
      <BrewMateCircularLogo className="w-40 h-auto sm:w-56" />
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 animate-pulse">Chargement des calculateurs...</p>
    </div>
  );
};

export default SplashScreen;
