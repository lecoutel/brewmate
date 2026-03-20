
import { WaterQualityResult, Commune, ProfileEvaluation, WaterProfile, WaterCapabilities, BrewableStyleResult, StyleBrewabilityStatus, IonKey, IonRangeInfo } from '../types';
import { WATER_PROFILES, BJCP_STYLE_NAMES } from '../constants';
import { BJCP_STYLE_WATER_TARGETS } from '../data/bjcpStyleWaterProfiles';

/** Build a WaterProfile from WaterQualityResult.parameters (Hub'Eau or Open Food Facts). */
export function parametersToWaterProfile(parameters: WaterQualityResult['parameters']): WaterProfile {
  return {
    ca: parameters.calcium?.value ?? 0,
    mg: parameters.magnesium?.value ?? 0,
    hco3: parameters.bicarbonates?.value ?? 0,
    na: parameters.sodium?.value ?? 0,
    cl: parameters.chlorides?.value ?? 0,
    so4: parameters.sulfates?.value ?? 0,
  };
}

const HUBEAU_API_URL = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis';
const GEO_API_URL = 'https://geo.api.gouv.fr/communes';
const SISE_EAUX_API_URL = 'https://apidb.moneaudebrassage.fr/lastanalyses';

// SISE Codes
const PARAM_CODES = {
  PH: '1302',
  CALCIUM: '1374',
  MAGNESIUM: '1372',
  SODIUM: '1375',
  CHLORIDES: '1337',
  SULFATES: '1338',
  HYDROGENOCARBONATES: '1327',
  TAC: '1347',
};

export async function searchCommunes(query: string): Promise<Commune[]> {
  if (query.length < 2) return [];
  try {
    const response = await fetch(`${GEO_API_URL}?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux&format=json&limit=10`);
    if (!response.ok) throw new Error('Erreur lors de la recherche de commune');
    return await response.json();
  } catch (error) {
    console.error('Search communes error:', error);
    return [];
  }
}

export async function getCommuneByCoords(lat: number, lon: number): Promise<Commune | null> {
  try {
    const response = await fetch(`${GEO_API_URL}?lat=${lat}&lon=${lon}&fields=nom,code,codesPostaux&format=json`);
    if (!response.ok) throw new Error('Erreur lors de la géolocalisation de la commune');
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Geo commune error:', error);
    return null;
  }
}

export interface Network {
  code: string;
  name: string;
  quartier: string;
}

