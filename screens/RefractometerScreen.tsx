import React, { useState, useEffect } from 'react';
import { PageLayout, ResultDisplay, InfoTooltip, DensityInputGroup } from '../components/Common';
import { RefractometerInputs, RefractometerResult, GravityUnit } from '../types';
import { calculateRefractometer, sgToBrix, sgToPlato } from '../utils/brewingCalculators';
import { COMMON_CLASSES } from '../constants';

interface RefractometerStringInputs {
  initialSg: string;
  initialBrix: string;
  initialPlato: string;
  finalSg: string;
  finalBrix: string;
  finalPlato: string;
}

const RefractometerScreen: React.FC = () => {
  const [tool, setTool] = useState<'hydrometer' | 'refractometer'>('hydrometer');
  const [inputs, setInputs] = useState<RefractometerStringInputs>({
    initialSg: "1.065",
    initialBrix: "16.0", 
    initialPlato: "16.0",
    finalSg: "1.032",
    finalBrix: "8.0",
    finalPlato: "8.0",
  });
  const [result, setResult] = useState<RefractometerResult | null>(null);
  const [formError, setFormError] = useState<string>('');

  const validateAndParseInputs = (): RefractometerInputs | null => {
    const initialDensityNum = parseFloat(inputs.initialSg);
    const finalMeasuredDensityNum = parseFloat(inputs.finalSg);

    if (isNaN(initialDensityNum) || initialDensityNum <= 0 || 
        isNaN(finalMeasuredDensityNum) || finalMeasuredDensityNum <= 0) {
      setFormError("Les densités doivent être des valeurs numériques positives et valides.");
      return null;
    }
    if (initialDensityNum < 1 || finalMeasuredDensityNum < 1) {
       setFormError("Pour la Densité spécifique, la valeur doit être >= 1.000 (ex: 1.052).");
       return null;
    }
    if (initialDensityNum > 2 || finalMeasuredDensityNum > 2) {
       setFormError("Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), et non la partie décimale seule (ex: 52).");
       return null;
    }
    if (finalMeasuredDensityNum >= initialDensityNum) {
      setFormError("La densité finale mesurée doit être inférieure à la densité initiale. La fermentation n'a peut-être pas commencé.");
      return null;
    }
    setFormError('');
    return {
      gravityUnit: GravityUnit.DI, // We always calculate using SG now
      initialDensity: initialDensityNum,
      finalMeasuredDensity: finalMeasuredDensityNum,
    };
  };

  useEffect(() => {
    const parsedInputs = validateAndParseInputs();
    if (parsedInputs) {
      if (tool === 'refractometer') {
        const calcResult = calculateRefractometer(parsedInputs);
        setResult(calcResult);
      } else {
        // Hydrometer calculation: simple ABV formula
        const abv = (parsedInputs.initialDensity - parsedInputs.finalMeasuredDensity) * 131.25;
        setResult({
          correctedFinalGravity: parsedInputs.finalMeasuredDensity,
          abv: parseFloat(abv.toFixed(2)),
          message: `Taux d'alcool (ABV) estimé : ${abv.toFixed(2)} %`
        });
      }
    } else {
      setResult(null);
    }
  }, [inputs, tool]);

  return (
    <PageLayout title="Calcul % Abv" showBackButton>
      <div className="mb-6 space-y-4">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full max-w-md mx-auto">
            <button
              onClick={() => setTool('hydrometer')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                tool === 'hydrometer' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-light-on-surface dark:text-dark-on-surface' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Densimètre
            </button>
            <button
              onClick={() => setTool('refractometer')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                tool === 'refractometer' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-light-on-surface dark:text-dark-on-surface' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Réfractomètre
            </button>
          </div>

          <InfoTooltip 
            infoText={tool === 'refractometer' 
              ? "L'alcool produit pendant la fermentation fausse la lecture de votre réfractomètre. Cet outil corrige cette lecture pour vous donner la vraie densité finale et le taux d'alcool de votre bière."
              : "Le densimètre donne une lecture directe de la densité. Le calcul de l'ABV est basé sur la différence entre la densité initiale (OG) et la densité finale (FG)."}
            className="w-full justify-start"
            iconClassName="w-5 h-5"
          >
            <h2 className={`${COMMON_CLASSES.label} text-lg`}>
              {tool === 'refractometer' ? 'Correction Réfractomètre' : 'Calcul ABV (Densimètre)'}
            </h2>
          </InfoTooltip>
      </div>
      <div className="space-y-6">
        <DensityInputGroup
          label="Densité Initiale (OG)"
          sgValue={inputs.initialSg}
          brixValue={inputs.initialBrix}
          platoValue={inputs.initialPlato}
          onSgChange={(val) => setInputs(prev => ({ ...prev, initialSg: val }))}
          onBrixChange={(val) => setInputs(prev => ({ ...prev, initialBrix: val }))}
          onPlatoChange={(val) => setInputs(prev => ({ ...prev, initialPlato: val }))}
        />

        <DensityInputGroup
          label={tool === 'refractometer' ? "Lecture Finale du Réfractomètre" : "Densité Finale (FG)"}
          sgValue={inputs.finalSg}
          brixValue={inputs.finalBrix}
          platoValue={inputs.finalPlato}
          onSgChange={(val) => setInputs(prev => ({ ...prev, finalSg: val }))}
          onBrixChange={(val) => setInputs(prev => ({ ...prev, finalBrix: val }))}
          onPlatoChange={(val) => setInputs(prev => ({ ...prev, finalPlato: val }))}
        />

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}
      </div>

      {result && (
         <div className="mt-8 space-y-4">
            {result.error ? (
              <ResultDisplay results={[]} error={result.error} type="error" />
            ) : (
              <>
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium uppercase tracking-wider mb-1">Taux d'alcool estimé (ABV)</p>
                  <div className="text-5xl font-black text-green-800 dark:text-green-200">
                    {result.abv} %
                  </div>
                </div>

                {tool === 'refractometer' && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Densité finale corrigée</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">SG</div>
                        <div className="text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                          {result.correctedFinalGravity.toFixed(3)}
                        </div>
                      </div>
                      <div className="text-center border-x border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">°Brix</div>
                        <div className="text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                          {sgToBrix(result.correctedFinalGravity).toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">°Plato</div>
                        <div className="text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                          {sgToPlato(result.correctedFinalGravity).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
         </div>
      )}
    </PageLayout>
  );
};

export default RefractometerScreen;
