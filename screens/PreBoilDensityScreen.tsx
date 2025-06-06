import React, { useState, useEffect } from 'react';
import { PageLayout, Input, Select, Button, ResultDisplay, InfoTooltip } from '../components/Common';
import { PreBoilDensityInputs, PreBoilDensityResult, GravityUnit } from '../types';
import { calculatePreBoilDensity } from '../utils/brewingCalculators';
import { GRAVITY_UNIT_OPTIONS, COMMON_CLASSES } from '../constants';

interface PreBoilDensityStringInputs {
  volumePreBoil: string;
  gravityUnit: GravityUnit;
  measuredGravity: string;
  targetGravity: string;
}

const PreBoilDensityScreen: React.FC = () => {
  const [inputs, setInputs] = useState<PreBoilDensityStringInputs>({
    volumePreBoil: "25",
    gravityUnit: GravityUnit.Brix,
    measuredGravity: "13.0",
    targetGravity: "12.5",
  });
  const [result, setResult] = useState<PreBoilDensityResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>("ex: 13.0");


  useEffect(() => {
    if (inputs.gravityUnit === GravityUnit.DI) { // DI is now "Densité Spécifique"
      setPlaceholder("ex: 1.052");
    } else {
      setPlaceholder("ex: 13.0");
    }
     setResult(null); 
     setFormError('');
  }, [inputs.gravityUnit]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    setResult(null);
    setFormError('');
  };
  
  const validateAndParseInputs = (): PreBoilDensityInputs | null => {
    const volumePreBoilNum = parseFloat(inputs.volumePreBoil);
    const measuredGravityNum = parseFloat(inputs.measuredGravity);
    const targetGravityNum = parseFloat(inputs.targetGravity);

    if (isNaN(volumePreBoilNum) || volumePreBoilNum <= 0 || 
        isNaN(measuredGravityNum) || measuredGravityNum <= 0 || 
        isNaN(targetGravityNum) || targetGravityNum <= 0) {
      setFormError("Toutes les valeurs numériques doivent être positives et valides.");
      return null;
    }
    if (inputs.gravityUnit === GravityUnit.DI && (measuredGravityNum < 1 || targetGravityNum < 1 )) {
       setFormError("Pour la Densité spécifique, la valeur doit être >= 1.000 (ex: 1.052).");
       return null;
    }
     if (inputs.gravityUnit === GravityUnit.DI && (measuredGravityNum > 2 || targetGravityNum > 2 )) {
       setFormError("Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), et non la partie décimale seule (ex: 52).");
       return null;
    }
    setFormError('');
    return {
      volumePreBoil: volumePreBoilNum,
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
    const calcResult = calculatePreBoilDensity(parsedInputs);
    setResult(calcResult);
  };
  
  const measuredNum = parseFloat(inputs.measuredGravity);
  const targetNum = parseFloat(inputs.targetGravity);
  const isCalculationDisabled = !isNaN(measuredNum) && !isNaN(targetNum) && measuredNum === targetNum;


  return (
    <PageLayout title="Correction Densité Pré-Ébullition" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Volume Pré-Ébullition (litres)"
          type="number"
          name="volumePreBoil"
          id="volumePreBoil"
          value={inputs.volumePreBoil}
          onChange={handleInputChange}
          step="0.1"
          min="0"
          placeholder="ex: 25"
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
                <InfoTooltip infoText="Entrez la Densité Spécifique au format complet, par exemple '1.052' et non '52'." />
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
        <ResultDisplay 
            results={<span style={result.message && (result.message.includes('La densité est trop basse') || result.message.includes('La densité est trop haute')) ? { color: '#181A1B', fontWeight: 'bold' } : {}}>{result.message}</span>} 
            error={result.error} 
            type={result.error ? 'error' : (result.message.includes("déjà à la cible") ? 'info' : 'success')}
        />
      )}
    </PageLayout>
  );
};

export default PreBoilDensityScreen;