export async function fetchNetworks(codeCommune: string): Promise<Network[]> {
  try {
    const url = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi?code_commune=${codeCommune}`;
    const response = await fetch(url);
    if (!response.ok) {
      // En cas de 5xx, retourner [] pour permettre un chargement sans réseau (fallback SISE ou resultats_dis sans code_reseau)
      if (response.status >= 500 && response.status < 600) {
        console.warn('Hub\'Eau API communes_udi 5xx, poursuite sans réseau:', response.status);
        return [];
      }
      throw new Error('Erreur API Hub\'Eau communes_udi');
    }
    const data = await response.json();
    
    const networksMap = new Map<string, Network>();
    data.data.forEach((item: any) => {
      if (!networksMap.has(item.code_reseau)) {
        networksMap.set(item.code_reseau, {
          code: item.code_reseau,
          name: item.nom_reseau,
          quartier: item.nom_quartier
        });
      }
    });
    
    return Array.from(networksMap.values());
  } catch (error) {
    console.error('Fetch networks error:', error);
    return [];
  }
}

export function getBeerStyleRecommendations(stats: any): ProfileEvaluation[] {
  if (!stats) return [];

  const evaluations: ProfileEvaluation[] = [];

  const getStyleName = (code: string) => {
    const name = BJCP_STYLE_NAMES[code];
    return name ? `${code}. ${name}` : code;
  };

  for (const [id, profile] of Object.entries(WATER_PROFILES)) {
    if (!profile.target_ions) continue; // Skip specialty for now

    const target = profile.target_ions;
    let status: 'IDEAL' | 'AJUSTABLE' | 'ACIDE_REQUIS' | 'DECONSEILLE' = 'IDEAL';
    let label = '🟢 Idéal tel quel';
    let color = 'text-emerald-700 dark:text-emerald-400';
    let bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
    let borderColor = 'border-emerald-200 dark:border-emerald-800/50';

    const differences: string[] = [];

    if (stats.so4 > target.SO4 + 50) differences.push(`Trop de Sulfates (-${(stats.so4 - target.SO4).toFixed(0)} mg/L)`);
    if (stats.cl > target.Cl + 50) differences.push(`Trop de Chlorures (-${(stats.cl - target.Cl).toFixed(0)} mg/L)`);
    if (stats.na > target.Na + 50) differences.push(`Trop de Sodium (-${(stats.na - target.Na).toFixed(0)} mg/L)`);
    if (stats.mg > target.Mg + 30) differences.push(`Trop de Magnésium (-${(stats.mg - target.Mg).toFixed(0)} mg/L)`);

    if (differences.length > 0) {
        status = 'DECONSEILLE';
        label = '🔴 Déconseillé (Trop minéralisée, dilution requise)';
        color = 'text-red-700 dark:text-red-400';
        bgColor = 'bg-red-50 dark:bg-red-900/20';
        borderColor = 'border-red-200 dark:border-red-800/50';
    } else if (stats.hco3 > target.HCO3 + 20) {
        status = 'ACIDE_REQUIS';
        label = '🟠 Ajustement acide requis';
        color = 'text-orange-700 dark:text-orange-400';
        bgColor = 'bg-orange-50 dark:bg-orange-900/20';
        borderColor = 'border-orange-200 dark:border-orange-800/50';
        differences.push(`Trop de Bicarbonates (-${(stats.hco3 - target.HCO3).toFixed(0)} mg/L)`);
        
        if (stats.so4 < target.SO4 - 30) differences.push(`Manque de Sulfates (+${(target.SO4 - stats.so4).toFixed(0)} mg/L)`);
        if (stats.cl < target.Cl - 30) differences.push(`Manque de Chlorures (+${(target.Cl - stats.cl).toFixed(0)} mg/L)`);
        if (stats.ca < target.Ca - 30) differences.push(`Manque de Calcium (+${(target.Ca - stats.ca).toFixed(0)} mg/L)`);
    } else {
        if (stats.so4 < target.SO4 - 30) differences.push(`Manque de Sulfates (+${(target.SO4 - stats.so4).toFixed(0)} mg/L)`);
        if (stats.cl < target.Cl - 30) differences.push(`Manque de Chlorures (+${(target.Cl - stats.cl).toFixed(0)} mg/L)`);
        if (stats.ca < target.Ca - 30) differences.push(`Manque de Calcium (+${(target.Ca - stats.ca).toFixed(0)} mg/L)`);

        if (differences.length > 0) {
            status = 'AJUSTABLE';
            label = '🟡 Facilement ajustable (Ajout de sels)';
            color = 'text-yellow-700 dark:text-yellow-400';
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
            borderColor = 'border-yellow-200 dark:border-yellow-800/50';
        }
    }

    evaluations.push({
      id,
      name: profile.nom_display,
      description: profile.description,
      status,
      statusLabel: label,
      statusColor: color,
      statusBgColor: bgColor,
      statusBorderColor: borderColor,
      bjcpStyles: profile.bjcp_styles.map(getStyleName),
      differences
    });
  }

  // Sort by status: IDEAL > AJUSTABLE > ACIDE_REQUIS > DECONSEILLE
  const statusOrder = { 'IDEAL': 0, 'AJUSTABLE': 1, 'ACIDE_REQUIS': 2, 'DECONSEILLE': 3 };
  evaluations.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return evaluations;
}

async function fetchFromSiseEaux(inseeCode: string, codeReseau?: string, nomCommune?: string): Promise<WaterQualityResult | null> {
  try {
    const response = await fetch(`${SISE_EAUX_API_URL}/${inseeCode}`);
    if (!response.ok) return null;

    const data = await response.json();
    const quartiers: any[] = data.quartiers || [];
    if (!quartiers.length) return null;

    let quartier = quartiers[0];
    if (codeReseau) {
      const match = quartiers.find((q: any) => q.cdreseau === codeReseau);
      if (match) quartier = match;
    }

    if (!quartier.ca && !quartier.mg && !quartier.hco3) return null;

    const dates = ['date_ca', 'date_mg', 'date_na', 'date_cl', 'date_so4', 'date_hco3']
      .map((d: string) => quartier[d])
      .filter(Boolean)
      .map((d: string) => new Date(d).getTime());
    const lastDate = dates.length > 0
      ? new Date(Math.max(...dates)).toLocaleDateString('fr-FR')
      : '';

    return {
      lastAnalysisDate: lastDate,
      commune: nomCommune || inseeCode,
      dataSource: 'sise-eaux',
      parameters: {
        ph: { value: quartier.ph || 0, unit: 'unité pH', name: 'pH', symbol: 'pH' },
        calcium: { value: quartier.ca || 0, unit: 'mg/L', name: 'Calcium', symbol: 'Ca²⁺' },
        magnesium: { value: quartier.mg || 0, unit: 'mg/L', name: 'Magnésium', symbol: 'Mg²⁺' },
        sodium: { value: quartier.na || 0, unit: 'mg/L', name: 'Sodium', symbol: 'Na⁺' },
        chlorides: { value: quartier.cl || 0, unit: 'mg/L', name: 'Chlorures', symbol: 'Cl⁻' },
        sulfates: { value: quartier.so4 || 0, unit: 'mg/L', name: 'Sulfates', symbol: 'SO₄²⁻' },
        bicarbonates: { value: quartier.hco3 || 0, unit: 'mg/L', name: 'Bicarbonates', symbol: 'HCO₃⁻', source: 'HCO3' },
      },
    };
  } catch {
    return null;
  }
}

export async function fetchWaterQuality(codeCommune: string, codeReseau?: string, nomCommune?: string): Promise<WaterQualityResult> {
  try {
    // We fetch the latest results for the specified parameters
    const codes = Object.values(PARAM_CODES).join(',');
    // Hub'Eau API: sort=desc defaults to date_prelevement. orderby is not a valid parameter.
    let url = `${HUBEAU_API_URL}?code_commune=${codeCommune}&code_parametre=${codes}&size=500&sort=desc`;
    if (codeReseau) {
      url += `&code_reseau=${codeReseau}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      // En cas d'erreur 5xx (ex. 500), tenter le fallback SISE-Eaux avant d'échouer
      if (response.status >= 500 && response.status < 600) {
        console.warn('Hub\'Eau API 5xx, tentative fallback SISE-Eaux:', response.status);
        const siseResult = await fetchFromSiseEaux(codeCommune, codeReseau, nomCommune);
        if (siseResult) return siseResult;
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Hub\'Eau API Error:', response.status, errorData);
      const message = response.status >= 500
        ? `Service Hub'Eau temporairement indisponible (${response.status}). Réessayez dans quelques instants.`
        : `Erreur API Hub'Eau (${response.status}). Veuillez réessayer plus tard.`;
      throw new Error(message);
    }
    
    const data = await response.json();
    const results = data.data;

    if (!results || results.length === 0) {
      const siseResult = await fetchFromSiseEaux(codeCommune, codeReseau, nomCommune);
      if (siseResult) return siseResult;
      throw new Error('Aucune donnée de qualité d\'eau trouvée pour cette commune.');
    }

    // Organize results by parameter code, keeping only the most recent one for each
    const latestResults: Record<string, any> = {};
    results.forEach((res: any) => {
      const code = res.code_parametre;
      if (!latestResults[code] || new Date(res.date_prelevement) > new Date(latestResults[code].date_prelevement)) {
        latestResults[code] = res;
      }
    });

    const getParamValue = (code: string) => {
      const res = latestResults[code];
      return res ? { value: res.resultat_numerique, unit: res.libelle_unite, name: res.libelle_parametre } : null;
    };

    const calcium = getParamValue(PARAM_CODES.CALCIUM);
    const magnesium = getParamValue(PARAM_CODES.MAGNESIUM);
    const sodium = getParamValue(PARAM_CODES.SODIUM);
    const chlorides = getParamValue(PARAM_CODES.CHLORIDES);
    const sulfates = getParamValue(PARAM_CODES.SULFATES);
    const hco3 = getParamValue(PARAM_CODES.HYDROGENOCARBONATES);
    const tac = getParamValue(PARAM_CODES.TAC);
    const ph = getParamValue(PARAM_CODES.PH);

    // Check if essential parameters are missing — try SISE-Eaux fallback
    if (!calcium && !magnesium && !hco3 && !tac) {
      const siseResult = await fetchFromSiseEaux(codeCommune, codeReseau, nomCommune || results[0]?.nom_commune);
      if (siseResult) return siseResult;
      throw new Error(`Les analyses sanitaires récentes pour cette commune ne contiennent pas les paramètres minéraux nécessaires au brassage (Calcium, Magnésium, Bicarbonates).`);
    }

    // Find the overall latest analysis date
    const allDates = results.map((r: any) => new Date(r.date_prelevement).getTime());
    const lastAnalysisDate = new Date(Math.max(...allDates)).toLocaleDateString('fr-FR');

    // Bicarbonate logic
    let bicarbonateValue = 0;
    let bicarbonateSource: 'HCO3' | 'TAC' | 'NONE' = 'NONE';
    let bicarbonateUnit = 'mg/L';

    if (hco3) {
      bicarbonateValue = hco3.value;
      bicarbonateSource = 'HCO3';
      bicarbonateUnit = hco3.unit;
    } else if (tac) {
      // 1 °f TAC ≈ 12.2 mg/L HCO3
      bicarbonateValue = tac.value * 12.2;
      bicarbonateSource = 'TAC';
      bicarbonateUnit = 'mg/L (est. via TAC)';
    }

    return {
      lastAnalysisDate,
      commune: results[0].nom_commune,
      dataSource: 'hubeau',
      parameters: {
        ph: { value: ph?.value || 0, unit: ph?.unit || 'unité pH', name: 'Potentiel en hydrogène (pH)', symbol: 'pH' },
        calcium: { value: calcium?.value || 0, unit: calcium?.unit || 'mg/L', name: 'Calcium', symbol: 'Ca²⁺' },
        magnesium: { value: magnesium?.value || 0, unit: magnesium?.unit || 'mg/L', name: 'Magnésium', symbol: 'Mg²⁺' },
        sodium: { value: sodium?.value || 0, unit: sodium?.unit || 'mg/L', name: 'Sodium', symbol: 'Na⁺' },
        chlorides: { value: chlorides?.value || 0, unit: chlorides?.unit || 'mg/L', name: 'Chlorures', symbol: 'Cl⁻' },
        sulfates: { value: sulfates?.value || 0, unit: sulfates?.unit || 'mg/L', name: 'Sulfates', symbol: 'SO₄²⁻' },
        bicarbonates: { value: bicarbonateValue, unit: bicarbonateUnit, name: 'Bicarbonates', symbol: 'HCO₃⁻', source: bicarbonateSource },
      }
    };

  } catch (error: any) {
    console.error('Fetch water quality error:', error);
    return {
      lastAnalysisDate: '',
      commune: '',
      parameters: {} as any,
      error: error.message || 'Une erreur est survenue lors de la récupération des données.'
    };
  }
}

