import { WaterQualityResult, WaterCitation } from '../types';
import { BottledWaterSearchHit } from '../services/openFoodFactsService';

/**
 * Base de données locale des eaux en bouteille populaires.
 * Synchronisée avec « Base de données eaux minérales pour brassage.rtf » (grandes marques nationales).
 * Données : sites officiels des marques, étiquettes, analyses officielles.
 * Les eaux minérales naturelles ont une composition réglementairement stable (Directive EU 2009/54/CE).
 * Chaque entrée cite la source officielle pour vérification.
 */

interface LocalWaterEntry {
  slug: string;        // identifiant unique (code = 'local:{slug}')
  name: string;        // nom affiché
  brand: string;
  aliases: string[];   // mots-clés de recherche (minuscules, sans accents, sans espaces)
  sourceNote?: string; // note sur la variabilité ou la nature de l'eau
  minerals: {
    ca: number;    // Calcium mg/L
    mg: number;    // Magnésium mg/L
    na: number;    // Sodium mg/L
    hco3: number;  // Bicarbonates mg/L
    so4: number;   // Sulfates mg/L
    cl: number;    // Chlorures mg/L
  };
  ph?: number;
  citation?: WaterCitation; // source officielle de la composition (lien vers site marque)
}

const LOCAL_WATERS: LocalWaterEntry[] = [
  {
    slug: 'mont-roucous',
    name: 'Mont Roucous',
    brand: 'Mont Roucous',
    aliases: ['mont roucous', 'montroucous', 'roucous'],
    minerals: { ca: 2.6, mg: 0.49, na: 3, hco3: 4.9, so4: 2.5, cl: 3.2 },
    ph: 7.0,
    citation: { url: 'https://www.mont-roucous.com/composition-mont-roucous', source: 'Site officiel Mont Roucous', verifiedDate: '2026-03' },
  },
  {
    slug: 'volvic',
    name: 'Volvic',
    brand: 'Volvic',
    aliases: ['volvic'],
    minerals: { ca: 13, mg: 9, na: 12, hco3: 80, so4: 9, cl: 16 },
    ph: 7.0,
    citation: { url: 'https://www.volvic.fr/nos-produits/eau-minerale-naturelle.html', source: 'Site officiel Volvic', verifiedDate: '2026-03' },
  },
  {
    slug: 'valvert',
    name: 'Valvert',
    brand: 'Valvert',
    aliases: ['valvert'],
    minerals: { ca: 67.6, mg: 2, na: 1.9, hco3: 204, so4: 18, cl: 4 },
    ph: 7.5,
    citation: { url: 'https://www.valvert.be/fr-be/eau-min%C3%A9rale-belge', source: 'Site officiel Valvert', verifiedDate: '2026-03' },
  },
  {
    slug: 'cristaline',
    name: 'Cristaline',
    brand: 'Cristaline',
    aliases: ['cristaline', 'cristalline'],
    sourceNote: 'Composition de la source Saint-Cyr. Cristaline embouteille depuis plusieurs sources ; la composition peut varier selon le point de vente.',
    minerals: { ca: 71.3, mg: 4.8, na: 7.6, hco3: 210, so4: 11, cl: 3.7 },
    ph: 7.4,
    citation: { url: 'https://www.moneaucristaline.fr/origine-et-sources/', source: 'Site officiel Cristaline', verifiedDate: '2026-03' },
  },
  {
    slug: 'evian',
    name: 'Évian',
    brand: 'Évian',
    aliases: ['evian', 'evians'],
    minerals: { ca: 80, mg: 26, na: 6.5, hco3: 360, so4: 15, cl: 10 },
    ph: 7.2,
    citation: { url: 'https://www.evian.com/fr/notre-eau/caracteristiques-de-leau-devian/', source: 'Site officiel Évian', verifiedDate: '2026-03' },
  },
  {
    slug: 'thonon',
    name: 'Thonon',
    brand: 'Thonon',
    aliases: ['thonon'],
    minerals: { ca: 92, mg: 16, na: 6, hco3: 340, so4: 12, cl: 14 },
    ph: 7.3,
    citation: { url: 'https://www.sources-alma.com/nos-marques/les-eaux-minerales/marque-thonon/', source: 'Site officiel Thonon', verifiedDate: '2026-03' },
  },
  {
    slug: 'saint-amand',
    name: 'Saint-Amand',
    brand: 'Saint-Amand',
    aliases: ['saint amand', 'saintamand', 'st amand', 'stamand'],
    minerals: { ca: 176, mg: 46, na: 28, hco3: 312, so4: 372, cl: 37 },
    ph: 7.2,
    citation: { url: 'https://www.sources-alma.com/nos-marques/les-eaux-minerales/saint-amand/', source: 'Site officiel Saint-Amand', verifiedDate: '2026-03' },
  },
  {
    slug: 'vittel',
    name: 'Vittel',
    brand: 'Vittel',
    aliases: ['vittel'],
    minerals: { ca: 203.8, mg: 43.1, na: 5, hco3: 399, so4: 328.9, cl: 8 },
    ph: 7.3,
    citation: { url: 'https://www.vittel.fr/source-de-vittel-mineralisation-de-son-eau', source: 'Site officiel Vittel', verifiedDate: '2026-03' },
  },
  {
    slug: 'contrex',
    name: 'Contrex',
    brand: 'Contrex',
    aliases: ['contrex', 'contrexeville'],
    minerals: { ca: 468, mg: 74.5, na: 9.1, hco3: 403, so4: 1187, cl: 10 },
    ph: 7.4,
    citation: { url: 'https://www.nestle.fr/nosmarques/eaux/contrex', source: 'Site officiel Contrex', verifiedDate: '2026-03' },
  },
  {
    slug: 'hepar',
    name: 'Hépar',
    brand: 'Hépar',
    aliases: ['hepar', 'hépar'],
    minerals: { ca: 549, mg: 119, na: 14, hco3: 384, so4: 1530, cl: 11 },
    ph: 7.2,
    citation: { url: 'https://www.nestle.fr/nosmarques/eaux/hepar', source: 'Site officiel Hépar', verifiedDate: '2026-03' },
  },
  {
    slug: 'courmayeur',
    name: 'Courmayeur',
    brand: 'Courmayeur',
    aliases: ['courmayeur'],
    minerals: { ca: 556, mg: 68, na: 0.6, hco3: 180, so4: 1423, cl: 0.4 },
    ph: 7.7,
    citation: { url: 'https://www.sources-alma.com/nos-marques/les-eaux-minerales/marque-courmayeur/', source: 'Site officiel Courmayeur', verifiedDate: '2026-03' },
  },
  {
    slug: 'perrier',
    name: 'Perrier',
    brand: 'Perrier',
    aliases: ['perrier'],
    sourceNote: 'Eau gazeuse naturelle.',
    minerals: { ca: 147, mg: 3, na: 9, hco3: 390, so4: 32, cl: 21 },
    ph: 5.5,
    citation: { url: 'https://www.perrier.com/fr/produits/detail/perrier', source: 'Site officiel Perrier', verifiedDate: '2026-03' },
  },
  {
    slug: 'badoit',
    name: 'Badoit',
    brand: 'Badoit',
    aliases: ['badoit'],
    sourceNote: 'Eau naturellement gazeuse.',
    minerals: { ca: 190, mg: 100, na: 160, hco3: 1300, so4: 43, cl: 40 },
    ph: 6.0,
    citation: { url: 'https://www.badoit.fr/notre-eau-minerale/badoit-composition.html', source: 'Site officiel Badoit', verifiedDate: '2026-03' },
  },
  {
    slug: 'salvetat',
    name: 'La Salvetat',
    brand: 'La Salvetat',
    aliases: ['salvetat', 'la salvetat'],
    sourceNote: 'Eau naturellement gazeuse.',
    minerals: { ca: 253, mg: 11, na: 7, hco3: 910, so4: 7, cl: 12 },
    ph: 5.9,
    citation: { url: 'https://www.lasalvetat.fr/eau-salvetat.html', source: 'Site officiel La Salvetat', verifiedDate: '2026-03' },
  },
  {
    slug: 'quezac',
    name: 'Quézac',
    brand: 'Quézac',
    aliases: ['quezac', 'quézac'],
    sourceNote: 'Eau naturellement gazeuse.',
    minerals: { ca: 241, mg: 95, na: 255, hco3: 1685, so4: 143, cl: 38 },
    ph: 6.5,
    citation: { url: 'https://www.quezac.com/', source: 'Site officiel Quézac', verifiedDate: '2026-03' },
  },
  {
    slug: 'san-pellegrino',
    name: 'San Pellegrino',
    brand: 'San Pellegrino',
    aliases: ['san pellegrino', 'sanpellegrino', 's.pellegrino', 'pellegrino'],
    sourceNote: 'Eau italienne naturellement gazeuse.',
    minerals: { ca: 174, mg: 57.4, na: 41.7, hco3: 222.6, so4: 471.4, cl: 51.7 },
    ph: 7.7,
    citation: { url: 'https://www.sanpellegrino.com/fr/eau', source: 'Site officiel San Pellegrino', verifiedDate: '2026-03' },
  },
  {
    slug: 'vichy-celestins',
    name: 'Vichy Célestins',
    brand: 'Vichy Célestins',
    aliases: ['vichy celestins', 'vichy célestins', 'vichy', 'celestins'],
    sourceNote: 'Eau naturellement gazeuse, très riche en sodium — déconseillée en brassage pur.',
    minerals: { ca: 109, mg: 10, na: 1172, hco3: 3218, so4: 44.5, cl: 252 },
    ph: 6.6,
    citation: { url: 'https://www.vichy-celestins.com/mineralite-prodigieuse/composition-3/', source: 'Site officiel Vichy Célestins', verifiedDate: '2026-03' },
  },
  {
    slug: 'vichy-saint-yorre',
    name: 'Vichy Saint-Yorre',
    brand: 'Vichy Saint-Yorre',
    aliases: ['saint yorre', 'saint-yorre', 'saintyorre', 'yorre'],
    sourceNote: 'Eau naturellement gazeuse, très riche en sodium — déconseillée en brassage pur.',
    minerals: { ca: 90, mg: 11, na: 1708, hco3: 4368, so4: 174, cl: 322 },
    ph: 6.5,
    citation: { url: 'https://www.st-yorre.com/st-yorre-et-mineralite/st-yorre-riche-mineraux/', source: 'Site officiel St-Yorre', verifiedDate: '2026-03' },
  },
];

