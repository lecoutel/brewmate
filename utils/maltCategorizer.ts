
import { MALT_TYPE as MT, MaltCategory } from '../types';

// Re-export with the original name for external use
export const MALT_TYPE = MT;


/**
 * Catégories de malt pour le calcul du pH.
 * L'ordre des clés dans cet objet est important pour la logique de catégorisation.
 * On vérifie du plus spécifique (Roasted) au plus général (Base).
 */
export const MALT_CATEGORIES: Record<Exclude<MaltCategory, 'UNKNOWN' | 'SPECIALTY_ACIDIC' | 'SPECIALTY_OTHER'>, string[]> & 
                             Partial<Record<'SPECIALTY_ACIDIC' | 'SPECIALTY_OTHER', string[]>> = {
  ROASTED: [
    'roast', 'black', 'chocolate', 'chocolat', 'carafa', 'sinamar', 'de-husked', 
    'dehusked', 'midnight', 'stout', 'torréfié', 'patent'
  ],
  CRYSTAL: [
    'crystal', 'caramel', 'cara', 'dextrin'
    // Note: "Cara" est très large et doit être vérifié après "Carafa".
  ],
  SPECIALTY_ACIDIC: [ // Moved here to ensure it's checked before broader categories if included
    'acid', 'acidulated', 'sauermalz'
  ],
  SPECIALTY_OTHER: [
    'biscuit', 'victory', 'melanoidin', 'aromatic', 'brumalt', 'honey',
    'smoked', 'rauchmalz', 'special b', 'special w'
  ],
  BASE: [
    'pilsner', 'pilsen', 'pale', 'lager', 'vienna', 'munich', 'maris otter',
    'golden promise', 'wheat', 'blé', 'weizen', 'spelt', 'épeautre',
    'rye', 'seigle', 'oat', 'avoine', '2-row', '6-row'
  ],
};


/**
 * Catégorise un malt en fonction de son nom.
 * @param {string} maltName - Le nom du malt extrait du BeerXML.
 * @returns {MaltCategory} - La catégorie du malt (ex: MALT_TYPE.ROASTED).
 */
export function getMaltCategory(maltName: string | null | undefined): MaltCategory {
  if (!maltName || typeof maltName !== 'string') {
    return MALT_TYPE.UNKNOWN;
  }

  const lowerCaseName = maltName.toLowerCase();

  // Itère sur les catégories dans l'ordre défini dans MALT_CATEGORIES
  // Need to define a specific order for checking because object key order isn't guaranteed for all JS engines pre-ES2015
  const orderedCategories: MaltCategory[] = [
      MALT_TYPE.ROASTED, 
      MALT_TYPE.SPECIALTY_ACIDIC, // check specific acidic malts early
      MALT_TYPE.CRYSTAL, // "cara" in crystal could conflict if not ordered carefully
      MALT_TYPE.SPECIALTY_OTHER,
      MALT_TYPE.BASE
    ];


  for (const categoryKey of orderedCategories) {
    // Ensure the category exists in MALT_CATEGORIES before trying to access its keywords
    if (MALT_CATEGORIES.hasOwnProperty(categoryKey)) {
      const keywords = MALT_CATEGORIES[categoryKey as keyof typeof MALT_CATEGORIES];
      if (keywords && keywords.some(keyword => lowerCaseName.includes(keyword))) {
        return categoryKey as MaltCategory;
      }
    }
  }
  
  // Fallback for base malts if not caught by specific keywords above or if it's a generic grain
  // This broad check is risky if Specialty_Other or Crystal malts are not caught first.
  // The current MALT_CATEGORIES.BASE already has common base malt names.
  // For safety, if it reaches here and wasn't categorized, it is UNKNOWN unless specific logic added.

  return MALT_TYPE.UNKNOWN; // Si aucune correspondance n'est trouvée
}
