
import React from 'react';
import { BeakerIcon, ScaleIcon, EyeIcon, SunIcon, MoonIcon, CogIcon, ChevronRightIcon, InformationCircleIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CalculatorRoute, CalculatorMeta, GravityUnit, CorrectionStage, AromaticProfileKey, TeaTypeKey } from './types'; // Added AromaticProfileKey, TeaTypeKey

// Theme Colors (using Tailwind arbitrary values)
export const THEME_COLORS = {
  light: {
    primary: '#FFC107', // amber-400
    onPrimary: '#000000', // black
    primaryContainer: '#FFD54F', // amber-300
    onPrimaryContainer: '#212121', // neutral-800
    surface: '#FDFDFD', // neutral-50
    onSurface: '#1C1B1F', // neutral-900
    background: '#F5F5F5', // neutral-100
    onBackground: '#1C1B1F', // neutral-900
    error: '#B00020', // red-700
    errorContainer: '#FDE8E8',
    onErrorContainer: '#B00020',
    toastSuccessBg: '#dcfce7', // green-100
    toastSuccessText: '#15803d', // green-700
    toastErrorBg: '#fee2e2', // red-100
    toastErrorText: '#b91c1c', // red-700
    toastInfoBg: '#dbeafe', // blue-100
    toastInfoText: '#1d4ed8', // blue-700
    toastWarningBg: '#fefce8', // yellow-100
    toastWarningText: '#a16207', // yellow-700
  },
  dark: {
    primary: '#D4A106', // amber-600
    onPrimary: '#000000', // black (Note: low contrast on D4A106, per spec)
    primaryContainer: '#B38600', // amber-800 (adjusted from spec #B38600 for better name)
    onPrimaryContainer: '#E0E0E0', // neutral-200
    surface: '#2C2C2E', // neutral-800
    onSurface: '#EAEAEA', // neutral-100
    background: '#0f172a', // slate-900
    onBackground: '#EAEAEA', // neutral-100
    error: '#CF6679', // red-400 (adjusted from spec for Tailwind palette)
    errorContainer: '#4A1313',
    onErrorContainer: '#CF6679',
    toastSuccessBg: '#166534', // green-800
    toastSuccessText: '#dcfce7', // green-100
    toastErrorBg: '#991b1b', // red-800
    toastErrorText: '#fee2e2', // red-100
    toastInfoBg: '#1e40af', // blue-800
    toastInfoText: '#dbeafe', // blue-100
    toastWarningBg: '#854d0e', // yellow-800
    toastWarningText: '#fefce8', // yellow-100
  },
};

