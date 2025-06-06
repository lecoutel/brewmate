
import React, { useState } from 'react';
import { PageLayout, Input, Select, Button, COMMON_CLASSES, ResultDisplay } from '../components/Common';
import {
  KombuchaRecipeInputs,
  KombuchaRecipeResult,
  AromaticProfileKey,
  TeaTypeKey,
} from '../types';
import { generateKombuchaRecipe } from '../services/kombuchaCalculatorService';
import { KOMBUCHA_AROMATIC_PROFILE_OPTIONS, KOMBUCHA_TEA_TYPE_OPTIONS, Icons, THEME_COLORS } from '../constants'; // Added THEME_COLORS

const KombuchaGeneratorScreen: React.FC = () => {
  const [inputs, setInputs] = useState<KombuchaRecipeInputs>({
    desiredVolumeL: 4,
    aromaticProfileKey: 'CLASSIC_BALANCED',
    teaTypeKey: 'BLACK_TEA',
  });
  const [result, setResult] = useState<KombuchaRecipeResult | null>(null);
  const [formError, setFormError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'desiredVolumeL' ? parseFloat(value) || 0 : value,
    }));
    setResult(null); // Clear previous results on input change
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.desiredVolumeL <= 0) {
      setFormError('La quantité finale désirée doit être supérieure à 0.');
      setResult(null);
      return;
    }
    setFormError('');
    const recipeResult = generateKombuchaRecipe(inputs);
    setResult(recipeResult);
  };

  return (
    <PageLayout title="Générateur de Recette de Kombucha" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Quantité Finale Désirée (litres)"
          type="number"
          name="desiredVolumeL"
          id="desiredVolumeL"
          value={inputs.desiredVolumeL.toString()} // Input expects string
          onChange={handleInputChange}
          step="0.5"
          min="0.5"
          placeholder="ex: 4"
          required
        />
        <Select
          label="Profil Aromatique Souhaité"
          name="aromaticProfileKey"
          id="aromaticProfileKey"
          value={inputs.aromaticProfileKey}
          onChange={handleInputChange}
          options={KOMBUCHA_AROMATIC_PROFILE_OPTIONS}
        />
        <Select
          label="Type de Thé Utilisé"
          name="teaTypeKey"
          id="teaTypeKey"
          value={inputs.teaTypeKey}
          onChange={handleInputChange}
          options={KOMBUCHA_TEA_TYPE_OPTIONS}
        />

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}

        <Button type="submit" className="w-full">
          Générer la Recette
        </Button>
      </form>

      {result && result.error && (
        <ResultDisplay results={result.error} error={result.error} type="error" />
      )}

      {result && !result.error && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold text-light-on-background dark:text-dark-on-background">{result.title}</h2>

          <div className={`p-4 rounded-lg bg-[${COMMON_CLASSES.infoText.match(/bg-\S+/)?.[0]}] text-[${COMMON_CLASSES.infoText.match(/text-\S+/)?.[0]}] border border-blue-300 dark:border-blue-700 dark:bg-[${COMMON_CLASSES.infoText.match(/dark:bg-\S+/)?.[0].replace('dark:','')}] dark:text-[${COMMON_CLASSES.infoText.match(/dark:text-\S+/)?.[0].replace('dark:','')}]`}>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Icons.SparklesIcon className={`w-5 h-5 mr-2 text-[${THEME_COLORS.light.primary}] dark:text-[${THEME_COLORS.dark.primary}]`} />
              Profil de Goût Attendu
            </h3>
            <p className="text-sm">{result.expectedTasteProfile}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3 text-light-on-surface dark:text-dark-on-surface">Ingrédients :</h3>
            <ul className="list-none space-y-2">
              {result.ingredients.map((ing, index) => (
                <li key={index} className={`p-3 rounded-md bg-gray-50 dark:bg-gray-700 flex justify-between items-center shadow-sm`}>
                  <span className="text-light-on-surface dark:text-dark-on-surface">{ing.name}</span>
                  <span className={`font-medium text-[${THEME_COLORS.light.primary}] dark:text-[${THEME_COLORS.dark.primary}]`}>
                    {ing.amount} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-light-on-surface dark:text-dark-on-surface">Instructions (1ère Fermentation - F1) :</h3>
            <ol className="list-decimal list-outside space-y-3 pl-5">
              {result.instructions.map((step) => (
                <li key={step.step} className="text-light-on-surface dark:text-dark-on-surface leading-relaxed">
                  {step.text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default KombuchaGeneratorScreen;
