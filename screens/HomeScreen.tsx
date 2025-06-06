import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CALCULATORS, APP_TITLE } from '../constants';
import { Card, PageLayout } from '../components/Common';
// Removed useTheme, Theme, SunIcon, MoonIcon, THEME_COLORS imports as they are no longer used here

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  // Theme toggle logic and state removed

  return (
    <PageLayout title="">
        {/* Theme toggle button removed from here */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">
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