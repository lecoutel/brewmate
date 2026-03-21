import { IonKey } from '../types';

// ── Types ──────────────────────────────────────────────────────────

export interface IonEducationEntry {
  symbol: string;
  name: string;
  definition: string;
  sensoryImpact: string;
  thresholds: {
    low?: { value: number; text: string };
    high?: { value: number; text: string };
  };
  ratioInfo?: string;
}

export interface StatEducationEntry {
  name: string;
  definition: string;
  significance: string;
  interpretation: { range: string; meaning: string }[];
}

// ── Ions ───────────────────────────────────────────────────────────

export const ION_EDUCATION: Record<IonKey, IonEducationEntry> = {
  ca: {
    symbol: 'Ca²⁺',
    name: 'Calcium',
    definition:
      "Le calcium est le principal minéral qui détermine la dureté de l'eau. Il provient de la dissolution du calcaire (CaCO₃) dans les sols.",
    sensoryImpact:
      "Favorise une bonne extraction des enzymes pendant l'empâtage, aide à la clarification de la bière et renforce la perception de corps et de rondeur en bouche.",
    thresholds: {
      low:  { value: 40,  text: "Extraction enzymatique moins efficace, fermentation plus lente et bière manquant de corps." },
      high: { value: 200, text: "Goût minéral prononcé, astringence possible et risque de dépôts calcaires dans l'équipement." },
    },
  },
  mg: {
    symbol: 'Mg²⁺',
    name: 'Magnésium',
    definition:
      "Le magnésium contribue aussi à la dureté de l'eau, mais en proportion moindre que le calcium. C'est un nutriment important pour les levures.",
    sensoryImpact:
      "À faible dose, il nourrit les levures et favorise une fermentation saine. À forte dose, il apporte de l'astringence et une amertume désagréable.",
    thresholds: {
      low:  { value: 5,   text: "Carence possible pour les levures, fermentation ralentie." },
      high: { value: 40,  text: "Astringence désagréable, amertume dure et effet laxatif possible à très haute dose." },
    },
  },
  na: {
    symbol: 'Na⁺',
    name: 'Sodium',
    definition:
      "Le sodium provient souvent du sel (NaCl) ou du bicarbonate de soude (NaHCO₃). On le trouve naturellement dans certaines eaux souterraines.",
    sensoryImpact:
      "En petite quantité, il arrondit le profil gustatif et renforce la perception de douceur maltée. En excès, il donne un goût franchement salé.",
    thresholds: {
      low:  { value: 0,   text: "Aucun effet négatif — le sodium n'est pas indispensable au brassage." },
      high: { value: 150, text: "Goût salé marqué, désagréable surtout dans les styles légers." },
    },
    ratioInfo:
      "Le sodium est souvent lié au chlorure (NaCl) ou aux bicarbonates (NaHCO₃). Vérifiez ces ions conjointement.",
  },
  cl: {
    symbol: 'Cl⁻',
    name: 'Chlorure',
    definition:
      "Le chlorure est un anion qui provient généralement du sel (NaCl) ou du chlorure de calcium (CaCl₂). À ne pas confondre avec le chlore (Cl₂), un désinfectant.",
    sensoryImpact:
      "Accentue la rondeur, le moelleux et la douceur maltée de la bière. C'est le contrepoids du sulfate dans l'équilibre gustatif.",
    thresholds: {
      low:  { value: 10,  text: "Bière manquant de corps et de rondeur maltée." },
      high: { value: 250, text: "Perception de douceur excessive, bière sans caractère et risque de corrosion de l'inox." },
    },
    ratioInfo:
      "Le ratio SO₄²⁻/Cl⁻ est clé : < 1 favorise un profil malteux et rond, > 1 un profil sec et amer.",
  },
  so4: {
    symbol: 'SO₄²⁻',
    name: 'Sulfate',
    definition:
      "Le sulfate est un anion courant, souvent ajouté sous forme de gypse (CaSO₄). L'eau de Burton-on-Trent, célèbre pour ses Pale Ales, en est très riche.",
    sensoryImpact:
      "Accentue la sécheresse, la netteté de l'amertume du houblon et la perception d'une finale croustillante. C'est l'allié des bières houblonnées.",
    thresholds: {
      low:  { value: 30,  text: "Amertume du houblon perçue comme molle et peu définie." },
      high: { value: 400, text: "Amertume âpre et astringente, arrière-goût de plâtre ou de soufre." },
    },
    ratioInfo:
      "Le ratio SO₄²⁻/Cl⁻ est clé : > 2 donne un profil très sec (style Burton IPA), < 0.5 un profil très malteux (style Munich).",
  },
  hco3: {
    symbol: 'HCO₃⁻',
    name: 'Bicarbonate',
    definition:
      "Le bicarbonate est la principale source d'alcalinité de l'eau. Il agit comme un tampon qui résiste aux changements de pH pendant l'empâtage.",
    sensoryImpact:
      "Augmente le pH de la maische, ce qui atténue l'amertume du houblon et favorise une finale plus douce, mais risque une extraction de tanins si le pH est trop haut.",
    thresholds: {
      low:  { value: 0,   text: "Facilite l'obtention d'un pH d'empâtage bas — idéal pour les bières claires et houblonnées." },
      high: { value: 250, text: "pH d'empâtage trop élevé, extraction de tanins, amertume rêche et saveurs de carton." },
    },
    ratioInfo:
      "Les bicarbonates sont liés à l'alcalinité résiduelle (RA). Une RA élevée convient aux bières foncées (les malts torréfiés apportent leur propre acidité).",
  },
};

