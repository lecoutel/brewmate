
import {
  PreBoilDensityInputs, PreBoilDensityResult, GravityUnit,
  PostBoilDensityInputs, PostBoilDensityResult, DensityCorrectionOption,
  RefractometerInputs, RefractometerResult
} from '../types';

// --- Density Conversion Utilities ---
function convertToPD(gravity: number, unit: GravityUnit): number {
  if (unit === GravityUnit.DI) return (gravity - 1) * 1000;
  if (unit === GravityUnit.Brix || unit === GravityUnit.Plato) return gravity * 4; // Approximation
  return 0;
}

// --- Pre-Boil Density Calculator ---
export function calculatePreBoilDensity(inputs: PreBoilDensityInputs): PreBoilDensityResult {
  const { volumePreBoil, gravityUnit, measuredGravity, targetGravity } = inputs;

  if (volumePreBoil <= 0 || measuredGravity <= 0 || (gravityUnit === GravityUnit.DI && measuredGravity < 1) || targetGravity <= 0 || (gravityUnit === GravityUnit.DI && targetGravity < 1) ) {
    return { options: [], message: '', error: "Veuillez entrer des valeurs valides. Le volume doit être > 0. La Densité spécifique doit être >= 1." };
  }
  if (gravityUnit === GravityUnit.DI && (measuredGravity > 2 || targetGravity > 2)) {
    return { options: [], message: '', error: "Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), pas 52." };
  }
  if ((gravityUnit === GravityUnit.Brix || gravityUnit === GravityUnit.Plato) && (measuredGravity > 50 || targetGravity > 50)) {
     return { options: [], message: '', error: `Pour ${gravityUnit}, entrez une valeur réaliste (ex: 13.0).` };
  }


  const gpCurrent = convertToPD(measuredGravity, gravityUnit);
  const gpTarget = convertToPD(targetGravity, gravityUnit);

  if (gpTarget === 0) {
    return { options: [], message: '', error: "La densité cible ne peut pas être zéro." };
  }

  if (gpCurrent === gpTarget) {
    return { options: [], message: "La densité est déjà à la cible. Aucune correction nécessaire." };
  }

  const options: DensityCorrectionOption[] = [];
  const volumeTarget = (volumePreBoil * gpCurrent) / gpTarget;

  if (gpCurrent > gpTarget) { // Density too high, need to dilute
    const waterToAdd = volumeTarget - volumePreBoil;
    if (waterToAdd < 0) return { options: [], message: '', error: "Erreur de calcul pour l'ajout d'eau." };
    options.push({
      type: 'dilute',
      amount: waterToAdd,
      unit: 'litres',
      description: `Ajouter ${waterToAdd.toFixed(2)} litres d'eau pour atteindre la densité cible.`,
    });
    return { options, message: "La densité est trop haute. Action suggérée :" };
  } else { // Density too low, need to concentrate
    const waterToEvaporate = volumePreBoil - volumeTarget;
    if (waterToEvaporate > 0) {
      options.push({
        type: 'evaporate',
        amount: waterToEvaporate,
        unit: 'litres',
        description: `Évaporer ${waterToEvaporate.toFixed(2)} litres d'eau en plus de votre évaporation habituelle.`,
      });
    }
    
    const pointsDeficitTotal = (gpTarget - gpCurrent) * volumePreBoil;
    const sugarAmountGrams = pointsDeficitTotal / 0.4;
    
    if (sugarAmountGrams > 0) {
      options.push({
        type: 'addSugarPowder',
        amount: sugarAmountGrams,
        unit: 'grammes',
        description: `Ajouter ${sugarAmountGrams.toFixed(0)} grammes de sucre de table ou candy blanc.`,
      });
    }

    return { 
      options, 
      message: "La densité est trop basse. Pour atteindre votre densité cible, vous pouvez choisir l'une des options suivantes :" 
    };
  }
}

