
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { COMMON_CLASSES as CC, Icons as IconsConst } from '../constants'; // Aliased to avoid conflict
import { brixToSG, sgToBrix, platoToSG, sgToPlato } from '../utils/brewingCalculators';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types';

// Re-export with the original name if needed elsewhere, or use CC directly in this file.
// For this specific fix, ensuring it's available for export is key.
export const COMMON_CLASSES = CC;
export const Icons = IconsConst;

interface DensityInputGroupProps {
  label: React.ReactNode;
  sgValue: string;
  brixValue: string;
  platoValue: string;
  onSgChange: (value: string) => void;
  onBrixChange: (value: string) => void;
  onPlatoChange: (value: string) => void;
  error?: string;
}

export const DensityInputGroup: React.FC<DensityInputGroupProps> = ({
  label,
  sgValue,
  brixValue,
  platoValue,
  onSgChange,
  onBrixChange,
  onPlatoChange,
  error
}) => {
  const handleSgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSgChange(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 1) {
      onBrixChange(sgToBrix(num).toFixed(1));
      onPlatoChange(sgToPlato(num).toFixed(1));
    } else {
      onBrixChange('');
      onPlatoChange('');
    }
  };

  const handleBrixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onBrixChange(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const sg = brixToSG(num);
      onSgChange(sg.toFixed(3));
      onPlatoChange(sgToPlato(sg).toFixed(1));
    } else {
      onSgChange('');
      onPlatoChange('');
    }
  };

  const handlePlatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onPlatoChange(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const sg = platoToSG(num);
      onSgChange(sg.toFixed(3));
      onBrixChange(sgToBrix(sg).toFixed(1));
    } else {
      onSgChange('');
      onBrixChange('');
    }
  };

  return (
    <div className="mb-4">
      <label className={COMMON_CLASSES.label}>{label}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">°Brix</div>
          <input
            type="number"
            value={brixValue}
            onChange={handleBrixChange}
            step="0.1"
            min="0"
            placeholder="ex: 12.4"
            className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75]' : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Densité Spécifique</div>
          <input
            type="number"
            value={sgValue}
            onChange={handleSgChange}
            step="0.001"
            min="1"
            placeholder="ex: 1.050"
            className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75]' : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">°Plato</div>
          <input
            type="number"
            value={platoValue}
            onChange={handlePlatoChange}
            step="0.1"
            min="0"
            placeholder="ex: 12.4"
            className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75]' : ''}`}
          />
        </div>
      </div>
      {error && <p className={`mt-1 ${COMMON_CLASSES.errorText}`}>{error}</p>}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode; 
  error?: string;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, wrapperClassName, ...props }) => (
  <div className={`mb-4 ${wrapperClassName}`}>
    <label htmlFor={id} className={COMMON_CLASSES.label}>
      {label}
    </label>
    <input id={id} {...props} className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75] focus:ring-[#FF4B2B]' : ''}`} />
    {error && <p className={`mt-1 ${COMMON_CLASSES.errorText}`}>{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  error?: string;
  wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, options, error, wrapperClassName, ...props }) => (
  <div className={`mb-4 ${wrapperClassName}`}>
    <label htmlFor={id} className={COMMON_CLASSES.label}>
      {label}
    </label>
    <select id={id} {...props} className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75]' : ''}`}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className={`mt-1 ${COMMON_CLASSES.errorText}`}>{error}</p>}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => (
  <button
    {...props}
    className={`${variant === 'primary' ? COMMON_CLASSES.buttonPrimary : COMMON_CLASSES.buttonSecondary} ${className}`}
  >
    {children}
  </button>
);

