import React, { useState, useEffect } from 'react';
import { PageLayout, Input, ResultDisplay, DensityInputGroup, ResultActionCard, SectionHeading, ResultHero } from '../components/Common';
import { PostBoilDensityInputs, PostBoilDensityResult, GravityUnit, DensityCorrectionOption } from '../types';
import { calculatePostBoilDensity } from '../utils/brewingCalculators';
import { COMMON_CLASSES, Icons } from '../constants';

interface PostBoilDensityStringInputs {
  volumePostBoil: string;
  measuredSg: string;
  measuredBrix: string;
  measuredPlato: string;
  targetSg: string;
  targetBrix: string;
  targetPlato: string;
}

const PostBoilDensityScreen: React.FC = () => {
  const [inputs, setInputs] = useState<PostBoilDensityStringInputs>({
    volumePostBoil: "20",
    measuredSg: "1.048",
    measuredBrix: "12.0",
    measuredPlato: "12.0",
    targetSg: "1.050",
    targetBrix: "12.5",
    targetPlato: "12.5",
  });
  const [result, setResult] = useState<PostBoilDensityResult | null>(null);
  const [formError, setFormError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };
  
  const validateAndParseInputs = (): PostBoilDensityInputs | null => {
    const volumePostBoilNum = parseFloat(inputs.volumePostBoil);
    const measuredGravityNum = parseFloat(inputs.measuredSg);
    const targetGravityNum = parseFloat(inputs.targetSg);

    if (isNaN(volumePostBoilNum) || volumePostBoilNum <= 0 || 
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
      volumePostBoil: volumePostBoilNum,
      gravityUnit: GravityUnit.DI, // We always calculate using SG now
      measuredGravity: measuredGravityNum,
      targetGravity: targetGravityNum,
    };
  };

  useEffect(() => {
    const parsedInputs = validateAndParseInputs();
    if (parsedInputs) {
      const calcResult = calculatePostBoilDensity(parsedInputs);
      setResult(calcResult);
    } else {
      setResult(null);
    }
  }, [inputs]);

  return (
    <PageLayout title="Correction Densité Fin d'Ébullition" showBackButton>
      <div className="space-y-6">
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
    </PageLayout>
  );
};

export default PostBoilDensityScreen;
