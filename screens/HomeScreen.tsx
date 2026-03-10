
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CALCULATORS, APP_TITLE } from '../constants';
import { Card, PageLayout } from '../components/Common';
// Removed useTheme, Theme, SunIcon, MoonIcon, THEME_COLORS imports as they are no longer used here

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  // Theme toggle logic and state removed

  return (
    <PageLayout title={APP_TITLE}>
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-6 pb-5 bg-gradient-to-br from-[#2563FF]/10 to-[#E6EEFF]/60 dark:from-[#2563FF]/20 dark:to-blue-900/30 border-b border-blue-100 dark:border-blue-900 rounded-t-xl">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Bonjour, brasseur 🍺</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sélectionnez un outil pour démarrer votre session.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {CALCULATORS.map((calculator) => (
          <Card
            key={calculator.id}
            title={calculator.name}
            description={calculator.description}
            icon={calculator.icon}
            onClick={() => navigate(calculator.route)}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default HomeScreen;