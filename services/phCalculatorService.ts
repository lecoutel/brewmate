
import { getMaltCategory, MALT_TYPE } from '../utils/maltCategorizer';
import { PhCalculationInputs, PhCalculationResult, MaltComposition, CorrectionStage, WaterProfile, MaltCategory, CorrectionType } from '../types';
import { BREWING_CHEMISTRY_FACTORS } from '../constants';

// Define a type for the details object structure
type PhCalculationDetails = Exclude<PhCalculationResult['details'], undefined>;

// Helper function to parse volume from BeerXML
const getVolumeFromXml = (xmlDoc: XMLDocument, tagName: string, parentTagName?: string): number | null => {
  let parentElement: Document | Element = xmlDoc;
  if (parentTagName) {
    const parents = xmlDoc.getElementsByTagName(parentTagName);
    if (parents.length > 0) {
      parentElement = parents[0];
    } else {
      return null; // Parent tag not found
    }
  }

  const elements = parentElement.getElementsByTagName(tagName);
  if (elements.length > 0 && elements[0].textContent) {
    const volume = parseFloat(elements[0].textContent);
    return isNaN(volume) ? null : volume;
  }
  return null;
};

const getMashInfuseVolumeFromXml = (xmlDoc: XMLDocument): number | null => {
  const mashSteps = xmlDoc.getElementsByTagName('MASH_STEP');
  let totalInfuseAmount = 0;
  let foundAnyInfuse = false;
  if (mashSteps.length > 0) {
    for (const step of mashSteps) {
      const infuseAmountTag = step.getElementsByTagName('INFUSE_AMOUNT')[0];
      if (infuseAmountTag && infuseAmountTag.textContent) {
        const amount = parseFloat(infuseAmountTag.textContent);
        if (!isNaN(amount) && amount > 0) {
          totalInfuseAmount += amount;
          foundAnyInfuse = true;
        }
      }
    }
  }
  return foundAnyInfuse ? totalInfuseAmount : null;
};


/**
 * Calcule la correction de pH en fonction de l'étape de brassage.
 */
