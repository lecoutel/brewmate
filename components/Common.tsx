
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
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mb-1">Densité spécifique</div>
          <input
            type="number"
            value={sgValue}
            onChange={handleSgChange}
            step="0.001"
            min="1"
            placeholder="ex: 1.050"
            className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75] calculator:border-calc-error' : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mb-1">°Plato</div>
          <input
            type="number"
            value={platoValue}
            onChange={handlePlatoChange}
            step="0.1"
            min="0"
            placeholder="ex: 12.4"
            className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75] calculator:border-calc-error' : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mb-1">°Brix</div>
          <input
            type="number"
            value={brixValue}
            onChange={handleBrixChange}
            step="0.1"
            min="0"
            placeholder="ex: 12.4"
            className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75] calculator:border-calc-error' : ''}`}
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
  clearable?: boolean;
  onClear?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  wrapperClassName,
  clearable,
  onClear,
  value,
  className,
  ...props
}) => {
  const hasValue = value != null && String(value).trim() !== '';
  const inputClasses = `${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75] calculator:border-calc-error focus:ring-[#FF4B2B] calculator:focus:ring-calc-error' : ''} ${clearable && hasValue ? 'pr-10' : ''} ${className ?? ''}`.trim();

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <label htmlFor={id} className={COMMON_CLASSES.label}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          {...props}
          className={inputClasses}
        />
        {clearable && hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full calculator:rounded-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 calculator:text-calc-text-muted calculator:hover:text-calc-text dark:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563FF] calculator:focus:ring-calc-border focus:ring-offset-0"
            title="Vider le champ"
            aria-label="Vider le champ"
          >
            <IconsConst.XCircleIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {error && <p className={`mt-1 ${COMMON_CLASSES.errorText}`}>{error}</p>}
    </div>
  );
};

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
    <select id={id} {...props} className={`${COMMON_CLASSES.input} ${error ? 'border-[#FF4B2B] dark:border-[#ff8c75] calculator:border-calc-error' : ''}`}>
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
    <div className="absolute left-0 inset-y-0 w-1 bg-[#2563FF] calculator:bg-calc-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl" />
    <div className="flex items-center justify-between pl-1">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#FF4B2B]/10 dark:bg-[#FF4B2B]/20 calculator:bg-calc-bg-surface flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF4B2B]/20 dark:group-hover:bg-[#FF4B2B]/30 calculator:group-hover:bg-calc-border transition-colors duration-200">
          <Icon className="w-6 h-6 text-[#FF4B2B] dark:text-[#ff8c75] calculator:text-calc-text" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text">{title}</h3>
          <p className={`${COMMON_CLASSES.textMuted} mt-0.5 text-sm`}>{description}</p>
        </div>
      </div>
      <IconsConst.ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted group-hover:translate-x-1 group-hover:text-[#2563FF] dark:group-hover:text-[#6b99ff] calculator:group-hover:text-calc-text transition-all duration-200 flex-shrink-0" />
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
        <IconsConst.InformationCircleIcon className={`${iconClassName ?? 'w-5 h-5'} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 calculator:text-calc-text-muted calculator:hover:text-calc-text transition-colors`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-3
                        bg-gray-100 dark:bg-gray-800 calculator:bg-calc-bg-card
                        text-gray-800 dark:text-gray-100 calculator:text-calc-text
                        rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 calculator:border-calc-border text-sm">
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
  const isActive = (t: Theme) => theme === t;
  const btnBase = 'p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 calculator:hover:bg-calc-bg-surface';
  const btnActive = 'bg-calc-accent text-calc-text';
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-gray-900 calculator:bg-calc-bg">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 calculator:bg-calc-bg-card border-b border-gray-200 dark:border-gray-700 calculator:border-calc-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/wortlab-logo-header.svg" alt="WortLab" className="h-7 w-auto flex-shrink-0 dark:hidden calculator:hidden" />
            <img src="/wortlab-logo-header-dark-mode.svg" alt="WortLab" className="h-7 w-auto flex-shrink-0 hidden dark:block calculator:hidden" />
            <img src="/wortlab-logo-header-calculator.svg" alt="WortLab" className="h-7 w-auto flex-shrink-0 hidden calculator:block" />
            <Link
              to="/feedback"
              className="text-xs font-medium px-2 py-0.5 rounded-full calculator:rounded-none bg-amber-100 dark:bg-amber-900/40 calculator:bg-calc-bg-surface calculator:text-calc-text border border-amber-300 dark:border-amber-700 calculator:border calculator:border-calc-border transition-colors"
              title="Contact / Donner mon avis"
            >
              beta
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(Theme.Calculator)}
              className={`${btnBase} ${isActive(Theme.Calculator) ? btnActive : ''}`}
              aria-label="Mode calculatrice"
              type="button"
              title="Mode calculatrice"
            >
              <IconsConst.CalculatorIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme(Theme.Light)}
              className={`${btnBase} ${isActive(Theme.Light) ? btnActive : ''}`}
              aria-label="Thème clair"
              type="button"
              title="Thème clair"
            >
              <IconsConst.LightModeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme(Theme.Dark)}
              className={`${btnBase} ${isActive(Theme.Dark) ? btnActive : ''}`}
              aria-label="Thème sombre"
              type="button"
              title="Thème sombre"
            >
              <IconsConst.MoonIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {showBackButton && (
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted hover:text-[#2563FF] dark:hover:text-[#6b99ff] calculator:hover:text-calc-text font-medium transition-colors group"
              >
                <IconsConst.ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
                Retour à l'accueil
              </Link>
            </div>
          )}
          <div className="p-6 rounded-xl calculator:rounded-none shadow-lg calculator:shadow-mac-lg bg-white dark:bg-gray-800 calculator:bg-calc-bg-card border border-gray-200 dark:border-gray-600 calculator:border-calc-border">
            {showBackButton && (
              <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 calculator:border-calc-border">
                <h1 className="text-2xl font-bold text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 space-y-1">
        <p className={COMMON_CLASSES.textMuted}>
          <Link
            to="/feedback"
            className="text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text hover:underline font-medium"
          >
            Donner mon avis
          </Link>
          {' · '}
          <Link
            to="/don"
            className="text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text hover:underline font-medium"
          >
            Offrir une bière
          </Link>
          {' · '}
          <span>WortLab &copy; {new Date().getFullYear()}</span>
        </p>
      </footer>
    </div>
  );
};

export const ResultDisplay: React.FC<{ results: string[] | string, error?: string, type?: 'success' | 'error' | 'info' }> = ({ results, error, type = 'success' }) => {
  if (error) {
    return (
      <div className="mt-6 p-4 rounded-xl calculator:rounded-none bg-red-50 dark:bg-red-900/30 calculator:bg-calc-bg-surface border border-red-200 dark:border-red-800 calculator:border-calc-error flex items-start">
        <IconsConst.ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 calculator:text-calc-error mr-3 flex-shrink-0 mt-0.5" />
        <p className="text-red-700 dark:text-red-300 calculator:text-calc-text font-semibold">{error}</p>
      </div>
    );
  }

  const baseClass = 'mt-6 p-5 rounded-xl calculator:rounded-none border shadow-sm calculator:shadow-mac flex items-start transition-all duration-300';
  let specificClass = '';
  let textClass = '';
  let Icon = IconsConst.CheckCircleIcon;

  if (type === 'success') {
    specificClass = 'bg-green-50 dark:bg-green-900/30 calculator:bg-calc-bg-card border-green-200 dark:border-green-800 calculator:border-calc-border';
    textClass = 'text-green-800 dark:text-green-200 calculator:text-calc-text';
    Icon = IconsConst.CheckCircleIcon;
  } else if (type === 'info') {
    specificClass = 'bg-blue-50 dark:bg-blue-900/30 calculator:bg-calc-bg-card border-blue-200 dark:border-blue-800 calculator:border-calc-border';
    textClass = 'text-blue-800 dark:text-blue-200 calculator:text-calc-text';
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
      <Icon className={`w-6 h-6 mr-3 flex-shrink-0 mt-0.5 ${type === 'success' ? 'text-green-600 dark:text-green-400 calculator:text-calc-text' : 'text-blue-600 dark:text-blue-400 calculator:text-calc-text'}`} />
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
  let borderClass = 'border-gray-200 dark:border-gray-700 calculator:border-calc-border';
  let bgClass = 'bg-white dark:bg-gray-800 calculator:bg-calc-bg-card';
  let accentClass = 'bg-[#2563FF] calculator:bg-calc-accent';

  if (type === 'warning') {
    borderClass = 'border-[#E6EEFF] dark:border-blue-800 calculator:border-calc-border';
    bgClass = 'bg-[#E6EEFF] dark:bg-blue-900/20 calculator:bg-calc-bg-surface';
    accentClass = 'bg-[#2563FF] calculator:bg-calc-accent';
  }

  return (
    <div className={`relative overflow-hidden p-4 rounded-xl calculator:rounded-none border shadow-sm calculator:shadow-mac ${bgClass} ${borderClass} transition-all hover:shadow-md`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClass}`} />
      {badge && (
        <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full calculator:rounded-none bg-[#2563FF]/10 text-[#2563FF] dark:bg-blue-900/30 dark:text-blue-300 calculator:bg-calc-bg-surface calculator:text-calc-text">
          {badge}
        </span>
      )}
      <div className="pl-2">
        <p className="text-gray-900 dark:text-gray-100 calculator:text-calc-text font-semibold text-lg leading-snug">
          {description}
        </p>
        {warning && (
          <div className="mt-2 flex items-start text-sm text-[#1A237E] dark:text-blue-400 calculator:text-calc-text bg-[#E6EEFF]/50 dark:bg-blue-900/40 calculator:bg-calc-bg-surface p-2 rounded-lg">
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
  <h3 className={`text-base font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text mb-3 flex items-center gap-2 ${className ?? ''}`}>
    <span className="bg-[#E6EEFF] dark:bg-blue-900/40 calculator:bg-calc-bg-surface text-[#1A237E] dark:text-blue-400 calculator:text-calc-text p-1.5 rounded-md flex-shrink-0">
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
  <div className={`p-3 bg-blue-50 dark:bg-blue-900/20 calculator:bg-calc-bg-surface rounded-lg border border-blue-200 dark:border-blue-700 calculator:border-calc-border flex gap-2 items-start ${className ?? ''}`}>
    {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 calculator:text-calc-text flex-shrink-0 mt-0.5" />}
    <p className="text-sm text-blue-700 dark:text-blue-300 calculator:text-calc-text leading-relaxed">{children}</p>
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
    success: 'text-green-600 dark:text-green-400 calculator:text-calc-text',
    warning: 'text-yellow-600 dark:text-yellow-400 calculator:text-calc-text',
    error: 'text-red-600 dark:text-red-400 calculator:text-calc-error',
    neutral: 'text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text',
  };
  return (
    <div className="text-center py-4 mb-2 border-b border-gray-100 dark:border-gray-700 calculator:border-calc-border">
      <div className={`text-5xl font-black ${colorMap[status]}`}>{value}</div>
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mt-1 uppercase tracking-wide">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted mt-0.5">{sublabel}</div>}
    </div>
  );
};