// ── Statistiques ───────────────────────────────────────────────────

export const STAT_EDUCATION: Record<string, StatEducationEntry> = {
  ratio: {
    name: 'Ratio SO₄²⁻/Cl⁻',
    definition:
      "C'est le rapport entre les sulfates et les chlorures. Il détermine l'équilibre fondamental entre amertume et rondeur dans la bière.",
    significance:
      "C'est probablement le paramètre le plus important pour le profil gustatif de votre bière. Il oriente l'ensemble du caractère : sec et amer, ou rond et malteux.",
    interpretation: [
      { range: '< 0.5',    meaning: 'Profil très malteux et rond — idéal pour les Stouts, Scotch Ales.' },
      { range: '0.5 – 1',  meaning: 'Équilibré avec une légère rondeur — Amber Ales, Märzen.' },
      { range: '1 – 2',    meaning: 'Équilibré à sec — Pale Ale, Pilsner.' },
      { range: '> 2',      meaning: 'Profil sec et amer — IPA, Burton Pale Ale.' },
    ],
  },
  durete: {
    name: 'Dureté',
    definition:
      "La dureté mesure la concentration en calcium et magnésium dans l'eau, exprimée en ppm de CaCO₃. Formule : (Ca × 2.5) + (Mg × 4.12).",
    significance:
      "Une eau dure fournit plus de minéraux pour les réactions enzymatiques et la santé des levures. Une eau douce est préférée pour les styles délicats comme les Pilsners.",
    interpretation: [
      { range: '0 – 60',     meaning: 'Eau douce — Pilsner, Helles, Kölsch.' },
      { range: '60 – 120',   meaning: 'Eau moyennement dure — convient à la plupart des styles.' },
      { range: '120 – 250',  meaning: 'Eau dure — Pale Ales, IPA, Bitters anglaises.' },
      { range: '> 250',      meaning: 'Eau très dure — à diluer ou traiter pour la plupart des styles.' },
    ],
  },
  alcalinite: {
    name: 'Alcalinité',
    definition:
      "L'alcalinité mesure le pouvoir tampon de l'eau, c'est-à-dire sa capacité à résister aux changements de pH. Elle dépend principalement des bicarbonates.",
    significance:
      "Plus l'alcalinité est élevée, plus il sera difficile d'abaisser le pH de l'empâtage. C'est un frein pour les bières claires, un atout pour les bières foncées.",
    interpretation: [
      { range: '0 – 50',     meaning: 'Alcalinité faible — facile d\'ajuster le pH, idéal pour les bières claires.' },
      { range: '50 – 150',   meaning: 'Alcalinité modérée — convient à la plupart des styles ambrés et foncés.' },
      { range: '> 150',      meaning: 'Alcalinité élevée — nécessite un traitement (acide, dilution) pour les bières claires.' },
    ],
  },
  alcaliniteResiduelle: {
    name: 'Alcalinité résiduelle (RA)',
    definition:
      "L'alcalinité résiduelle est l'alcalinité restante après que le calcium et le magnésium ont précipité une partie des bicarbonates. Formule de Kolbach.",
    significance:
      "C'est l'indicateur le plus fiable pour prédire le pH de l'empâtage. Il tient compte de l'effet tampon du calcium et du magnésium qui contrebalancent les bicarbonates.",
    interpretation: [
      { range: '< 0',       meaning: 'RA négative — eau idéale pour les bières très claires (Pilsner, Helles).' },
      { range: '0 – 50',    meaning: 'RA faible — convient aux Pale Ales, blondes, blances.' },
      { range: '50 – 120',  meaning: 'RA modérée — ambrées, bières de garde, brunes.' },
      { range: '> 120',     meaning: 'RA élevée — Stouts, Porters, bières très foncées.' },
    ],
  },
  equilibreIonique: {
    name: 'Équilibre ionique',
    definition:
      "L'équilibre ionique compare la somme des charges positives (cations : Ca²⁺, Mg²⁺, Na⁺) à la somme des charges négatives (anions : Cl⁻, SO₄²⁻, HCO₃⁻), exprimées en milliéquivalents par litre (mEq/L).",
    significance:
      "Dans une eau correctement analysée, cations et anions doivent s'équilibrer (loi de l'électroneutralité). Un déséquilibre important signale des données incomplètes ou imprécises — certains ions manquent peut-être à l'analyse.",
    interpretation: [
      { range: '0 – 5',   meaning: 'Excellent — les données minérales sont fiables et complètes.' },
      { range: '5 – 10',  meaning: 'Acceptable — légère imprécision, exploitable pour le brassage.' },
      { range: '10 – 20', meaning: 'Médiocre — il manque probablement un ou plusieurs ions dans l\'analyse.' },
      { range: '> 20',    meaning: 'Mauvais — données incomplètes, les recommandations de styles seront peu fiables.' },
    ],
  },
};

