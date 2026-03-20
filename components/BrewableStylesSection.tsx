
import React, { useState } from 'react';
import { BrewableStyleResult, WaterCapabilities, StyleBrewabilityStatus, IonRangeInfo, IonKey } from '../types';
import { Icons } from '../components/Common';
import IonRangeBar from './IonRangeBar';

type IonDirection = 'tooHigh' | 'tooLow';

const SENSORY_IMPACT: Partial<Record<IonKey, Partial<Record<IonDirection, string>>>> = {
  so4: {
    tooHigh: "sera trop amère et sèche en finale",
    tooLow:  "manquera d'amertume et paraîtra molle",
  },
  cl: {
    tooHigh: "sera trop ronde et sucrée",
    tooLow:  "semblera fine et manquera de corps maltée",
  },
  hco3: {
    tooHigh: "aura une amertume atténuée et une finale alcaline",
    tooLow:  "pourrait présenter une acidité excessive",
  },
  ca: {
    tooHigh: "pourrait présenter un goût minéral excessif",
    tooLow:  "manquera de corps et de rondeur",
  },
  mg: {
    tooHigh: "présentera une astringence et une amertume désagréable",
  },
  na: {
    tooHigh: "présentera une sensation salée excessive",
  },
};

const SENSORY_PRIORITY: IonKey[] = ['so4', 'cl', 'hco3', 'ca', 'mg', 'na'];

function buildSensoryText(ionRanges: IonRangeInfo[]): string | null {
  const impacts: string[] = [];
  for (const ion of SENSORY_PRIORITY) {
    const info = ionRanges.find(r => r.ion === ion);
    if (!info) continue;
    if (info.current >= info.rangeMin && info.current <= info.rangeMax) continue;
    const direction: IonDirection = info.current > info.rangeMax ? 'tooHigh' : 'tooLow';
    const msg = SENSORY_IMPACT[ion]?.[direction];
    if (msg) impacts.push(msg);
  }
  if (impacts.length === 0) return null;
  if (impacts.length === 1) return impacts[0];
  const last = impacts.pop()!;
  return impacts.join(', ') + ' et ' + last;
}

/** Types d’ajustement d’eau à prévoir pour brasser ce style (lisible au dépliage). */
function buildAdjustmentTypeLines(style: BrewableStyleResult): string[] {
  if (style.status === 'IDEAL') {
    return [
      "Aucun ajustement minéral n'est nécessaire : les ions sont déjà dans la plage cible pour ce style.",
    ];
  }
  if (style.status === 'HORS_PORTEE') {
    return [
      'Réduire des minéraux en excès (sulfates, chlorures, sodium ou magnésium) : seulement possible en diluant avec de l’eau osmosée ou par osmose inverse.',
      'Les ajouts (sels, acide) ne permettent pas d’abaisser ces concentrations.',
    ];
  }
  if (style.status === 'SPECIALITE') {
    return [];
  }
  const lines: string[] = [];
  if (style.needsAcid) {
    lines.push(
      'Traitement acide (lactique ou phosphorique) pour réduire les bicarbonates (HCO₃⁻) — typique si l’eau est trop « dure » pour le style.',
    );
  }
  if (style.needsBicarbonate) {
    lines.push(
      'Ajout de bicarbonate de sodium pour augmenter les bicarbonates (HCO₃⁻) — lorsque l’eau est trop peu minéralisée pour le style.',
    );
  }
  if (style.needsSalts) {
    lines.push(
      'Ajout de sels minéraux (gypse CaSO₄, chlorure de calcium CaCl₂, etc.) pour augmenter sulfates, chlorures et/ou calcium.',
    );
  }
  return lines;
}

function adjustmentPlanBoxClass(status: BrewableStyleResult['status']): string {
  if (status === 'IDEAL') {
    return 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/30';
  }
  if (status === 'HORS_PORTEE') {
    return 'border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/25';
  }
  return 'border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/20';
}

interface StyleStatusConfig {
  dot: string;
  chip: string;
  label: string;
}

const RED_CHIP = 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';

const STATUS_CONFIG: Partial<Record<StyleBrewabilityStatus, StyleStatusConfig>> = {
  IDEAL: {
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    label: 'Idéal tel quel',
  },
  HORS_PORTEE: {
    dot: 'bg-red-400',
    chip: RED_CHIP,
    label: 'Hors de portée',
  },
  SPECIALITE: {
    dot: 'bg-gray-400',
    chip: 'bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    label: 'Profil variable',
  },
};

interface StyleRowProps {
  style: BrewableStyleResult;
  capabilities: WaterCapabilities;
  searchActive: boolean;
}

