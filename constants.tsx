import React from 'react';
import {
  Calculator as CalculatorIcon,
  Scale as ScaleIcon,
  Eye as EyeIcon,
  Sparkles as SparklesIcon,
  Globe as GlobeAltIcon,
  Target as TargetIcon,
  Reload as RefreshIcon,
  ExternalLink as ArrowTopRightOnSquareIcon,
  InfoBox as InformationCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check as CheckCircleIcon,
  SquareAlert as ExclamationTriangleIcon,
  Settings2 as CogIcon,
  Cancel as XCircleIcon,
  PlusBox as PlusCircleIcon,
  TestTube as BeakerIcon,
  Gps as GeolocIcon,
  CloudSun as SunIcon,
  Moon as MoonIcon,
} from 'pixelarticons/react';
import { CalculatorRoute, CalculatorMeta, HomeSection } from './types';

export const APP_TITLE = 'WortLab';
export const SPLASH_DURATION = 2000;

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
  },
  dark: {
    primary: '#6b99ff',
    onPrimary: '#000000',
    primaryContainer: '#1e3a8a',
    onPrimaryContainer: '#E6EEFF',
    surface: '#1f2937',
    onSurface: '#f9fafb',
    background: '#111827',
    onBackground: '#f3f4f6',
    error: '#ff8c75',
    errorContainer: '#7f1d1d',
    onErrorContainer: '#FFE6E1',
  },
  calculator: {
    primary: '#9A7E00',
    onPrimary: '#3A2F00',
    primaryContainer: '#C9A800',
    onPrimaryContainer: '#3A2F00',
    surface: '#C9A800',
    onSurface: '#3A2F00',
    background: '#B99600',
    onBackground: '#3A2F00',
    error: '#8b2914',
    errorContainer: '#5c1a0a',
    onErrorContainer: '#3A2F00',
  },
};

export const COMMON_CLASSES = {
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 calculator:text-calc-text calculator:font-mac mb-1',
  input: 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 calculator:border-calc-border calculator:border-2 bg-white dark:bg-gray-700 calculator:bg-calc-bg text-gray-900 dark:text-gray-100 calculator:text-calc-text focus:ring-2 focus:ring-[#2563FF] calculator:focus:ring-calc-border focus:border-transparent outline-none transition-all calculator:rounded-none calculator:shadow-mac-inset calculator:font-mac',
  buttonPrimary: 'w-full py-3 px-4 bg-[#2563FF] hover:bg-[#1d4ed8] calculator:bg-calc-accent calculator:hover:bg-calc-highlight text-white calculator:text-calc-text font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed calculator:rounded-none calculator:shadow-mac calculator:hover:shadow-mac calculator:hover:translate-y-0 calculator:font-mac',
  buttonSecondary: 'w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 calculator:bg-calc-bg-card hover:bg-gray-300 dark:hover:bg-gray-600 calculator:hover:bg-calc-highlight text-gray-800 dark:text-gray-200 calculator:text-calc-text font-bold rounded-lg transition-all duration-200 calculator:rounded-none calculator:shadow-mac calculator:border-2 calculator:border-calc-border calculator:font-mac',
  card: 'bg-white dark:bg-gray-800 calculator:bg-calc-bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-600 calculator:border-calc-border calculator:border-2 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 calculator:rounded-none calculator:shadow-mac calculator:hover:shadow-mac-lg',
  textMuted: 'text-sm text-gray-500 dark:text-gray-300 calculator:text-calc-text-muted calculator:font-mac',
  errorText: 'text-sm text-red-600 dark:text-red-400 calculator:text-calc-error calculator:font-mac',
  infoText: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 calculator:bg-calc-bg-surface calculator:text-calc-text calculator:border calculator:border-calc-border calculator:rounded-none',
};

export const Icons = {
  ChevronRightIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TargetIcon,
  RefreshIcon,
  BeakerIcon,
  ScaleIcon,
  EyeIcon,
  SparklesIcon,
  GlobeAltIcon,
  CogIcon,
  XCircleIcon,
  PlusCircleIcon,
  CalculatorIcon,
  GeolocIcon,
  SunIcon,
  MoonIcon,
};

export const WortLabCircularLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <img src="/wortlab-logo-splashscreen.svg" alt="WortLab" className="w-24 h-24 sm:w-32 sm:h-32 mb-2 object-contain dark:hidden calculator:hidden" />
    <img src="/wortlab-logo-splashscreen-dark-mode.svg" alt="WortLab" className="w-24 h-24 sm:w-32 sm:h-32 mb-2 object-contain hidden dark:block calculator:hidden" />
    <img src="/wortlab-logo-splashscreen-calculator.svg" alt="WortLab" className="w-24 h-24 sm:w-32 sm:h-32 mb-2 object-contain hidden calculator:block" />
    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">WortLab</span>
  </div>
);

