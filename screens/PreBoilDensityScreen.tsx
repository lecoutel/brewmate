import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, ResultDisplay, DensityInputGroup, ResultActionCard, SectionHeading, ResultHero } from '../components/Common';
import { PreBoilDensityInputs, PreBoilDensityResult, GravityUnit, DensityCorrectionOption } from '../types';
import { calculatePreBoilDensity, sgToBrix, sgToPlato } from '../utils/brewingCalculators';
import { COMMON_CLASSES, Icons } from '../constants';
import { usePersistentState } from '../hooks/usePersistentState';
import { useUrlParams } from '../hooks/useUrlParams';
import FormulaInfoSection from '../components/FormulaInfoSection';

interface PreBoilDensityStringInputs {
  volumePreBoil: string;
  measuredSg: string;
  measuredBrix: string;
  measuredPlato: string;
  targetSg: string;
  targetBrix: string;
  targetPlato: string;
}

const PreBoilDensityScreen: React.FC = () => {
  const initialInputs: PreBoilDensityStringInputs = {
    volumePreBoil: "25",
    measuredSg: "",
    measuredBrix: "",
    measuredPlato: "",
    targetSg: "",
    targetBrix: "",
    targetPlato: "",
  };
  const [inputs, setInputs, clearInputsCache] = usePersistentState<PreBoilDensityStringInputs>(
    'brewmate:preboil:inputs',
    initialInputs
  );
  const [result, setResult] = useState<PreBoilDensityResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [urlParams, setUrlParams] = useUrlParams();
  const hasHydratedFromUrlRef = useRef(false);

  useEffect(() => {
    if (hasHydratedFromUrlRef.current) return;
    hasHydratedFromUrlRef.current = true;
    const { volumePreBoil, measuredSg, targetSg } = urlParams;
    if (volumePreBoil || measuredSg || targetSg) {
      const measuredNum = measuredSg ? parseFloat(measuredSg) : NaN;
      const targetNum = targetSg ? parseFloat(targetSg) : NaN;
      setInputs((prev) => ({
        ...prev,
        ...(volumePreBoil != null && volumePreBoil !== '' && { volumePreBoil }),
        ...(measuredSg != null && measuredSg !== '' && !isNaN(measuredNum) && {
          measuredSg,
          measuredBrix: sgToBrix(measuredNum).toFixed(1),
          measuredPlato: sgToPlato(measuredNum).toFixed(1),
        }),
        ...(targetSg != null && targetSg !== '' && !isNaN(targetNum) && {
          targetSg,
          targetBrix: sgToBrix(targetNum).toFixed(1),
          targetPlato: sgToPlato(targetNum).toFixed(1),
        }),
      }));
    }
  }, [urlParams]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) return;
    setUrlParams({
      volumePreBoil: inputs.volumePreBoil || undefined,
      measuredSg: inputs.measuredSg || undefined,
      targetSg: inputs.targetSg || undefined,
    });
  }, [inputs.volumePreBoil, inputs.measuredSg, inputs.targetSg]);

  useEffect(() => {
    // Migration one-shot: clear legacy demo defaults from persisted storage.
    const hasLegacyDefaults =
      inputs.measuredSg === "1.053" &&
      inputs.measuredBrix === "13.0" &&
      inputs.measuredPlato === "13.0" &&
      inputs.targetSg === "1.050" &&
      inputs.targetBrix === "12.5" &&
      inputs.targetPlato === "12.5";

    if (hasLegacyDefaults) {
      setInputs(prev => ({
        ...prev,
        measuredSg: '',
        measuredBrix: '',
        measuredPlato: '',
        targetSg: '',
        targetBrix: '',
        targetPlato: '',
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleClearInputs = () => {
    clearInputsCache();
    setFormError('');
    setResult(null);
  };
  
  const validateAndParseInputs = (): PreBoilDensityInputs | null => {
    const volumePreBoilNum = parseFloat(inputs.volumePreBoil);
    const measuredGravityNum = parseFloat(inputs.measuredSg);
    const targetGravityNum = parseFloat(inputs.targetSg);

    if (isNaN(volumePreBoilNum) || volumePreBoilNum <= 0 || 
        isNaN(measuredGravityNum) || measuredGravityNum <= 0 || 
        isNaN(targetGravityNum) || targetGravityNum <= 0) {
      setFormError("Toutes les valeurs numériques doivent être positives et valides.");
      return null;
    }
    if (measuredGravityNum < 1 || targetGravityNum < 1) {
       setFormError("Pour la Densité spécifique, la valeur doit être >= 1.000 (ex: 1.052).");
       return null;
    }
     if (measuredGravityNum > 2 || targetGravityNum > 2) {
       setFormError("Pour la Densité spécifique, entrez la valeur complète (ex: 1.052), et non la partie décimale seule (ex: 52).");
       return null;
    }
    setFormError('');
    return {
      volumePreBoil: volumePreBoilNum,
      gravityUnit: GravityUnit.DI, // We always calculate using SG now
      measuredGravity: measuredGravityNum,
      targetGravity: targetGravityNum,
    };
  };

  useEffect(() => {
    const parsedInputs = validateAndParseInputs();
    if (parsedInputs) {
      const calcResult = calculatePreBoilDensity(parsedInputs);
      setResult(calcResult);
    } else {
      setResult(null);
    }
  }, [inputs]);

  // Derived values for formula demonstration
  const _msNum  = parseFloat(inputs.measuredSg);
  const _tsNum  = parseFloat(inputs.targetSg);
  const _volNum = parseFloat(inputs.volumePreBoil);
  const _ok = !!result && !result.error && !isNaN(_msNum) && !isNaN(_tsNum) && !isNaN(_volNum) && _msNum >= 1 && _tsNum >= 1 && _volNum > 0;
  const _pdActuel = _ok ? (_msNum - 1) * 1000 : 0;
  const _pdCible  = _ok ? (_tsNum - 1) * 1000  : 0;
  const _vCible   = (_ok && _pdCible > 0) ? (_volNum * _pdActuel) / _pdCible : 0;
  const _isDiluting      = _ok && _pdActuel > _pdCible;
  const _isConcentrating = _ok && _pdCible  > _pdActuel;
  const _sugarDeficit    = _isConcentrating ? (_pdCible - _pdActuel) * _volNum : 0;

  return (
    <PageLayout title="Correction Densité Pré-Ébullition" showBackButton>
      <div className="space-y-6">
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
        
        <DensityInputGroup
          label="Densité Mesurée"
          sgValue={inputs.measuredSg}
          brixValue={inputs.measuredBrix}
          platoValue={inputs.measuredPlato}
          onSgChange={(val) => setInputs(prev => ({ ...prev, measuredSg: val }))}
          onBrixChange={(val) => setInputs(prev => ({ ...prev, measuredBrix: val }))}
          onPlatoChange={(val) => setInputs(prev => ({ ...prev, measuredPlato: val }))}
        />

        <DensityInputGroup
          label="Densité Cible"
          sgValue={inputs.targetSg}
          brixValue={inputs.targetBrix}
          platoValue={inputs.targetPlato}
          onSgChange={(val) => setInputs(prev => ({ ...prev, targetSg: val }))}
          onBrixChange={(val) => setInputs(prev => ({ ...prev, targetBrix: val }))}
          onPlatoChange={(val) => setInputs(prev => ({ ...prev, targetPlato: val }))}
        />

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}

        <button
          type="button"
          onClick={handleClearInputs}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-calc-bg-surface light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface hover:bg-gray-200 dark:hover:bg-calc-border light:hover:bg-calc-border dark:hover:bg-calc-border calculator:hover:bg-calc-border text-gray-700 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text text-sm font-semibold rounded-lg transition-colors"
        >
          Vider les champs
        </button>
      </div>

      {result && (
        <div className="mt-8">
          {result.error && <ResultDisplay results={[]} error={result.error} type="error"/>}

          {!result.error && (() => {
            const measured = parseFloat(inputs.measuredSg);
            const target = parseFloat(inputs.targetSg);
            const atTarget = Math.abs(measured - target) < 0.001;
            const tooHigh = measured > target + 0.001;
            return (
              <ResultHero
                value={atTarget ? '✓' : tooHigh ? 'Trop élevée' : 'Trop faible'}
                label={atTarget ? 'Densité atteinte' : tooHigh ? 'Densité excessive — correction requise' : 'Densité insuffisante — correction requise'}
                status={atTarget ? 'success' : 'warning'}
              />
            );
          })()}

          {!result.error && result.options && result.options.length > 0 && (
            <div className="mt-4 space-y-4">
              <SectionHeading icon={Icons.CogIcon}>Options de correction</SectionHeading>
              <div className="space-y-3">
                {result.options.map((opt: DensityCorrectionOption, index: number) => (
                  <ResultActionCard
                    key={index}
                    description={opt.description}
                    warning={opt.warning}
                    type={opt.warning ? 'warning' : 'primary'}
                    badge={index === 0 ? 'Option A' : 'Option B'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {_ok && result && (() => {
        const optDilute = result.options.find(o => o.type === 'dilute');
        const optEvaporate = result.options.find(o => o.type === 'evaporate');
        const optSugar = result.options.find(o => o.type === 'addSugarPowder');
        const computedConservation = [
          `PD_actuel = (${_msNum.toFixed(3)} − 1) × 1000 = ${_pdActuel.toFixed(1)}`,
          `PD_cible = (${_tsNum.toFixed(3)} − 1) × 1000 = ${_pdCible.toFixed(1)}`,
          '',
          `V_cible = (V_actuel × PD_actuel) / PD_cible = (${_volNum.toFixed(2)} × ${_pdActuel.toFixed(1)}) / ${_pdCible.toFixed(1)} = ${_vCible.toFixed(2)} L`,
          '',
          ...(_isDiluting && optDilute?.amount != null
            ? [`V_eau à ajouter = V_cible − V_actuel = ${optDilute.amount.toFixed(2)} L`]
            : _isConcentrating && optEvaporate?.amount != null
              ? [`V_eau à évaporer = V_actuel − V_cible = ${optEvaporate.amount.toFixed(2)} L`]
              : []),
        ];
        const computedSugar = optSugar?.amount != null
          ? [
            `Déficit (PD·L) = (PD_cible − PD_actuel) × V = (${_pdCible.toFixed(1)} − ${_pdActuel.toFixed(1)}) × ${_volNum.toFixed(2)} = ${_sugarDeficit.toFixed(1)}`,
            `sucre (g) = Déficit / 0.4 = ${_sugarDeficit.toFixed(1)} / 0.4 = ${optSugar.amount.toFixed(0)} g`,
          ]
          : undefined;
        return (
      <FormulaInfoSection
        entries={[
          {
            name: 'Conservation des points de gravité (dilution / concentration)',
            description:
              "Principe de conservation : le produit volume × points de densité est constant. Permet de calculer le volume d'eau à ajouter ou à évaporer pour atteindre la densité cible.",
            formulas: [
              'PD = (SG − 1) × 1000',
              '',
              'V₁ × PD₁ = V₂ × PD₂  →  V_cible = (V_actuel × PD_actuel) / PD_cible',
              'V_eau_à_ajouter = V_cible − V_actuel',
              'V_eau_à_évaporer = V_actuel − V_cible',
            ],
            computed: computedConservation,
            sources: [
              {
                label: 'John Palmer — How to Brew (Section 15)',
                url: 'https://www.howtobrew.com/book/section-3/how-to-brew-on-your-first-batch/chapter-15',
              },
            ],
          },
          {
            name: 'Addition de sucre (saccharose)',
            description:
              "1 gramme de saccharose dissous dans 1 litre apporte environ 0.4 points de densité. La quantité de sucre à ajouter est proportionnelle au déficit de points × volume.",
            formulas: [
              'Déficit (PD·L) = (PD_cible − PD_actuel) × V (L)',
              'sucre (g) = Déficit / 0.4',
              '',
              'Facteur 0.4 : contribution en PD par g/L de saccharose',
            ],
            computed: computedSugar,
            sources: [
              {
                label: "Greg Noonan — New Brewing Lager Beer (1996)",
                url: 'https://www.brewerspublications.com/products/new-brewing-lager-beer',
              },
              {
                label: "Brewer's Friend — Gravity & Sugar Calculator",
                url: 'https://www.brewersfriend.com/gravity-and-sugar-conversion-tools/',
              },
            ],
          },
        ]}
      />
        );
      })()}
    </PageLayout>
  );
};

export default PreBoilDensityScreen;
