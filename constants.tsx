import React from 'react';
import { BeakerIcon, ScaleIcon, EyeIcon, SunIcon, MoonIcon, CogIcon, ChevronRightIcon, InformationCircleIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CalculatorRoute, CalculatorMeta, GravityUnit, CorrectionStage, AromaticProfileKey, TeaTypeKey } from './types'; // Added AromaticProfileKey, TeaTypeKey

// Theme Colors (using Tailwind arbitrary values)
export const THEME_COLORS = {
  light: {
    primary: '#2563FF',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E6EEFF',
    onPrimaryContainer: '#1A237E',
    surface: '#F9FAFB',
    onSurface: '#181A1B',
    background: '#F5F7FA',
    onBackground: '#181A1B',
    error: '#FF4B2B',
    errorContainer: '#FFE6E1',
    onErrorContainer: '#B71C1C',
    toastSuccessBg: '#dcfce7',
    toastSuccessText: '#15803d',
    toastErrorBg: '#ffe6e1',
    toastErrorText: '#b71c1c',
    toastInfoBg: '#e6eeff',
    toastInfoText: '#2563ff',
    toastWarningBg: '#fff8e1',
    toastWarningText: '#a16207',
  }
};

// App Logo
export const BrewMateCircularLogo: React.FC<{className?: string}> = ({ className }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-32 sm:h-32 mb-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" strokeWidth="4" className="stroke-[#2563FF]" fill="transparent" />
      <circle cx="50" cy="50" r="40" strokeWidth="3" className="stroke-[#FF4B2B]" fill="transparent" strokeDasharray="4 4" />
      {/* B */}
      <text x="35%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="bold" className="fill-[#2563FF]">
        B
      </text>
      {/* M */}
      <text x="65%" y="60%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="bold" className="fill-[#FF4B2B]">
        M
      </text>
    </svg>
    <span className="text-2xl sm:text-3xl font-bold text-light-on-background">BrewMate</span>
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
          bg-light-surface
          border-gray-300
          text-light-on-surface
          focus:ring-2 focus:ring-[${THEME_COLORS.light.primary}] focus:border-[${THEME_COLORS.light.primary}] outline-none transition-colors duration-200`,
  label: "block text-sm font-medium mb-1 text-light-on-surface",
  buttonPrimary: `bg-[${THEME_COLORS.light.primary}] hover:bg-opacity-80 text-[${THEME_COLORS.light.onPrimary}]
                  font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out 
                  disabled:bg-[${THEME_COLORS.light.error}] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed`,
  buttonSecondary: `bg-gray-200 hover:bg-gray-300 text-gray-800
                    font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`,
  card: `bg-light-surface
         p-6 rounded-xl shadow-lg hover:shadow-2xl
         transition-all duration-300 ease-in-out cursor-pointer border border-gray-200`,
  title: "text-2xl font-bold mb-6 text-center text-light-on-background",
  textMuted: "text-sm text-gray-500",
  errorText: `text-sm text-[${THEME_COLORS.light.error}]`,
  infoText: `text-sm p-3 rounded-md border 
             bg-[${THEME_COLORS.light.toastInfoBg}] text-[${THEME_COLORS.light.toastInfoText}] border-blue-300`,
  resultBox: `p-4 rounded-lg border shadow-sm
              bg-light-surface
              border-gray-200`,
  resultText: `text-light-on-surface font-medium`,
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