// --- Post-Boil Density Calculator ---
export function calculatePostBoilDensity(inputs: PostBoilDensityInputs): PostBoilDensityResult {
  const { volumePostBoil, gravityUnit, measuredGravity, targetGravity } = inputs;

  if (volumePostBoil <= 0 || measuredGravity <= 0 || (gravityUnit === GravityUnit.DI && measuredGravity < 1) || targetGravity <= 0 || (gravityUnit === GravityUnit.DI && targetGravity < 1) ) {
    return { options: [], message: '', error: "Veuillez entrer des valeurs valides. Le volume doit être > 0. La Densité spécifique doit être >= 1." };
  }
  if (gravityUnit === GravityUnit.DI && (measuredGravity > 2 || targetGravity > 2)) {
     return { options: [], message: '', error: "Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), pas 52." };
  }
   if ((gravityUnit === GravityUnit.Brix || gravityUnit === GravityUnit.Plato) && (measuredGravity > 50 || targetGravity > 50)) {
     return { options: [], message: '', error: `Pour ${gravityUnit}, entrez une valeur réaliste (ex: 13.0).` };
  }

  const gpCurrent = convertToPD(measuredGravity, gravityUnit);
  const gpTarget = convertToPD(targetGravity, gravityUnit);

  if (gpTarget === 0) {
    return { options: [], message: '', error: "La densité cible ne peut pas être zéro." };
  }

  if (gpCurrent === gpTarget) {
    return { options: [], message: "Félicitations, votre densité est à la cible !" };
  }

  const options: DensityCorrectionOption[] = [];

  if (gpCurrent > gpTarget) { // Density too high, dilute
    const volumeTarget = (volumePostBoil * gpCurrent) / gpTarget;
    const waterToAdd = volumeTarget - volumePostBoil;
     if (waterToAdd < 0) return { options: [], message: '', error: "Erreur de calcul pour l'ajout d'eau." };
    options.push({
      type: 'dilute',
      amount: waterToAdd,
      unit: 'litres',
      description: `Ajouter ${waterToAdd.toFixed(2)} litres d'eau stérile pour atteindre la densité cible.`,
      warning: "Utilisez de l'eau bouillie et refroidie pour éviter toute contamination."
    });
    return { options, message: "La densité est trop haute. Action suggérée :" };
  } else { // Density too low, concentrate or add sugar
    const pointsDeficitTotal = (gpTarget - gpCurrent) * volumePostBoil;

    // Option 1: Evaporate
    const volumeTargetForEvaporation = (volumePostBoil * gpCurrent) / gpTarget;
    const waterToEvaporate = volumePostBoil - volumeTargetForEvaporation;
    if (waterToEvaporate > 0) { // Check if evaporation is a valid option (target density is higher)
      options.push({
        type: 'evaporate',
        amount: waterToEvaporate,
        unit: 'litres',
        description: `Évaporer ${waterToEvaporate.toFixed(2)} litres d'eau.`,
        warning: "Attention : cela nécessite de refaire bouillir le moût. Cela peut affecter les arômes de houblon."
      });
    }
    
    // Option 2 & 3: Add Sugar (Sucrose approx 0.4 PD per g/L)
    // (PD * L) is pointsDeficitTotal. pointDeficitTotal / (PD / g) = g
    const sugarAmountGrams = pointsDeficitTotal / 0.4; 
    if (sugarAmountGrams > 0) {
        options.push({
          type: 'addSugarCandy',
          amount: sugarAmountGrams,
          unit: 'grammes',
          description: `Ajouter ${sugarAmountGrams.toFixed(2)} grammes de sucre candy blanc.`,
          warning: "Dissolvez complètement le sucre dans un peu de moût chaud avant de l'incorporer, puis homogénéisez bien l'ensemble."
        });
        options.push({
          type: 'addSugarPowder',
          amount: sugarAmountGrams,
          unit: 'grammes',
          description: `Ajouter ${sugarAmountGrams.toFixed(2)} grammes de sucre blanc en poudre.`,
          warning: "Dissolvez complètement le sucre dans un peu de moût chaud avant de l'incorporer, puis homogénéisez bien l'ensemble."
        });
    }
    return { options, message: "La densité est trop basse. Pour atteindre votre densité cible, vous pouvez choisir l'une des options suivantes :" };
  }
}


// --- Refractometer Correction Calculator ---
export function sgToBrix(sg: number): number {
  if (sg < 1) return 0; 
  return -668.962 + (1262.45 * sg) - (776.43 * Math.pow(sg, 2)) + (182.94 * Math.pow(sg, 3));
}

export function brixToSG(brix: number): number {
  if (brix <=0) return 1.000;
  return 1 + (brix / (258.6 - ((brix / 258.2) * 227.1)));
}

