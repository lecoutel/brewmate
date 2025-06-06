import React, { useState, useEffect } from 'react';
import { PageLayout, Input, Select, Button, ResultDisplay, InfoTooltip } from '../components/Common';
import { PostBoilDensityInputs, PostBoilDensityResult, GravityUnit, PostBoilDensityResultOption } from '../types';
import { calculatePostBoilDensity } from '../utils/brewingCalculators';
import { GRAVITY_UNIT_OPTIONS, COMMON_CLASSES, Icons } from '../constants';

interface PostBoilDensityStringInputs {
  volumePostBoil: string;
  gravityUnit: GravityUnit;
  measuredGravity: string;
  targetGravity: string;
}

const PostBoilDensityScreen: React.FC = () => {
  const [inputs, setInputs] = useState<PostBoilDensityStringInputs>({
    volumePostBoil: "20",
    gravityUnit: GravityUnit.Brix,
    measuredGravity: "12.0",
    targetGravity: "12.5",
  });
  const [result, setResult] = useState<PostBoilDensityResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>("ex: 12.0");

  useEffect(() => {
    setPlaceholder(inputs.gravityUnit === GravityUnit.DI ? "ex: 1.048" : "ex: 12.0");
    setResult(null);
    setFormError('');
  }, [inputs.gravityUnit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    setResult(null);
    setFormError('');
  };
  
  const validateAndParseInputs = (): PostBoilDensityInputs | null => {
    const volumePostBoilNum = parseFloat(inputs.volumePostBoil);
    const measuredGravityNum = parseFloat(inputs.measuredGravity);
    const targetGravityNum = parseFloat(inputs.targetGravity);

    if (isNaN(volumePostBoilNum) || volumePostBoilNum <= 0 || 
        isNaN(measuredGravityNum) || measuredGravityNum <= 0 || 
        isNaN(targetGravityNum) || targetGravityNum <= 0) {
      setFormError("Toutes les valeurs numériques doivent être positives et valides.");
      return null;
    }
    if (inputs.gravityUnit === GravityUnit.DI && (measuredGravityNum < 1 || targetGravityNum < 1)) {
       setFormError("Pour la Densité spécifique, la valeur doit être >= 1.000 (ex: 1.052).");
       return null;
    }
    if (inputs.gravityUnit === GravityUnit.DI && (measuredGravityNum > 2 || targetGravityNum > 2 )) {
       setFormError("Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), et non la partie décimale seule (ex: 52).");
       return null;
    }
    setFormError('');
    return {
      volumePostBoil: volumePostBoilNum,
      gravityUnit: inputs.gravityUnit,
      measuredGravity: measuredGravityNum,
      targetGravity: targetGravityNum,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInputs = validateAndParseInputs();
    if (!parsedInputs) {
      setResult(null);
      return;
    }
    const calcResult = calculatePostBoilDensity(parsedInputs);
    setResult(calcResult);
  };

  const measuredNum = parseFloat(inputs.measuredGravity);
  const targetNum = parseFloat(inputs.targetGravity);
  const isCalculationDisabled = !isNaN(measuredNum) && !isNaN(targetNum) && measuredNum === targetNum;

  return (
    <PageLayout title="Correction Densité Fin d'Ébullition" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Volume Post-Ébullition (litres)"
          type="number"
          name="volumePostBoil"
          id="volumePostBoil"
          value={inputs.volumePostBoil}
          onChange={handleInputChange}
          step="0.1"
          min="0"
          placeholder="ex: 20"
          required
        />
        <Select
          label="Unité de Densité"
          name="gravityUnit"
          id="gravityUnit"
          value={inputs.gravityUnit}
          onChange={handleInputChange}
          options={GRAVITY_UNIT_OPTIONS}
        />
        <Input
          label={
            <div className="flex items-center">
              Densité Mesurée
              {inputs.gravityUnit === GravityUnit.DI && (
                <InfoTooltip infoText="Entrez la Densité Spécifique au format complet, par exemple '1.048' et non '48'." />
              )}
            </div>
          }
          type="number"
          name="measuredGravity"
          id="measuredGravity"
          value={inputs.measuredGravity}
          onChange={handleInputChange}
          step={inputs.gravityUnit === GravityUnit.DI ? "0.001" : "0.1"}
          min="0"
          placeholder={placeholder}
          required
        />
        <Input
          label="Densité Cible"
          type="number"
          name="targetGravity"
          id="targetGravity"
          value={inputs.targetGravity}
          onChange={handleInputChange}
          step={inputs.gravityUnit === GravityUnit.DI ? "0.001" : "0.1"}
          min="0"
          placeholder={placeholder}
          required
        />
        
        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}

        <Button type="submit" className="w-full" disabled={isCalculationDisabled || !!formError}>
          Calculer
        </Button>
      </form>

      {result && (
        <div className="mt-6">
          {result.error && <ResultDisplay results={result.error ? [result.error] : []} error={result.error} type="error"/>}
          {!result.error && result.message && (
            <div className={`p-4 rounded-lg mb-4 ${result.message.includes("Félicitations") ? COMMON_CLASSES.infoText : 'bg-yellow-50 dark:bg-yellow-900_bg_opacity_30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'}`}>
              <p className="font-semibold">{result.message}</p>
            </div>
          )}
          {!result.error && result.options && result.options.length > 0 && (
            <div className="space-y-3">
              {result.options.map((opt: PostBoilDensityResultOption, index: number) => (
                <div key={index} className={`p-4 rounded-lg ${COMMON_CLASSES.resultBox} border-opacity-50`}>
                  <p className={`${COMMON_CLASSES.resultText}`}>{opt.description}</p>
                  {opt.warning && (
                    <p className={`${COMMON_CLASSES.textMuted} mt-1 flex items-start`}>
                      <Icons.InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-yellow-500" />
                      <span>{opt.warning}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default PostBoilDensityScreen;