const StyleRow: React.FC<StyleRowProps> = ({ style, capabilities, searchActive }) => {
  const [expanded, setExpanded] = useState(false);
  const staticCfg = STATUS_CONFIG[style.status];
  const canExpand =
    (style.ionRanges != null && style.ionRanges.length > 0) || style.differences.length > 0;
  const adjustmentLines = buildAdjustmentTypeLines(style);

  const specialiteNote = style.actionRequise === 'prompt_user_for_color'
    ? 'Dépend de la couleur choisie (IPA de Spécialité)'
    : style.actionRequise === 'prompt_user_for_base_style'
    ? 'Profil selon le style de base'
    : null;

  // For AVEC_* statuses: compute missing capability chips
  const missingChips: string[] = [];
  if (!staticCfg) {
    if (style.needsAcid && !capabilities.canAddAcid) missingChips.push('Acide requis');
    if (style.needsSalts && !capabilities.canAddSalts) missingChips.push('Sels requis');
    if (style.needsBicarbonate && !capabilities.canAddBicarbonate) missingChips.push('Bicarbonate requis');
  }

  const dotClass = staticCfg
    ? staticCfg.dot
    : missingChips.length > 0 ? 'bg-red-400' : 'bg-emerald-500';

  return (
    <div className={`rounded-lg calculator:rounded-none border calculator:border-2 transition-colors ${
      style.status === 'HORS_PORTEE' && searchActive
        ? 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10'
        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 calculator:bg-calc-bg-card'
    }`}>
      <button
        type="button"
        onClick={() => canExpand && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${canExpand ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 calculator:hover:bg-calc-bg-surface' : 'cursor-default'} rounded-lg calculator:rounded-none transition-colors`}
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
        <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 w-8 shrink-0">{style.bjcpCode}</span>
        <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 calculator:text-calc-text font-mac">{style.name}</span>
        {specialiteNote && (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic hidden sm:block mr-2">{specialiteNote}</span>
        )}
        {staticCfg ? (
          <span className={`text-xs px-2 py-0.5 rounded calculator:rounded-none border font-medium shrink-0 ${staticCfg.chip}`}>
            {staticCfg.label}
          </span>
        ) : (
          missingChips.map(label => (
            <span key={label} className={`text-xs px-2 py-0.5 rounded calculator:rounded-none border font-medium shrink-0 ${RED_CHIP}`}>
              {label}
            </span>
          ))
        )}
        {style.brewersFriendSlug && (
          <a
            href={`https://www.brewersfriend.com/styles/${style.brewersFriendSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium shrink-0 text-[#2563FF] dark:text-blue-400 border-[#2563FF]/30 dark:border-blue-400/30 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Recettes
            <Icons.ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>
        )}
        {canExpand && (
          <svg className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {expanded && canExpand && (
        <div className="px-3 pb-3 pt-0">
          {specialiteNote && (
            <p className="text-xs italic text-gray-400 dark:text-gray-500 mb-1 sm:hidden">{specialiteNote}</p>
          )}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-0.5 space-y-2">
            {adjustmentLines.length > 0 && (
              <div className={`rounded-lg calculator:rounded-none border px-2.5 py-2 ${adjustmentPlanBoxClass(style.status)}`}>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 calculator:text-calc-text mb-1.5 font-mac">
                  Ajustement pour ce style
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-gray-700 dark:text-gray-300 calculator:text-calc-text leading-snug">
                  {adjustmentLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {style.ionRanges ? (
              <>
                {/* Ion range bars */}
                <div className="space-y-1.5 py-1">
                  {style.ionRanges.map(info => (
                    <IonRangeBar key={info.ion} info={info} />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                    Valeur actuelle
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-0.5 h-3 bg-blue-500" />
                    Après ajustement
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-4 h-2 rounded-sm bg-emerald-400/40" />
                    Plage cible
                  </span>
                </div>

                {/* Sensory impact warning */}
                {(() => {
                  const txt = buildSensoryText(style.ionRanges!);
                  return txt ? (
                    <p className="text-xs text-amber-700 dark:text-amber-400 calculator:text-calc-text italic pt-0.5">
                      Sans les ajustements nécessaires, votre bière {txt}.
                    </p>
                  ) : null;
                })()}
              </>
            ) : (
              /* Fallback text list for SPECIALITE or styles without ionRanges */
              <ul className="space-y-1">
                {style.differences.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    {diff.startsWith('Sulfates trop') || diff.startsWith('Chlorures trop') || diff.startsWith('Sodium trop') || diff.startsWith('Magnésium trop') || diff.startsWith('HCO₃⁻ trop élevé') ? (
                      <Icons.XCircleIcon className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <Icons.PlusCircleIcon className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">{diff}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface BrewableStylesSectionProps {
  brewableStyles: BrewableStyleResult[];
  capabilities: WaterCapabilities;
  onCapabilityChange: (key: keyof WaterCapabilities, value: boolean) => void;
  styleSearchQuery: string;
  onStyleSearchChange: (q: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const BrewableStylesSection: React.FC<BrewableStylesSectionProps> = ({
  brewableStyles,
  capabilities,
  onCapabilityChange,
  styleSearchQuery,
  onStyleSearchChange,
  isExpanded,
  onToggleExpanded,
}) => {
  const searchActive = styleSearchQuery.trim().length > 0;
  const q = styleSearchQuery.trim().toLowerCase();

  const filteredStyles = searchActive
    ? brewableStyles.filter(s =>
        s.bjcpCode.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
      )
    : brewableStyles.filter(s => s.isAchievable);

  const achievableCount = brewableStyles.filter(s => s.isAchievable).length;

  return (
    <div className="bg-white dark:bg-gray-800 dark:bg-gray-900 dark:bg-gray-800 calculator:bg-calc-bg-card rounded-xl calculator:rounded-none border border-gray-200 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border shadow-sm calculator:shadow-mac overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-6 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50:bg-calc-bg-surface dark:hover:bg-gray-700 calculator:hover:bg-calc-bg-surface transition-colors"
      >
        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 dark:text-gray-100 calculator:text-calc-text flex items-center gap-2">
          <Icons.BeakerIcon className="w-5 h-5 text-[#2563FF] dark:text-gray-100 calculator:text-calc-text" />
          Quels styles puis-je brasser ?
          <span className="ml-1 text-sm font-normal px-2 py-0.5 rounded-full calculator:rounded-none bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            {achievableCount} styles
          </span>
        </h4>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-100 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border">
          {/* Capabilities */}
          <div className="mt-5 mb-5 p-4 rounded-lg calculator:rounded-none bg-gray-50 dark:bg-gray-800/50 dark:bg-gray-900 calculator:bg-calc-bg border border-gray-200 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-100 calculator:text-calc-text mb-3 font-mac">
              Mes capacités d'ajustement
            </p>
            <div className="space-y-2.5">
              {([
                { key: 'canAddAcid'  as keyof WaterCapabilities, label: 'Acide lactique ou phosphorique', sub: 'Réduit les bicarbonates (HCO₃⁻)' },
                { key: 'canAddBicarbonate' as keyof WaterCapabilities, label: 'Bicarbonate de sodium', sub: 'Augmente les bicarbonates (HCO₃⁻) — cas rare' },
                { key: 'canAddSalts' as keyof WaterCapabilities, label: 'Ajout de sels minéraux', sub: 'CaSO₄, CaCl₂... — augmente sulfates, chlorures, calcium' },
              ] as const).map(({ key, label, sub }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={capabilities[key]}
                    onChange={e => onCapabilityChange(key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded calculator:rounded-none text-[#2563FF] dark:text-blue-400 calculator:text-calc-accent border-gray-300 dark:border-gray-700 cursor-pointer accent-[#2563FF]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 calculator:text-calc-text font-mac group-hover:text-[#2563FF] dark:group-hover:text-calc-accent:text-calc-accent transition-colors">
                      {label}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mac mt-0.5">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 italic font-mac">
              Rappel : on peut ajouter des minéraux, mais pas en retirer sans osmose inverse.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Rechercher un style BJCP (ex: IPA, Pilsner, 3B...)"
              value={styleSearchQuery}
              onChange={e => onStyleSearchChange(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border rounded-lg calculator:rounded-none bg-white dark:bg-gray-800 dark:bg-gray-900 calculator:bg-calc-bg dark:text-gray-100 calculator:text-calc-text focus:ring-2 focus:ring-[#2563FF] calculator:focus:ring-calc-border focus:border-transparent outline-none transition-all font-mac"
            />
            {styleSearchQuery && (
              <button
                onClick={() => onStyleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-100"
              >
                ×
              </button>
            )}
          </div>

          {/* Hint when search is active */}
          {searchActive && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-3 font-mac">
              Recherche dans tous les styles BJCP, quel que soit leur statut.
            </p>
          )}

          {/* Style list */}
          <div className="space-y-1.5">
            {filteredStyles.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-6 text-center font-mac">
                {searchActive
                  ? `Aucun style ne correspond à «\u00a0${styleSearchQuery}\u00a0».`
                  : 'Aucun style atteignable avec cette eau et ces capacités.'}
              </p>
            )}
            {filteredStyles.map(style => (
              <StyleRow key={style.bjcpCode} style={style} capabilities={capabilities} searchActive={searchActive} />
            ))}
          </div>

          {/* Footer count */}
          {!searchActive && filteredStyles.length > 0 && (
            <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500 font-mac">
              {achievableCount} style{achievableCount > 1 ? 's' : ''} atteignable{achievableCount > 1 ? 's' : ''} avec ton eau et tes capacités actuelles
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrewableStylesSection;
