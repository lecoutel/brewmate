
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { COMMON_CLASSES as CC, THEME_COLORS, Icons as IconsConst } from '../constants'; // Aliased to avoid conflict
import { brixToSG, sgToBrix, platoToSG, sgToPlato } from '../utils/brewingCalculators';

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
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">°Brix</div>
          <input
            type="number"
            value={brixValue}
            onChange={handleBrixChange}
            step="0.1"
            min="0"
            placeholder="ex: 12.4"
            className={`${COMMON_CLASSES.input} ${error ? `border-[${THEME_COLORS.light.error}] dark:border-[${THEME_COLORS.dark.error}]` : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Densité Spécifique</div>
          <input
            type="number"
            value={sgValue}
            onChange={handleSgChange}
            step="0.001"
            min="1"
            placeholder="ex: 1.050"
            className={`${COMMON_CLASSES.input} ${error ? `border-[${THEME_COLORS.light.error}] dark:border-[${THEME_COLORS.dark.error}]` : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">°Plato</div>
          <input
            type="number"
            value={platoValue}
            onChange={handlePlatoChange}
            step="0.1"
            min="0"
            placeholder="ex: 12.4"
            className={`${COMMON_CLASSES.input} ${error ? `border-[${THEME_COLORS.light.error}] dark:border-[${THEME_COLORS.dark.error}]` : ''}`}
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
    <input id={id} {...props} className={`${COMMON_CLASSES.input} ${error ? `border-[${THEME_COLORS.light.error}] dark:border-[${THEME_COLORS.dark.error}] focus:ring-[${THEME_COLORS.light.error}] dark:focus:ring-[${THEME_COLORS.dark.error}]` : ''}`} />
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
    <select id={id} {...props} className={`${COMMON_CLASSES.input} ${error ? `border-[${THEME_COLORS.light.error}] dark:border-[${THEME_COLORS.dark.error}]` : ''}`}>
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
  <div onClick={onClick} className={`${COMMON_CLASSES.card} ${className} group`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className={`w-10 h-10 mr-4 text-[${THEME_COLORS.light.error}] dark:text-[${THEME_COLORS.dark.error}] group-hover:scale-110 transition-transform duration-200`} />
        <div>
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{title}</h3>
          <p className={`${COMMON_CLASSES.textMuted} mt-1`}>{description}</p>
        </div>
      </div>
      <IconsConst.ChevronRightIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform duration-200" />
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
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <img src="/logo.png" alt="BrewMate" className="w-8 h-8 object-contain flex-shrink-0" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">BrewMate</span>
        </div>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {showBackButton && (
            <div className="p-4 rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Link to="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                <IconsConst.ArrowLeftIcon className="w-4 h-4" />
                Retour
              </Link>
            </div>
          )}
          <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {showBackButton && (
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">{title}</h1>
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
}

export const ResultActionCard: React.FC<ResultActionCardProps> = ({ description, warning, type = 'primary' }) => {
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
      <div className="pl-2">
        <p className="text-light-on-surface dark:text-dark-on-surface font-semibold text-lg leading-snug">
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
