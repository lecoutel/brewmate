import React, { useState, useEffect } from 'react';
import { PageLayout, Input, Select, Button, ResultDisplay, InfoTooltip } from '../components/Common';
import { RefractometerInputs, RefractometerResult, GravityUnit } from '../types';
import { calculateRefractometer } from '../utils/brewingCalculators';
import { GRAVITY_UNIT_OPTIONS, COMMON_CLASSES } from '../constants';

interface RefractometerStringInputs {
  gravityUnit: GravityUnit;
  initialDensity: string;
  finalMeasuredDensity: string;
}

const RefractometerScreen: React.FC = () => {
  const [inputs, setInputs] = useState<RefractometerStringInputs>({
    gravityUnit: GravityUnit.Brix,
    initialDensity: "16.0", 
    finalMeasuredDensity: "8.0",
  });
  const [result, setResult] = useState<RefractometerResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>("ex: 16.0");

  useEffect(() => {
    setPlaceholder(inputs.gravityUnit === GravityUnit.DI ? "ex: 1.065" : "ex: 16.0");
    setResult(null);
    setFormError('');
  }, [inputs.gravityUnit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    setResult(null);
    setFormError('');
  };
  
  const validateAndParseInputs = (): RefractometerInputs | null => {
    const initialDensityNum = parseFloat(inputs.initialDensity);
    const finalMeasuredDensityNum = parseFloat(inputs.finalMeasuredDensity);

    if (isNaN(initialDensityNum) || initialDensityNum <= 0 || 
        isNaN(finalMeasuredDensityNum) || finalMeasuredDensityNum <= 0) {
      setFormError("Les densités doivent être des valeurs numériques positives et valides.");
      return null;
    }
    if (inputs.gravityUnit === GravityUnit.DI && (initialDensityNum < 1 || finalMeasuredDensityNum < 1)) {
       setFormError("Pour la Densité spécifique, la valeur doit être >= 1.000 (ex: 1.052).");
       return null;
    }
     if (inputs.gravityUnit === GravityUnit.DI && (initialDensityNum > 2 || finalMeasuredDensityNum > 2 )) {
       setFormError("Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), et non la partie décimale seule (ex: 52).");
       return null;
    }
    if (finalMeasuredDensityNum >= initialDensityNum) {
      setFormError("La densité finale mesurée doit être inférieure à la densité initiale. La fermentation n'a peut-être pas commencé.");
      return null;
    }
    setFormError('');
    return {
      gravityUnit: inputs.gravityUnit,
      initialDensity: initialDensityNum,
      finalMeasuredDensity: finalMeasuredDensityNum,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInputs = validateAndParseInputs();
    if (!parsedInputs) {
      setResult(null);
      return;
    }
    const calcResult = calculateRefractometer(parsedInputs);
    setResult(calcResult);
  };
  
  const initialDensityNum = parseFloat(inputs.initialDensity);
  const finalMeasuredDensityNum = parseFloat(inputs.finalMeasuredDensity);
  const isSubmitDisabled = !!formError || 
                           isNaN(initialDensityNum) || isNaN(finalMeasuredDensityNum) || // Check if parsing failed
                           finalMeasuredDensityNum >= initialDensityNum;

  return (
    <PageLayout title="Correction Réfractomètre & Alcool" showBackButton>
      <div className="mb-6">
          <InfoTooltip 
            infoText={<span>L'alcool produit pendant la fermentation fausse la lecture de votre réfractomètre. Cet outil corrige cette lecture pour vous donner la vraie densité finale et le taux d'alcool de votre bière.</span>}
            className="w-full justify-start"
            iconClassName="w-5 h-5"
          >
            <h2 className={`${COMMON_CLASSES.label} text-lg`}>Pourquoi ce calculateur ?</h2>
          </InfoTooltip>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Unité de Densité (pour les deux lectures)"
          name="gravityUnit"
          id="gravityUnit"
          value={inputs.gravityUnit}
          onChange={handleInputChange}
          options={GRAVITY_UNIT_OPTIONS}
        />
        <Input
          label={
            <div className="flex items-center">
              Densité Initiale (OG)
              {inputs.gravityUnit === GravityUnit.DI && (
                <InfoTooltip infoText="Entrez la Densité Spécifique au format '1.XXX'." />
              )}
            </div>
          }
          type="number"
          name="initialDensity"
          id="initialDensity"
          value={inputs.initialDensity}
          onChange={handleInputChange}
          step={inputs.gravityUnit === GravityUnit.DI ? "0.001" : "0.1"}
          min="0"
          placeholder={placeholder}
          required
        />
        <Input
          label={
            <div className="flex items-center">
              Lecture Finale du Réfractomètre (après fermentation)
               {inputs.gravityUnit === GravityUnit.DI && (
                <InfoTooltip infoText="Entrez la lecture finale en Densité Spécifique au format '1.XXX'. Cette valeur sera traitée pour le calcul." />
              )}
            </div>
          }
          type="number"
          name="finalMeasuredDensity"
          id="finalMeasuredDensity"
          value={inputs.finalMeasuredDensity}
          onChange={handleInputChange}
          step={inputs.gravityUnit === GravityUnit.DI ? "0.001" : "0.1"}
          min="0"
          placeholder={placeholder}
          required
        />

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}
        
        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          Calculer
        </Button>
      </form>

      {result && (
         <ResultDisplay 
            results={result.message.split('\n')}
            error={result.error} 
            type={result.error ? 'error' : 'success'}
        />
      )}
    </PageLayout>
  );
};

export default RefractometerScreen;