export function calculatePhCorrection(inputs: PhCalculationInputs): PhCalculationResult {
  const { stage, measurements, beerXmlString, waterProfile } = inputs;
  const { currentPh, targetPh, volume } = measurements;

  const defaultResultBase = {
    lacticAcidMl: 0,
    phosphoricAcidMl: 0,
    bicarbonateGrams: 0,
  };

  if (isNaN(volume) || volume <= 0) {
    return { ...defaultResultBase, correctionType: 'NONE' as CorrectionType, message: '', error: "Le volume doit être un nombre positif." };
  }
  if (isNaN(currentPh) || currentPh <= 0 || currentPh > 14 || isNaN(targetPh) || targetPh <= 0 || targetPh > 14) {
    return { ...defaultResultBase, correctionType: 'NONE' as CorrectionType, message: '', error: "Le pH actuel et cible doivent être entre 0 et 14." };
  }

  const phDelta = currentPh - targetPh;

  let xmlDoc: XMLDocument | null = null;
  let parseErrorMsg: string | null = null;

  if (beerXmlString) {
    const parser = new DOMParser();
    xmlDoc = parser.parseFromString(beerXmlString, "application/xml");
    const parseErrorNode = xmlDoc.getElementsByTagName("parsererror");
    if (parseErrorNode.length > 0) {
      parseErrorMsg = "Erreur lors de l'analyse du fichier BeerXML. Vérifiez le format.";
      xmlDoc = null; // Invalidate xmlDoc if parsing failed
    }
  }
  
  const autoDetectedMashVolumeL = xmlDoc && stage === CorrectionStage.MASH ? getMashInfuseVolumeFromXml(xmlDoc) : null;
  const autoDetectedPreBoilVolumeL = xmlDoc && stage === CorrectionStage.PRE_BOIL ? getVolumeFromXml(xmlDoc, 'BOIL_SIZE', 'RECIPE') : null;

  const baseDetailsForReturn: PhCalculationDetails = {
      autoDetectedMashVolumeL: autoDetectedMashVolumeL ?? undefined,
      autoDetectedPreBoilVolumeL: autoDetectedPreBoilVolumeL ?? undefined,
  };


  if (Math.abs(phDelta) < 0.001) { // pH is effectively at target
    return {
      ...defaultResultBase,
      correctionType: 'NONE',
      message: "Le pH est déjà à la cible. Aucune correction nécessaire.",
      details: { ...baseDetailsForReturn }
    };
  }

  if (stage === CorrectionStage.MASH) {
    if (!waterProfile) {
      return { ...defaultResultBase, correctionType: 'NONE', message:'', error: "Le profil d'eau est requis pour le calcul du pH d'empâtage.", details: {...baseDetailsForReturn} };
    }
    if (!beerXmlString || !xmlDoc) {
      return { ...defaultResultBase, correctionType: 'NONE', message:'', error: `Un fichier BeerXML valide est requis pour l'analyse des malts pour l'empâtage. ${parseErrorMsg || ''}`.trim(), details: {...baseDetailsForReturn} };
    }

    const fermentablesNodes = xmlDoc.getElementsByTagName('FERMENTABLE');
    if (fermentablesNodes.length === 0) {
      return { ...defaultResultBase, correctionType: 'NONE', message:'', error: "Aucun ingrédient fermentescible trouvé dans le fichier BeerXML.", details: {...baseDetailsForReturn} };
    }

    const maltComposition: MaltComposition = {
      [MALT_TYPE.BASE]: 0, [MALT_TYPE.CRYSTAL]: 0, [MALT_TYPE.ROASTED]: 0,
      [MALT_TYPE.SPECIALTY_ACIDIC]: 0, [MALT_TYPE.SPECIALTY_OTHER]: 0, [MALT_TYPE.UNKNOWN]: 0,
    };
    let totalGrainWeightKg = 0;
    let acidMaltKg = 0;

    for (const fermentableNode of fermentablesNodes) {
      const typeElement = fermentableNode.getElementsByTagName('TYPE')[0];
      const nameElement = fermentableNode.getElementsByTagName('NAME')[0];
      const amountElement = fermentableNode.getElementsByTagName('AMOUNT')[0];
      if (!typeElement?.textContent || !nameElement?.textContent || !amountElement?.textContent) continue;

      const type = typeElement.textContent.toLowerCase();
      if (type === 'grain' || type === 'adjunct') {
        const name = nameElement.textContent;
        const amountKgSingle = parseFloat(amountElement.textContent);
        if (isNaN(amountKgSingle) || amountKgSingle < 0) continue;
        totalGrainWeightKg += amountKgSingle;
        const category = getMaltCategory(name);
        (maltComposition[category as keyof MaltComposition] as number) += amountKgSingle;
        if (category === MALT_TYPE.SPECIALTY_ACIDIC) {
          acidMaltKg += amountKgSingle;
        }
      }
    }

    if (totalGrainWeightKg === 0) {
      return { ...defaultResultBase, correctionType: 'NONE', message:'', error: "Aucun malt/grain avec une quantité valide trouvé.", details: {...baseDetailsForReturn, maltComposition }};
    }

    const mEqFromAcidMalt = (acidMaltKg * 1000 / 100) * BREWING_CHEMISTRY_FACTORS.ACID_MALT_MEQ_PER_100G;

    const { ca, mg, hco3 } = waterProfile;
    const alkalinityCaCO3 = hco3 * (50 / 61.0168);
    const residualAlkalinity = alkalinityCaCO3 - ((ca / 1.4) + (mg / 1.7));

    const BF_BASE = 33.0, BF_CRYSTAL = 50.0, BF_ROASTED = 70.0;
    const maltBuffering =
        (maltComposition[MALT_TYPE.BASE] * BF_BASE) +
        (maltComposition[MALT_TYPE.CRYSTAL] * BF_CRYSTAL) +
        (maltComposition[MALT_TYPE.ROASTED] * BF_ROASTED);

    const raContributionToBuffering = residualAlkalinity * 0.08;
    const totalMashBuffering = maltBuffering + raContributionToBuffering;
    
    const initialMEqNeeded = totalMashBuffering * phDelta; // Negative if pH too low, positive if pH too high

    let currentMashDetails: PhCalculationDetails = {
        ...baseDetailsForReturn,
        residualAlkalinity: parseFloat(residualAlkalinity.toFixed(2)),
        totalMashBuffering: parseFloat(totalMashBuffering.toFixed(2)),
        maltComposition,
        mEqFromAcidMalt: parseFloat(mEqFromAcidMalt.toFixed(2)),
        initialMEqNeeded: parseFloat(initialMEqNeeded.toFixed(2)),
    };

    if (totalMashBuffering <= 0 && phDelta !== 0) { // Check after initialMEqNeeded is calculated
      return { ...defaultResultBase, correctionType: 'NONE', message:'', error: "Pouvoir tampon calculé nul ou négatif. Vérifiez BeerXML/profil d'eau.", details: currentMashDetails };
    }


    if (phDelta > 0) { // Need to lower pH (acidification)
      const netMEqNeededForAcidification = initialMEqNeeded - mEqFromAcidMalt;
      currentMashDetails.netMEqNeededForAcidification = parseFloat(netMEqNeededForAcidification.toFixed(2));

      if (netMEqNeededForAcidification <= 0) {
        return {
          ...defaultResultBase,
          correctionType: 'NONE',
          message: "Le malt acidulé présent dans la recette suffit ou dépasse le besoin d'acidification. Aucun ajout d'acide liquide nécessaire.",
          details: currentMashDetails,
        };
      }
      const lacticAcidMl = netMEqNeededForAcidification / BREWING_CHEMISTRY_FACTORS.LACTIC_ACID_80_MEQ_PER_ML;
      const phosphoricAcidMl = netMEqNeededForAcidification / BREWING_CHEMISTRY_FACTORS.PHOSPHORIC_ACID_75_MEQ_PER_ML;
      return {
        ...defaultResultBase,
        correctionType: 'ACIDIFY',
        lacticAcidMl: parseFloat(lacticAcidMl.toFixed(2)),
        phosphoricAcidMl: parseFloat(phosphoricAcidMl.toFixed(2)),
        message: "Ajout d'acide nécessaire pour atteindre le pH cible.",
        details: currentMashDetails,
      };
    } else { // Need to raise pH (phDelta < 0, alkalinization)
      const mEqToAlkalinize = Math.abs(initialMEqNeeded) + mEqFromAcidMalt;
      currentMashDetails.mEqToAlkalinize = parseFloat(mEqToAlkalinize.toFixed(2));

      if (mEqToAlkalinize <= 0 && phDelta !==0) { 
           return {
             ...defaultResultBase,
             correctionType: 'NONE',
             message: "Aucune correction d'alcalinisation calculée (mEq <= 0). Vérifiez les valeurs.",
             details: currentMashDetails,
           };
      }
       if (mEqToAlkalinize <= 0 && phDelta === 0){
            return {
             ...defaultResultBase,
             correctionType: 'NONE',
             message: "Le pH est à la cible, aucune alcalinisation nécessaire.",
             details: currentMashDetails,
           };
       }
      const bicarbonateGrams = mEqToAlkalinize / BREWING_CHEMISTRY_FACTORS.SODIUM_BICARBONATE_MEQ_PER_GRAM;
      return {
        ...defaultResultBase,
        correctionType: 'ALCALINIZE',
        bicarbonateGrams: parseFloat(bicarbonateGrams.toFixed(2)),
        message: "Ajout de bicarbonate de sodium nécessaire pour atteindre le pH cible.",
        details: currentMashDetails,
      };
    }

  } else if (stage === CorrectionStage.PRE_BOIL) {
    let currentPreBoilDetails: PhCalculationDetails = { ...baseDetailsForReturn };

    if (parseErrorMsg && beerXmlString) { // XML was provided but failed to parse
        return { ...defaultResultBase, correctionType: 'NONE', message:'', error: `Erreur lors de l'analyse du fichier BeerXML pour le volume pré-ébullition: ${parseErrorMsg}`, details: currentPreBoilDetails };
    }

    if (phDelta > 0) { // Acidification
      const lacticAcidMl = 0.5 * volume * phDelta;
      const phosphoricAcidMl = 0.15 * volume * phDelta;
      return {
        ...defaultResultBase,
        correctionType: 'ACIDIFY',
        lacticAcidMl: parseFloat(lacticAcidMl.toFixed(2)),
        phosphoricAcidMl: parseFloat(phosphoricAcidMl.toFixed(2)),
        message: "Ajout d'acide (calcul simplifié pré-ébullition).",
        details: currentPreBoilDetails
      };
    } else { // Alkalinization (phDelta < 0)
      const mEqToNeutralize_preboil = BREWING_CHEMISTRY_FACTORS.PRE_BOIL_WORT_BUFFERING_ESTIMATE_MEQ_PER_L_PH * volume * Math.abs(phDelta);
      currentPreBoilDetails.mEqToAlkalinize = parseFloat(mEqToNeutralize_preboil.toFixed(2));
      const bicarbonateGrams = mEqToNeutralize_preboil / BREWING_CHEMISTRY_FACTORS.SODIUM_BICARBONATE_MEQ_PER_GRAM;
      return {
        ...defaultResultBase,
        correctionType: 'ALCALINIZE',
        bicarbonateGrams: parseFloat(bicarbonateGrams.toFixed(2)),
        message: "Ajout de bicarbonate de sodium (calcul simplifié pré-ébullition).",
        details: currentPreBoilDetails
      };
    }
  } else {
    return { ...defaultResultBase, correctionType: 'NONE', message:'', error: "Étape de correction invalide.", details: {...baseDetailsForReturn} };
  }
}
