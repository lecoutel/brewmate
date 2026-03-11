import { WaterQualityResult } from '../types';
import { searchLocalWaters, getLocalWaterProfile } from '../data/bottledWaterDatabase';

const OFF_API_BASE = 'https://world.openfoodfacts.org';
const OFF_SEARCH_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? '/api/openfoodfacts-search'
    : 'https://search.openfoodfacts.org';

export interface BottledWaterSearchHit {
  code: string;
  name: string;
  brand?: string;
}

/**
 * Search Open Food Facts for bottled waters sold in France.
 * Uses search-a-licious API. Category "waters" only; France filter applied server-side then client-side fallback.
 */
export async function searchBottledWaters(query: string): Promise<BottledWaterSearchHit[]> {
  if (!query.trim()) return [];
  const trimmed = query.trim();

  // 1) Base locale en priorité — résultat instantané, données fiables
  const localHits = searchLocalWaters(trimmed);
  if (localHits.length > 0) return localHits;

  // 2) Fallback Open Food Facts pour les eaux non référencées
  const encodeQ = (q: string) => encodeURIComponent(q);
  try {
    const fields = 'code,product_name,brands,countries_tags,completeness';
    const baseParams = `page_size=20&fields=${fields}&langs=fr,en`;

    // 1) Try with France filter (Lucene: categories + countries)
    const qWithFrance = `${trimmed} categories_tags:"en:waters" countries_tags:"en:france"`;
    let url = `${OFF_SEARCH_BASE}/search?q=${encodeQ(qWithFrance)}&${baseParams}`;
    let response = await fetch(url);
    let data: any = response.ok ? await response.json() : null;
    let hits: any[] = Array.isArray(data?.hits) ? data.hits : [];

    // 2) If no hits, retry without country filter and filter client-side (avoids CORS/strict filter issues)
    if (hits.length === 0) {
      const qWatersOnly = `${trimmed} categories_tags:"en:waters"`;
      url = `${OFF_SEARCH_BASE}/search?q=${encodeQ(qWatersOnly)}&page_size=30&fields=${fields}&langs=fr,en`;
      response = await fetch(url);
      data = response.ok ? await response.json() : null;
      const raw = Array.isArray(data?.hits) ? data.hits : [];
      const hasFrance = (tags: string[] | undefined) => Array.isArray(tags) && tags.some((t: string) => t === 'en:france' || String(t).includes('france'));
      hits = raw.filter((p: any) => hasFrance(p.countries_tags));
    }

    return hits
      .filter((p: any) => p.code && p.product_name)
      .sort((a: any, b: any) => (b.completeness ?? 0) - (a.completeness ?? 0))
      .map((p: any) => ({
        code: String(p.code),
        name: String(p.product_name),
        brand: Array.isArray(p.brands) ? p.brands.map((b: string) => b.trim()).filter(Boolean).join(', ') || undefined : (p.brands ? String(p.brands).trim() || undefined : undefined),
      }));
  } catch (error) {
    console.error('Open Food Facts search error:', error);
    return [];
  }
}

/**
 * Extract mg/L from OFF nutriments.
 * OFF uses per 100g (or 100ml): value can be in g (e.g. calcium_100g: 0.0468, calcium_unit: "g")
 * or in mg. For water: 100g ≈ 100ml, so mg/100g * 10 = mg/L; g/100g * 10000 = mg/L.
 */
function nutrimentToMgL(nutriments: any, keys: string[]): number {
  for (const key of keys) {
    if (key.endsWith('_serving')) continue;
    const v = nutriments?.[key];
    if (v == null || typeof v !== 'number' || isNaN(v)) continue;
    const unitKey = key.replace(/_100g$|_100ml$|_serving$/, '_unit');
    const unit = nutriments?.[unitKey];
    if (key.endsWith('_100g') || key.endsWith('_100ml')) {
      if (unit === 'g') return v * 10000;
      return v * 10;
    }
    if (unit === 'g') return v * 10000;
    return v;
  }
  return 0;
}

/** Parse minerals from French ingredient IDs e.g. fr:calcium-ca-80 → 80 */
function parseMineralsFromIngredients(ingredients: any[]): Record<string, number> {
  const out: Record<string, number> = {
    calcium: 0,
    magnesium: 0,
    sodium: 0,
    bicarbonates: 0,
    sulfates: 0,
    chlorides: 0,
  };
  if (!Array.isArray(ingredients)) return out;

  const patterns: { key: keyof typeof out; prefix: string }[] = [
    { key: 'calcium', prefix: 'fr:calcium-ca-' },
    { key: 'magnesium', prefix: 'fr:magnesium-mg-' },
    { key: 'sodium', prefix: 'fr:sodium-na-' },
    { key: 'bicarbonates', prefix: 'fr:bicarbonates-hco3-' },
    { key: 'sulfates', prefix: 'fr:sulfates-so4-' },
    { key: 'chlorides', prefix: 'fr:chlorures-cl-' },
  ];

  for (const ing of ingredients) {
    const id = (ing.id || ing.ingredient_id || '').toLowerCase();
    for (const { key, prefix } of patterns) {
      if (id.startsWith(prefix)) {
        const rest = id.slice(prefix.length).replace(/,/g, '.');
        const num = parseFloat(rest);
        if (!isNaN(num)) out[key] = num;
        break;
      }
    }
  }
  return out;
}

