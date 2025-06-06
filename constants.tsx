import React from 'react';
import { BeakerIcon, ScaleIcon, EyeIcon, SunIcon, MoonIcon, CogIcon, ChevronRightIcon, InformationCircleIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CalculatorRoute, CalculatorMeta, GravityUnit, CorrectionStage, AromaticProfileKey, TeaTypeKey } from './types'; // Added AromaticProfileKey, TeaTypeKey

// Theme Colors (using Tailwind arbitrary values)
export const THEME_COLORS = {
  light: {
    primary: '#2563FF', // bleu électrique du logo
    onPrimary: '#FFFFFF', // blanc pour contraste
    primaryContainer: '#E6EEFF', // bleu très clair, désaturé
    onPrimaryContainer: '#1A237E', // bleu foncé pour contraste
    surface: '#F9FAFB', // blanc cassé
    onSurface: '#181A1B', // gris très foncé
    background: '#F5F7FA', // gris très clair
    onBackground: '#181A1B', // gris très foncé
    error: '#FF4B2B', // rouge orangé du logo
    errorContainer: '#FFE6E1', // rouge très clair
    onErrorContainer: '#B71C1C', // rouge foncé
    toastSuccessBg: '#dcfce7', // inchangé
    toastSuccessText: '#15803d', // inchangé
    toastErrorBg: '#ffe6e1', // adapté au nouveau rouge
    toastErrorText: '#b71c1c', // adapté au nouveau rouge foncé
    toastInfoBg: '#e6eeff', // adapté au nouveau bleu
    toastInfoText: '#2563ff', // bleu logo
    toastWarningBg: '#fff8e1', // jaune très clair
    toastWarningText: '#a16207', // inchangé
  },
  dark: {
    primary: '#2563FF', // même bleu électrique
    onPrimary: '#FFFFFF', // blanc
    primaryContainer: '#1A237E', // bleu nuit foncé
    onPrimaryContainer: '#E6EEFF', // bleu très clair
    surface: '#181A1B', // gris anthracite
    onSurface: '#EAEAEA', // gris clair
    background: '#10141A', // bleu nuit très foncé
    onBackground: '#EAEAEA', // gris clair
    error: '#FF6A4D', // rouge orangé légèrement éclairci
    errorContainer: '#4A1313', // inchangé
    onErrorContainer: '#FFB3A7', // rouge clair
    toastSuccessBg: '#166534', // inchangé
    toastSuccessText: '#dcfce7', // inchangé
    toastErrorBg: '#4a1313', // inchangé
    toastErrorText: '#ffb3a7', // adapté au nouveau rouge clair
    toastInfoBg: '#1a237e', // bleu nuit foncé
    toastInfoText: '#e6eeff', // bleu très clair
    toastWarningBg: '#4a3b0b', // jaune foncé
    toastWarningText: '#fff8e1', // jaune très clair
  },
};

// App Logo
export const BrewMateCircularLogo: React.FC<{className?: string}> = ({ className }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-32 sm:h-32 mb-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" strokeWidth="4" className="stroke-[#2563FF] dark:stroke-[#2563FF]" fill="transparent" />
      <circle cx="50" cy="50" r="40" strokeWidth="3" className="stroke-[#FF4B2B] dark:stroke-[#FF6A4D]" fill="transparent" strokeDasharray="4 4" />

      {/* B */}
      <text x="35%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="bold" className="fill-[#2563FF] dark:fill-[#E6EEFF]">
        B
      </text>
      {/* M */}
      <text x="65%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="bold" className="fill-[#FF4B2B] dark:fill-[#FF6A4D]">
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
    icon: ScaleIcon, // Was ScaleIcon, changed to avoid repetition, SparklesIcon seems more fitting for "correction"
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
