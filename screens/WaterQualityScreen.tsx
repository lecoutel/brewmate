
import React, { useState, useEffect, useRef } from 'react';
import { PageLayout, Input, Button, COMMON_CLASSES, Icons } from '../components/Common';
import { WaterQualityResult, Commune } from '../types';
import { fetchWaterQuality, searchCommunes, getCommuneByCoords, fetchNetworks, Network, getBeerStyleRecommendations } from '../services/waterQualityService';

const WaterQualityScreen: React.FC = () => {
  const [query, setQuery] = useState('');
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
  
  const [beerSearchQuery, setBeerSearchQuery] = useState('');
  
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
                  setResult(null);
                  setBeerSearchQuery('');
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
              Plusieurs points de captation (réseaux) disponibles pour cette commune. Veuillez en sélectionner un :
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

        {error && <p className={COMMON_CLASSES.errorText}>{error}</p>}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF]"></div>
            <p className="text-sm text-gray-500">Récupération des données Hub'Eau...</p>
          </div>
        )}

        {result && !isLoading && stats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom de profil</p>
                  <h3 className="text-xl font-bold text-light-on-surface dark:text-dark-on-surface">
                    Eau robinet {result.commune} {selectedNetwork ? `(${selectedNetwork.name})` : ''}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Dernière analyse : {result.lastAnalysisDate || 'Inconnue'}</p>
                </div>
                <div className="bg-[#E6EEFF] dark:bg-blue-900/40 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#1A237E] dark:text-blue-200">
                  {result.dataSource === 'sise-eaux' ? 'SISE-Eaux' : "Hub'Eau"}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium text-light-on-surface dark:text-dark-on-surface">Eau du réseau</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">pH</p>
                  <p className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                    {result.parameters.ph?.value ? result.parameters.ph.value.toFixed(1) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {Object.values(result.parameters).some((p: any) => p && p.name !== 'Potentiel en hydrogène (pH)' && p.value > 0) ? (
              <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                
                {/* Cations */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-green-700 dark:text-green-500">Cations {stats.totalCations.toFixed(2)} mEq/L</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">équilibre ionique {stats.ionBalance.toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">Calcium Ca²⁺ <span className="font-semibold text-gray-700 dark:text-gray-300">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{result.parameters.calcium.value.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">Magnésium Mg²⁺ <span className="font-semibold text-gray-700 dark:text-gray-300">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{result.parameters.magnesium.value.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">Sodium Na⁺ <span className="font-semibold text-gray-700 dark:text-gray-300">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{result.parameters.sodium.value.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Anions */}
                <div className="mb-8">
                  <h4 className="font-bold text-green-700 dark:text-green-500 mb-2">Anions {stats.totalAnions.toFixed(2)} mEq/L</h4>
                  <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">Chlorure Cl⁻ <span className="font-semibold text-gray-700 dark:text-gray-300">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{result.parameters.chlorides.value.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">Sulfate SO₄²⁻ <span className="font-semibold text-gray-700 dark:text-gray-300">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{result.parameters.sulfates.value.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">Bicarbonate HCO₃⁻ <span className="font-semibold text-gray-700 dark:text-gray-300">ppm</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{result.parameters.bicarbonates.value.toFixed(1)}</p>
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
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">SO₄²⁻/Cl⁻ <span className="font-semibold text-gray-700 dark:text-gray-300">ratio</span></p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{stats.ratio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dureté</p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{stats.durete.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Alcalinité</p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{stats.alcalinite.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Alcalinité résiduelle</p>
                      <p className="text-2xl font-bold text-right mt-1 text-light-on-surface dark:text-dark-on-surface">{stats.alcaliniteResiduelle.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <Icons.InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Les analyses sanitaires récentes pour cette commune ne contiennent pas les paramètres minéraux nécessaires au brassage (Calcium, Magnésium, etc.).
                </p>
              </div>
            )}

            {/* Beer Style Recommendations */}
            {beerRecommendations && (
              <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => setIsProfilesExpanded(!isProfilesExpanded)}
                  className="w-full flex items-center justify-between p-6 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <h4 className="font-bold text-lg text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
                    <Icons.BeakerIcon className="w-5 h-5 text-[#2563FF]" />
                    Profils d'eau & Styles (BJCP)
                  </h4>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isProfilesExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProfilesExpanded && (
                  <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 mt-4">
                      <div className="relative w-full md:w-64 ml-auto">
                        <input
                          type="text"
                          placeholder="Filtrer un style ou profil..."
                          value={beerSearchQuery}
                          onChange={(e) => setBeerSearchQuery(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface focus:ring-2 focus:ring-[#2563FF] focus:border-transparent outline-none transition-all"
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
                        <div key={evaluation.id} className={`p-4 rounded-lg border ${evaluation.statusBorderColor} ${evaluation.statusBgColor}`}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                            <div>
                              <h5 className="font-bold text-gray-900 dark:text-white">{evaluation.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{evaluation.description}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap border ${evaluation.statusBorderColor} ${evaluation.statusColor} bg-white dark:bg-gray-800`}>
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
                                    <span className="text-gray-700 dark:text-gray-300">{diff}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {evaluation.bjcpStyles.filter(s => !beerSearchQuery || s.toLowerCase().includes(beerSearchQuery.toLowerCase())).map(style => (
                              <span key={style} className="px-2 py-0.5 bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 rounded text-xs border border-gray-200 dark:border-gray-700">
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

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Note :</strong> Ces données proviennent {result.dataSource === 'sise-eaux' ? 'de la base nationale SISE-Eaux (data.gouv.fr) via moneaudebrassage.fr' : 'du portail national Hub\'Eau'}. Les valeurs peuvent varier selon le point de prélèvement et la période de l'année. Pour un brassage de précision, une analyse d'eau à domicile reste la référence.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default WaterQualityScreen;
