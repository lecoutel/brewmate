
export enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export enum CalculatorRoute {
  Home = '/',
  Splash = '/splash',
  PhCorrection = '/ph-correction',
  PreBoilDensity = '/pre-boil-density',
  PostBoilDensity = '/post-boil-density',
  Refractometer = '/refractometer',
  KombuchaGenerator = '/kombucha-generator', // New route
}

export interface CalculatorMeta {
  id: string;
  name: string;
  route: CalculatorRoute;
  description: string;
  icon: React.ElementType; // Heroicon component
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

export interface PreBoilDensityResult {
  waterToAdd?: number;
  waterToEvaporate?: number;
  message: string;
  error?: string;
}

export interface PostBoilDensityInputs {
  volumePostBoil: number;
  gravityUnit: GravityUnit;
  measuredGravity: number;
  targetGravity: number;
}

export interface PostBoilDensityResultOption {
  type: 'dilute' | 'evaporate' | 'addSugarCandy' | 'addSugarPowder';
  amount?: number;
  unit?: 'litres' | 'grammes';
  description: string;
  warning?: string;
}
export interface PostBoilDensityResult {
  options: PostBoilDensityResultOption[];
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