export const CALCULATORS: CalculatorMeta[] = [
  {
    id: 'ph-correction',
    name: 'Correction du pH',
    route: CalculatorRoute.PhCorrection,
    description: 'Calculez la dose d\'acide (lactique, phosphorique) ou de bicarbonate pour atteindre votre pH cible.',
    icon: BeakerIcon,
  },
  {
    id: 'pre-boil-density',
    name: 'Densité Pré-Ébullition',
    route: CalculatorRoute.PreBoilDensity,
    description: 'Diluez ou concentrez votre maische pour atteindre la densité cible avant l\'ébullition.',
    icon: ScaleIcon,
  },
  {
    id: 'post-boil-density',
    name: 'Densité Post-Ébullition',
    route: CalculatorRoute.PostBoilDensity,
    description: 'Corrigez la densité de votre moût en fin d\'ébullition par dilution ou ajout de sucre ou d\'extrait.',
    icon: ScaleIcon,
  },
  {
    id: 'abv-calculator',
    name: 'Calcul ABV',
    route: CalculatorRoute.AbvCalculator,
    description: 'Calculez l\'ABV de votre bière, que la mesure finale vienne d\'un densimètre ou d\'un réfractomètre.',
    icon: EyeIcon,
  },
  {
    id: 'kombucha-generator',
    name: 'Générateur Kombucha',
    route: CalculatorRoute.KombuchaGenerator,
    description: 'Générez une recette complète (thé, sucre, starter) adaptée à votre volume et profil aromatique.',
    icon: SparklesIcon,
  },
  {
    id: 'water-quality',
    name: 'Qualité de l\'eau',
    route: CalculatorRoute.WaterQuality,
    description: 'Analysez les minéraux de votre eau du robinet et identifiez les styles BJCP compatibles.',
    icon: GlobeAltIcon,
  },
];

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: 'understand-water',
    title: 'Comprendre mon eau',
    description: 'Consulter les minéraux de votre eau et les styles BJCP compatibles. Utile pour remplir votre profil dans Brewfather.',
    calculatorIds: ['water-quality'],
  },
  {
    id: 'adjust-ph',
    title: 'Ajuster le pH de la maische',
    description: 'Atteindre le pH cible à l\'empâtage ou en pré-ébullition (acide ou bicarbonate).',
    calculatorIds: ['ph-correction'],
  },
  {
    id: 'target-density',
    title: 'Atteindre ma densité cible',
    description: 'Corriger la densité avant ou après l\'ébullition (dilution, évaporation, sucre).',
    calculatorIds: ['pre-boil-density', 'post-boil-density'],
  },
  {
    id: 'measure-result',
    title: 'Mesurer le résultat (alcool)',
    description: 'Obtenir la densité finale corrigée et l\'ABV, avec densimètre ou réfractomètre.',
    calculatorIds: ['abv-calculator'],
  },
  {
    id: 'other-drinks',
    title: 'Autres boissons',
    description: 'Recettes et paramètres pour le kombucha.',
    calculatorIds: ['kombucha-generator'],
  },
];

export const KOMBUCHA_AROMATIC_PROFILE_OPTIONS = [
  { value: 'LIGHT_GENTLE', label: 'Léger et Doux' },
  { value: 'CLASSIC_BALANCED', label: 'Classique et Équilibré' },
  { value: 'INTENSE_VINEGARY', label: 'Intense et Vinaigré' },
];

export const KOMBUCHA_TEA_TYPE_OPTIONS = [
  { value: 'BLACK_TEA', label: 'Thé Noir' },
  { value: 'GREEN_TEA', label: 'Thé Vert' },
  { value: 'MIXED_TEA', label: 'Mélange Noir/Vert' },
];

export const KOMBUCHA_PROFILE_HELP = 'Pour commencer : Classique et Équilibré.';
export const KOMBUCHA_TEA_HELP = 'Thé noir : le plus simple pour le SCOBY. Thé vert : fermentation un peu plus rapide.';

