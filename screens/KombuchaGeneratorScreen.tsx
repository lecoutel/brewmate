import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, Select, Button, COMMON_CLASSES, ResultDisplay, SectionHeading, InfoPanel } from '../components/Common';
import {
  KombuchaRecipeInputs,
  KombuchaRecipeResult,
} from '../types';
import { generateKombuchaRecipe } from '../services/kombuchaCalculatorService';
import { KOMBUCHA_AROMATIC_PROFILE_OPTIONS, KOMBUCHA_TEA_TYPE_OPTIONS, Icons, THEME_COLORS } from '../constants'; // Added THEME_COLORS
import { usePersistentState } from '../hooks/usePersistentState';
import { useUrlParams } from '../hooks/useUrlParams';

const KombuchaGeneratorScreen: React.FC = () => {
  const initialInputs: KombuchaRecipeInputs = {
    desiredVolumeL: 4,
    aromaticProfileKey: 'CLASSIC_BALANCED',
    teaTypeKey: 'BLACK_TEA',
  };
  const [inputs, setInputs, clearInputsCache] = usePersistentState<KombuchaRecipeInputs>(
    'brewmate:kombucha:inputs',
    initialInputs
  );
  const [result, setResult] = useState<KombuchaRecipeResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [urlParams, setUrlParams] = useUrlParams();
  const hasHydratedFromUrlRef = useRef(false);

  useEffect(() => {
    if (hasHydratedFromUrlRef.current) return;
    hasHydratedFromUrlRef.current = true;
    const { volume, profile, tea } = urlParams;
    const updates: Partial<KombuchaRecipeInputs> = {};
    if (volume != null && volume !== '') {
      const v = parseFloat(volume);
      if (!isNaN(v) && v > 0) updates.desiredVolumeL = v;
    }
    if (profile === 'LIGHT_GENTLE' || profile === 'CLASSIC_BALANCED' || profile === 'INTENSE_VINEGARY') {
      updates.aromaticProfileKey = profile;
    }
    if (tea === 'BLACK_TEA' || tea === 'GREEN_TEA' || tea === 'MIXED_TEA') {
      updates.teaTypeKey = tea;
    }
    if (Object.keys(updates).length > 0) setInputs((prev) => ({ ...prev, ...updates }));
  }, [urlParams]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) return;
    setUrlParams({
      volume: String(inputs.desiredVolumeL),
      profile: inputs.aromaticProfileKey,
      tea: inputs.teaTypeKey,
    });
  }, [inputs.desiredVolumeL, inputs.aromaticProfileKey, inputs.teaTypeKey]);

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

  const handleClearInputs = () => {
    clearInputsCache();
    setResult(null);
    setFormError('');
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
        <Button type="button" variant="secondary" className="w-full" onClick={handleClearInputs}>
          Vider les champs
        </Button>
      </form>

      {result && result.error && (
        <ResultDisplay results={result.error} error={result.error} type="error" />
      )}

      {result && !result.error && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.title}</h2>

          <InfoPanel icon={Icons.SparklesIcon}>
            <strong className="block mb-1">Profil de Goût Attendu</strong>
            {result.expectedTasteProfile}
          </InfoPanel>

          <div>
            <SectionHeading icon={Icons.BeakerIcon}>Ingrédients</SectionHeading>
            <ul className="list-none space-y-2">
              {result.ingredients.map((ing, index) => (
                <li key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex justify-between items-center shadow-sm">
                  <span className="text-gray-900 dark:text-gray-100">{ing.name}</span>
                  <span className="font-semibold text-[#2563FF] dark:text-[#6b99ff]">
                    {ing.amount} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading icon={Icons.CogIcon}>Instructions (1ère Fermentation - F1)</SectionHeading>
            <ol className="list-decimal list-outside space-y-3 pl-5">
              {result.instructions.map((step) => (
                <li key={step.step} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {step.text}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-2 text-center">
            <Button variant="secondary" onClick={() => setResult(null)}>
              ← Nouvelle recette
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default KombuchaGeneratorScreen;
