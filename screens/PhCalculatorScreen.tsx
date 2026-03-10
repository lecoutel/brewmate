
import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, Button, InfoTooltip, COMMON_CLASSES, Select, InfoPanel, ResultHero, ResultActionCard, ResultDisplay } from '../components/Common';
import { PhCalculationInputs, PhCalculationResult, WaterProfile, CorrectionStage, Commune, MALT_TYPE } from '../types';
import { calculatePhCorrection } from '../services/phCalculatorService';
import { fetchWaterQuality, searchCommunes, getCommuneByCoords, fetchNetworks, Network } from '../services/waterQualityService';
import { DEFAULT_LOOS_WATER_PROFILE, Icons, CORRECTION_STAGE_OPTIONS } from '../constants';
import { usePersistentState } from '../hooks/usePersistentState';
import { useUrlParams } from '../hooks/useUrlParams';

const PhCalculatorScreen: React.FC = () => {
  const [stage, setStage, clearStageCache] = usePersistentState<CorrectionStage>(
    'brewmate:ph:stage',
    CorrectionStage.MASH
  );
  const [beerXmlContent, setBeerXmlContent, clearBeerXmlCache] = usePersistentState<string>(
    'brewmate:ph:beerxml:content',
    ''
  );
  const [fileName, setFileName, clearBeerXmlNameCache] = usePersistentState<string>(
    'brewmate:ph:beerxml:name',
    ''
  );
  
  const [currentPhStr, setCurrentPhStr, clearCurrentPhCache] = usePersistentState<string>('brewmate:ph:currentPh', "");
  const [targetPhStr, setTargetPhStr, clearTargetPhCache] = usePersistentState<string>('brewmate:ph:targetPh', "5.3");
  const [volumeStr, setVolumeStr, clearVolumeCache] = usePersistentState<string>('brewmate:ph:volume', "");

  const [result, setResult] = useState<PhCalculationResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [autoDetectedVolume, setAutoDetectedVolume] = useState<number | null>(null);

  // Water Quality State
  const [query, setQuery, clearWaterQueryCache] = usePersistentState('brewmate:ph:waterQuery', '');
  interface PhWaterCache {
    waterProfile: WaterProfile;
    selectedCommune: Commune;
    selectedNetwork: Network | null;
    networks: Network[];
  }
  const [phWaterCache, setPhWaterCache, clearPhWaterCache] = usePersistentState<PhWaterCache | null>(
    'brewmate:ph:waterApiCache',
    null
  );
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [waterProfile, setWaterProfile] = useState<WaterProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [waterError, setWaterError] = useState('');
  
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const beerXmlInputRef = useRef<HTMLInputElement>(null);
  const searchActivatedRef = useRef(false);
  const hydratedFromWaterCacheRef = useRef(false);
  const [urlParams, setUrlParams] = useUrlParams();
  const hasHydratedFromUrlRef = useRef(false);

  // Au chargement, hydrater l'état depuis l'URL (lien partagé) — entrées + résultat pour affichage direct en nav privée
  useEffect(() => {
    if (hasHydratedFromUrlRef.current) return;
    hasHydratedFromUrlRef.current = true;
    const {
      stage: s, currentPh, targetPh, volume, city, ca, mg, hco3, na, cl, so4,
      rType, lacticMl, phosphoricMl, bicarbonateG, msg,
      volMash, volPreBoil, ar, buffer, mEqInit, mEqAcidMalt, mEqNet, mEqAlk,
      maltBase, maltCrystal, maltRoasted, maltAcid, maltOther, maltUnknown,
    } = urlParams;

    if (s === CorrectionStage.MASH || s === CorrectionStage.PRE_BOIL) setStage(s);
    if (currentPh !== undefined && currentPh !== '') setCurrentPhStr(currentPh);
    if (targetPh !== undefined && targetPh !== '') setTargetPhStr(targetPh);
    if (volume !== undefined && volume !== '') setVolumeStr(volume);
    if (city !== undefined && city !== '') setQuery(city);

    const caNum = ca != null && ca !== '' ? parseFloat(ca) : NaN;
    const mgNum = mg != null && mg !== '' ? parseFloat(mg) : NaN;
    const hco3Num = hco3 != null && hco3 !== '' ? parseFloat(hco3) : NaN;
    const naNum = na != null && na !== '' ? parseFloat(na) : NaN;
    const clNum = cl != null && cl !== '' ? parseFloat(cl) : NaN;
    const so4Num = so4 != null && so4 !== '' ? parseFloat(so4) : NaN;
    if (!isNaN(caNum) || !isNaN(mgNum) || !isNaN(hco3Num) || !isNaN(naNum) || !isNaN(clNum) || !isNaN(so4Num)) {
      setWaterProfile({
        ca: isNaN(caNum) ? 0 : caNum,
        mg: isNaN(mgNum) ? 0 : mgNum,
        hco3: isNaN(hco3Num) ? 0 : hco3Num,
        ...(isNaN(naNum) ? {} : { na: naNum }),
        ...(isNaN(clNum) ? {} : { cl: clNum }),
        ...(isNaN(so4Num) ? {} : { so4: so4Num }),
      });
    }

    // Reconstruire le résultat depuis l'URL pour affichage direct (nav privée)
    const correctionType = (rType === 'ACIDIFY' || rType === 'ALCALINIZE' || rType === 'NONE') ? rType : undefined;
    if (correctionType !== undefined) {
      const lactic = lacticMl != null && lacticMl !== '' ? parseFloat(lacticMl) : 0;
      const phosphoric = phosphoricMl != null && phosphoricMl !== '' ? parseFloat(phosphoricMl) : 0;
      const bicarbonate = bicarbonateG != null && bicarbonateG !== '' ? parseFloat(bicarbonateG) : 0;
      const volMashNum = volMash != null && volMash !== '' ? parseFloat(volMash) : undefined;
      const volPreBoilNum = volPreBoil != null && volPreBoil !== '' ? parseFloat(volPreBoil) : undefined;
      const arNum = ar != null && ar !== '' ? parseFloat(ar) : undefined;
      const bufferNum = buffer != null && buffer !== '' ? parseFloat(buffer) : undefined;
      const mEqInitNum = mEqInit != null && mEqInit !== '' ? parseFloat(mEqInit) : undefined;
      const mEqAcidMaltNum = mEqAcidMalt != null && mEqAcidMalt !== '' ? parseFloat(mEqAcidMalt) : undefined;
      const mEqNetNum = mEqNet != null && mEqNet !== '' ? parseFloat(mEqNet) : undefined;
      const mEqAlkNum = mEqAlk != null && mEqAlk !== '' ? parseFloat(mEqAlk) : undefined;

      const base = maltBase != null && maltBase !== '' ? parseFloat(maltBase) : 0;
      const crystal = maltCrystal != null && maltCrystal !== '' ? parseFloat(maltCrystal) : 0;
      const roasted = maltRoasted != null && maltRoasted !== '' ? parseFloat(maltRoasted) : 0;
      const hasMalt = !isNaN(base) || !isNaN(crystal) || !isNaN(roasted) ||
        (maltAcid != null && maltAcid !== '') || (maltOther != null && maltOther !== '') || (maltUnknown != null && maltUnknown !== '');
      const maltComposition = hasMalt ? {
        [MALT_TYPE.BASE]: isNaN(base) ? 0 : base,
        [MALT_TYPE.CRYSTAL]: isNaN(crystal) ? 0 : crystal,
        [MALT_TYPE.ROASTED]: isNaN(roasted) ? 0 : roasted,
        ...(maltAcid != null && maltAcid !== '' && !isNaN(parseFloat(maltAcid)) ? { [MALT_TYPE.SPECIALTY_ACIDIC]: parseFloat(maltAcid) } : {}),
        ...(maltOther != null && maltOther !== '' && !isNaN(parseFloat(maltOther)) ? { [MALT_TYPE.SPECIALTY_OTHER]: parseFloat(maltOther) } : {}),
        ...(maltUnknown != null && maltUnknown !== '' && !isNaN(parseFloat(maltUnknown)) ? { [MALT_TYPE.UNKNOWN]: parseFloat(maltUnknown) } : {}),
      } : undefined;

      const details =
        volMashNum !== undefined || volPreBoilNum !== undefined || arNum !== undefined || bufferNum !== undefined ||
        mEqInitNum !== undefined || mEqAcidMaltNum !== undefined || mEqNetNum !== undefined || mEqAlkNum !== undefined || maltComposition
          ? {
              ...(volMashNum !== undefined && !isNaN(volMashNum) ? { autoDetectedMashVolumeL: volMashNum } : {}),
              ...(volPreBoilNum !== undefined && !isNaN(volPreBoilNum) ? { autoDetectedPreBoilVolumeL: volPreBoilNum } : {}),
              ...(arNum !== undefined && !isNaN(arNum) ? { residualAlkalinity: arNum } : {}),
              ...(bufferNum !== undefined && !isNaN(bufferNum) ? { totalMashBuffering: bufferNum } : {}),
              ...(mEqInitNum !== undefined && !isNaN(mEqInitNum) ? { initialMEqNeeded: mEqInitNum } : {}),
              ...(mEqAcidMaltNum !== undefined && !isNaN(mEqAcidMaltNum) ? { mEqFromAcidMalt: mEqAcidMaltNum } : {}),
              ...(mEqNetNum !== undefined && !isNaN(mEqNetNum) ? { netMEqNeededForAcidification: mEqNetNum } : {}),
              ...(mEqAlkNum !== undefined && !isNaN(mEqAlkNum) ? { mEqToAlkalinize: mEqAlkNum } : {}),
              ...(maltComposition ? { maltComposition } : {}),
            }
          : undefined;

      setResult({
        correctionType,
        lacticAcidMl: isNaN(lactic) ? 0 : lactic,
        phosphoricAcidMl: isNaN(phosphoric) ? 0 : phosphoric,
        bicarbonateGrams: isNaN(bicarbonate) ? 0 : bicarbonate,
        message: msg != null && msg !== '' ? msg : '',
        ...(details && Object.keys(details).length > 0 ? { details } : {}),
      });
      if (volMashNum !== undefined && !isNaN(volMashNum)) setAutoDetectedVolume(volMashNum);
      else if (volPreBoilNum !== undefined && !isNaN(volPreBoilNum)) setAutoDetectedVolume(volPreBoilNum);
      setShowDetails(true);
    }
  }, [urlParams]);

  // Synchroniser entrées + résultat vers l'URL (lien partageable, nav privée = tout visible)
  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) return;
    const next: Record<string, string | number | undefined> = {
      stage,
      currentPh: currentPhStr || undefined,
      targetPh: targetPhStr || undefined,
      volume: volumeStr || undefined,
      city: query || undefined,
      ca: waterProfile ? String(waterProfile.ca) : undefined,
      mg: waterProfile ? String(waterProfile.mg) : undefined,
      hco3: waterProfile ? String(waterProfile.hco3) : undefined,
      na: waterProfile && waterProfile.na != null ? String(waterProfile.na) : undefined,
      cl: waterProfile && waterProfile.cl != null ? String(waterProfile.cl) : undefined,
      so4: waterProfile && waterProfile.so4 != null ? String(waterProfile.so4) : undefined,
    };
    if (result && !result.error) {
      next.rType = result.correctionType;
      next.lacticMl = result.lacticAcidMl;
      next.phosphoricMl = result.phosphoricAcidMl;
      next.bicarbonateG = result.bicarbonateGrams;
      if (result.message) next.msg = encodeURIComponent(result.message);
      if (result.details) {
        if (typeof result.details.autoDetectedMashVolumeL === 'number') next.volMash = result.details.autoDetectedMashVolumeL;
        if (typeof result.details.autoDetectedPreBoilVolumeL === 'number') next.volPreBoil = result.details.autoDetectedPreBoilVolumeL;
        if (typeof result.details.residualAlkalinity === 'number') next.ar = result.details.residualAlkalinity;
        if (typeof result.details.totalMashBuffering === 'number') next.buffer = result.details.totalMashBuffering;
        if (typeof result.details.initialMEqNeeded === 'number') next.mEqInit = result.details.initialMEqNeeded;
        if (typeof result.details.mEqFromAcidMalt === 'number') next.mEqAcidMalt = result.details.mEqFromAcidMalt;
        if (typeof result.details.netMEqNeededForAcidification === 'number') next.mEqNet = result.details.netMEqNeededForAcidification;
        if (typeof result.details.mEqToAlkalinize === 'number') next.mEqAlk = result.details.mEqToAlkalinize;
        if (result.details.maltComposition) {
          next.maltBase = result.details.maltComposition.BASE;
          next.maltCrystal = result.details.maltComposition.CRYSTAL;
          next.maltRoasted = result.details.maltComposition.ROASTED;
          if (result.details.maltComposition.SPECIALTY_ACIDIC != null) next.maltAcid = result.details.maltComposition.SPECIALTY_ACIDIC;
          if (result.details.maltComposition.SPECIALTY_OTHER != null) next.maltOther = result.details.maltComposition.SPECIALTY_OTHER;
          if (result.details.maltComposition.UNKNOWN != null) next.maltUnknown = result.details.maltComposition.UNKNOWN;
        }
      }
    }
    setUrlParams(next);
  }, [stage, currentPhStr, targetPhStr, volumeStr, query, waterProfile, result]);

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
    if (hydratedFromWaterCacheRef.current) return;
    if (!query || !phWaterCache || phWaterCache.selectedCommune.nom !== query) return;
    hydratedFromWaterCacheRef.current = true;
    setWaterProfile(phWaterCache.waterProfile);
    setSelectedCommune(phWaterCache.selectedCommune);
    setSelectedNetwork(phWaterCache.selectedNetwork);
    setNetworks(phWaterCache.networks);
  }, [query, phWaterCache]);

  useEffect(() => {
    if (waterProfile && selectedCommune) {
      setPhWaterCache({
        waterProfile,
        selectedCommune,
        selectedNetwork,
        networks,
      });
    }
  }, [waterProfile, selectedCommune, selectedNetwork, networks]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2 && !selectedCommune) {
        setIsSearching(true);
        const results = await searchCommunes(query);
        setCommunes(results);
        if (searchActivatedRef.current) {
          setShowAutocomplete(true);
        }
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

  const handleRefreshWaterData = () => {
    if (!selectedCommune) {
      setWaterError('Sélectionnez une commune avant de rafraîchir les données.');
      return;
    }
    handleFetchData(selectedCommune.code, selectedNetwork?.code);
  };

  useEffect(() => {
    // Migration one-shot: clear legacy demo defaults from persisted storage.
    if (currentPhStr === "5.7") setCurrentPhStr('');
    if (volumeStr === "20" || volumeStr === "25") setVolumeStr('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevStageRef = useRef<CorrectionStage | null>(null);
  useEffect(() => {
    const prevStage = prevStageRef.current;
    prevStageRef.current = stage;
    if (prevStage !== null && prevStage !== stage) {
      setBeerXmlContent('');
      setFileName('');
      setResult(null);
      setFormError('');
      setAutoDetectedVolume(null);
      if (beerXmlInputRef.current) beerXmlInputRef.current.value = '';
    }
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
                 if (!volumeStr) {
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

  const handleRemoveBeerXml = () => {
    clearBeerXmlCache();
    clearBeerXmlNameCache();
    setAutoDetectedVolume(null);
    setResult(null);
    if (beerXmlInputRef.current) {
      beerXmlInputRef.current.value = '';
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

  const handleClearAll = () => {
    clearStageCache();
    clearBeerXmlCache();
    clearBeerXmlNameCache();
    clearCurrentPhCache();
    clearTargetPhCache();
    clearVolumeCache();
    clearWaterQueryCache();
    clearPhWaterCache();

    setResult(null);
    setFormError('');
    setAutoDetectedVolume(null);
    setShowDetails(false);
    setWaterProfile(null);
    setWaterError('');
    setCommunes([]);
    setSelectedCommune(null);
    setNetworks([]);
    setSelectedNetwork(null);
    setShowAutocomplete(false);
    setIsSearching(false);
    if (beerXmlInputRef.current) {
      beerXmlInputRef.current.value = '';
    }
  };

  return (
    <PageLayout title="Calculateur de Correction de pH" showBackButton>
      <div className="space-y-6">
        <Select
          label="Étape de Correction"
          name="stage"
          id="stage"
          value={stage}
          options={CORRECTION_STAGE_OPTIONS}
          onChange={(e) => setStage(e.target.value as CorrectionStage)}
        />

        {stage === CorrectionStage.PRE_BOIL && (
          <InfoPanel>
            Pour la pré-ébullition, le calcul est simplifié. Le BeerXML est optionnel (pour auto-détection du volume).
          </InfoPanel>
        )}

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
                    onFocus={() => {
                      searchActivatedRef.current = true;
                      if (communes.length > 0) setShowAutocomplete(true);
                    }}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedCommune(null);
                      setNetworks([]);
                      setSelectedNetwork(null);
                      setWaterProfile(null);
                    }}
                    onClear={() => {
                      setQuery('');
                      setSelectedCommune(null);
                      setNetworks([]);
                      setSelectedNetwork(null);
                      setWaterProfile(null);
                    }}
                    placeholder="Ex: Lyon, Paris, Nantes..."
                    autoComplete="off"
                    wrapperClassName="!mb-0"
                    clearable
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
                {waterProfile && (
                  <div className="shrink-0">
                    <Button
                      onClick={handleRefreshWaterData}
                      className="h-[46px] px-3"
                      title="Rafraîchir les données d'eau"
                      disabled={isLoading || !selectedCommune}
                    >
                      <Icons.RefreshIcon className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              {showAutocomplete && communes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
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
              {showAutocomplete && communes.length === 0 && query.length > 2 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                  <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 italic">
                    Aucune commune trouvée pour « {query} »
                  </p>
                </div>
              )}

              {isLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chargement</p>
              )}
            </div>

            {networks.length > 1 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in">
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Plusieurs points de captation (réseaux) disponibles. Veuillez en sélectionner un :
                </label>
                <select
                  className={COMMON_CLASSES.input + " bg-white dark:bg-gray-700"}
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
            ref={beerXmlInputRef}
            onChange={handleFileChange}
            className={`w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 dark:file:bg-gray-700 file:text-gray-800 dark:file:text-gray-200 hover:file:opacity-80 focus:ring-2 focus:ring-[#2563FF]`}
            aria-describedby="beerXmlFile_help"
          />
          {fileName && <p id="beerXmlFile_help" className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fichier: {fileName}</p>}
          {(fileName || beerXmlContent) && (
            <button
              type="button"
              onClick={handleRemoveBeerXml}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Supprimer le fichier BeerXML
            </button>
          )}
          {stage === CorrectionStage.MASH && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Pour l'empâtage, un fichier BeerXML est nécessaire pour analyser les malts et obtenir la meilleure précision. Le profil d'eau de votre commune est également requis.
            </p>
          )}
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

        {formError && <p className={COMMON_CLASSES.errorText}>{formError}</p>}
        <Button type="button" variant="secondary" onClick={handleClearAll} className="w-full">
          Réinitialiser les champs
        </Button>
      </div>

      {result && (
        <div className="mt-6 space-y-3">
          {/* Erreur fatale */}
          {result.error && (
            <ResultDisplay results={[]} error={result.error} type="error" />
          )}

          {/* pH déjà à la cible */}
          {!result.error && result.correctionType === 'NONE' && (
            <ResultHero
              value="✓"
              label={result.message || 'pH déjà à la cible'}
              status="success"
            />
          )}

          {/* Valeur principale en hero (ACIDIFY / ALCALINIZE) */}
          {!result.error && result.correctionType !== 'NONE' && (() => {
            const primaryValue = result.lacticAcidMl > 0
              ? `${result.lacticAcidMl.toFixed(2)} ml`
              : result.phosphoricAcidMl > 0
                ? `${result.phosphoricAcidMl.toFixed(2)} ml`
                : result.bicarbonateGrams > 0
                  ? `${result.bicarbonateGrams.toFixed(2)} g`
                  : null;
            const primaryLabel = result.lacticAcidMl > 0
              ? "Acide Lactique 80% à ajouter"
              : result.phosphoricAcidMl > 0 && result.lacticAcidMl === 0
                ? "Acide Phosphorique 75% à ajouter"
                : "Bicarbonate de Sodium à ajouter";
            return primaryValue ? (
              <ResultHero value={primaryValue} label={primaryLabel} status="neutral" />
            ) : null;
          })()}

          {/* Acide Lactique */}
          {!result.error && result.lacticAcidMl > 0 && (
            <ResultActionCard
              description={`${result.lacticAcidMl.toFixed(2)} ml d'Acide Lactique 80%`}
              badge={result.phosphoricAcidMl > 0 ? 'Option A' : undefined}
            />
          )}
          {/* Acide Phosphorique */}
          {!result.error && result.phosphoricAcidMl > 0 && (
            <ResultActionCard
              description={`${result.phosphoricAcidMl.toFixed(2)} ml d'Acide Phosphorique 75%`}
              badge={result.lacticAcidMl > 0 ? 'Option B' : undefined}
            />
          )}
          {/* Bicarbonate de Sodium — alcalinisation */}
          {!result.error && result.bicarbonateGrams > 0 && (
            <ResultActionCard
              description={`${result.bicarbonateGrams.toFixed(2)} g de Bicarbonate de Sodium`}
            />
          )}
          {/* Message seul (malt acide suffisant, etc.) */}
          {!result.error && result.message && result.lacticAcidMl === 0 && result.phosphoricAcidMl === 0 && result.bicarbonateGrams === 0 && result.correctionType !== 'NONE' && (
            <InfoPanel>{result.message}</InfoPanel>
          )}

          {/* Détails MASH */}
          {!result.error && result.details && stage === CorrectionStage.MASH && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between px-4 py-3 mt-1 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Détails du calcul</span>
                <Icons.ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDetails ? 'rotate-90' : ''}`} />
              </button>
              {showDetails && (
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm space-y-1">
                  {currentPhStr && <p className={COMMON_CLASSES.textMuted}><strong>pH actuel :</strong> {currentPhStr}</p>}
                  {targetPhStr && <p className={COMMON_CLASSES.textMuted}><strong>pH cible :</strong> {targetPhStr}</p>}
                  {volumeStr && <p className={COMMON_CLASSES.textMuted}><strong>Volume :</strong> {volumeStr} L</p>}
                  {typeof result.details.autoDetectedMashVolumeL === 'number' && <p className={COMMON_CLASSES.textMuted}><strong>Volume Maische Auto-Détecté :</strong> {result.details.autoDetectedMashVolumeL.toFixed(2)} L</p>}
                  {typeof result.details.residualAlkalinity === 'number' && <p className={COMMON_CLASSES.textMuted}><strong>Alcalinité Résiduelle (AR) :</strong> {result.details.residualAlkalinity.toFixed(2)} ppm as CaCO₃</p>}
                  {typeof result.details.totalMashBuffering === 'number' && <p className={COMMON_CLASSES.textMuted}><strong>Pouvoir Tampon Total :</strong> {result.details.totalMashBuffering.toFixed(2)}</p>}
                  {typeof result.details.initialMEqNeeded === 'number' && <p className={COMMON_CLASSES.textMuted}><strong>mEq Initiaux (avant malt acide) :</strong> {result.details.initialMEqNeeded.toFixed(2)}</p>}
                  {typeof result.details.mEqFromAcidMalt === 'number' && result.details.mEqFromAcidMalt > 0 && <p className={COMMON_CLASSES.textMuted}><strong>mEq apportés par Malt Acide :</strong> {result.details.mEqFromAcidMalt.toFixed(2)}</p>}
                  {typeof result.details.netMEqNeededForAcidification === 'number' && result.correctionType === 'ACIDIFY' && <p className={COMMON_CLASSES.textMuted}><strong>mEq Nets (Acidification) :</strong> {result.details.netMEqNeededForAcidification.toFixed(2)}</p>}
                  {typeof result.details.mEqToAlkalinize === 'number' && result.correctionType === 'ALCALINIZE' && <p className={COMMON_CLASSES.textMuted}><strong>mEq (Alcalinisation) :</strong> {result.details.mEqToAlkalinize.toFixed(2)}</p>}
                  {result.details.maltComposition && (
                    <>
                      <p className={COMMON_CLASSES.textMuted}><strong>Composition Malts (kg) :</strong></p>
                      <ul className="list-disc list-inside pl-4 space-y-0.5">
                        <li className={COMMON_CLASSES.textMuted}>Base : {result.details.maltComposition.BASE.toFixed(3)} kg</li>
                        <li className={COMMON_CLASSES.textMuted}>Crystal : {result.details.maltComposition.CRYSTAL.toFixed(3)} kg</li>
                        <li className={COMMON_CLASSES.textMuted}>Roasted : {result.details.maltComposition.ROASTED.toFixed(3)} kg</li>
                        {result.details.maltComposition.SPECIALTY_ACIDIC ? <li className={COMMON_CLASSES.textMuted}>Acide : {result.details.maltComposition.SPECIALTY_ACIDIC.toFixed(3)} kg</li> : null}
                        {result.details.maltComposition.SPECIALTY_OTHER ? <li className={COMMON_CLASSES.textMuted}>Autre Spéc. : {result.details.maltComposition.SPECIALTY_OTHER.toFixed(3)} kg</li> : null}
                        {result.details.maltComposition.UNKNOWN ? <li className={COMMON_CLASSES.textMuted}>Inconnu : {result.details.maltComposition.UNKNOWN.toFixed(3)} kg</li> : null}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Volume auto-détecté PRE_BOIL */}
          {!result.error && result.details && typeof result.details.autoDetectedPreBoilVolumeL === 'number' && stage === CorrectionStage.PRE_BOIL && (
            <p className={`${COMMON_CLASSES.textMuted} text-xs`}>Volume pré-ébullition auto-détecté du BeerXML : {result.details.autoDetectedPreBoilVolumeL.toFixed(2)} L.</p>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default PhCalculatorScreen;