interface CardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, icon: Icon, onClick, className }) => (
  <div onClick={onClick} className={`${COMMON_CLASSES.card} ${className ?? ''} group relative overflow-hidden`}>
    <div className="absolute left-0 inset-y-0 w-1 bg-[#2563FF] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl" />
    <div className="flex items-center justify-between pl-1">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#FF4B2B]/10 dark:bg-[#FF4B2B]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF4B2B]/20 dark:group-hover:bg-[#FF4B2B]/30 transition-colors duration-200">
          <Icon className="w-6 h-6 text-[#FF4B2B] dark:text-[#ff8c75]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#2563FF] dark:text-[#6b99ff]">{title}</h3>
          <p className={`${COMMON_CLASSES.textMuted} mt-0.5 text-sm`}>{description}</p>
        </div>
      </div>
      <IconsConst.ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 group-hover:text-[#2563FF] dark:group-hover:text-[#6b99ff] transition-all duration-200 flex-shrink-0" />
    </div>
  </div>
);

interface InfoTooltipProps {
  infoText: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ infoText, children, className, iconClassName }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {children}
      <button 
        type="button"
        onMouseEnter={() => setIsOpen(true)} 
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 focus:outline-none"
        aria-label="More info"
      >
        <IconsConst.InformationCircleIcon className={`${iconClassName ?? 'w-5 h-5'} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-3
                        bg-gray-100 dark:bg-gray-800 
                        text-gray-800 dark:text-gray-100
                        rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 text-sm">
          {infoText}
        </div>
      )}
    </div>
  );
};


interface PageLayoutProps {
  title: string;
  showBackButton?: boolean;
  children: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, showBackButton, children }) => {
  const [theme, setTheme] = useTheme();
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BrewMate" className="w-8 h-8 object-contain flex-shrink-0" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">BrewMate</span>
          </div>
          <button
            onClick={() => setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Basculer le thème"
            type="button"
          >
            {theme === Theme.Dark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {showBackButton && (
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[#2563FF] dark:hover:text-[#6b99ff] font-medium transition-colors group"
              >
                <IconsConst.ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
                Retour à l'accueil
              </Link>
            </div>
          )}
          <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            {showBackButton && (
              <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-[#2563FF] dark:text-[#6b99ff]">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
      <footer className="text-center py-4">
        <p className={COMMON_CLASSES.textMuted}>BrewMate &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export const ResultDisplay: React.FC<{ results: string[] | string, error?: string, type?: 'success' | 'error' | 'info' }> = ({ results, error, type = 'success' }) => {
  if (error) {
    return (
      <div className={`mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-start`}>
        <IconsConst.ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
        <p className={`text-red-700 dark:text-red-300 font-semibold`}>{error}</p>
      </div>
    );
  }
  
  const baseClass = 'mt-6 p-5 rounded-xl border shadow-sm flex items-start transition-all duration-300';
  let specificClass = '';
  let textClass = '';
  let Icon = IconsConst.CheckCircleIcon;

  if (type === 'success') {
    specificClass = `bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800`;
    textClass = `text-green-800 dark:text-green-200`;
    Icon = IconsConst.CheckCircleIcon;
  } else if (type === 'info') {
     specificClass = `bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800`;
     textClass = `text-blue-800 dark:text-blue-200`;
     Icon = IconsConst.InformationCircleIcon;
  }

  const content = Array.isArray(results) ? (
    <ul className="space-y-1">
      {results.map((res, index) => (
        <li key={index} className={`${textClass} font-medium leading-relaxed`}>
          {res}
        </li>
      ))}
    </ul>
  ) : (
    <p className={`${textClass} font-semibold leading-relaxed`}>{results}</p>
  );

  return (
    <div className={`${baseClass} ${specificClass}`}>
      <Icon className={`w-6 h-6 mr-3 flex-shrink-0 mt-0.5 ${type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
      <div className="flex-1">{content}</div>
    </div>
  );
};

interface ResultActionCardProps {
  description: string;
  warning?: string;
  type?: 'primary' | 'secondary' | 'warning';
  badge?: string;
}

export const ResultActionCard: React.FC<ResultActionCardProps> = ({ description, warning, type = 'primary', badge }) => {
  let borderClass = 'border-gray-200 dark:border-gray-700';
  let bgClass = 'bg-white dark:bg-gray-800';
  let accentClass = 'bg-[#2563FF]';

  if (type === 'warning') {
    borderClass = 'border-[#E6EEFF] dark:border-blue-800';
    bgClass = 'bg-[#E6EEFF] dark:bg-blue-900/20';
    accentClass = 'bg-[#2563FF]';
  }

  return (
    <div className={`relative overflow-hidden p-4 rounded-xl border shadow-sm ${bgClass} ${borderClass} transition-all hover:shadow-md`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClass}`} />
      {badge && (
        <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2563FF]/10 text-[#2563FF] dark:bg-blue-900/30 dark:text-blue-300">
          {badge}
        </span>
      )}
      <div className="pl-2">
        <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg leading-snug">
          {description}
        </p>
        {warning && (
          <div className="mt-2 flex items-start text-sm text-[#1A237E] dark:text-blue-400 bg-[#E6EEFF]/50 dark:bg-blue-900/40 p-2 rounded-lg">
            <IconsConst.InformationCircleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SectionHeading ---
interface SectionHeadingProps {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ icon: Icon, children, className }) => (
  <h3 className={`text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 ${className ?? ''}`}>
    <span className="bg-[#E6EEFF] dark:bg-blue-900/40 text-[#1A237E] dark:text-blue-400 p-1.5 rounded-md flex-shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    {children}
  </h3>
);

// --- InfoPanel ---
interface InfoPanelProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ children, icon: Icon, className }) => (
  <div className={`p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 flex gap-2 items-start ${className ?? ''}`}>
    {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />}
    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{children}</p>
  </div>
);

// --- ResultHero ---
interface ResultHeroProps {
  value: string;
  label: string;
  sublabel?: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
}

export const ResultHero: React.FC<ResultHeroProps> = ({ value, label, sublabel, status = 'neutral' }) => {
  const colorMap = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    neutral: 'text-[#2563FF] dark:text-[#6b99ff]',
  };
  return (
    <div className="text-center py-4 mb-2 border-b border-gray-100 dark:border-gray-700">
      <div className={`text-5xl font-black ${colorMap[status]}`}>{value}</div>
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sublabel}</div>}
    </div>
  );
};