export const KOMBUCHA_TASTE_SUMMARIES: Record<string, Record<string, string>> = {
  LIGHT_GENTLE: {
    BLACK_TEA: 'Délicat et accessible, notes maltées et fruitées subtiles, acidité douce.',
    GREEN_TEA: 'Finesse et légèreté, notes florales et végétales, idéal avec menthe ou gingembre.',
    MIXED_TEA: 'Équilibre doux, léger corps malté et touche florale, très polyvalent.',
  },
  CLASSIC_BALANCED: {
    BLACK_TEA: 'Le classique : robuste, saveurs pomme et cidre, corsé et désaltérant.',
    GREEN_TEA: 'Vif et herbacé, notes agrumes et pomme verte, finale sèche.',
    MIXED_TEA: 'Complexité maximale, corps et acidité franche, saveurs évolutives.',
  },
  INTENSE_VINEGARY: {
    BLACK_TEA: 'Puissant et audacieux, acidité acétique marquée, pour amateurs de sensations fortes.',
    GREEN_TEA: 'Sec et percutant, très acide, idéal pour shrubs ou vinaigrettes.',
    MIXED_TEA: 'Profil intense, punch vinaigré et large palette de saveurs.',
  },
};

export const DEFAULT_LOOS_WATER_PROFILE = {
  ca: 50,
  mg: 10,
  hco3: 150,
};

export const CORRECTION_STAGE_OPTIONS = [
  { value: 'MASH', label: 'Empâtage' },
  { value: 'PRE_BOIL', label: 'Pré-ébullition' },
];

export const BREWING_CHEMISTRY_FACTORS = {
  ACID_MALT_MEQ_PER_100G: 11,                              // Weyermann Sauermalz : min 1% acide lactique → 1000/90.08 = 11.1 mEq/100g
  LACTIC_ACID_80_MEQ_PER_ML: 10.6,                        // ρ=1.19 g/mL × 0.80 / 90.08 g/mol × 1000 = 10.57 mEq/mL
  PHOSPHORIC_ACID_75_MEQ_PER_ML: 11.5,                    // ρ=1.507 g/mL × 0.75 / 97.99 × 1000 = 11.53 mEq/mL (1 proton effectif à pH 5.2)
  SODIUM_BICARBONATE_MEQ_PER_GRAM: 11.9,                  // 1000 / 84.01 = 11.90 mEq/g
  PRE_BOIL_WORT_BUFFERING_ESTIMATE_MEQ_PER_L_PH: 12,      // Littérature (Briggs) : 10-20 mEq/L/pH pour wort OG typique
};

export interface WaterProfileTarget {
  nom_display: string;
  description: string;
  target_ions: {
    Ca: number;
    Mg: number;
    Na: number;
    SO4: number;
    Cl: number;
    HCO3: number;
  } | null;
  bjcp_styles: string[];
  action_requise?: 'prompt_user_for_color' | 'prompt_user_for_base_style';
}