// App Logo
export const BrewMateCircularLogo: React.FC<{className?: string}> = ({ className }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-32 sm:h-32 mb-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" strokeWidth="4" className="stroke-[#3B82F6] dark:stroke-[#60A5FA]" fill="transparent" />
      <circle cx="50" cy="50" r="40" strokeWidth="3" className="stroke-[#EF4444] dark:stroke-[#F87171]" fill="transparent" strokeDasharray="4 4" />

      {/* B */}
      <text x="35%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="bold" className="fill-[#3B82F6] dark:fill-[#60A5FA]">
        B
      </text>
      {/* M */}
      <text x="65%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="bold" className="fill-[#EF4444] dark:fill-[#F87171]">
        M
      </text>
    </svg>
    <span className="text-2xl sm:text-3xl font-bold text-light-on-background dark:text-dark-on-background">BrewMate</span>
  </div>
);


// Calculator metadata
export const CALCULATORS: CalculatorMeta[] = [
  {
    id: 'ph-correction',
    name: 'Correction de pH (Mash / Pré-ébullition)',
    route: CalculatorRoute.PhCorrection,
    description: 'Ajustez le pH (Empâtage via BeerXML, Pré-ébullition simplifié).',
    icon: BeakerIcon,
  },
  {
    id: 'pre-boil-density',
    name: 'Correction Densité Pré-Ébullition',
    route: CalculatorRoute.PreBoilDensity,
    description: 'Atteignez votre densité cible avant l\'ébullition.',
    icon: ScaleIcon,
  },
  {
    id: 'post-boil-density',
    name: 'Correction Densité Fin d\'Ébullition',
    route: CalculatorRoute.PostBoilDensity,
    description: 'Corrigez votre densité finale (dilution, évaporation, sucre).',
    icon: SparklesIcon, // Was ScaleIcon, changed to avoid repetition, SparklesIcon seems more fitting for "correction"
  },
  {
    id: 'refractometer',
    name: 'Correction Réfractomètre & Alcool',
    route: CalculatorRoute.Refractometer,
    description: 'Calculez la densité finale corrigée et le taux d\'alcool.',
    icon: EyeIcon,
  },
  {
    id: 'kombucha-recipe-generator',
    name: 'Générateur de Recette de Kombucha',
    route: CalculatorRoute.KombuchaGenerator,
    description: 'Créez votre recette de 1ère fermentation (F1) sur mesure.',
    icon: SparklesIcon, // Using SparklesIcon as requested
  },
];

export const COMMON_CLASSES = {
  input: `w-full p-3 border rounded-lg shadow-sm
          bg-light-surface dark:bg-dark-surface
          border-gray-300 dark:border-gray-600
          text-light-on-surface dark:text-dark-on-surface
          focus:ring-2 focus:ring-[${THEME_COLORS.light.primary}] dark:focus:ring-[${THEME_COLORS.dark.primary}] focus:border-transparent outline-none transition-colors duration-200`,
  label: "block text-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface",
  buttonPrimary: `bg-[${THEME_COLORS.light.primary}] hover:bg-opacity-80 text-[${THEME_COLORS.light.onPrimary}]
                  dark:bg-[${THEME_COLORS.dark.primary}] dark:hover:bg-opacity-80 dark:text-[${THEME_COLORS.dark.onPrimary}]
                  font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`,
  buttonSecondary: `bg-gray-200 hover:bg-gray-300 text-gray-800
                    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
                    font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`,
  card: `bg-light-surface dark:bg-dark-surface
         p-6 rounded-xl shadow-lg hover:shadow-2xl
         transition-all duration-300 ease-in-out cursor-pointer border border-gray-200 dark:border-gray-700`,
  title: "text-2xl font-bold mb-6 text-center text-light-on-background dark:text-dark-on-background",
  textMuted: "text-sm text-gray-500 dark:text-gray-400",
  errorText: `text-sm text-[${THEME_COLORS.light.error}] dark:text-[${THEME_COLORS.dark.error}]`,
  infoText: `text-sm p-3 rounded-md border 
             bg-[${THEME_COLORS.light.toastInfoBg}] text-[${THEME_COLORS.light.toastInfoText}] border-blue-300
             dark:bg-[${THEME_COLORS.dark.toastInfoBg}] dark:text-[${THEME_COLORS.dark.toastInfoText}] dark:border-blue-700`,
  resultBox: `p-4 rounded-lg border shadow-sm
              bg-light-surface dark:bg-dark-surface 
              border-gray-200 dark:border-gray-700`, // Added resultBox
  resultText: `text-light-on-surface dark:text-dark-on-surface font-medium`, // Added resultText
};

// Form Options
export const GRAVITY_UNIT_OPTIONS = Object.values(GravityUnit).map(value => ({ value, label: value }));

export const CORRECTION_STAGE_OPTIONS = [
  { value: CorrectionStage.MASH, label: 'Empâtage (Mash)' },
  { value: CorrectionStage.PRE_BOIL, label: 'Pré-ébullition' },
];

// Icon mapping
export const Icons = {
  BeakerIcon,
  ScaleIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  CogIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  SparklesIcon
};

export const APP_TITLE = "BrewMate";
export const SPLASH_DURATION = 1500; // milliseconds


// Default Water Profile (Loos, as specified for the new pH calculator)
export const DEFAULT_LOOS_WATER_PROFILE = {
  ca: 125,  // mg/L
  mg: 20.7, // mg/L
  hco3: 306.5, // mg/L
};

export const BREWING_CHEMISTRY_FACTORS = {
  LACTIC_ACID_80_MEQ_PER_ML: 8.1,
  PHOSPHORIC_ACID_75_MEQ_PER_ML: 23.0,
  SODIUM_BICARBONATE_MEQ_PER_GRAM: 11.9, // mEq alkalinizing power per gram
  ACID_MALT_MEQ_PER_100G: 13, // mEq acidifying power per 100g of acid malt
  PRE_BOIL_WORT_BUFFERING_ESTIMATE_MEQ_PER_L_PH: 3, // Estimated mEq needed to change 1L of pre-boil wort by 1 pH unit
};

// Kombucha Generator Options
export const KOMBUCHA_AROMATIC_PROFILE_OPTIONS: { value: AromaticProfileKey; label: string }[] = [
    { value: 'CLASSIC_BALANCED', label: 'Classique et Équilibré' },
    { value: 'LIGHT_GENTLE', label: 'Léger et Doux' },
    { value: 'INTENSE_VINEGARY', label: 'Intense et Vinaigré' },
];

export const KOMBUCHA_TEA_TYPE_OPTIONS: { value: TeaTypeKey; label: string }[] = [
    { value: 'BLACK_TEA', label: 'Thé Noir' },
    { value: 'GREEN_TEA', label: 'Thé Vert' },
    { value: 'MIXED_TEA', label: 'Mélange (Noir/Vert)' },
];
