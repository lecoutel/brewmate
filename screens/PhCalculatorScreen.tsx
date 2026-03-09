
import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, Button, ResultDisplay, InfoTooltip, COMMON_CLASSES, Select } from '../components/Common';
import { PhCalculationInputs, PhCalculationResult, WaterProfile, CorrectionStage, Commune } from '../types';
import { calculatePhCorrection } from '../services/phCalculatorService';
import { fetchWaterQuality, searchCommunes, getCommuneByCoords, fetchNetworks, Network } from '../services/waterQualityService';
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

  // Water Quality State
  const [query, setQuery] = useState('');
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [waterProfile, setWaterProfile] = useState<WaterProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [waterError, setWaterError] = useState('');
  
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2 && !selectedCommune) {
        setIsSearching(true);
        const results = await searchCommunes(query);
        setCommunes(results);
        setShowAutocomplete(true);
        setIsSearching(false);
      } else {
        setCommunes([]);
        setShowAutocomplete(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedCommune]);

  const handleSelectCommune = async (commune: Commune, isGeolocation: boolean = false) => {
    setSelectedCommune(commune);
    setQuery(commune.nom);
    setShowAutocomplete(false);
    setIsLoading(true);
    setWaterError('');
    setWaterProfile(null);
    setNetworks([]);
    setSelectedNetwork(null);

    try {
      const fetchedNetworks = await fetchNetworks(commune.code);
      setNetworks(fetchedNetworks);

      if (fetchedNetworks.length === 0) {
        handleFetchData(commune.code);
      } else if (fetchedNetworks.length === 1 || isGeolocation) {
        setSelectedNetwork(fetchedNetworks[0]);
        handleFetchData(commune.code, fetchedNetworks[0].code);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setWaterError('Erreur lors de la récupération des réseaux.');
      setIsLoading(false);
    }
  };

  const handleSelectNetwork = (networkCode: string) => {
    const network = networks.find(n => n.code === networkCode);
    if (network && selectedCommune) {
      setSelectedNetwork(network);
      handleFetchData(selectedCommune.code, network.code);
    }
  };

  const handleFetchData = async (code: string, reseauCode?: string) => {
    setIsLoading(true);
    setWaterError('');
    setWaterProfile(null);
    try {
      const data = await fetchWaterQuality(code, reseauCode);
      if (data.error) {
        setWaterError(data.error);
      } else if (data.parameters) {
        setWaterProfile({
          ca: data.parameters.calcium?.value || 0,
          mg: data.parameters.magnesium?.value || 0,
          hco3: data.parameters.bicarbonates?.value || 0,
          na: data.parameters.sodium?.value || 0,
          cl: data.parameters.chlorides?.value || 0,
          so4: data.parameters.sulfates?.value || 0,
        });
      }
    } catch (err: any) {
      setWaterError(err.message || 'Impossible de récupérer les données d\'eau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setWaterError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLoading(true);
    setWaterError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const commune = await getCommuneByCoords(latitude, longitude);
        if (commune) {
          handleSelectCommune(commune, true);
        } else {
          setWaterError("Impossible de déterminer votre commune.");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setWaterError("Erreur de géolocalisation. Assurez-vous d'avoir autorisé l'accès.");
        setIsLoading(false);
      }
    );
  };

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
    if (stage === CorrectionStage.MASH && !waterProfile) {
      setFormError("Veuillez sélectionner une commune pour obtenir le profil d'eau.");
      return null;
    }
    setFormError('');
    return {
      stage,
      measurements: { currentPh: currentPhNum, targetPh: targetPhNum, volume: volumeNum },
      beerXmlString: beerXmlContent || undefined, // Pass empty string as undefined
      waterProfile: stage === CorrectionStage.MASH && waterProfile ? waterProfile : undefined,
    };
  };

  useEffect(() => {
    const parsedInputs = validateAndParseInputs();
    if (parsedInputs) {
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
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [stage, currentPhStr, targetPhStr, volumeStr, beerXmlContent, waterProfile]);
  
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
        messages.push(`Ajouter ${result.bicarbonateGrams.toFixed(2)} g de Bicarbonate de Sodium Alimentaire`);
    }

    if (messages.length === 0 && result.message) { // e.g. pH already correct, or acid malt sufficient
        return [result.message];
    }
    return messages.length > 0 ? messages : ["Aucun ajustement d'acide ou de bicarbonate calculé."];
  };

  return (
    <PageLayout title="Calculateur de Correction de pH" showBackButton>
      <div className="space-y-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-900_bg_opacity_20 rounded-md border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Ce calculateur permet de diminuer le pH (via acides lactique/phosphorique) ou de l'augmenter (via bicarbonate de sodium alimentaire) selon vos besoins.
          </p>
        </div>

        <Select
          label="Étape de Correction"
          name="stage"
          id="stage"
          value={stage}
          options={CORRECTION_STAGE_OPTIONS}
          onChange={(e) => setStage(e.target.value as CorrectionStage)}
        />

        {stage === CorrectionStage.MASH && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900_bg_opacity_20 rounded-md border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Pour l'empâtage, un fichier BeerXML est nécessaire pour analyser les malts et obtenir la meilleure précision. Le profil d'eau de votre commune est également requis.
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
          <div className="space-y-4 border-t border-b border-gray-200 dark:border-gray-700 py-4 my-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Profil d'eau</h3>
            <div className="relative" ref={autocompleteRef}>
              <div className="flex gap-2 items-end">
                <div className="relative flex-1">
                  <Input
                    label="Rechercher votre ville"
                    type="text"
                    name="city"
                    id="city"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedCommune(null);
                      setNetworks([]);
                      setSelectedNetwork(null);
                      setWaterProfile(null);
                    }}
                    placeholder="Ex: Lyon, Paris, Nantes..."
                    autoComplete="off"
                    wrapperClassName="!mb-0"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-10">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2563FF]"></div>
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <Button
                    onClick={handleGeolocation}
                    className="h-[46px] px-3"
                    title="Ma position"
                    disabled={isLoading}
                  >
                    <Icons.TargetIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {showAutocomplete && communes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                  {communes.map((c) => (
                    <div
                      key={c.code}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700"
                      onClick={() => handleSelectCommune(c, false)}
                    >
                      <div className="font-medium">{c.nom}</div>
                      <div className="text-xs text-gray-500">{c.codesPostaux.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {networks.length > 1 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in">
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Plusieurs points de captation (réseaux) disponibles. Veuillez en sélectionner un :
                </label>
                <select
                  className={COMMON_CLASSES.input + " bg-white dark:bg-dark-surface"}
                  value={selectedNetwork?.code || ''}
                  onChange={(e) => handleSelectNetwork(e.target.value)}
                >
                  {!selectedNetwork && <option value="" disabled>-- Choisir un réseau --</option>}
                  {networks.map(n => (
                    <option key={n.code} value={n.code}>
                      {n.name} {n.quartier && n.quartier !== '-' ? `(${n.quartier})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {waterError && <p className={COMMON_CLASSES.errorText}>{waterError}</p>}
            
            {waterProfile && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">
                  Profil d'eau chargé pour {selectedCommune?.nom} {selectedNetwork ? `(${selectedNetwork.name})` : ''}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Ca: {waterProfile.ca.toFixed(1)}, Mg: {waterProfile.mg.toFixed(1)}, Na: {waterProfile.na?.toFixed(1) || '0.0'}, Cl: {waterProfile.cl?.toFixed(1) || '0.0'}, SO₄: {waterProfile.so4?.toFixed(1) || '0.0'}, HCO₃: {waterProfile.hco3.toFixed(1)} (mg/L)
                </p>
              </div>
            )}
          </div>
        )}

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}
      </div>

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