export const WATER_PROFILES: Record<string, WaterProfileTarget> = {
  pilsner_boheme: {
    nom_display: "Eau extra-douce (Tchèque)",
    description: "Une eau presque déminéralisée pour une extraction du houblon Saaz sans aucune astringence.",
    target_ions: { Ca: 15, Mg: 5, Na: 5, SO4: 15, Cl: 15, HCO3: 15 },
    bjcp_styles: ["3A", "3B", "3C", "3D"]
  },
  gose_historique: {
    nom_display: "Profil salin (Gose)",
    description: "Une eau volontairement chargée en sodium pour l'effet salé caractéristique du style.",
    target_ions: { Ca: 75, Mg: 10, Na: 120, SO4: 50, Cl: 150, HCO3: 40 },
    bjcp_styles: ["23G"]
  },
  burton_ale: {
    nom_display: "Minérale extrême (Burton-on-Trent)",
    description: "Profil historique anglais, pousse l'amertume à l'extrême. Attention au côté crayeux.",
    target_ions: { Ca: 250, Mg: 20, Na: 30, SO4: 500, Cl: 40, HCO3: 200 },
    bjcp_styles: ["11C", "12C", "17A"]
  },
  blonde_houblonnee: {
    nom_display: "Blonde & Amère",
    description: "Amertume tranchante, profil sec. Parfait pour les IPA classiques, les Pale Ales et les Pilsners allemandes.",
    target_ions: { Ca: 100, Mg: 10, Na: 15, SO4: 250, Cl: 50, HCO3: 40 },
    bjcp_styles: [
      "1A", "1B", "2A", "5A", "5B", "5C", "5D", 
      "12A", "12B", "18B", "21A", "22A", 
      "22B", "25B", "25C", "26A", "26C"
    ]
  },
  blonde_maltee: {
    nom_display: "Blonde & Maltée",
    description: "Rondeur, douceur maltée. Parfait pour les Helles, Witbier, et bières de blé.",
    target_ions: { Ca: 60, Mg: 5, Na: 10, SO4: 50, Cl: 100, HCO3: 40 },
    bjcp_styles: [
      "1C", "1D", "4A", "4B", "4C", "10A", 
      "18A", "23A", "24A", "24B", "24C", "25A"
    ]
  },
  ambree_equilibree: {
    nom_display: "Ambrée & Équilibrée",
    description: "Soutient à la fois le malt caramel et une fine amertume. Pour les Bitters, Vienna et Amber Ales.",
    target_ions: { Ca: 75, Mg: 10, Na: 20, SO4: 150, Cl: 100, HCO3: 80 },
    bjcp_styles: [
      "2B", "6A", "6B", "6C", "7A", "7B", 
      "9A", "9B", "11A", "11B", "14A", "14B", 
      "14C", "15A", "19A", "19B", "22C", "22D", 
      "23B", "23C"
    ]
  },
  brune_maltee: {
    nom_display: "Brune & Ronde",
    description: "Gère l'acidité des malts torréfiés, favorise le corps. Idéal pour Porter, Sweet Stout, Dunkel.",
    target_ions: { Ca: 60, Mg: 10, Na: 30, SO4: 50, Cl: 100, HCO3: 150 },
    bjcp_styles: [
      "2C", "8A", "8B", "9C", "10B", "10C", 
      "13A", "13B", "13C", "16A", "16B", "16C", 
      "16D", "17B", "17C", "17D", "19C", "26B", "26D"
    ]
  },
  noire_houblonnee: {
    nom_display: "Noire & Sèche / Houblonnée",
    description: "Équilibre l'acidité des grains noirs tout en gardant une finale sèche et amère. American Stout, Irish Stout.",
    target_ions: { Ca: 100, Mg: 10, Na: 30, SO4: 150, Cl: 50, HCO3: 150 },
    bjcp_styles: [
      "15B", "15C", "20A", "20B", "20C"
    ]
  },
  hazy_neipa: {
    nom_display: "Trouble & Juteuse (NEIPA)",
    description: "Ratio Chlorure/Sulfate inversé pour une texture soyeuse et faire exploser le fruit du houblon sans amertume tranchante.",
    target_ions: { Ca: 100, Mg: 10, Na: 20, SO4: 75, Cl: 150, HCO3: 40 },
    bjcp_styles: [
      "21C"
    ]
  },
  sours_sauvages: {
    nom_display: "Acides & Sauvages",
    description: "Profil faible en sulfates pour éviter que l'amertume ne rentre en conflit avec l'acidité (clash amer/acide).",
    target_ions: { Ca: 50, Mg: 5, Na: 10, SO4: 25, Cl: 75, HCO3: 40 },
    bjcp_styles: [
      "23D", "23E", "23F", "28A", "28B", "28C", "28D"
    ]
  },
  ipa_specialty: {
    nom_display: "IPA de Spécialité (Dépend de la couleur)",
    description: "Le profil d'eau doit s'adapter à la couleur et à l'amertume de la sous-catégorie choisie (Black IPA = Noire, Red IPA = Ambrée...).",
    target_ions: null,
    bjcp_styles: [
      "21B"
    ],
    action_requise: "prompt_user_for_color"
  },
  specialty_base_requise: {
    nom_display: "Bière avec ajouts / Spécialité",
    description: "L'eau se choisit en fonction du style de bière de base (ex: une bière aux fruits sur base de Stout utilisera le profil Brune & Ronde).",
    target_ions: null,
    bjcp_styles: [
      "27A", "29A", "29B", "29C", "30A", "30B", 
      "30C", "30D", "31A", "31B", "32A", "32B", 
      "33A", "33B", "34A", "34B", "34C"
    ],
    action_requise: "prompt_user_for_base_style"
  }
};

