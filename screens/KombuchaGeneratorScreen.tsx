import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, Select, Button, COMMON_CLASSES, ResultDisplay, SectionHeading } from '../components/Common';
import {
  KombuchaRecipeInputs,
  KombuchaRecipeResult,
} from '../types';
import { generateKombuchaRecipe } from '../services/kombuchaCalculatorService';
import { KOMBUCHA_PROFILES } from '../services/kombuchaData';
import {
  KOMBUCHA_AROMATIC_PROFILE_OPTIONS,
  KOMBUCHA_TEA_TYPE_OPTIONS,
  KOMBUCHA_PROFILE_HELP,
  KOMBUCHA_TEA_HELP,
  Icons,
} from '../constants';
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
      ...(name === 'desiredVolumeL' ? { desiredVolumeL: parseFloat(value) || 0 } : { [name]: value }),
    }));
    setResult(null);
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
          value={inputs.desiredVolumeL.toString()}
          onChange={handleInputChange}
          step="0.5"
          min="0.5"
          placeholder="ex: 4"
          required
        />
        <div>
          <Select
            label="Profil Aromatique Souhaité"
            name="aromaticProfileKey"
            id="aromaticProfileKey"
            value={inputs.aromaticProfileKey}
            onChange={handleInputChange}
            options={KOMBUCHA_AROMATIC_PROFILE_OPTIONS}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted">{KOMBUCHA_PROFILE_HELP}</p>
        </div>
        <div>
          <Select
            label="Type de Thé Utilisé"
            name="teaTypeKey"
            id="teaTypeKey"
            value={inputs.teaTypeKey}
            onChange={handleInputChange}
            options={KOMBUCHA_TEA_TYPE_OPTIONS}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted">{KOMBUCHA_TEA_HELP}</p>
        </div>

        <div className="rounded-lg calculator:rounded-none border border-gray-200 dark:border-gray-600 calculator:border-calc-border bg-gray-50/50 dark:bg-gray-800/50 calculator:bg-calc-bg p-4">
          <strong className="block mb-1 text-gray-900 dark:text-gray-100 calculator:text-calc-text">Profil de goût attendu</strong>
          <p className="text-gray-700 dark:text-gray-300 calculator:text-calc-text-muted text-sm">
            {KOMBUCHA_PROFILES[inputs.aromaticProfileKey]?.descriptions[inputs.teaTypeKey] ?? '—'}
          </p>
        </div>

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">{result.title}</h2>

          <div>
            <strong className="block mb-1 text-gray-900 dark:text-gray-100 calculator:text-calc-text">Profil de goût attendu</strong>
            <p className="text-gray-700 dark:text-gray-300 calculator:text-calc-text-muted">
              {result.expectedTasteProfile}
            </p>
          </div>

          <div>
            <SectionHeading icon={Icons.BeakerIcon}>Ingrédients</SectionHeading>
            <ul className="list-none space-y-2">
              {result.ingredients.map((ing, index) => (
                <li key={index} className="p-3 rounded-lg calculator:rounded-none bg-gray-50 dark:bg-gray-700 calculator:bg-calc-bg flex justify-between items-center shadow-sm calculator:shadow-none calculator:border calculator:border-calc-border">
                  <span className="text-gray-900 dark:text-gray-100 calculator:text-calc-text">{ing.name}</span>
                  <span className="font-semibold text-[#2563FF] dark:text-[#6b99ff] calculator:text-calc-text">
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
                <li key={step.step} className="text-gray-700 dark:text-gray-300 calculator:text-calc-text-muted leading-relaxed">
                  {step.text}
                </li>
              ))}
            </ol>
            <div className="mt-3 space-y-3 text-sm text-amber-800 dark:text-amber-200 calculator:text-calc-text rounded-lg calculator:rounded-none bg-amber-50 dark:bg-amber-900/20 calculator:bg-calc-bg-card p-4 border border-amber-200 dark:border-amber-800 calculator:border-calc-border">
              <p className="font-medium">Conseils de sécurité</p>
              <p><strong>Eau</strong> — Utilisez de l'eau filtrée ou de source. Si vous n'avez que l'eau du robinet : faites-la bouillir ou laissez-la reposer 24 h à l'air libre avant de l'utiliser.</p>
              <p><strong>À jeter (moisissure)</strong> — En surface du liquide ou du SCOBY : aspect sec, duveteux, velu ou poudreux ; couleurs blanc vif, vert, bleu, gris ou noir. → Jetez tout (liquide + SCOBY) et désinfectez le matériel.</p>
              <p><strong>Normal (à garder)</strong> — Sédiments bruns dans le liquide ou sous le SCOBY ; nouvelle membrane translucide à la surface (bébé SCOBY). C'est bon signe.</p>
              <p className="text-amber-900 dark:text-amber-100 font-medium">En cas de doute, ne pas consommer.</p>
              <p><strong>Matériel</strong> — Privilégiez un récipient en verre ou en inox alimentaire (304/316). Évitez les récipients en métal non alimentaire ou en céramique émaillée non garantie sans plomb.</p>
            </div>
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
