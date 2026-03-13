import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, ResultDisplay, InfoTooltip, DensityInputGroup } from '../components/Common';
import { RefractometerInputs, RefractometerResult, GravityUnit } from '../types';
import { calculateRefractometer, sgToBrix, sgToPlato } from '../utils/brewingCalculators';
import { useUrlParams } from '../hooks/useUrlParams';
import { COMMON_CLASSES } from '../constants';
import { usePersistentState } from '../hooks/usePersistentState';
import FormulaInfoSection, { FormulaEntry } from '../components/FormulaInfoSection';

interface RefractometerStringInputs {
  initialSg: string;
  initialBrix: string;
  initialPlato: string;
  finalSg: string;
  finalBrix: string;
  finalPlato: string;
}

const RefractometerScreen: React.FC = () => {
  const [tool, setTool, clearToolCache] = usePersistentState<'hydrometer' | 'refractometer'>(
    'brewmate:abv:tool',
    'hydrometer'
  );
  const initialInputs: RefractometerStringInputs = {
    initialSg: "",
    initialBrix: "",
    initialPlato: "",
    finalSg: "",
    finalBrix: "",
    finalPlato: "",
  };
  const [inputs, setInputs, clearInputsCache] = usePersistentState<RefractometerStringInputs>(
    'brewmate:abv:inputs',
    initialInputs
  );
  const [result, setResult] = useState<RefractometerResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [urlParams, setUrlParams] = useUrlParams();
  const hasHydratedFromUrlRef = useRef(false);

  useEffect(() => {
    if (hasHydratedFromUrlRef.current) return;
    hasHydratedFromUrlRef.current = true;
    const { tool: t, initialSg, finalSg } = urlParams;
    if (t === 'hydrometer' || t === 'refractometer') setTool(t);
    if (initialSg || finalSg) {
      const initialNum = initialSg ? parseFloat(initialSg) : NaN;
      const finalNum = finalSg ? parseFloat(finalSg) : NaN;
      setInputs((prev) => ({
        ...prev,
        ...(initialSg != null && initialSg !== '' && !isNaN(initialNum) && {
          initialSg,
          initialBrix: sgToBrix(initialNum).toFixed(1),
          initialPlato: sgToPlato(initialNum).toFixed(1),
        }),
        ...(finalSg != null && finalSg !== '' && !isNaN(finalNum) && {
          finalSg,
          finalBrix: sgToBrix(finalNum).toFixed(1),
          finalPlato: sgToPlato(finalNum).toFixed(1),
        }),
      }));
    }
  }, [urlParams]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) return;
    setUrlParams({
      tool,
      initialSg: inputs.initialSg || undefined,
      finalSg: inputs.finalSg || undefined,
    });
  }, [tool, inputs.initialSg, inputs.finalSg]);

  useEffect(() => {
    // Migration one-shot: clear legacy demo defaults from persisted storage.
    const hasLegacyDefaults =
      inputs.initialSg === "1.065" &&
      inputs.initialBrix === "16.0" &&
      inputs.initialPlato === "16.0" &&
      inputs.finalSg === "1.032" &&
      inputs.finalBrix === "8.0" &&
      inputs.finalPlato === "8.0";

    if (hasLegacyDefaults) {
      setInputs({
        initialSg: '',
        initialBrix: '',
        initialPlato: '',
        finalSg: '',
        finalBrix: '',
        finalPlato: '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearInputs = () => {
    clearInputsCache();
    clearToolCache();
    setFormError('');
    setResult(null);
  };

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
        // Hydrometer calculation: Tabarie formula (more accurate than * 131.25)
        const abv = (76.08 * (parsedInputs.initialDensity - parsedInputs.finalMeasuredDensity) / (1.775 - parsedInputs.initialDensity)) * (parsedInputs.finalMeasuredDensity / 0.794);
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

  // Derived values for formula demonstration
  const _ogNum = parseFloat(inputs.initialSg);
  const _fgNum = parseFloat(inputs.finalSg);
  const _hasResult = !!result && !result.error;
  const _ogBrix = (!isNaN(_ogNum) && _ogNum >= 1) ? sgToBrix(_ogNum) : 0;
  const _fgBrix = (!isNaN(_fgNum) && _fgNum >= 1) ? sgToBrix(_fgNum) : 0;

  return (
    <PageLayout title="Calcul % Abv" showBackButton>
      <div className="mb-6 space-y-4">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 calculator:bg-calc-bg calculator:border calculator:border-calc-border rounded-lg calculator:rounded-none w-full max-w-md mx-auto">
            <button
              onClick={() => setTool('hydrometer')}
              className={`flex-1 py-2 px-4 rounded-md calculator:rounded-none text-sm font-medium transition-all duration-200 ${
                tool === 'hydrometer'
? 'bg-white dark:bg-gray-700 calculator:bg-calc-bg-card shadow-sm calculator:shadow-mac text-gray-900 dark:text-gray-100 calculator:text-calc-text'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 calculator:text-calc-text-muted calculator:hover:text-calc-text'
              }`}
            >
              Densimètre
            </button>
            <button
              onClick={() => setTool('refractometer')}
              className={`flex-1 py-2 px-4 rounded-md calculator:rounded-none text-sm font-medium transition-all duration-200 ${
                tool === 'refractometer'
? 'bg-white dark:bg-gray-700 calculator:bg-calc-bg-card shadow-sm calculator:shadow-mac text-gray-900 dark:text-gray-100 calculator:text-calc-text'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 calculator:text-calc-text-muted calculator:hover:text-calc-text'
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

        <button
          type="button"
          onClick={handleClearInputs}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 calculator:bg-calc-bg-surface hover:bg-gray-200 dark:hover:bg-gray-600 calculator:hover:bg-calc-border text-gray-700 dark:text-gray-200 calculator:text-calc-text text-sm font-semibold rounded-lg transition-colors"
        >
          Vider les champs
        </button>
      </div>

      {result && (
         <div className="mt-8 space-y-4">
            {result.error ? (
              <ResultDisplay results={[]} error={result.error} type="error" />
            ) : (
              <>
                <div className="bg-green-50 dark:bg-green-900/30 calculator:bg-calc-bg-card border border-green-200 dark:border-green-800 calculator:border-calc-border rounded-xl calculator:rounded-none p-6 text-center shadow-sm calculator:shadow-mac">
                  <p className="text-sm text-green-700 dark:text-green-400 calculator:text-calc-text-muted font-medium uppercase tracking-wider mb-1">Taux d'alcool estimé (ABV)</p>
                  <div className="text-5xl font-black text-green-800 dark:text-green-200 calculator:text-calc-text">
                    {result.abv} %
                  </div>
                </div>

                {tool === 'refractometer' && (
<div className="bg-white dark:bg-gray-800 calculator:bg-calc-bg-card border border-gray-200 dark:border-gray-700 calculator:border-calc-border rounded-xl calculator:rounded-none p-5 shadow-sm calculator:shadow-mac">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted uppercase tracking-wider mb-3">Densité finale corrigée</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mb-1">SG</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">
                          {result.correctedFinalGravity.toFixed(3)}
                        </div>
                      </div>
                      <div className="text-center border-x border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mb-1">°Brix</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">
                          {sgToBrix(result.correctedFinalGravity).toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mb-1">°Plato</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">
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

      {/* Méthodes & Sources — uniquement lorsqu'il y a des résultats */}
      {_hasResult && (
      <FormulaInfoSection
        entries={
          tool === 'refractometer'
            ? ([
                {
                  name: 'Correction réfractomètre — Terrill (2011)',
                  description:
                    "L'alcool produit pendant la fermentation fausse la lecture du réfractomètre. Ce polynôme cubique, dérivé empiriquement par Sean Terrill, corrige la densité finale mesurée (Rf) en tenant compte de la densité initiale (Ri), les deux en °Brix.",
                  formulas: [
                    'FG = 1.0000 − 0.0044993·Ri + 0.011774·Rf',
                    '       + 0.00027581·Ri² − 0.00012717·Rf²',
                    '       − 0.0000072800·Ri³ + 0.0000063293·Rf³',
                    '',
                    'Ri = OG en °Brix (lecture initiale)',
                    'Rf = FG en °Brix (lecture finale non corrigée)',
                  ],
                  computed: _hasResult ? [
                    `Ri = ${_ogBrix.toFixed(2)} °Brix  (OG = ${_ogNum.toFixed(3)})`,
                    `Rf = ${_fgBrix.toFixed(2)} °Brix  (FG mesurée = ${_fgNum.toFixed(3)})`,
                    ``,
                    `FG corrigée = ${result!.correctedFinalGravity.toFixed(3)}`,
                  ] : undefined,
                  sources: [
                    {
                      label: 'Sean Terrill — Revisiting the Refractometer (2011)',
                      url: 'https://seanterrill.com/2011/04/07/refractometer-fg-results/',
                    },
                    {
                      label: "Brewer's Friend — Refractometer Calculator",
                      url: 'https://www.brewersfriend.com/refractometer-calculator/',
                    },
                  ],
                },
                {
                  name: 'SG → °Brix (ASBC)',
                  description:
                    "Polynôme de régression de l'ASBC pour convertir la densité spécifique en degrés Brix.",
                  formulas: [
                    'Brix = −668.962 + 1262.45·SG − 776.43·SG² + 182.94·SG³',
                  ],
                  computed: _hasResult ? [
                    `SG_OG = ${_ogNum.toFixed(3)}  →  ${_ogBrix.toFixed(2)} °Brix`,
                    `SG_FG = ${_fgNum.toFixed(3)}  →  ${_fgBrix.toFixed(2)} °Brix`,
                  ] : undefined,
                  sources: [
                    {
                      label: 'ASBC — Methods of Analysis',
                      url: 'https://www.asbcnet.org/',
                    },
                  ],
                },
                {
                  name: "Taux d'alcool — Formule de Tabarie (Balling, 1865)",
                  description:
                    "Plus précise que la formule linéaire × 131.25, notamment pour les bières fortes (ABV > 8 %). Prend en compte la densité résiduelle du moût fermenté.",
                  formulas: [
                    'ABV = (76.08 × (OG − FG) / (1.775 − OG)) × (FG / 0.794)',
                  ],
                  computed: _hasResult ? [
                    `OG = ${_ogNum.toFixed(3)},  FG corrigée = ${result!.correctedFinalGravity.toFixed(3)}`,
                    `ABV = (76.08 × (${_ogNum.toFixed(3)} − ${result!.correctedFinalGravity.toFixed(3)}) / (1.775 − ${_ogNum.toFixed(3)})) × (${result!.correctedFinalGravity.toFixed(3)} / 0.794)`,
                    `    = ${result!.abv} %`,
                  ] : undefined,
                  sources: [
                    {
                      label: "Brewer's Friend — ABV Calculator (avec démonstration)",
                      url: 'https://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/',
                    },
                  ],
                },
              ] as FormulaEntry[])
            : ([
                {
                  name: "Taux d'alcool — Formule de Tabarie (Balling, 1865)",
                  description:
                    "Plus précise que la formule linéaire × 131.25, notamment pour les bières fortes (ABV > 8 %). Prend en compte la densité résiduelle du moût fermenté.",
                  formulas: [
                    'ABV = (76.08 × (OG − FG) / (1.775 − OG)) × (FG / 0.794)',
                    '',
                    'OG = densité initiale (Original Gravity)',
                    'FG = densité finale (Final Gravity)',
                  ],
                  computed: _hasResult ? [
                    `OG = ${_ogNum.toFixed(3)},  FG = ${_fgNum.toFixed(3)}`,
                    `ABV = (76.08 × (${_ogNum.toFixed(3)} − ${_fgNum.toFixed(3)}) / (1.775 − ${_ogNum.toFixed(3)})) × (${_fgNum.toFixed(3)} / 0.794)`,
                    `    = ${result!.abv} %`,
                  ] : undefined,
                  sources: [
                    {
                      label: "Brewer's Friend — ABV Calculator (avec démonstration)",
                      url: 'https://www.brewersfriend.com/2011/06/16/alcohol-by-volume-calculator-updated/',
                    },
                  ],
                },
              ] as FormulaEntry[])
        }
      />
      )}
    </PageLayout>
  );
};

export default RefractometerScreen;
