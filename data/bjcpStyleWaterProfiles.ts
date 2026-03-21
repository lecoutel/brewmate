
import { BJCP_STYLE_NAMES } from '../constants';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface BjcpStyleTarget {
  ca:   number;  mg:   number;  na:   number;
  so4:  number;  cl:   number;  hco3: number;
  // Per-ion tolerance margins — source: charlienewey/brewing-salt-calculator (MIT)
  // Acceptable range for each ion = [target - margin, target + margin]
  // For styles not covered by charlienewey, defaults: SO4±50, Cl±50, Na±50, Ca±30, Mg±15, HCO3±40
  ca_margin:   number;
  mg_margin:   number;
  na_margin:   number;
  so4_margin:  number;
  cl_margin:   number;
  hco3_margin: number;
}

export interface BjcpStyleWaterEntry {
  target: BjcpStyleTarget | null;
  profileGroupId: string;
  actionRequise?: 'prompt_user_for_color' | 'prompt_user_for_base_style';
  /** Brewer's Friend URL slug for recipe lookup (e.g. "american-ipa") */
  brewersFriendSlug?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a BjcpStyleTarget with per-ion midpoint + margin (charlienewey). */
function T(
  ca: number, ca_m: number,
  mg: number, mg_m: number,
  na: number, na_m: number,
  so4: number, so4_m: number,
  cl: number, cl_m: number,
  hco3: number, hco3_m: number,
): BjcpStyleTarget {
  return {
    ca, mg, na, so4, cl, hco3,
    ca_margin: ca_m, mg_margin: mg_m, na_margin: na_m,
    so4_margin: so4_m, cl_margin: cl_m, hco3_margin: hco3_m,
  };
}

/**
 * Default margins for styles not covered by charlienewey.
 * Values: SO4±50, Cl±50, Na±50, Ca±30, Mg±15, HCO3±40
 */
function D(ca: number, mg: number, na: number, so4: number, cl: number, hco3: number): BjcpStyleTarget {
  return T(ca, 30, mg, 15, na, 50, so4, 50, cl, 50, hco3, 40);
}

// ---------------------------------------------------------------------------
// Per-style water targets
//
// Data sources:
//   • charlienewey/brewing-salt-calculator (MIT) — midpoints & margins for 67 BJCP 2015 styles
//     https://github.com/charlienewey/brewing-salt-calculator/blob/master/src/data/water_profiles.json
//   • Current WortLab macro-profiles — fallback for styles absent from charlienewey
//     (derived from Palmer & Kaminski "Water: A Comprehensive Guide for Brewers", 2013)
//
// Column order in T():  ca ±  /  mg ±  /  na ±  /  so4 ±  /  cl ±  /  hco3 ±
// ---------------------------------------------------------------------------

export const BJCP_STYLE_WATER_TARGETS: Record<string, BjcpStyleWaterEntry> = {

  // -------------------------------------------------------------------------
  // 1 — Light American Lager  (charlienewey: 01A, 01B, 01C, 01D)
  // -------------------------------------------------------------------------
  "1A":  { target: T(55,    5,   15, 15,  50, 50,   25,  25,  75,  25,  20,  20), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "american-light-lager" },
  "1B":  { target: T(62.5, 12.5, 15, 15,  50, 50,  100,  50,  75,  25,  20,  20), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "american-lager" },
  "1C":  { target: T(75,   25,   15, 15,  50, 50,   25,  25,  50,  50,  40,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "cream-ale" },
  "1D":  { target: T(75,   25,   15, 15,  50, 50,  150,  50,  75,  25,  40,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "american-wheat-beer" },

  // -------------------------------------------------------------------------
  // 2 — International Lager  (2A/2B absent charlienewey → macro fallback; 2C covered)
  // -------------------------------------------------------------------------
  "2A":  { target: D(100, 10,  15, 250,  50,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "international-pale-lager" },
  "2B":  { target: D( 75, 10,  20, 150, 100,  80), profileGroupId: "ambree_equilibree", brewersFriendSlug: "international-amber-lager" },
  "2C":  { target: T(62.5, 12.5, 15, 15,  50, 50,  25, 25, 100,  50, 100,  20), profileGroupId: "brune_maltee", brewersFriendSlug: "international-dark-lager" },

  // -------------------------------------------------------------------------
  // 3 — Czech Lager
  //   3A-3C: PILSNER macro (more accurate than charlienewey 03D for pale Czech lagers)
  //          with 03D margins as proxy
  //   3D: charlienewey 03D
  // -------------------------------------------------------------------------
  "3A":  { target: T(15, 5,  5, 15,  5, 50,  15, 25,  15, 25,  15, 20), profileGroupId: "pilsner_boheme", brewersFriendSlug: "czech-pale-lager" },
  "3B":  { target: T(15, 5,  5, 15,  5, 50,  15, 25,  15, 25,  15, 20), profileGroupId: "pilsner_boheme", brewersFriendSlug: "czech-premium-pale-lager" },
  "3C":  { target: T(15, 5,  5, 15,  5, 50,  15, 25,  15, 25,  15, 20), profileGroupId: "pilsner_boheme", brewersFriendSlug: "czech-amber-lager" },
  "3D":  { target: T(55, 5,  15, 15, 50, 50,  25, 25,  75, 25,  20, 20), profileGroupId: "pilsner_boheme", brewersFriendSlug: "czech-dark-lager" },

  // -------------------------------------------------------------------------
  // 4 — Pale Malty European Lager  (4A + 4C covered; 4B absent → macro)
  // -------------------------------------------------------------------------
  "4A":  { target: T(55,    5,   15, 15,  50, 50,   25,  25,  75,  25,  20,  20), profileGroupId: "blonde_maltee", brewersFriendSlug: "munich-helles" },
  "4B":  { target: D(60,  5,  10,  50, 100,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "festbier" },
  "4C":  { target: T(62.5, 12.5, 15, 15,  50, 50,   50,  50, 100,  50,  60,  20), profileGroupId: "blonde_maltee", brewersFriendSlug: "helles-bock" },

  // -------------------------------------------------------------------------
  // 5 — Pale Bitter European Beer  (5A absent → macro; 5B, 5C, 5D covered)
  // -------------------------------------------------------------------------
  "5A":  { target: D(100, 10, 15, 250,  50,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "german-leichtbier" },
  "5B":  { target: T(75,   25,   15, 15,  50, 50,   25,  25,  50,  50,  40,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "kolsch" },
  "5C":  { target: T(112.5, 37.5, 15, 15, 50, 50,  100,  50,  75,  25,  60,  20), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "german-helles-exportbier" },
  "5D":  { target: T(62.5, 12.5, 15, 15,  50, 50,  100,  50,  75,  25,  20,  20), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "german-pils" },

  // -------------------------------------------------------------------------
  // 6 — Amber Malty European Lager  (6A + 6C covered; 6B absent → macro)
  // -------------------------------------------------------------------------
  "6A":  { target: T(62.5, 12.5, 15, 15,  50, 50,   50,  50, 100,  50,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "marzen" },
  "6B":  { target: D(75, 10,  20, 150, 100,  80), profileGroupId: "ambree_equilibree", brewersFriendSlug: "rauchbier" },
  "6C":  { target: T(62.5, 12.5, 15, 15,  50, 50,   50,  50, 100,  50,  60,  20), profileGroupId: "ambree_equilibree", brewersFriendSlug: "dunkles-bock" },

  // -------------------------------------------------------------------------
  // 7 — Amber Bitter European Beer  (7A + 7B covered; 7C absent → macro)
  // -------------------------------------------------------------------------
  "7A":  { target: T(62.5, 12.5, 15, 15,  50, 50,   50,  50, 100,  50,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "vienna-lager" },
  "7B":  { target: T(100,  50,   15, 15,  50, 50,  200, 100,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "altbier" },
  // 7C Kellerbier absent charlienewey → macro ambree (proche 7A)
  "7C":  { target: D(75, 10,  20, 150, 100,  80), profileGroupId: "ambree_equilibree" },

  // -------------------------------------------------------------------------
  // 8 — Dark European Lager  (8A + 8B covered)
  // -------------------------------------------------------------------------
  "8A":  { target: T(62.5, 12.5, 15, 15,  50, 50,   25,  25, 100,  50, 100,  20), profileGroupId: "brune_maltee", brewersFriendSlug: "munich-dunkel" },
  "8B":  { target: T(62.5, 12.5, 15, 15,  50, 50,   25,  25, 100,  50, 100,  20), profileGroupId: "brune_maltee", brewersFriendSlug: "schwarzbier" },

  // -------------------------------------------------------------------------
  // 9 — Strong European Beer  (9A, 9B, 9C covered)
  // -------------------------------------------------------------------------
  "9A":  { target: T(75,   25,   15, 15,  50, 50,   50,  50,  75,  25, 115,  35), profileGroupId: "ambree_equilibree", brewersFriendSlug: "doppelbock" },
  "9B":  { target: T(75,   25,   15, 15,  50, 50,   50,  50,  75,  25, 115,  35), profileGroupId: "ambree_equilibree", brewersFriendSlug: "eisbock" },
  "9C":  { target: T(62.5, 12.5, 15, 15,  50, 50,  100,  50, 100,  50, 120,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "baltic-porter" },

  // -------------------------------------------------------------------------
  // 10 — German Wheat Beer  (10A, 10B, 10C covered)
  // -------------------------------------------------------------------------
  "10A": { target: T(75,   25,   15.5, 14.5,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "weissbier" },
  "10B": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "dunkles-weissbier" },
  "10C": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50, 100,  50, 160,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "weizenbock" },

  // -------------------------------------------------------------------------
  // 11 — British Bitter  (11A, 11B, 11C covered)
  // -------------------------------------------------------------------------
  "11A": { target: T(75,   25,   15.5, 14.5,  50, 50, 150,  50,  75,  25,  40,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "ordinary-bitter" },
  "11B": { target: T(100,  50,   15.5, 14.5,  50, 50, 150,  50,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "best-bitter" },
  "11C": { target: T(100,  50,   15.5, 14.5,  50, 50, 200, 100,  75,  25,  80,  40), profileGroupId: "burton_ale", brewersFriendSlug: "strong-bitter" },

  // -------------------------------------------------------------------------
  // 12 — Pale Commonwealth Beer  (12C covered; 12A, 12B absent → macro)
  // -------------------------------------------------------------------------
  "12A": { target: D(100, 10, 15, 250,  50,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "british-golden-ale" },
  "12B": { target: D(100, 10, 15, 250,  50,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "australian-sparkling-ale" },
  "12C": { target: T(100,  50,   15.5, 14.5,  50, 50, 200, 100,  75,  25,  80,  40), profileGroupId: "burton_ale", brewersFriendSlug: "english-ipa" },

  // -------------------------------------------------------------------------
  // 13 — Brown British Beer  (13A, 13B, 13C covered)
  // -------------------------------------------------------------------------
  "13A": { target: T(100,  50,   15.5, 14.5,  50, 50, 150,  50,  75,  25,  80,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "dark-mild" },
  "13B": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50,  75,  25, 115,  35), profileGroupId: "brune_maltee", brewersFriendSlug: "british-brown-ale" },
  "13C": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50,  75,  25, 115,  35), profileGroupId: "brune_maltee", brewersFriendSlug: "english-porter" },

  // -------------------------------------------------------------------------
  // 14 — Scottish Ale  (14A, 14B, 14C covered)
  // -------------------------------------------------------------------------
  "14A": { target: T(100,  50,   15.5, 14.5,  50, 50, 150,  50,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "scottish-light" },
  "14B": { target: T(100,  50,   15.5, 14.5,  50, 50, 150,  50,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "scottish-heavy" },
  "14C": { target: T(100,  50,   15.5, 14.5,  50, 50, 150,  50,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "scottish-export" },

  // -------------------------------------------------------------------------
  // 15 — Irish Beer  (15A, 15B covered; 15C absent → macro)
  // -------------------------------------------------------------------------
  "15A": { target: T(100,  50,   15.5, 14.5,  50, 50, 200, 100,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "irish-red-ale" },
  "15B": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50,  75,  25, 115,  35), profileGroupId: "noire_houblonnee", brewersFriendSlug: "irish-stout" },
  "15C": { target: D(100, 10,  30, 150,  50, 150), profileGroupId: "noire_houblonnee", brewersFriendSlug: "irish-extra-stout" },

  // -------------------------------------------------------------------------
  // 16 — Dark British Beer  (16A, 16B, 16D covered; 16C absent → macro)
  // -------------------------------------------------------------------------
  "16A": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "sweet-stout" },
  "16B": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "oatmeal-stout" },
  "16C": { target: D(60, 10,  30,  50, 100, 150), profileGroupId: "brune_maltee", brewersFriendSlug: "tropical-stout" },
  "16D": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "foreign-extra-stout" },

  // -------------------------------------------------------------------------
  // 17 — Strong British Ale  (17B, 17C, 17D covered; 17A absent → macro BURTON)
  // -------------------------------------------------------------------------
  "17A": { target: D(250, 20,  30, 500,  40, 200), profileGroupId: "burton_ale", brewersFriendSlug: "british-strong-ale" },
  "17B": { target: T(75,   25,   15.5, 14.5,  50, 50,  75,  25, 100,  50,  80,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "old-ale" },
  "17C": { target: T(75,   25,   15.5, 14.5,  50, 50,  75,  25, 100,  50,  80,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "wee-heavy" },
  "17D": { target: T(75,   25,   15.5, 14.5,  50, 50,  75,  25, 100,  50,  80,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "english-barleywine" },

  // -------------------------------------------------------------------------
  // 18 — Pale American Ale  (18A, 18B covered)
  // -------------------------------------------------------------------------
  "18A": { target: T(55,    5,   15.5, 14.5,  50, 50,  25,  25,  75,  25,  20,  20), profileGroupId: "blonde_maltee", brewersFriendSlug: "blonde-ale" },
  "18B": { target: T(100,  50,   15.5, 14.5,  50, 50, 250, 150,  50,  50,  80,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "american-pale-ale" },

  // -------------------------------------------------------------------------
  // 19 — Amber & Brown American Beer  (19A, 19B, 19C covered)
  // -------------------------------------------------------------------------
  "19A": { target: T(100,  50,   15.5, 14.5,  50, 50, 200, 100,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "american-amber-ale" },
  "19B": { target: T(100,  50,   15.5, 14.5,  50, 50, 200, 100,  75,  25,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "california-common" },
  "19C": { target: T(62.5, 12.5, 15.5, 14.5,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "american-brown-ale" },

  // -------------------------------------------------------------------------
  // 20 — American Porter & Stout  (20A, 20B, 20C covered)
  // -------------------------------------------------------------------------
  "20A": { target: T(62.5, 12.5, 16, 14,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "noire_houblonnee", brewersFriendSlug: "american-porter" },
  "20B": { target: T(62.5, 12.5, 16, 14,  50, 50, 100,  50, 100,  50, 120,  40), profileGroupId: "noire_houblonnee", brewersFriendSlug: "american-stout" },
  "20C": { target: T(62.5, 12.5, 16, 14,  50, 50, 100,  50, 100,  50, 160,  40), profileGroupId: "noire_houblonnee", brewersFriendSlug: "imperial-stout" },

  // -------------------------------------------------------------------------
  // 21 — IPA  (21A covered; 21B null/special; 21C absent → HAZY macro)
  // -------------------------------------------------------------------------
  "21A": { target: T(100,  50,   16, 14,  50, 50, 250, 150,  50,  50,  80,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "american-ipa" },
  "21B": { target: null, profileGroupId: "ipa_specialty", actionRequise: "prompt_user_for_color" },
  "21C": { target: D(100, 10,  20,  75, 150,  40), profileGroupId: "hazy_neipa", brewersFriendSlug: "specialty-ipa-new-england-ipa" },

  // -------------------------------------------------------------------------
  // 22 — Strong American Ale  (22A + 22C covered; 22B absent → macro; 22D absent → macro)
  // -------------------------------------------------------------------------
  "22A": { target: T(100,  50,   16, 14,  50, 50, 250, 150,  50,  50,  80,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "double-ipa" },
  "22B": { target: D(100, 10, 15, 250,  50,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "american-strong-ale" },
  "22C": { target: T(75,   25,   16, 14,  50, 50,  75,  25, 100,  50,  80,  40), profileGroupId: "ambree_equilibree", brewersFriendSlug: "american-barleywine" },
  "22D": { target: D(75, 10,  20, 150, 100,  80), profileGroupId: "ambree_equilibree", brewersFriendSlug: "wheatwine" },

  // -------------------------------------------------------------------------
  // 23 — European Sour Ale  (23A-23F covered; 23G absent → GOSE macro)
  // -------------------------------------------------------------------------
  "23A": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "berliner-weisse" },
  "23B": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  60,  60), profileGroupId: "ambree_equilibree", brewersFriendSlug: "flanders-red-ale" },
  "23C": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  50,  50), profileGroupId: "ambree_equilibree", brewersFriendSlug: "oud-bruin" },
  "23D": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "lambic" },
  "23E": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "gueuze" },
  "23F": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "fruit-lambic" },
  // 23G Gose: ajout BJCP 2021, absent charlienewey → macro gose_historique
  "23G": { target: D(75, 10, 120,  50, 150,  40), profileGroupId: "gose_historique", brewersFriendSlug: "gose" },

  // -------------------------------------------------------------------------
  // 24 — Belgian Ale  (24A, 24B, 24C covered)
  // -------------------------------------------------------------------------
  "24A": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "witbier" },
  "24B": { target: T(100,  50,   16, 14,  50, 50, 200, 100,  75,  25,  80,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "belgian-pale-ale" },
  "24C": { target: T(75,   25,   16, 14,  50, 50,  75,  25, 100,  50,  80,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "biere-de-garde" },

  // -------------------------------------------------------------------------
  // 25 — Strong Belgian Ale  (25A, 25B, 25C covered)
  // -------------------------------------------------------------------------
  "25A": { target: T(75,   25,   16, 14,  50, 50,  25,  25,  50,  50,  40,  40), profileGroupId: "blonde_maltee", brewersFriendSlug: "belgian-blond-ale" },
  "25B": { target: T(100,  50,   16, 14,  50, 50, 250, 150,  50,  50,  80,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "saison" },
  "25C": { target: T(75,   25,   16, 14,  50, 50,  75,  25,  75,  25,  20,  20), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "belgian-golden-strong-ale" },

  // -------------------------------------------------------------------------
  // 26 — Trappist Ale  (26B, 26C, 26D covered; 26A absent → macro)
  // -------------------------------------------------------------------------
  "26A": { target: D(100, 10, 15, 250,  50,  40), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "trappist-single" },
  "26B": { target: T(75,   25,   16, 14,  50, 50,  75,  25, 100,  50,  80,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "belgian-dubbel" },
  "26C": { target: T(75,   25,   16, 14,  50, 50,  75,  25,  75,  25,  20,  20), profileGroupId: "blonde_houblonnee", brewersFriendSlug: "belgian-tripel" },
  "26D": { target: T(62.5, 12.5, 16, 14,  50, 50, 100,  50, 100,  50, 160,  40), profileGroupId: "brune_maltee", brewersFriendSlug: "belgian-dark-strong-ale" },

  // -------------------------------------------------------------------------
  // 27 — Historical Beer  (profil variable selon sous-style → null)
  // Note: charlienewey 27A = "Roggenbier" (BJCP 2015) ≠ 27A BJCP 2021 (Historical Beer)
  // -------------------------------------------------------------------------
  "27A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },

  // -------------------------------------------------------------------------
  // 28 — American Wild Ale  (absent charlienewey → SOUR macro)
  // -------------------------------------------------------------------------
  "28A": { target: D(50,  5,  10,  25,  75,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "brett-beer" },
  "28B": { target: D(50,  5,  10,  25,  75,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "mixed-fermentation-sour-beer" },
  "28C": { target: D(50,  5,  10,  25,  75,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "wild-specialty-beer" },
  "28D": { target: D(50,  5,  10,  25,  75,  40), profileGroupId: "sours_sauvages", brewersFriendSlug: "straight-sour-beer" },

  // -------------------------------------------------------------------------
  // 29–34 — Specialty Styles  (profil dépend du style de base → null)
  // -------------------------------------------------------------------------
  "29A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "29B": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "29C": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "30A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "30B": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "30C": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "30D": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "31A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "31B": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "32A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "32B": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "33A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "33B": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "34A": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "34B": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
  "34C": { target: null, profileGroupId: "specialty_base_requise", actionRequise: "prompt_user_for_base_style" },
};

// Validate that all BJCP_STYLE_NAMES codes are covered (dev-time check)
export function getMissingBjcpCodes(): string[] {
  return Object.keys(BJCP_STYLE_NAMES).filter(code => !BJCP_STYLE_WATER_TARGETS[code]);
}
