
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { COMMON_CLASSES as CC, THEME_COLORS, Icons } from '../constants'; // Aliased to avoid conflict

// Re-export with the original name if needed elsewhere, or use CC directly in this file.
// For this specific fix, ensuring it's available for export is key.
export const COMMON_CLASSES = CC;


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
        <Icon className={`w-10 h-10 mr-4 text-[${THEME_COLORS.light.primary}] dark:text-[${THEME_COLORS.dark.primary}] group-hover:scale-110 transition-transform duration-200`} />
        <div>
          <h3 className="text-xl font-semibold text-light-on-surface dark:text-dark-on-surface">{title}</h3>
          <p className={`${COMMON_CLASSES.textMuted} mt-1`}>{description}</p>
        </div>
      </div>
      <Icons.ChevronRightIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform duration-200" />
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
        <Icons.InformationCircleIcon className={`${iconClassName ?? 'w-5 h-5'} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors`} />
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
    <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8">
      <header className="mb-6 flex items-center">
        {showBackButton && (
          <Link to="/" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Go back">
            <Icons.ArrowLeftIcon className="w-6 h-6 text-light-on-background dark:text-dark-on-background" />
          </Link>
        )}
        <h1 className="text-3xl font-bold text-light-on-background dark:text-dark-on-background">{title}</h1>
      </header>
      <main className="flex-grow">
        <div className={`max-w-2xl mx-auto p-6 rounded-xl shadow-2xl bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700`}>
          {children}
        </div>
      </main>
      <footer className="text-center mt-8 py-4">
        <p className={COMMON_CLASSES.textMuted}>BrewMate &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export const ResultDisplay: React.FC<{ results: string[] | string, error?: string, type?: 'success' | 'error' | 'info' }> = ({ results, error, type = 'success' }) => {
  if (error) {
    return (
      <div className={`mt-6 p-4 rounded-lg bg-[${THEME_COLORS.light.errorContainer}] dark:bg-[${THEME_COLORS.dark.errorContainer}] border border-[${THEME_COLORS.light.error}] dark:border-[${THEME_COLORS.dark.error}]`}>
        <p className={`text-[${THEME_COLORS.light.onErrorContainer}] dark:text-[${THEME_COLORS.dark.onErrorContainer}] font-semibold`}>{error}</p>
      </div>
    );
  }
  
  const baseClass = 'mt-6 p-4 rounded-lg border';
  let specificClass = '';
  let textClass = '';

  if (type === 'success') {
    specificClass = `bg-green-50 dark:bg-green-900_bg_opacity_30 border-green-200 dark:border-green-700`;
    textClass = `text-green-700 dark:text-green-300`;
  } else if (type === 'info') {
     specificClass = `bg-blue-50 dark:bg-blue-900_bg_opacity_30 border-blue-200 dark:border-blue-700`;
     textClass = `text-blue-700 dark:text-blue-300`;
  }


  const content = Array.isArray(results) ? (
    <ul className="list-disc list-inside">
      {results.map((res, index) => <li key={index} className={`${textClass} font-medium`}>{res}</li>)}
    </ul>
  ) : (
    <p className={`${textClass} font-semibold`}>{results}</p>
  );

  return <div className={`${baseClass} ${specificClass}`}>{content}</div>;
};