type WaterStats = { ca: number; mg: number; na: number; cl: number; so4: number; hco3: number };

function bjcpCodeSort(a: string, b: string): number {
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);
  if (numA !== numB) return numA - numB;
  return a.localeCompare(b);
}

const STATUS_ORDER: Record<StyleBrewabilityStatus, number> = {
  'IDEAL': 0,
  'AVEC_SELS': 1,
  'AVEC_ACIDE': 2,
  'AVEC_BICARBONATE': 3,
  'AVEC_SELS_ET_ACIDE': 4,
  'HORS_PORTEE': 5,
  'SPECIALITE': 6,
};

const ION_KEYS: IonKey[] = ['ca', 'mg', 'na', 'so4', 'cl', 'hco3'];
const ION_SYMBOLS: Record<IonKey, string> = {
  ca: 'Ca²⁺', mg: 'Mg²⁺', na: 'Na⁺', so4: 'SO₄²⁻', cl: 'Cl⁻', hco3: 'HCO₃⁻',
};

function niceAxisMax(rangeMax: number, current: number, adjusted: number): number {
  const raw = Math.max(rangeMax * 2.5, current * 1.2, adjusted * 1.2, 10);
  return Math.ceil(raw / 25) * 25;
}

function computeAdjusted(
  ion: IonKey,
  current: number,
  rangeMin: number,
  rangeMax: number,
  target: number,
  capabilities: WaterCapabilities,
): number {
  if (current >= rangeMin && current <= rangeMax) return current;
  switch (ion) {
    case 'ca':
    case 'so4':
    case 'cl':
      return (current < rangeMin && capabilities.canAddSalts) ? target : current;
    case 'hco3':
      if (current > rangeMax && capabilities.canAddAcid) return target;
      if (current < rangeMin && capabilities.canAddBicarbonate) return target;
      return current;
    default: // mg, na: not directly adjustable
      return current;
  }
}

