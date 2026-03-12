
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
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-6 pb-5 bg-gradient-to-br from-[#2563FF]/10 to-[#E6EEFF]/60 dark:from-[#2563FF]/20 dark:to-blue-900/30 border-b border-blue-100 dark:border-blue-900 rounded-t-xl">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Bonjour, brasseur 🍺</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Choisissez un outil selon ce que vous voulez faire.</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {HOME_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{section.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to={CalculatorRoute.Feedback}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#2563FF] dark:hover:border-[#6b99ff] hover:shadow-md transition-all duration-200 text-left group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#2563FF] dark:group-hover:text-[#6b99ff]">
                Donnez votre avis !
              </span>
              <span className="text-[#2563FF] dark:text-[#6b99ff]">→</span>
            </Link>
            <Link
              to={CalculatorRoute.Don}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#2563FF] dark:hover:border-[#6b99ff] hover:shadow-md transition-all duration-200 text-left group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#2563FF] dark:group-hover:text-[#6b99ff]">
                Offrir une bière 🍻
              </span>
              <span className="text-[#2563FF] dark:text-[#6b99ff]">→</span>
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default HomeScreen;