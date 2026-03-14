
import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, Button, COMMON_CLASSES, Icons } from '../components/Common';
import { WaterQualityResult, Commune } from '../types';
import { fetchWaterQuality, searchCommunes, getCommuneByCoords, fetchNetworks, Network, getBeerStyleRecommendations } from '../services/waterQualityService';
import { searchBottledWaters, getBottledWaterProfile, BottledWaterSearchHit } from '../services/openFoodFactsService';
import { usePersistentState } from '../hooks/usePersistentState';
import { useUrlParams } from '../hooks/useUrlParams';
import FormulaInfoSection from '../components/FormulaInfoSection';

export type WaterSourceType = 'tap' | 'bottle';

export interface WaterApiCache {
  result: WaterQualityResult;
  selectedCommune: Commune;
  selectedNetwork: Network | null;
  networks: Network[];
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function formatVerifiedDate(verifiedDate: string | undefined): string | null {
  if (!verifiedDate) return null;
  const [y, m] = verifiedDate.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return verifiedDate;
  return `${MONTHS_FR[m - 1]} ${y}`;
}

const WaterQualityScreen: React.FC = () => {
  const [waterSource, setWaterSource] = usePersistentState<WaterSourceType>('brewmate:water:source', 'tap');
  const [query, setQuery, clearQueryCache] = usePersistentState('brewmate:water:query', '');
  const [waterCache, setWaterCache, clearWaterCache] = usePersistentState<WaterApiCache | null>(
    'brewmate:water:apiCache',
    null
  );
  const [bottleProductCode, setBottleProductCode] = usePersistentState<string | null>('brewmate:water:bottleCode', null);
  const [bottleProductName, setBottleProductName] = usePersistentState<string>('brewmate:water:bottleName', '');

  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [result, setResult] = useState<WaterQualityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isProfilesExpanded, setIsProfilesExpanded] = useState(false);
  const [geolocSuccess, setGeolocSuccess] = useState(false);

  const [bottleQuery, setBottleQuery, clearBottleQueryCache] = usePersistentState('brewmate:water:bottleQuery', '');
  const [bottleResults, setBottleResults] = useState<BottledWaterSearchHit[]>([]);
  const [isBottleSearching, setIsBottleSearching] = useState(false);
  const [showBottleAutocomplete, setShowBottleAutocomplete] = useState(false);

  const [beerSearchQuery, setBeerSearchQuery, clearBeerSearchCache] = usePersistentState(
    'brewmate:water:beerFilter',
    ''
  );
  
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const searchActivatedRef = useRef(false);
  const justSelectedBottleRef = useRef(false);
  const hydratedFromCacheRef = useRef(false);
  const [urlParams, setUrlParams] = useUrlParams();
  const hasHydratedFromUrlRef = useRef(false);
  const hasAutoSelectedFromUrlRef = useRef(false);

