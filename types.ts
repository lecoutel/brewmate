
import React from 'react';

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Calculator = 'calculator',
  System = 'system',
}

export enum CalculatorRoute {
  Home = '/',
  Splash = '/splash',
  PhCorrection = '/ph-correction',
  PreBoilDensity = '/pre-boil-density',
  PostBoilDensity = '/post-boil-density',
  AbvCalculator = '/abv-calculator',
  RefractometerLegacy = '/refractometer',
  KombuchaGenerator = '/kombucha-generator',
  WaterQuality = '/water-quality',
  Feedback = '/feedback',
  Don = '/don',
}

export interface CalculatorMeta {
  id: string;
  name: string;
  route: CalculatorRoute;
  description: string;
  icon: React.ElementType; // Heroicon component
}

export interface HomeSection {
  id: string;
  title: string;
  description: string;
  calculatorIds: string[];
}

// --- Water Quality Types ---
export interface WaterParameter {
  value: number;
  unit: string;
  name: string;
  symbol: string;
  source?: 'HCO3' | 'TAC' | 'NONE';
}

export interface ProfileEvaluation {
  id: string;
  name: string;
  description: string;
  status: 'IDEAL' | 'AJUSTABLE' | 'ACIDE_REQUIS' | 'DECONSEILLE';
  statusLabel: string;
  statusColor: string;
  statusBgColor: string;
  statusBorderColor: string;
  bjcpStyles: string[];
  differences: string[];
}

// --- BJCP Water Brewing Compatibility ---
export interface WaterCapabilities {
  canAddAcid: boolean;         // acide lactique ou phosphorique (baisse HCO3)
  canAddBicarbonate: boolean;  // bicarbonate de sodium (monte HCO3)
  canAddSalts: boolean;        // sulfates, CaCl2... (peut ajouter, jamais retirer)
}

export type StyleBrewabilityStatus =
  | 'IDEAL'
  | 'AVEC_SELS'
  | 'AVEC_ACIDE'
  | 'AVEC_BICARBONATE'
  | 'AVEC_SELS_ET_ACIDE'
  | 'HORS_PORTEE'
  | 'SPECIALITE';

export interface BrewableStyleResult {
  bjcpCode: string;
  name: string;
  status: StyleBrewabilityStatus;
  isAchievable: boolean;
  needsAcid: boolean;
  needsBicarbonate: boolean;
  needsSalts: boolean;
  isHorsPorteeAbsolute: boolean;
  actionRequise?: 'prompt_user_for_color' | 'prompt_user_for_base_style';
  differences: string[];
  /** Brewer's Friend URL slug for recipe lookup */
  brewersFriendSlug?: string;
  /** Per-ion range data for visual bars. Absent for SPECIALITE styles. */
  ionRanges?: IonRangeInfo[];
  /** Source of the water profile ranges. */
  rangeSource?: 'charlienewey' | 'palmer-kaminski';
}

export type IonKey = 'ca' | 'mg' | 'na' | 'so4' | 'cl' | 'hco3';

export interface IonRangeInfo {
  ion: IonKey;
  symbol: string;    // e.g. "Ca²⁺", "SO₄²⁻"
  target: number;    // midpoint of acceptable range
  rangeMin: number;  // target - margin (raw value, may be slightly negative)
  rangeMax: number;  // target + margin
  current: number;   // current water value
  adjusted: number;  // projected value after optimal adjustment given capabilities
  axisMax: number;   // display axis maximum for bar scaling
}

export interface WaterCitation {
  url: string;            // lien cliquable vers la source officielle
  source: string;         // ex: "Site officiel Évian"
  verifiedDate?: string;  // ex: "2026-03" pour traçabilité
}

export interface WaterQualityResult {
  lastAnalysisDate: string;
  parameters: {
    ph?: WaterParameter;
    calcium: WaterParameter;
    magnesium: WaterParameter;
    sodium: WaterParameter;
    chlorides: WaterParameter;
    sulfates: WaterParameter;
    bicarbonates: WaterParameter;
  };
  commune: string;
  dataSource?: 'hubeau' | 'sise-eaux' | 'openfoodfacts' | 'local-db';
  productName?: string;
  productCode?: string;
  mineralCompleteness?: number; // 0-6 : nombre d'ions (Ca, Mg, Na, HCO3, SO4, Cl) avec valeur > 0
  sourceNote?: string; // note contextuelle (ex: variabilité de source pour Cristaline)
  citation?: WaterCitation; // source officielle de la composition minérale
  error?: string;
}

export interface Commune {
  nom: string;
  code: string;
  codesPostaux: string[];
}

// --- pH Calculator Types (New Unified with Stages) ---
export enum CorrectionStage {
  MASH = 'MASH',
  PRE_BOIL = 'PRE_BOIL',
}

export const MALT_TYPE = {
  ROASTED: 'ROASTED',
  CRYSTAL: 'CRYSTAL',
  SPECIALTY_ACIDIC: 'SPECIALTY_ACIDIC',
  SPECIALTY_OTHER: 'SPECIALTY_OTHER',
  BASE: 'BASE',
  UNKNOWN: 'UNKNOWN',
} as const;