export const BJCP_STYLE_NAMES: Record<string, string> = {
  "1A": "American Light Lager",
  "1B": "American Lager",
  "1C": "Cream Ale",
  "1D": "American Wheat Beer",
  "2A": "International Pale Lager",
  "2B": "International Amber Lager",
  "2C": "International Dark Lager",
  "3A": "Czech Pale Lager",
  "3B": "Czech Premium Pale Lager",
  "3C": "Czech Amber Lager",
  "3D": "Czech Dark Lager",
  "4A": "Munich Helles",
  "4B": "Festbier",
  "4C": "Helles Bock",
  "5A": "German Leichtbier",
  "5B": "Kölsch",
  "5C": "German Helles Exportbier",
  "5D": "German Pils",
  "6A": "Märzen",
  "6B": "Rauchbier",
  "6C": "Dunkles Bock",
  "7A": "Vienna Lager",
  "7B": "Altbier",
  "7C": "Kellerbier",
  "8A": "Munich Dunkel",
  "8B": "Schwarzbier",
  "9A": "Doppelbock",
  "9B": "Eisbock",
  "9C": "Baltic Porter",
  "10A": "Weissbier",
  "10B": "Dunkles Weissbier",
  "10C": "Weizenbock",
  "11A": "Ordinary Bitter",
  "11B": "Best Bitter",
  "11C": "Strong Bitter",
  "12A": "British Golden Ale",
  "12B": "Australian Sparkling Ale",
  "12C": "English IPA",
  "13A": "Dark Mild",
  "13B": "British Brown Ale",
  "13C": "English Porter",
  "14A": "Scottish Light",
  "14B": "Scottish Heavy",
  "14C": "Scottish Export",
  "15A": "Irish Red Ale",
  "15B": "Irish Stout",
  "15C": "Irish Extra Stout",
  "16A": "Sweet Stout",
  "16B": "Oatmeal Stout",
  "16C": "Tropical Stout",
  "16D": "Foreign Extra Stout",
  "17A": "British Strong Ale",
  "17B": "Old Ale",
  "17C": "Wee Heavy",
  "17D": "English Barleywine",
  "18A": "Blonde Ale",
  "18B": "American Pale Ale",
  "19A": "American Amber Ale",
  "19B": "California Common",
  "19C": "American Brown Ale",
  "20A": "American Stout",
  "20B": "Imperial Stout",
  "20C": "American Porter",
  "21A": "American IPA",
  "21B": "Specialty IPA",
  "21C": "Hazy IPA",
  "22A": "Double IPA",
  "22B": "American Strong Ale",
  "22C": "American Barleywine",
  "22D": "Wheatwine",
  "23A": "Berliner Weisse",
  "23B": "Flanders Red Ale",
  "23C": "Oud Bruin",
  "23D": "Lambic",
  "23E": "Gueuze",
  "23F": "Fruit Lambic",
  "23G": "Gose",
  "24A": "Witbier",
  "24B": "Belgian Pale Ale",
  "24C": "Bière de Garde",
  "25A": "Belgian Blond Ale",
  "25B": "Saison",
  "25C": "Belgian Golden Strong Ale",
  "26A": "Trappist Single",
  "26B": "Belgian Dubbel",
  "26C": "Belgian Tripel",
  "26D": "Belgian Dark Strong Ale",
  "27A": "Historical Beer",
  "28A": "Brett Beer",
  "28B": "Mixed-Fermentation Sour Beer",
  "28C": "Wild Specialty Beer",
  "28D": "Straight Sour Beer",
  "29A": "Fruit Beer",
  "29B": "Fruit and Spice Beer",
  "29C": "Specialty Fruit Beer",
  "30A": "Spice, Herb, or Vegetable Beer",
  "30B": "Autumn Seasonal Beer",
  "30C": "Winter Seasonal Beer",
  "30D": "Specialty Spice Beer",
  "31A": "Alternative Grain Beer",
  "31B": "Alternative Sugar Beer",
  "32A": "Classic Style Smoked Beer",
  "32B": "Specialty Smoked Beer",
  "33A": "Wood-Aged Beer",
  "33B": "Specialty Wood-Aged Beer",
  "34A": "Commercial Specialty Beer",
  "34B": "Mixed-Style Beer",
  "34C": "Experimental Beer"
};