  // Hydrate from URL: bottle (water=bottle&code=...) or city (?city=...)
  useEffect(() => {
    if (hasHydratedFromUrlRef.current) return;
    hasHydratedFromUrlRef.current = true;
    const { city, water, code } = urlParams;
    if (water === 'bottle' && code && code.trim() !== '') {
      setWaterSource('bottle');
      setBottleProductCode(code.trim());
      return;
    }
    if (city != null && city !== '') setQuery(city);
  }, [urlParams]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) return;
    if (waterSource !== 'tap') return;
    setUrlParams({ city: query || undefined, water: undefined, code: undefined });
  }, [waterSource, query]);

  // Auto-resolve city from URL and fetch water quality when landing with ?city=...
  useEffect(() => {
    if (waterSource !== 'tap' || hasAutoSelectedFromUrlRef.current) return;
    const urlCity = urlParams?.city?.trim();
    if (!urlCity || query.trim() !== urlCity) return;
    if (communes.length === 0) return;
    const match = communes.find((c) => c.nom === query.trim()) ?? communes[0];
    hasAutoSelectedFromUrlRef.current = true;
    handleSelectCommune(match, false);
  }, [waterSource, urlParams?.city, query, communes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setShowBottleAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (hydratedFromCacheRef.current || waterSource !== 'tap') return;
    if (!query || !waterCache || waterCache.selectedCommune.nom !== query) return;
    hydratedFromCacheRef.current = true;
    setResult(waterCache.result);
    setSelectedCommune(waterCache.selectedCommune);
    setSelectedNetwork(waterCache.selectedNetwork);
    setNetworks(waterCache.networks);
  }, [query, waterCache, waterSource]);

  useEffect(() => {
    if (waterSource !== 'tap') return;
    if (result && selectedCommune && !result.error) {
      setWaterCache({
        result,
        selectedCommune,
        selectedNetwork,
        networks,
      });
    }
  }, [waterSource, result, selectedCommune, selectedNetwork, networks]);

  const prevWaterSourceRef = useRef<WaterSourceType>(waterSource);
  useEffect(() => {
    if (prevWaterSourceRef.current !== waterSource) {
      prevWaterSourceRef.current = waterSource;
      setResult(null);
      setError('');
    }
  }, [waterSource]);

  useEffect(() => {
    if (waterSource !== 'tap') return;
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
  }, [waterSource, query, selectedCommune]);

  useEffect(() => {
    if (waterSource !== 'bottle') return;
    const t = setTimeout(async () => {
      if (justSelectedBottleRef.current) {
        justSelectedBottleRef.current = false;
        return;
      }
      if (bottleQuery.trim().length < 2) {
        setBottleResults([]);
        setShowBottleAutocomplete(false);
        return;
      }
      setIsBottleSearching(true);
      const hits = await searchBottledWaters(bottleQuery.trim());
      setBottleResults(hits);
      setShowBottleAutocomplete(true);
      setIsBottleSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [waterSource, bottleQuery]);

  useEffect(() => {
    if (waterSource !== 'bottle' || !bottleProductCode) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError('');
      const data = await getBottledWaterProfile(bottleProductCode);
      if (!cancelled && data) {
        setResult(data);
        if (data.productName) {
          setBottleProductName(data.productName);
          setBottleQuery((prev) => (prev.trim() === '' ? data.productName! : prev));
        }
      } else if (!cancelled && data === null) {
        setError('Impossible de récupérer les données de cette eau.');
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [waterSource, bottleProductCode]);

  const handleSelectBottle = async (hit: BottledWaterSearchHit) => {
    justSelectedBottleRef.current = true;
    setShowBottleAutocomplete(false);
    setBottleResults([]);
    setBottleQuery(hit.name);
    setBottleProductCode(hit.code);
    setBottleProductName(hit.name);
    setUrlParams({ water: 'bottle', code: hit.code, city: undefined });
  };

  const handleSelectCommune = async (commune: Commune, isGeolocation: boolean = false) => {
    setSelectedCommune(commune);
    setQuery(commune.nom);
    setShowAutocomplete(false);
    setIsLoading(true);
    setError('');
    setResult(null);
    setNetworks([]);
    setSelectedNetwork(null);

    try {
      const fetchedNetworks = await fetchNetworks(commune.code);
      setNetworks(fetchedNetworks);

      if (fetchedNetworks.length === 0) {
        // Fallback to fetching water quality without network if none found
        handleFetchData(commune.code);
      } else if (fetchedNetworks.length === 1 || isGeolocation) {
        // If only 1 network, or if geolocation used (auto-select first), fetch data
        setSelectedNetwork(fetchedNetworks[0]);
        handleFetchData(commune.code, fetchedNetworks[0].code);
      } else {
        // Multiple networks and manual search: wait for user to select
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des réseaux.');
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
    setError('');
    setResult(null);
    try {
      const data = await fetchWaterQuality(code, reseauCode, selectedCommune?.nom || query);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Impossible de récupérer les données.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const commune = await getCommuneByCoords(latitude, longitude);
        if (commune) {
          setGeolocSuccess(true);
          setTimeout(() => setGeolocSuccess(false), 3000);
          handleSelectCommune(commune, true);
        } else {
          setError("Impossible de déterminer votre commune.");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError("Erreur de géolocalisation. Assurez-vous d'avoir autorisé l'accès.");
        setIsLoading(false);
      }
    );
  };

  const handleRefreshWaterData = () => {
    if (!selectedCommune) {
      setError('Sélectionnez une commune avant de rafraîchir les données.');
      return;
    }
    handleFetchData(selectedCommune.code, selectedNetwork?.code);
  };

  const handleClearWaterData = () => {
    clearQueryCache();
    clearBeerSearchCache();
    clearWaterCache();
    clearBottleQueryCache();
    setBottleProductCode(null);
    setBottleProductName('');
    setBottleQuery('');
    setBottleResults([]);
    setShowBottleAutocomplete(false);
    setCommunes([]);
    setSelectedCommune(null);
    setNetworks([]);
    setSelectedNetwork(null);
    setResult(null);
    setError('');
    setShowAutocomplete(false);
    setIsProfilesExpanded(false);
  };

  const calculateStats = (params: any) => {
    if (!params) return null;
    
    const ca = params.calcium?.value || 0;
    const mg = params.magnesium?.value || 0;
    const na = params.sodium?.value || 0;
    const cl = params.chlorides?.value || 0;
    const so4 = params.sulfates?.value || 0;
    const hco3 = params.bicarbonates?.value || 0;

    const ca_meq = ca / 20.04;
    const mg_meq = mg / 12.15;
    const na_meq = na / 22.99;
    const totalCations = ca_meq + mg_meq + na_meq;

    const cl_meq = cl / 35.45;
    const so4_meq = so4 / 48.03;
    const hco3_meq = hco3 / 61.02;
    const totalAnions = cl_meq + so4_meq + hco3_meq;

    const diff = Math.abs(totalCations - totalAnions);
    const sum = totalCations + totalAnions;
    const ionBalance = sum > 0 ? (diff / sum) * 100 : 0;

    const ratio = cl > 0 ? so4 / cl : 0;
    const durete = (ca * 2.5) + (mg * 4.12);
    const alcalinite = hco3 * 50.04 / 61.02;
    const alcaliniteResiduelle = alcalinite - ((ca / 1.4) + (mg / 1.7));

    return {
      totalCations,
      totalAnions,
      ionBalance,
      ratio,
      durete,
      alcalinite,
      alcaliniteResiduelle,
      ca, mg, na, cl, so4, hco3
    };
  };

  const stats = result ? calculateStats(result.parameters) : null;
  const beerRecommendations = stats ? getBeerStyleRecommendations(stats) : null;

  return (
    <PageLayout title="Qualité de l'eau (France)" showBackButton>
      <div className="space-y-6">
        <div className="flex rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border p-1 bg-gray-50 dark:bg-calc-bg-card/50 light:bg-calc-bg dark:bg-calc-bg calculator:bg-calc-bg">
          <button
            type="button"
            onClick={() => setWaterSource('tap')}
            className={`flex-1 py-2 px-3 rounded-md light:rounded-none dark:rounded-none calculator:rounded-none text-sm font-medium transition-colors ${waterSource === 'tap' ? 'bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card shadow calculator:shadow-mac text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text' : 'text-gray-600 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted hover:text-gray-900 dark:hover:text-calc-text calculator:hover:text-calc-text'}`}
          >
            Eau du robinet
          </button>
          <button
            type="button"
            onClick={() => setWaterSource('bottle')}
            className={`flex-1 py-2 px-3 rounded-md light:rounded-none dark:rounded-none calculator:rounded-none text-sm font-medium transition-colors ${waterSource === 'bottle' ? 'bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card shadow calculator:shadow-mac text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text' : 'text-gray-600 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted hover:text-gray-900 dark:hover:text-calc-text calculator:hover:text-calc-text'}`}
          >
            Eau en bouteille
          </button>
        </div>

        {waterSource === 'tap' && (
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
                  setResult(null);
                  setBeerSearchQuery('');
                }}
                onClear={() => {
                  setQuery('');
                  setSelectedCommune(null);
                  setNetworks([]);
                  setSelectedNetwork(null);
                  setResult(null);
                  setBeerSearchQuery('');
                }}
                placeholder="Ex: Lyon, Paris, Nantes..."
                autoComplete="off"
                wrapperClassName="!mb-0"
                clearable
              />
              {isSearching && (
                <div className="absolute right-3 top-10">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2563FF] light:border-calc-accent dark:border-calc-accent calculator:border-calc-accent"></div>
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
                {geolocSuccess
                  ? <Icons.CheckCircleIcon className="w-5 h-5 text-green-300 dark:text-calc-text" />
                  : <Icons.GeolocIcon className="w-5 h-5" />
                }
              </Button>
            </div>
            {result && (
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

          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted mt-1">Chargement</p>
          )}

          {showAutocomplete && communes.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none shadow-xl max-h-60 overflow-auto">
              {communes.map((c) => (
                <div
                  key={c.code}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 light:hover:bg-calc-bg-surface dark:hover:bg-calc-bg-surface calculator:hover:bg-calc-bg-surface cursor-pointer border-b last:border-0 border-gray-100 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border"
                  onClick={() => handleSelectCommune(c, false)}
                >
                  <div className="font-medium light:text-calc-text dark:text-calc-text calculator:text-calc-text">{c.nom}</div>
                  <div className="text-xs text-gray-500 light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">{c.codesPostaux.join(', ')}</div>
                </div>
              ))}
            </div>
          )}
          {showAutocomplete && communes.length === 0 && query.length > 2 && !isSearching && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none shadow-xl">
              <p className="px-4 py-3 text-sm text-gray-400 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted italic">
                Aucune commune trouvée pour « {query} »
              </p>
            </div>
          )}
        </div>
        )}

        {waterSource === 'bottle' && (
        <div className="relative" ref={autocompleteRef}>
          <div className="relative">
            <Input
              label="Rechercher une eau en bouteille"
              type="text"
              name="bottle"
              id="bottle"
              value={bottleQuery}
              onChange={(e) => {
                setBottleQuery(e.target.value);
                setBottleProductCode(null);
                setResult(null);
                setError('');
              }}
              placeholder="Ex: Evian, Volvic, Contrex..."
              autoComplete="off"
              wrapperClassName="!mb-0"
            />
            {isBottleSearching && (
              <div className="absolute right-3 top-10">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2563FF] light:border-calc-accent dark:border-calc-accent calculator:border-calc-accent"></div>
              </div>
            )}
          </div>
          {showBottleAutocomplete && bottleResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border rounded-lg shadow-xl max-h-60 overflow-auto">
              {bottleResults.map((hit) => (
                <div
                  key={hit.code}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b last:border-0 border-gray-100 dark:border-calc-border"
                  onClick={() => handleSelectBottle(hit)}
                >
                  <div className="font-medium">{hit.name}</div>
                  {hit.brand && hit.brand !== hit.name && <div className="text-xs text-gray-500">{hit.brand}</div>}
                </div>
              ))}
            </div>
          )}
          {showBottleAutocomplete && bottleResults.length === 0 && bottleQuery.trim().length >= 2 && !isBottleSearching && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border rounded-lg shadow-xl">
              <p className="px-4 py-3 text-sm text-gray-400 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted italic">
                Aucune eau trouvée pour « {bottleQuery} »
              </p>
            </div>
          )}
        </div>
        )}

        {waterSource === 'tap' && networks.length > 1 && (
          <div className="bg-blue-50 dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface p-4 rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none border border-blue-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border animate-in fade-in">
            <label className="block text-sm font-medium text-blue-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text mb-2">
              Plusieurs points de captation (réseaux) disponibles pour cette commune. Veuillez en sélectionner un :
            </label>
            <select
              className={COMMON_CLASSES.input + " bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card"}
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

        {error && <p className={COMMON_CLASSES.errorText}>{error}</p>}

        <Button type="button" variant="secondary" onClick={handleClearWaterData} className="w-full">
          Effacer les valeurs
        </Button>

        {isLoading && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Skeleton qui préfigure la carte résultat */}
            <div className="bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card p-6 rounded-xl light:rounded-none dark:rounded-none calculator:rounded-none border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border shadow-sm calculator:shadow-mac">
              <div className="flex justify-between items-end border-b border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border pb-4 mb-4">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse" />
                  <div className="h-6 w-48 bg-gray-200 dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse" />
                  <div className="h-3 w-36 bg-gray-100 dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse" />
              </div>
              <div className="flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-gray-100 dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-3 w-8 bg-gray-100 dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse ml-auto" />
                  <div className="h-8 w-12 bg-gray-200 dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface rounded light:rounded-none dark:rounded-none calculator:rounded-none animate-pulse ml-auto" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#2563FF]/30 border-t-[#2563FF] light:border-calc-accent dark:border-calc-accent calculator:border-calc-accent" />
            </div>
          </div>
        )}

        {result && !isLoading && stats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card p-6 rounded-xl light:rounded-none dark:rounded-none calculator:rounded-none border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border shadow-sm calculator:shadow-mac">
              <div className="flex flex-wrap justify-between items-end gap-2 border-b border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">Nom de profil</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">
                    {result.dataSource === 'openfoodfacts' || result.dataSource === 'local-db'
                      ? `Eau en bouteille ${result.productName || bottleProductName || '—'}`
                      : `Eau robinet ${result.commune} ${selectedNetwork ? `(${selectedNetwork.name})` : ''}`}
                  </h3>
                  {(result.dataSource === 'openfoodfacts' || result.dataSource === 'sise-eaux' || result.dataSource === 'hubeau') && (
                    <p className="text-xs text-gray-400 light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted mt-1">
                      {result.dataSource === 'openfoodfacts'
                        ? 'Source : Open Food Facts'
                        : result.dataSource === 'sise-eaux'
                        ? 'Source : SISE-Eaux'
                        : "Source : Hub'Eau"}
                    </p>
                  )}
                  {result.dataSource === 'local-db' && result.sourceNote && (
                    <p className="text-xs text-amber-600 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted mt-1 italic">{result.sourceNote}</p>
                  )}
                  {result.dataSource === 'local-db' && (
                    <div className="text-xs mt-2 pt-2 border-t border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border space-y-1">
                      {result.citation && (
                        <p className="text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">
                          Source :{' '}
                          <a
                            href={result.citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text hover:underline"
                          >
                            {result.citation.source}
                            <Icons.ArrowTopRightOnSquareIcon className="w-4 h-4 shrink-0" aria-hidden />
                          </a>
                        </p>
                      )}
                      {result.citation?.verifiedDate && (
                        <p className="text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">
                          Dernière mise à jour : {formatVerifiedDate(result.citation.verifiedDate)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {(result.dataSource === 'openfoodfacts' || result.dataSource === 'sise-eaux' || result.dataSource === 'hubeau') && (
                  <div className="px-2 py-1 rounded light:rounded-none dark:rounded-none calculator:rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#E6EEFF] dark:bg-calc-bg-surface light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-surface dark:bg-calc-bg-surface calculator:bg-calc-bg-surface text-[#1A237E] dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">
                    {result.dataSource === 'openfoodfacts' ? 'Open Food Facts'
                      : result.dataSource === 'sise-eaux' ? 'SISE-Eaux'
                      : "Hub'Eau"}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">Type</p>
                  <p className="font-medium text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">
                    {result.dataSource === 'openfoodfacts' || result.dataSource === 'local-db' ? 'Eau en bouteille' : 'Eau du réseau'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">pH</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">
                    {result.parameters.ph?.value ? result.parameters.ph.value.toFixed(1) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {result.dataSource === 'openfoodfacts' && (result.mineralCompleteness ?? 0) > 0 && (result.mineralCompleteness ?? 0) < 3 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card border border-amber-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border rounded-xl light:rounded-none dark:rounded-none calculator:rounded-none text-sm text-amber-800 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">
                <Icons.InformationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Données minérales partielles dans Open Food Facts ({result.mineralCompleteness}/6 ions renseignés). L'équilibre ionique n'est pas fiable — essayez une autre référence du même produit.</span>
              </div>
            )}

            {(result.dataSource === 'local-db'
              || (result.dataSource !== 'openfoodfacts'
                  ? Object.values(result.parameters).some((p: any) => p && p.name !== 'Potentiel en hydrogène (pH)' && p.value > 0)
                  : (result.mineralCompleteness ?? 0) >= 3)
            ) ? (
              <div className="bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card p-6 rounded-xl light:rounded-none dark:rounded-none calculator:rounded-none border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border shadow-sm calculator:shadow-mac">

                {/* Cations */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-green-700 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">Cations {stats.totalCations.toFixed(2)} mEq/L</h4>
                    <span className="text-xs text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">équilibre ionique {stats.ionBalance.toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border py-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">Calcium Ca²⁺ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{result.parameters.calcium.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">Magnésium Mg²⁺ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{result.parameters.magnesium.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">Sodium Na⁺ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{result.parameters.sodium.value.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Anions */}
                <div className="mb-8">
                  <h4 className="font-bold text-green-700 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text mb-2">Anions {stats.totalAnions.toFixed(2)} mEq/L</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border py-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">Chlorure Cl⁻ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{result.parameters.chlorides.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">Sulfate SO₄²⁻ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{result.parameters.sulfates.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">Bicarbonate HCO₃⁻ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{result.parameters.bicarbonates.value.toFixed(2)}</p>
                    </div>
                  </div>
                  {result.parameters.bicarbonates.source === 'TAC' && (
                    <p className="text-[10px] mt-2 text-gray-400 italic text-right">
                      * Bicarbonates estimés à partir du TAC.
                    </p>
                  )}
                </div>

                {/* Statistiques */}
                <div>
                  <h4 className="font-bold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border py-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted flex justify-between">SO₄²⁻/Cl⁻ <span className="font-semibold text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text">ratio</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{stats.ratio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">Dureté</p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{stats.durete.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">Alcalinité</p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{stats.alcalinite.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-calc-text-muted light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted">Alcalinité résiduelle</p>
                      <p className="text-2xl font-bold text-right mt-1 text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text">{stats.alcaliniteResiduelle.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-calc-bg-card/50 light:bg-calc-bg dark:bg-calc-bg calculator:bg-calc-bg rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none border border-dashed border-gray-300 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border">
                <Icons.InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-calc-text-muted">
                  {result.dataSource === 'openfoodfacts'
                    ? 'Aucune donnée minérale disponible pour ce produit dans Open Food Facts. Essayez de scanner le code-barre ou de chercher une autre référence de la même marque.'
                    : 'Les analyses sanitaires récentes pour cette commune ne contiennent pas les paramètres minéraux nécessaires au brassage (Calcium, Magnésium, etc.).'}
                </p>
              </div>
            )}

            {/* Beer Style Recommendations */}
            {beerRecommendations && (
              <div className="bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card rounded-xl light:rounded-none dark:rounded-none calculator:rounded-none border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border shadow-sm calculator:shadow-mac overflow-hidden">
                <button 
                  onClick={() => setIsProfilesExpanded(!isProfilesExpanded)}
                  className="w-full flex items-center justify-between p-6 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 light:hover:bg-calc-bg-surface dark:hover:bg-calc-bg-surface calculator:hover:bg-calc-bg-surface transition-colors"
                >
                  <h4 className="font-bold text-lg text-gray-900 dark:text-calc-text light:text-calc-text dark:text-calc-text calculator:text-calc-text flex items-center gap-2">
                    <Icons.BeakerIcon className="w-5 h-5 text-[#2563FF] light:text-calc-text dark:text-calc-text calculator:text-calc-text" />
                    Profils d'eau & Styles (BJCP)
                  </h4>
                  <svg 
                    className={`w-5 h-5 text-gray-500 light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted transition-transform duration-200 ${isProfilesExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProfilesExpanded && (
                  <div className="p-6 pt-0 border-t border-gray-100 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 mt-4">
                      <div className="relative w-full md:w-64 ml-auto">
                        <input
                          type="text"
                          placeholder="Filtrer un style ou profil..."
                          value={beerSearchQuery}
                          onChange={(e) => setBeerSearchQuery(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg calculator:bg-calc-bg light:text-calc-text dark:text-calc-text calculator:text-calc-text focus:ring-2 focus:ring-[#2563FF] calculator:focus:ring-calc-border focus:border-transparent outline-none transition-all"
                        />
                        {beerSearchQuery && (
                          <button 
                            onClick={() => setBeerSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {beerRecommendations.filter(evaluation => {
                        if (!beerSearchQuery) return true;
                        const q = beerSearchQuery.toLowerCase();
                        return evaluation.name.toLowerCase().includes(q) || evaluation.bjcpStyles.some(s => s.toLowerCase().includes(q));
                      }).map(evaluation => (
                        <div key={evaluation.id} className={`p-4 rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none border light:bg-calc-bg dark:bg-calc-bg calculator:bg-calc-bg light:border-calc-border dark:border-calc-border calculator:border-calc-border ${evaluation.statusBorderColor} ${evaluation.statusBgColor}`}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                            <div>
                              <h5 className="font-bold text-gray-900 dark:text-white">{evaluation.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-calc-text-muted mt-1">{evaluation.description}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full light:rounded-none dark:rounded-none calculator:rounded-none text-sm font-semibold whitespace-nowrap border ${evaluation.statusBorderColor} ${evaluation.statusColor} bg-white dark:bg-calc-bg-card light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card light:border-calc-border dark:border-calc-border calculator:border-calc-border light:text-calc-text dark:text-calc-text calculator:text-calc-text`}>
                              {evaluation.statusLabel}
                            </div>
                          </div>
                          {evaluation.differences && evaluation.differences.length > 0 && (
                            <div className="mt-3 mb-1">
                              <ul className="space-y-1">
                                {evaluation.differences.map((diff, idx) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    {diff.startsWith('Trop') ? (
                                      <Icons.XCircleIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    ) : (
                                      <Icons.PlusCircleIcon className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                    )}
                                    <span className="text-gray-700 dark:text-calc-text-muted">{diff}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {evaluation.bjcpStyles.filter(s => !beerSearchQuery || s.toLowerCase().includes(beerSearchQuery.toLowerCase())).map(style => (
                              <span key={style} className="px-2 py-0.5 bg-white/60 dark:bg-black/20 light:bg-calc-bg dark:bg-calc-bg light:bg-calc-bg-card dark:bg-calc-bg-card calculator:bg-calc-bg-card text-gray-700 dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text rounded light:rounded-none dark:rounded-none calculator:rounded-none text-xs border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border">
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                      {beerRecommendations.length > 0 && beerRecommendations.filter(evaluation => {
                        if (!beerSearchQuery) return true;
                        const q = beerSearchQuery.toLowerCase();
                        return evaluation.name.toLowerCase().includes(q) || evaluation.bjcpStyles.some(s => s.toLowerCase().includes(q));
                      }).length === 0 && (
                        <p className="text-sm text-gray-500 italic py-4 text-center">
                          Aucun profil ou style ne correspond à "{beerSearchQuery}".
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-calc-bg-card/50 light:bg-calc-bg dark:bg-calc-bg calculator:bg-calc-bg rounded-lg light:rounded-none dark:rounded-none calculator:rounded-none border border-gray-200 dark:border-calc-border light:border-calc-border dark:border-calc-border calculator:border-calc-border">
              <p className="text-xs text-gray-500 light:text-calc-text-muted dark:text-calc-text-muted light:text-calc-text dark:text-calc-text calculator:text-calc-text-muted leading-relaxed">
                <strong>Note :</strong> Ces données proviennent {result.dataSource === 'openfoodfacts' ? 'd\'Open Food Facts (base collaborative)' : result.dataSource === 'sise-eaux' ? 'de la base nationale SISE-Eaux (data.gouv.fr) via moneaudebrassage.fr' : 'du portail national Hub\'Eau'}. Les valeurs peuvent varier selon le point de prélèvement et la période de l'année. Pour un brassage de précision, une analyse d'eau à domicile reste la référence.
              </p>
            </div>
          </div>
        )}
      {result && !isLoading && stats && (() => {
        const computedMEq = [
          `Ca²⁺  = ${stats.ca.toFixed(1)} ppm → ${(stats.ca / 20.04).toFixed(2)} mEq/L`,
          `Mg²⁺  = ${stats.mg.toFixed(1)} ppm → ${(stats.mg / 12.15).toFixed(2)} mEq/L`,
          `Na⁺   = ${stats.na.toFixed(1)} ppm → ${(stats.na / 22.99).toFixed(2)} mEq/L`,
          `Cl⁻   = ${stats.cl.toFixed(1)} ppm → ${(stats.cl / 35.45).toFixed(2)} mEq/L`,
          `SO₄²⁻ = ${stats.so4.toFixed(1)} ppm → ${(stats.so4 / 48.03).toFixed(2)} mEq/L`,
          `HCO₃⁻ = ${stats.hco3.toFixed(1)} ppm → ${(stats.hco3 / 61.02).toFixed(2)} mEq/L`,
          '',
          `Σcat = ${stats.totalCations.toFixed(2)} mEq/L,  Σan = ${stats.totalAnions.toFixed(2)} mEq/L`,
          `balance ionique = ${stats.ionBalance.toFixed(1)} %`,
        ];
        const computedDurete = [
          `dureté = Ca × 2.497 + Mg × 4.118 = ${stats.ca.toFixed(1)} × 2.497 + ${stats.mg.toFixed(1)} × 4.118 = ${stats.durete.toFixed(0)} ppm CaCO₃`,
        ];
        const computedAR = [
          `alcalinité = HCO₃⁻ × (50.04/61.02) = ${stats.hco3.toFixed(1)} × 0.820 ≈ ${stats.alcalinite.toFixed(0)} ppm CaCO₃`,
          '',
          `AR = alcalinité − (Ca/1.4) − (Mg/1.7) = ${stats.alcaliniteResiduelle.toFixed(0)}`,
        ];
        return (
      <FormulaInfoSection
        entries={[
          {
            name: 'Conversions ioniques en milliéquivalents (mEq/L)',
            description:
              "Pour comparer les charges entre cations et anions, chaque ion est converti en mEq/L en divisant sa concentration (mg/L) par sa masse équivalente (masse molaire / valence).",
            formulas: [
              'Ca²⁺  : mEq/L = ppm / 20.04   (masse éq. = 40.08 / 2)',
              'Mg²⁺  : mEq/L = ppm / 12.15   (masse éq. = 24.31 / 2)',
              'Na⁺   : mEq/L = ppm / 22.99   (masse éq. = 22.99 / 1)',
              'Cl⁻   : mEq/L = ppm / 35.45   (masse éq. = 35.45 / 1)',
              'SO₄²⁻ : mEq/L = ppm / 48.03   (masse éq. = 96.06 / 2)',
              'HCO₃⁻ : mEq/L = ppm / 61.02   (masse éq. = 61.02 / 1)',
              '',
              'balance ionique (%) = |Σcat − Σan| / (Σcat + Σan) × 100',
              '< 10 % → profil cohérent  |  > 10 % → probable erreur de mesure',
            ],
            computed: computedMEq,
            sources: [
              {
                label: "WHO — Guidelines for Drinking-water Quality (4th ed.)",
                url: 'https://www.who.int/publications/i/item/9789240045064',
              },
              {
                label: "Palmer & Kaminski — Water: A Comprehensive Guide for Brewers (2013)",
                url: 'https://www.brewerspublications.com/products/water-a-comprehensive-guide-for-brewers',
              },
            ],
          },
          {
            name: 'Dureté totale de l\'eau (titre hydrotimétrique, CaCO₃)',
            description:
              "La dureté mesure la concentration totale en ions divalents (Ca²⁺ et Mg²⁺), exprimée en équivalent CaCO₃.",
            formulas: [
              'dureté (ppm CaCO₃) = Ca × 2.497 + Mg × 4.118',
              '',
              'Facteurs : rapport masse molaire CaCO₃ / masse éq. de chaque ion',
              '  Ca : 100.09 / 20.04 ≈ 2.497',
              '  Mg : 100.09 / 12.15 ≈ 4.118',
            ],
            computed: computedDurete,
            sources: [
              {
                label: "Palmer & Kaminski — Water: A Comprehensive Guide for Brewers (2013)",
                url: 'https://www.brewerspublications.com/products/water-a-comprehensive-guide-for-brewers',
              },
            ],
          },
          {
            name: 'Alcalinité Résiduelle — Kolbach (1953)',
            description:
              "L'alcalinité résiduelle prédit l'effet de l'eau sur le pH de la maische : Ca²⁺ et Mg²⁺ neutralisent une partie de l'alcalinité des bicarbonates.",
            formulas: [
              'alcalinité (ppm CaCO₃) = HCO₃⁻ × (50.04 / 61.02)',
              '',
              'AR = alcalinité − (Ca / 1.4) − (Mg / 1.7)',
              '',
              'AR > 0  →  eau alcaline (tend à hausser le pH de maische)',
              'AR < 0  →  eau douce (tend à abaisser le pH de maische)',
              'AR ≈ 0  →  eau neutre pour la maische',
            ],
            computed: computedAR,
            sources: [
              {
                label: "Palmer & Kaminski — Water: A Comprehensive Guide for Brewers (2013)",
                url: 'https://www.brewerspublications.com/products/water-a-comprehensive-guide-for-brewers',
              },
              {
                label: "Brewer's Friend — Water Chemistry Calculator",
                url: 'https://www.brewersfriend.com/water-chemistry/',
              },
            ],
          },
        ]}
      />
        );
      })()}
      </div>
    </PageLayout>
  );
};

export default WaterQualityScreen;