export type MaltCategory = keyof typeof MALT_TYPE;

export interface MaltComposition {
  [MALT_TYPE.BASE]: number;
  [MALT_TYPE.CRYSTAL]: number;
  [MALT_TYPE.ROASTED]: number;
  [MALT_TYPE.SPECIALTY_ACIDIC]?: number; // Now explicitly tracked
  [MALT_TYPE.SPECIALTY_OTHER]?: number;
  [MALT_TYPE.UNKNOWN]?: number;
}

export interface WaterProfile {
  ca: number; // Calcium in mg/L
  mg: number; // Magnesium in mg/L
  hco3: number; // Bicarbonates in mg/L
  na?: number; // Sodium in mg/L
  cl?: number; // Chlorides in mg/L
  so4?: number; // Sulfates in mg/L
}

export interface PhCalculationInputs {
  stage: CorrectionStage;
  measurements: {
    currentPh: number;
    targetPh: number;
    volume: number; // Mash volume for MASH, Pre-boil volume for PRE_BOIL
  };
  beerXmlString?: string; // Optional for PRE_BOIL, but needed for MASH malt analysis
  waterProfile?: WaterProfile; // Required for MASH high-precision calculation
}

export type CorrectionType = 'ACIDIFY' | 'ALCALINIZE' | 'NONE';

export interface PhCalculationResult {
  correctionType: CorrectionType;
  lacticAcidMl: number;
  phosphoricAcidMl: number;
  bicarbonateGrams: number;
  message: string;
  details?: { // Primarily for MASH stage
    residualAlkalinity?: number;
    totalMashBuffering?: number;
    initialMEqNeeded?: number; // mEq based on pH delta and totalMashBuffering BEFORE acid malt
    mEqFromAcidMalt?: number; // mEq contributed by acid malt
    netMEqNeededForAcidification?: number; // initialMEqNeeded - mEqFromAcidMalt (if positive)
    mEqToAlkalinize?: number; // |initialMEqNeeded| + mEqFromAcidMalt (if initialMEqNeeded is negative)
    maltComposition?: MaltComposition;
    autoDetectedMashVolumeL?: number;
    autoDetectedPreBoilVolumeL?: number;
  };
  error?: string; // For fatal calculation errors
}


// --- Density Calculator Types ---
export enum GravityUnit {
  Brix = "°Brix",
  DI = "Densité spécifique",
  Plato = "°Plato",
}

export interface PreBoilDensityInputs {
  volumePreBoil: number;
  gravityUnit: GravityUnit;
  measuredGravity: number;
  targetGravity: number;
}

export interface DensityCorrectionOption {
  type: 'dilute' | 'evaporate' | 'addSugarCandy' | 'addSugarPowder';
  amount?: number;
  unit?: 'litres' | 'grammes';
  description: string;
  warning?: string;
}

export interface PreBoilDensityResult {
  options: DensityCorrectionOption[];
  message: string;
  error?: string;
}

export interface PostBoilDensityInputs {
  volumePostBoil: number;
  gravityUnit: GravityUnit;
  measuredGravity: number;
  targetGravity: number;
}

export interface PostBoilDensityResult {
  options: DensityCorrectionOption[];
  message: string;
  error?: string;
}


export interface RefractometerInputs {
  gravityUnit: GravityUnit;
  initialDensity: number; // OG
  finalMeasuredDensity: number; // FG from refractometer
}

export interface RefractometerResult {
  correctedFinalGravity: number;
  abv: number;
  message: string;
  error?: string;
}

// --- Kombucha Generator Types ---
export type AromaticProfileKey = 'LIGHT_GENTLE' | 'CLASSIC_BALANCED' | 'INTENSE_VINEGARY';
export type TeaTypeKey = 'BLACK_TEA' | 'GREEN_TEA' | 'MIXED_TEA';

export interface KombuchaRecipeInputs {
  desiredVolumeL: number;
  aromaticProfileKey: AromaticProfileKey;
  teaTypeKey: TeaTypeKey;
}

export interface KombuchaIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface KombuchaInstructionStep {
  step: number;
  text: string;
}

export interface KombuchaRecipeResult {
  title: string;
  expectedTasteProfile: string;
  ingredients: KombuchaIngredient[];
  instructions: KombuchaInstructionStep[];
  error?: string;
}

export interface KombuchaProfile {
  tea_per_liter: number;
  sugar_per_liter: number;
  descriptions: Record<TeaTypeKey, string>;
}

export interface KombuchaProfileData {
  LIGHT_GENTLE: KombuchaProfile;
  CLASSIC_BALANCED: KombuchaProfile;
  INTENSE_VINEGARY: KombuchaProfile;
}

export interface InfusionTimesData {
  BLACK_TEA: number;
  GREEN_TEA: number;
  MIXED_TEA: number;
}