/**
 * Fetch a product by barcode and map it to WaterQualityResult (same shape as Hub'Eau).
 * Uses nutriments when available, otherwise parses French mineral ingredient IDs.
 */
export async function getBottledWaterProfile(code: string): Promise<WaterQualityResult | null> {
  // Déléguer à la base locale pour les codes préfixés 'local:'
  if (code.startsWith('local:')) {
    const slug = code.slice('local:'.length);
    return getLocalWaterProfile(slug);
  }

  try {
    const response = await fetch(`${OFF_API_BASE}/api/v0/product/${code}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;

    const product = data.product as any;
    const nutriments = product.nutriments || {};
    const ingredients = product.ingredients || [];

    let calcium = nutrimentToMgL(nutriments, ['calcium_100g', 'calcium_100ml', 'calcium']);
    let magnesium = nutrimentToMgL(nutriments, ['magnesium_100g', 'magnesium_100ml', 'magnesium']);
    let sodium = nutrimentToMgL(nutriments, ['sodium_100g', 'sodium_100ml', 'sodium']);
    let bicarbonates = nutrimentToMgL(nutriments, ['bicarbonates_100g', 'bicarbonate_100g', 'bicarbonates_100ml', 'bicarbonate_100ml', 'bicarbonates', 'bicarbonate']);
    let sulfates = nutrimentToMgL(nutriments, ['sulfates_100g', 'sulfate_100g', 'sulphate_100g', 'sulphates_100g', 'sulfates_100ml', 'sulfates']);
    let chlorides = nutrimentToMgL(nutriments, ['chlorides_100g', 'chloride_100g', 'chlorides_100ml', 'chlorides']);

    if (sodium === 0 && (nutriments.salt_100g != null || nutriments.sodium_100g != null)) {
      const salt = nutriments.salt_100g;
      if (salt != null && typeof salt === 'number') sodium = salt * 400; // NaCl → Na approx
      else sodium = nutrimentToMgL(nutriments, ['sodium_100g', 'sodium_100ml']) || 0;
    }

    const fromIngredients = parseMineralsFromIngredients(ingredients);
    if (fromIngredients.calcium > 0 || fromIngredients.magnesium > 0 || fromIngredients.bicarbonates > 0) {
      calcium = calcium || fromIngredients.calcium;
      magnesium = magnesium || fromIngredients.magnesium;
      sodium = sodium || fromIngredients.sodium;
      bicarbonates = bicarbonates || fromIngredients.bicarbonates;
      sulfates = sulfates || fromIngredients.sulfates;
      chlorides = chlorides || fromIngredients.chlorides;
    }

    const productName = product.product_name_fr || product.product_name || 'Eau en bouteille';
    const rawPh = product.ph != null ? Number(product.ph) : (nutriments.ph_100g ?? nutriments.ph);
    const phValue = rawPh != null && !isNaN(Number(rawPh)) && Number(rawPh) >= 5.0 && Number(rawPh) <= 9.5
      ? Number(rawPh)
      : null;
    const makeParam = (value: number, name: string, symbol: string) => ({
      value,
      unit: 'mg/L',
      name,
      symbol,
    });

    const mineralCompleteness = [calcium, magnesium, sodium, bicarbonates, sulfates, chlorides].filter(v => v > 0).length;

    return {
      lastAnalysisDate: '',
      commune: '',
      dataSource: 'openfoodfacts',
      productName: String(productName),
      productCode: code,
      mineralCompleteness,
      parameters: {
        ph: phValue != null ? { value: phValue, unit: 'unité pH', name: 'Potentiel en hydrogène (pH)', symbol: 'pH' } : undefined,
        calcium: makeParam(calcium, 'Calcium', 'Ca²⁺'),
        magnesium: makeParam(magnesium, 'Magnésium', 'Mg²⁺'),
        sodium: makeParam(sodium, 'Sodium', 'Na⁺'),
        chlorides: makeParam(chlorides, 'Chlorures', 'Cl⁻'),
        sulfates: makeParam(sulfates, 'Sulfates', 'SO₄²⁻'),
        bicarbonates: makeParam(bicarbonates, 'Bicarbonates', 'HCO₃⁻'),
      },
    };
  } catch (error) {
    console.error('Open Food Facts get product error:', error);
    return null;
  }
}
