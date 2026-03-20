
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CALCULATORS, HOME_SECTIONS, APP_TITLE } from '../constants';
import { Card, PageLayout } from '../components/Common';
import { CalculatorRoute } from '../types';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  // Theme toggle logic and state removed

  return (
    <PageLayout title={APP_TITLE}>
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-6 pb-5 bg-gradient-to-br from-[#2563FF]/10 to-[#E6EEFF]/60 dark:from-calc-bg-surface dark:to-calc-bg-card calculator:from-calc-bg-surface dark:to-calc-bg-card calculator:to-calc-bg-card border-b border-blue-100 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border rounded-t-xl calculator:rounded-none">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text mb-1">Bonjour, brasseur</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-100 dark:text-gray-400 calculator:text-calc-text-muted">Choisissez un outil selon ce que vous voulez faire.</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {HOME_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text">{section.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-100 dark:text-gray-400 calculator:text-calc-text-muted">{section.description}</p>
            <div className="grid grid-cols-1 gap-4">
              {section.calculatorIds
                .map((id) => CALCULATORS.find((c) => c.id === id))
                .filter((calculator): calculator is NonNullable<typeof calculator> => calculator != null)
                .map((calculator) => (
                  <Card
                    key={calculator.id}
                    title={calculator.name}
                    description={calculator.description}
                    icon={calculator.icon}
                    onClick={() => navigate(calculator.route)}
                  />
                ))}
            </div>
          </section>
        ))}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text">Contact</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to={CalculatorRoute.Feedback}
              className="flex items-center justify-between p-4 rounded-xl calculator:rounded-none border border-gray-200 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border bg-white dark:bg-gray-800 dark:bg-gray-800 calculator:bg-calc-bg-card hover:border-gray-400 dark:hover:border-gray-700:border-calc-accent dark:hover:border-calc-accent calculator:hover:border-calc-accent hover:shadow-md:shadow-mac dark:hover:shadow-mac calculator:hover:shadow-mac transition-all duration-200 text-left group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text group-hover:text-gray-700 dark:group-hover:text-gray-100:text-calc-text dark:group-hover:text-gray-100 calculator:group-hover:text-calc-text">
                Donnez votre avis !
              </span>
              <span className="text-gray-500 dark:text-gray-400 dark:text-gray-100 calculator:text-calc-text group-hover:text-gray-700 dark:group-hover:text-gray-100">→</span>
            </Link>
            <Link
              to={CalculatorRoute.Don}
              className="flex items-center justify-between p-4 rounded-xl calculator:rounded-none border border-gray-200 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border bg-white dark:bg-gray-800 dark:bg-gray-800 calculator:bg-calc-bg-card hover:border-gray-400 dark:hover:border-gray-700:border-calc-accent dark:hover:border-calc-accent calculator:hover:border-calc-accent hover:shadow-md:shadow-mac dark:hover:shadow-mac calculator:hover:shadow-mac transition-all duration-200 text-left group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text group-hover:text-gray-700 dark:group-hover:text-gray-100:text-calc-text dark:group-hover:text-gray-100 calculator:group-hover:text-calc-text">
                Offrir une bière
              </span>
              <span className="text-gray-500 dark:text-gray-400 dark:text-gray-100 calculator:text-calc-text group-hover:text-gray-700 dark:group-hover:text-gray-100">→</span>
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default HomeScreen;