// ── Interprétation dynamique ───────────────────────────────────────

export function interpretIonValue(ionKey: IonKey, value: number): { text: string; status: 'ok' | 'low' | 'high' } {
  const entry = ION_EDUCATION[ionKey];
  const low = entry.thresholds.low;
  const high = entry.thresholds.high;

  if (low && low.value > 0 && value < low.value) {
    return { text: `${value.toFixed(0)} ppm — en dessous du seuil de ${low.value} ppm. ${low.text}`, status: 'low' };
  }
  if (high && value > high.value) {
    return { text: `${value.toFixed(0)} ppm — au-dessus du seuil de ${high.value} ppm. ${high.text}`, status: 'high' };
  }

  const lowBound = low && low.value > 0 ? low.value : 0;
  const highBound = high ? high.value : Infinity;
  if (highBound === Infinity) {
    return { text: `${value.toFixed(0)} ppm — dans une plage normale pour le brassage.`, status: 'ok' };
  }
  return { text: `${value.toFixed(0)} ppm — dans la plage idéale (${lowBound}–${highBound} ppm) pour le brassage.`, status: 'ok' };
}

export function interpretStatValue(statKey: string, value: number): { text: string; matchedRange: number } {
  const entry = STAT_EDUCATION[statKey];
  if (!entry) return { text: '', matchedRange: -1 };

  // Find which interpretation range the value falls into
  const ranges = entry.interpretation;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i].range;
    // Parse range patterns: "< X", "X – Y", "> X"
    const ltMatch = r.match(/^<\s*([-\d.]+)/);
    const gtMatch = r.match(/^>\s*([-\d.]+)/);
    const rangeMatch = r.match(/^([-\d.]+)\s*[–-]\s*([-\d.]+)/);

    if (ltMatch && value < parseFloat(ltMatch[1])) {
      return { text: ranges[i].meaning, matchedRange: i };
    }
    if (rangeMatch && value >= parseFloat(rangeMatch[1]) && value <= parseFloat(rangeMatch[2])) {
      return { text: ranges[i].meaning, matchedRange: i };
    }
    if (gtMatch && value > parseFloat(gtMatch[1])) {
      return { text: ranges[i].meaning, matchedRange: i };
    }
  }
  // Fallback: match last range
  return { text: ranges[ranges.length - 1].meaning, matchedRange: ranges.length - 1 };
}
