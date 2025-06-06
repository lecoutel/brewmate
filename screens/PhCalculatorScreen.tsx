import React, { useState, useEffect } from 'react';
import { PageLayout, Input, Button, ResultDisplay, InfoTooltip, COMMON_CLASSES, Select } from '../components/Common';
import { PhCalculationInputs, PhCalculationResult, WaterProfile, CorrectionStage } from '../types';
import { calculatePhCorrection } from '../services/phCalculatorService';
import { DEFAULT_LOOS_WATER_PROFILE, Icons, CORRECTION_STAGE_OPTIONS } from '../constants';

const PhCalculatorScreen: React.FC = () => {
  const [stage, setStage] = useState<CorrectionStage>(CorrectionStage.MASH);
  const [beerXmlContent, setBeerXmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  const [currentPhStr, setCurrentPhStr] = useState<string>("5.7");
  const [targetPhStr, setTargetPhStr] = useState<string>("5.3");
  const [volumeStr, setVolumeStr] = useState<string>(stage === CorrectionStage.MASH ? "20" : "25"); // Default mash/preboil vol

  const [result, setResult] = useState<PhCalculationResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [autoDetectedVolume, setAutoDetectedVolume] = useState<number | null>(null);

  useEffect(() => {
    // Reset form and results when stage changes
    setBeerXmlContent('');
    setFileName('');
    setResult(null);
    setFormError('');
    setAutoDetectedVolume(null);
    // Update default volume based on stage, but only if user hasn't typed something specific
    if (volumeStr === "20" || volumeStr === "25") { // Crude check if it's still default
         setVolumeStr(stage === CorrectionStage.MASH ? "20" : "25");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAutoDetectedVolume(null); // Clear previous auto-detected volume
    setResult(null);

    if (file) {
      if (file.type === "text/xml" || file.name.endsWith('.xml')) {
        setIsLoading(true);
        setFileName(file.name);
        setFormError('');
        try {
          const text = await file.text();
          setBeerXmlContent(text);
          // Attempt to auto-detect volume after loading XML
          // This is a simplified approach; full parsing happens in the service
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, "application/xml");
          if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
            let detectedVol: number | null = null;
            if (stage === CorrectionStage.MASH) {
                const mashSteps = xmlDoc.getElementsByTagName('MASH_STEP');
                let totalInfuse = 0;
                let found = false;
                for (const step of mashSteps) {
                    const infuse = step.getElementsByTagName('INFUSE_AMOUNT')[0]?.textContent;
                    if (infuse) {
                        totalInfuse += parseFloat(infuse);
                        found = true;
                    }
                }
                if (found) detectedVol = totalInfuse;

            } else if (stage === CorrectionStage.PRE_BOIL) {
                const boilSize = xmlDoc.getElementsByTagName('BOIL_SIZE')[0]?.textContent;
                if (boilSize) detectedVol = parseFloat(boilSize);
            }
            if (detectedVol && !isNaN(detectedVol)) {
                setAutoDetectedVolume(parseFloat(detectedVol.toFixed(2)));
                 if (!volumeStr || volumeStr === "20" || volumeStr === "25") { // Only prefill if volume is default
                    setVolumeStr(detectedVol.toFixed(2));
                }
            }
          }
        } catch (error) {
          console.error("Error reading file:", error);
          setFormError("Erreur lors de la lecture du fichier.");
          setBeerXmlContent('');
          setFileName('');
        } finally {
          setIsLoading(false);
        }
      } else {
        setFormError("Veuillez sélectionner un fichier BeerXML (.xml).");
        setBeerXmlContent('');
        setFileName('');
        event.target.value = ''; // Reset file input
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "currentPh") setCurrentPhStr(value);
    if (name === "targetPh") setTargetPhStr(value);
    if (name === "volume") setVolumeStr(value);
    setResult(null);
    setFormError('');
  };
  
  const validateAndParseInputs = (): PhCalculationInputs | null => {
    const currentPhNum = parseFloat(currentPhStr);
    const targetPhNum = parseFloat(targetPhStr);
    const volumeNum = parseFloat(volumeStr);

    if (isNaN(currentPhNum) || currentPhNum <= 0 || currentPhNum > 14 ||
        isNaN(targetPhNum) || targetPhNum <= 0 || targetPhNum > 14) {
      setFormError("Le pH doit être une valeur numérique valide entre 0 et 14.");
      return null;
    }
    if (isNaN(volumeNum) || volumeNum <= 0) {
      setFormError("Le volume doit être une valeur numérique positive.");
      return null;
    }
     if (stage === CorrectionStage.MASH && !beerXmlContent) {
      setFormError("Un fichier BeerXML est requis pour la correction du pH d'empâtage.");
      return null;
    }
    setFormError('');
    return {
      stage,
      measurements: { currentPh: currentPhNum, targetPh: targetPhNum, volume: volumeNum },
      beerXmlString: beerXmlContent || undefined, // Pass empty string as undefined
      waterProfile: stage === CorrectionStage.MASH ? DEFAULT_LOOS_WATER_PROFILE : undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null); // Clear previous result before new calculation

    const parsedInputs = validateAndParseInputs();
    if (!parsedInputs) {
      return;
    }

    try {
      const calcResult = calculatePhCorrection(parsedInputs);
      setResult(calcResult);
      // Update autoDetectedVolume from result details if available
      if (calcResult.details?.autoDetectedMashVolumeL && stage === CorrectionStage.MASH) {
        setAutoDetectedVolume(calcResult.details.autoDetectedMashVolumeL);
      } else if (calcResult.details?.autoDetectedPreBoilVolumeL && stage === CorrectionStage.PRE_BOIL) {
        setAutoDetectedVolume(calcResult.details.autoDetectedPreBoilVolumeL);
      }

    } catch (error: any) {
      console.error("Error during pH calculation:", error);
      setFormError(error.message || "Une erreur est survenue lors du calcul du pH.");
    }
  };
  
  const isSubmitDisabled = isLoading || (stage === CorrectionStage.MASH && !beerXmlContent && !formError);
  const volumeLabel = stage === CorrectionStage.MASH ? "Volume de la Maische (L)" : "Volume Pré-ébullition (L)";

  const renderResultMessages = () => {
    if (!result) return null;
    if (result.error) return null; 
    if (result.message && (result.lacticAcidMl === 0 || typeof result.lacticAcidMl === 'undefined') && (result.phosphoricAcidMl === 0 || typeof result.phosphoricAcidMl === 'undefined') && (result.bicarbonateGrams === 0 || typeof result.bicarbonateGrams === 'undefined') ) {
        return [result.message];
    }


    const messages: string[] = [];
    if (typeof result.lacticAcidMl === 'number' && result.lacticAcidMl > 0) {
      messages.push(`Ajouter ${result.lacticAcidMl.toFixed(2)} ml d'Acide Lactique 80%`);
    }
    if (typeof result.phosphoricAcidMl === 'number' && result.phosphoricAcidMl > 0) {
      messages.push(`Ou ajouter ${result.phosphoricAcidMl.toFixed(2)} ml d'Acide Phosphorique 75%`);
    }
    if (typeof result.bicarbonateGrams === 'number' && result.bicarbonateGrams > 0) {
        messages.push(`Ajouter ${result.bicarbonateGrams.toFixed(2)} g de Bicarbonate de Sodium`);
    }

    if (messages.length === 0 && result.message) { // e.g. pH already correct, or acid malt sufficient
        return [result.message];
    }
    return messages.length > 0 ? messages : ["Aucun ajustement d'acide ou de bicarbonate calculé."];
  };

  return (
    <PageLayout title="Calculateur de Correction de pH" showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Étape de Correction"
          name="stage"
          id="stage"
          value={stage}
          options={CORRECTION_STAGE_OPTIONS}
          onChange={(e) => setStage(e.target.value as CorrectionStage)}
        />

        {stage === CorrectionStage.MASH && (
          <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold">
              Pour l'empâtage, un fichier BeerXML est nécessaire pour analyser les malts et obtenir la meilleure précision. Le profil d'eau "Loos" est utilisé par défaut.
            </p>
          </div>
        )}
        {stage === CorrectionStage.PRE_BOIL && (
           <div className="p-3 bg-blue-50 dark:bg-blue-900_bg_opacity_20 rounded-md border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Pour la pré-ébullition, le calcul est simplifié. Le BeerXML est optionnel (pour auto-détection du volume).
            </p>
          </div>
        )}

        <div>
          <label htmlFor="beerXmlFile" className={COMMON_CLASSES.label}>
            Fichier Recette BeerXML (.xml)
            <InfoTooltip 
                infoText={stage === CorrectionStage.MASH 
                    ? "Requis pour l'empâtage. Utilisé pour analyser les malts et auto-détecter le volume de la maische." 
                    : "Optionnel. Utilisé pour auto-détecter le volume pré-ébullition."} />
          </label>
          <input
            type="file" id="beerXmlFile" name="beerXmlFile" accept=".xml,text/xml"
            onChange={handleFileChange}
            className={`w-full text-sm p-2 border rounded-lg file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0 file:text-sm file:font-semibold
                        file:bg-[${COMMON_CLASSES.buttonSecondary.match(/bg-\S+/)?.[0]}] file:text-[${COMMON_CLASSES.buttonSecondary.match(/text-\S+/)?.[0]}]
                        hover:file:opacity-80 ${COMMON_CLASSES.input}`}
            aria-describedby="beerXmlFile_help"
          />
          {fileName && <p id="beerXmlFile_help" className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fichier: {fileName}</p>}
          {isLoading && <p className="mt-1 text-sm text-blue-500 dark:text-blue-400">Chargement...</p>}
        </div>

        <Input
          label={volumeLabel + (autoDetectedVolume ? ` (Auto-détecté: ${autoDetectedVolume} L)` : '')}
          type="number" name="volume" id="volume" value={volumeStr}
          onChange={handleInputChange}
          step="0.1" min="0" placeholder={`ex: ${stage === CorrectionStage.MASH ? '20' : '25'}`} required
        />
        <Input
          label="pH Actuel" type="number" name="currentPh" id="currentPh" value={currentPhStr}
          onChange={handleInputChange}
          step="0.01" min="0" max="14" placeholder="ex: 5.7" required
        />
        <Input
          label="pH Cible" type="number" name="targetPh" id="targetPh" value={targetPhStr}
          onChange={handleInputChange}
          step="0.01" min="0" max="14" placeholder="ex: 5.3" required
        />
        
        {stage === CorrectionStage.MASH && (
          <p className={`${COMMON_CLASSES.textMuted} text-xs`}>
            Profil d'eau "Loos" utilisé: Ca: {DEFAULT_LOOS_WATER_PROFILE.ca}, Mg: {DEFAULT_LOOS_WATER_PROFILE.mg}, HCO3: {DEFAULT_LOOS_WATER_PROFILE.hco3} (mg/L).
          </p>
        )}

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          {isLoading ? 'Chargement...' : 'Calculer le pH'}
        </Button>
      </form>

      {result && (
        <>
          <ResultDisplay 
            results={result.error ? '' : renderResultMessages() ?? []}
            error={result.error ?? undefined}
            type={result.error ? 'error' : (result.message && (result.lacticAcidMl === 0 || typeof result.lacticAcidMl === 'undefined') && (result.phosphoricAcidMl === 0 || typeof result.phosphoricAcidMl === 'undefined') && (result.bicarbonateGrams === 0 || typeof result.bicarbonateGrams === 'undefined') ? 'info' : 'success')}
          />
          {result.details && stage === CorrectionStage.MASH && (
            <div className="mt-4">
              <button onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center justify-between w-full p-2 rounded-md ${COMMON_CLASSES.buttonSecondary} text-sm`}>
                <span>{showDetails ? 'Cacher' : 'Afficher'} Détails (Empâtage)</span>
                <Icons.ChevronRightIcon className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
              </button>
              {showDetails && result.details && (
                <div className={`mt-2 p-4 border rounded-lg bg-light-surface dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-sm ${COMMON_CLASSES.textMuted} space-y-1`}>
                  {typeof result.details.autoDetectedMashVolumeL === 'number' && <p><strong>Volume Maische Auto-Détecté:</strong> {result.details.autoDetectedMashVolumeL.toFixed(2)} L</p>}
                  {typeof result.details.residualAlkalinity === 'number' && <p><strong>Alcalinité Résiduelle (AR):</strong> {result.details.residualAlkalinity.toFixed(2)} ppm as CaCO₃</p>}
                  {typeof result.details.totalMashBuffering === 'number' && <p><strong>Pouvoir Tampon Total:</strong> {result.details.totalMashBuffering.toFixed(2)}</p>}
                  {typeof result.details.initialMEqNeeded === 'number' && <p><strong>mEq Initiaux (avant malt acide):</strong> {result.details.initialMEqNeeded.toFixed(2)}</p>}
                  {typeof result.details.mEqFromAcidMalt === 'number' && result.details.mEqFromAcidMalt > 0 && <p><strong>mEq apportés par Malt Acide:</strong> {result.details.mEqFromAcidMalt.toFixed(2)}</p>}
                  {typeof result.details.netMEqNeededForAcidification === 'number' && result.correctionType === 'ACIDIFY' && <p><strong>mEq Nets (Acidification):</strong> {result.details.netMEqNeededForAcidification.toFixed(2)}</p>}
                  {typeof result.details.mEqToAlkalinize === 'number' && result.correctionType === 'ALCALINIZE' && <p><strong>mEq (Alcalinisation):</strong> {result.details.mEqToAlkalinize.toFixed(2)}</p>}
                  {result.details.maltComposition && (<>
                    <p><strong>Composition Malts (kg):</strong></p>
                    <ul className="list-disc list-inside pl-4">
                      <li>Base: {result.details.maltComposition.BASE.toFixed(3)} kg</li>
                      <li>Crystal: {result.details.maltComposition.CRYSTAL.toFixed(3)} kg</li>
                      <li>Roasted: {result.details.maltComposition.ROASTED.toFixed(3)} kg</li>
                      {result.details.maltComposition.SPECIALTY_ACIDIC ? <li>Acide: {result.details.maltComposition.SPECIALTY_ACIDIC.toFixed(3)} kg</li> : null}
                      {result.details.maltComposition.SPECIALTY_OTHER ? <li>Autre Spéc.: {result.details.maltComposition.SPECIALTY_OTHER.toFixed(3)} kg</li> : null }
                      {result.details.maltComposition.UNKNOWN ? <li>Inconnu: {result.details.maltComposition.UNKNOWN.toFixed(3)} kg</li> : null}
                    </ul>
                  </>)}
                </div>
              )}
            </div>
          )}
           {result && result.details && typeof result.details.autoDetectedPreBoilVolumeL === 'number' && stage === CorrectionStage.PRE_BOIL && (
             <p className={`${COMMON_CLASSES.textMuted} text-xs mt-2`}>Volume pré-ébullition auto-détecté du BeerXML : {result.details.autoDetectedPreBoilVolumeL.toFixed(2)} L.</p>
           )}
        </>
      )}
    </PageLayout>
  );
};

export default PhCalculatorScreen;