export function sgToPlato(sg: number): number {
  if (sg < 1) return 0;
  return (-1 * 616.868) + (1111.14 * sg) - (630.272 * Math.pow(sg, 2)) + (135.997 * Math.pow(sg, 3));
}

export function platoToSG(plato: number): number {
  if (plato <= 0) return 1.000;
  // Newton-Raphson inversion of the ASBC sgToPlato cubic polynomial:
  // Plato = -616.868 + 1111.14*SG - 630.272*SG² + 135.997*SG³
  let sg = 1 + plato / 250; // initial estimate
  for (let i = 0; i < 20; i++) {
    const f = -616.868 + 1111.14 * sg - 630.272 * sg * sg + 135.997 * sg * sg * sg - plato;
    const fp = 1111.14 - 2 * 630.272 * sg + 3 * 135.997 * sg * sg;
    const delta = f / fp;
    sg -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return sg;
}


export function calculateRefractometer(inputs: RefractometerInputs): RefractometerResult {
  const { gravityUnit, initialDensity, finalMeasuredDensity } = inputs;

  if (initialDensity <= 0 || finalMeasuredDensity <= 0) {
    return { correctedFinalGravity: 0, abv: 0, message: '', error: "Veuillez entrer des valeurs positives pour les densités." };
  }
  if (gravityUnit === GravityUnit.DI && (initialDensity < 1 || finalMeasuredDensity < 1)) {
     return { correctedFinalGravity: 0, abv: 0, message: '', error: "Pour la Densité spécifique, la valeur doit être >= 1.000."};
  }
   if (gravityUnit === GravityUnit.DI && (initialDensity > 2 || finalMeasuredDensity > 2)) {
     return { correctedFinalGravity: 0, abv: 0, message: '', error: "Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), pas 52." };
  }

  let ogBrix: number;
  let fgMeasuredBrix: number;
  let ogSG: number;

  if (gravityUnit === GravityUnit.DI) {
    ogSG = initialDensity;
    ogBrix = sgToBrix(initialDensity);
  } else { 
    ogBrix = initialDensity; 
    ogSG = brixToSG(initialDensity);
  }

  if (gravityUnit === GravityUnit.DI) {
    fgMeasuredBrix = sgToBrix(finalMeasuredDensity); 
  } else { 
    fgMeasuredBrix = finalMeasuredDensity;
  }
  
  if (finalMeasuredDensity >= initialDensity ) {
      // This check should use original input values for user clarity
      const unitName = gravityUnit === GravityUnit.DI ? "Densité spécifique" : gravityUnit;
      return { correctedFinalGravity: 0, abv: 0, message: '', error: `La lecture finale (${unitName}) doit être inférieure à la lecture initiale. La fermentation n'a peut-être pas commencé.` };
  }

  const fgCorrectedSG = 1.0000 - 
                        (0.0044993 * ogBrix) + 
                        (0.011774 * fgMeasuredBrix) + 
                        (0.00027581 * Math.pow(ogBrix, 2)) - 
                        (0.00012717 * Math.pow(fgMeasuredBrix, 2)) - 
                        (0.0000072800 * Math.pow(ogBrix, 3)) + 
                        (0.0000063293 * Math.pow(fgMeasuredBrix, 3));

  // Tabarie formula: more accurate than the linear (OG - FG) * 131.25 approximation,
  // especially for high-gravity fermentations (ABV > 8%).
  const abv = (76.08 * (ogSG - fgCorrectedSG) / (1.775 - ogSG)) * (fgCorrectedSG / 0.794);

  const correctedBrix = Math.max(0, sgToBrix(fgCorrectedSG));
  const correctedPlato = Math.max(0, sgToPlato(fgCorrectedSG));

  return {
    correctedFinalGravity: parseFloat(fgCorrectedSG.toFixed(3)),
    abv: parseFloat(abv.toFixed(2)),
    message: `Densité finale corrigée :\n• ${fgCorrectedSG.toFixed(3)} (Densité Spécifique)\n• ${correctedBrix.toFixed(1)} °Brix\n• ${correctedPlato.toFixed(1)} °Plato\n\nTaux d'alcool (ABV) estimé : ${abv.toFixed(2)} %`
  };
}