/** Normalise une chaîne pour la comparaison (minuscule, sans accents, sans tirets) */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ')
    .trim();
}

/**
 * Recherche dans la base locale. Retourne les eaux dont le nom ou un alias contient la requête.
 * Les résultats sont triés par pertinence (correspondance exacte en premier).
 */
export function searchLocalWaters(query: string): BottledWaterSearchHit[] {
  const q = normalize(query);
  if (!q) return [];

  const scored = LOCAL_WATERS.flatMap((entry) => {
    const normalizedName = normalize(entry.name);
    const normalizedAliases = entry.aliases.map(normalize);

    if (normalizedName === q || normalizedAliases.includes(q)) {
      return [{ entry, score: 2 }];
    }
    if (normalizedName.includes(q) || normalizedAliases.some((a) => a.includes(q))) {
      return [{ entry, score: 1 }];
    }
    return [];
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map(({ entry }) => ({
    code: `local:${entry.slug}`,
    name: entry.name,
    brand: entry.brand,
  }));
}

/**
 * Retourne le profil complet d'une eau depuis la base locale.
 * @param slug - identifiant de l'eau (sans le préfixe 'local:')
 */
export function getLocalWaterProfile(slug: string): WaterQualityResult | null {
  const entry = LOCAL_WATERS.find((e) => e.slug === slug);
  if (!entry) return null;

  const makeParam = (value: number, name: string, symbol: string) => ({
    value,
    unit: 'mg/L',
    name,
    symbol,
  });

  return {
    lastAnalysisDate: '',
    commune: '',
    dataSource: 'local-db',
    productName: entry.name,
    productCode: `local:${entry.slug}`,
    sourceNote: entry.sourceNote,
    citation: entry.citation,
    mineralCompleteness: 6,
    parameters: {
      ph: entry.ph != null
        ? { value: entry.ph, unit: 'unité pH', name: 'Potentiel en hydrogène (pH)', symbol: 'pH' }
        : undefined,
      calcium: makeParam(entry.minerals.ca, 'Calcium', 'Ca²⁺'),
      magnesium: makeParam(entry.minerals.mg, 'Magnésium', 'Mg²⁺'),
      sodium: makeParam(entry.minerals.na, 'Sodium', 'Na⁺'),
      chlorides: makeParam(entry.minerals.cl, 'Chlorures', 'Cl⁻'),
      sulfates: makeParam(entry.minerals.so4, 'Sulfates', 'SO₄²⁻'),
      bicarbonates: makeParam(entry.minerals.hco3, 'Bicarbonates', 'HCO₃⁻'),
    },
  };
}