export function getBrewableStyles(
  stats: WaterStats,
  capabilities: WaterCapabilities
): BrewableStyleResult[] {
  const results: BrewableStyleResult[] = [];

  for (const [code, entry] of Object.entries(BJCP_STYLE_WATER_TARGETS)) {
    const name = BJCP_STYLE_NAMES[code] ?? code;

    if (!entry.target) {
      results.push({
        bjcpCode: code,
        name,
        status: 'SPECIALITE',
        isAchievable: false,
        needsAcid: false,
        needsBicarbonate: false,
        needsSalts: false,
        isHorsPorteeAbsolute: false,
        actionRequise: entry.actionRequise,
        differences: [],
        brewersFriendSlug: entry.brewersFriendSlug,
      });
      continue;
    }

    const t = entry.target;
    const differences: string[] = [];

    // Excess minerals that cannot be removed without reverse osmosis
    // Thresholds use per-style margins from charlienewey data (or macro-profile defaults)
    const tooMuchSo4 = stats.so4 > t.so4 + t.so4_margin;
    const tooMuchCl  = stats.cl  > t.cl  + t.cl_margin;
    const tooMuchNa  = stats.na  > t.na  + t.na_margin;
    const tooMuchMg  = stats.mg  > t.mg  + t.mg_margin;
    const isHorsPorteeAbsolute = tooMuchSo4 || tooMuchCl || tooMuchNa || tooMuchMg;

    if (tooMuchSo4) differences.push(`Sulfates trop élevés (−${(stats.so4 - t.so4).toFixed(0)} mg/L, non réductible sans osmose)`);
    if (tooMuchCl)  differences.push(`Chlorures trop élevés (−${(stats.cl - t.cl).toFixed(0)} mg/L, non réductible sans osmose)`);
    if (tooMuchNa)  differences.push(`Sodium trop élevé (−${(stats.na - t.na).toFixed(0)} mg/L, non réductible sans osmose)`);
    if (tooMuchMg)  differences.push(`Magnésium trop élevé (−${(stats.mg - t.mg).toFixed(0)} mg/L, non réductible sans osmose)`);

    // Adjustment needs — per-style symmetric tolerance from charlienewey
    const needsAcid        = stats.hco3 > t.hco3 + t.hco3_margin;
    const needsBicarbonate = stats.hco3 < t.hco3 - t.hco3_margin;
    const needsSalts       = stats.so4 < t.so4 - t.so4_margin || stats.cl < t.cl - t.cl_margin || stats.ca < t.ca - t.ca_margin;

    if (needsAcid)        differences.push(`HCO₃⁻ trop élevé (+${(stats.hco3 - t.hco3).toFixed(0)} mg/L → traitement acide requis)`);
    if (needsBicarbonate) differences.push(`HCO₃⁻ trop bas (+${(t.hco3 - stats.hco3).toFixed(0)} mg/L → bicarbonate requis)`);
    if (!tooMuchSo4 && stats.so4 < t.so4 - t.so4_margin) differences.push(`Sulfates insuffisants (+${(t.so4 - stats.so4).toFixed(0)} mg/L)`);
    if (!tooMuchCl  && stats.cl  < t.cl  - t.cl_margin)  differences.push(`Chlorures insuffisants (+${(t.cl  - stats.cl).toFixed(0)} mg/L)`);
    if (stats.ca < t.ca - t.ca_margin)                    differences.push(`Calcium insuffisant (+${(t.ca - stats.ca).toFixed(0)} mg/L)`);

    // HORS_PORTEE uniquement pour les minéraux en excès absolus (non réductibles sans osmose)
    const isHorsPortee = isHorsPorteeAbsolute;

    let isAchievable: boolean;
    if (isHorsPortee) {
      isAchievable = false;
    } else {
      isAchievable =
        (!needsAcid        || capabilities.canAddAcid) &&
        (!needsBicarbonate || capabilities.canAddBicarbonate) &&
        (!needsSalts       || capabilities.canAddSalts);
    }

    let status: StyleBrewabilityStatus;
    if (isHorsPortee) {
      status = 'HORS_PORTEE';
    } else if (!needsAcid && !needsBicarbonate && !needsSalts) {
      status = 'IDEAL';
    } else if (needsSalts && needsAcid) {
      status = 'AVEC_SELS_ET_ACIDE';
    } else if (needsSalts && needsBicarbonate) {
      status = 'AVEC_SELS_ET_ACIDE';
    } else if (needsSalts) {
      status = 'AVEC_SELS';
    } else if (needsAcid) {
      status = 'AVEC_ACIDE';
    } else {
      status = 'AVEC_BICARBONATE';
    }

    const ionRanges: IonRangeInfo[] = ION_KEYS.map(ion => {
      const targetVal = t[ion as keyof typeof t] as number;
      const margin    = t[`${ion}_margin` as keyof typeof t] as number;
      const rangeMin  = targetVal - margin;
      const rangeMax  = targetVal + margin;
      const current   = stats[ion];
      const adjusted  = computeAdjusted(ion, current, rangeMin, rangeMax, targetVal, capabilities);
      const axisMax   = niceAxisMax(rangeMax, current, adjusted);
      return { ion, symbol: ION_SYMBOLS[ion], target: targetVal, rangeMin, rangeMax, current, adjusted, axisMax };
    });

    // Detect data source: D() uses fixed default margins (30/15/50/50/50/40)
    const isDefaultMargins =
      t.ca_margin === 30 && t.mg_margin === 15 && t.na_margin === 50 &&
      t.so4_margin === 50 && t.cl_margin === 50 && t.hco3_margin === 40;
    const rangeSource = isDefaultMargins ? 'palmer-kaminski' as const : 'charlienewey' as const;

    results.push({
      bjcpCode: code,
      name,
      status,
      isAchievable,
      needsAcid,
      needsBicarbonate,
      needsSalts,
      isHorsPorteeAbsolute,
      actionRequise: entry.actionRequise,
      differences,
      brewersFriendSlug: entry.brewersFriendSlug,
      ionRanges,
      rangeSource,
    });
  }

  results.sort((a, b) => {
    const orderDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (orderDiff !== 0) return orderDiff;
    return bjcpCodeSort(a.bjcpCode, b.bjcpCode);
  });

  return results;
}
