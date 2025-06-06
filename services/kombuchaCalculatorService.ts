
import {
  KombuchaRecipeInputs,
  KombuchaRecipeResult,
  KombuchaIngredient,
  KombuchaInstructionStep,
  AromaticProfileKey,
  TeaTypeKey,
} from '../types';
import { KOMBUCHA_PROFILES, INFUSION_TIMES } from './kombuchaData';

export function generateKombuchaRecipe(inputs: KombuchaRecipeInputs): KombuchaRecipeResult {
  const { desiredVolumeL, aromaticProfileKey, teaTypeKey } = inputs;

  if (desiredVolumeL <= 0) {
    return {
      title: '',
      expectedTasteProfile: '',
      ingredients: [],
      instructions: [],
      error: 'La quantité finale désirée doit être un nombre positif.',
    };
  }

  const profile = KOMBUCHA_PROFILES[aromaticProfileKey];
  if (!profile) {
    return {
      title: '',
      expectedTasteProfile: '',
      ingredients: [],
      instructions: [],
      error: 'Profil aromatique non valide sélectionné.',
    };
  }

  const expectedTasteProfile = profile.descriptions[teaTypeKey];
  const infusionTimeMinutes = INFUSION_TIMES[teaTypeKey];

  if (!expectedTasteProfile || infusionTimeMinutes === undefined) {
    return {
      title: '',
      expectedTasteProfile: '',
      ingredients: [],
      instructions: [],
      error: 'Type de thé non valide sélectionné pour le profil aromatique.',
    };
  }

  // Calculations
  const starterLiquidL = desiredVolumeL * 0.15;
  const teaGrams = desiredVolumeL * profile.tea_per_liter;
  const sugarGrams = desiredVolumeL * profile.sugar_per_liter;
  const totalWaterL = desiredVolumeL - starterLiquidL;
  const hotWaterL = totalWaterL * 0.4; // 40% of total water for infusion
  const coldWaterL = totalWaterL - hotWaterL; // Remaining 60%
  const inoculationTemp = "20-30°C";

  const ingredients: KombuchaIngredient[] = [
    { name: 'Eau totale (pour infusion et dilution)', amount: parseFloat(totalWaterL.toFixed(2)), unit: 'L' },
    { name: `Thé (${teaTypeKey.replace('_', ' ').toLowerCase()})`, amount: parseFloat(teaGrams.toFixed(1)), unit: 'g' },
    { name: 'Sucre blanc granulé', amount: parseFloat(sugarGrams.toFixed(1)), unit: 'g' },
    { name: 'Starter liquide (Kombucha non pasteurisé d\'un batch précédent)', amount: parseFloat(starterLiquidL.toFixed(2)), unit: 'L' },
    { name: 'SCOBY (Symbiotic Culture Of Bacteria and Yeast)', amount: 1, unit: 'unité' },
  ];

  const instructions: KombuchaInstructionStep[] = [
    { step: 1, text: `Chauffez ${hotWaterL.toFixed(2)} L d'eau à ébullition, puis retirez du feu.` },
    { step: 2, text: `Ajoutez les ${teaGrams.toFixed(1)} g de thé. Laissez infuser pendant ${infusionTimeMinutes} minutes. Retirez ensuite les feuilles de thé.` },
    { step: 3, text: `Pendant que l'infusion est chaude, dissolvez complètement les ${sugarGrams.toFixed(1)} g de sucre.` },
    { step: 4, text: `Versez l'infusion sucrée dans votre bocal de fermentation. Ajoutez les ${coldWaterL.toFixed(2)} L d'eau froide restante pour aider à refroidir le mélange.` },
    { step: 5, text: `Attendez que le moût de thé sucré atteigne une température comprise entre ${inoculationTemp}. Une fois à température, ajoutez les ${starterLiquidL.toFixed(2)} L de starter liquide et déposez délicatement le SCOBY à la surface.` },
    { step: 6, text: `Couvrez le bocal avec un tissu respirant (étamine, filtre à café) maintenu par un élastique. Laissez fermenter dans un endroit sombre, à température ambiante, pendant 7 à 21 jours, en goûtant régulièrement à partir du 7ème jour jusqu'à atteindre le profil désiré.` },
  ];
  
  let profileName = '';
    switch(aromaticProfileKey) {
        case 'LIGHT_GENTLE': profileName = "Léger et Doux"; break;
        case 'CLASSIC_BALANCED': profileName = "Classique et Équilibré"; break;
        case 'INTENSE_VINEGARY': profileName = "Intense et Vinaigré"; break;
    }
    let teaName = '';
    switch(teaTypeKey) {
        case 'BLACK_TEA': teaName = "Thé Noir"; break;
        case 'GREEN_TEA': teaName = "Thé Vert"; break;
        case 'MIXED_TEA': teaName = "Mélange"; break;
    }


  return {
    title: `Recette pour ${desiredVolumeL} L de Kombucha - Profil '${profileName}' au ${teaName}`,
    expectedTasteProfile,
    ingredients,
    instructions,
  };
}
