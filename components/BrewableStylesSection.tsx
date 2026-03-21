
import React, { useState } from 'react';
import { BrewableStyleResult, WaterCapabilities, StyleBrewabilityStatus, IonRangeInfo, IonKey } from '../types';
import { Icons } from '../components/Common';
import IonRangeBar from './IonRangeBar';

type IonDirection = 'tooHigh' | 'tooLow';

const SENSORY_IMPACT: Partial<Record<IonKey, Partial<Record<IonDirection, string>>>> = {
  so4: {
    tooHigh: "trop amère avec une sécheresse désagréable",
    tooLow:  "manquera de mordant amer — houblon « plat »",
  },
  cl: {
    tooHigh: "trop sucrée et épaisse, côté sirupeux",
    tooLow:  "aqueuse et « vide » en bouche — pas de rondeur maltée",
  },
  hco3: {
    tooHigh: "arrière-goût savonneux, amertume gommée",
    tooLow:  "trop acide et mordante",
  },
  ca: {
    tooHigh: "goût minéral ou crayeux prononcé",
    tooLow:  "manquera de « texture » — légère et sans relief",
  },
  mg: {
    tooHigh: "sensation âpre et sèche sur la langue",
  },
  na: {
    tooHigh: "goût salé perceptible",
  },
};

interface AdjustmentItem {
  salt: string;
  action: string;
  detail: string;
  delta: string;
  sensory: string | null;
  type: 'add' | 'reduce' | 'ok' | 'dilute';
}

/** Helper: find ion range info by key. */
function ionInfo(style: BrewableStyleResult, ion: IonKey): IonRangeInfo | undefined {
  return style.ionRanges?.find(r => r.ion === ion);
}

/** Structured adjustment items for a style. */
function buildAdjustmentItems(style: BrewableStyleResult): AdjustmentItem[] {
  if (style.status === 'IDEAL') {
    return [{
      salt: 'Aucun ajustement',
      action: 'Votre eau est déjà dans la plage cible pour ce style.',
      detail: '',
      delta: '',
      sensory: null,
      type: 'ok',
    }];
  }
  if (style.status === 'HORS_PORTEE') {
    const excessParts: string[] = [];
    for (const ion of ['so4', 'cl', 'na', 'mg'] as IonKey[]) {
      const info = ionInfo(style, ion);
      if (info && info.current > info.rangeMax) {
        excessParts.push(`${info.symbol} +${Math.round(info.current - info.rangeMax)}`);
      }
    }
    return [{
      salt: 'Dilution requise',
      action: "Minéraux en excès non réductibles sans dilution à l'eau osmosée.",
      detail: excessParts.length > 0 ? excessParts.join('  ·  ') : '',
      delta: '',
      sensory: null,
      type: 'dilute',
    }];
  }
  if (style.status === 'SPECIALITE') {
    return [];
  }

  const items: AdjustmentItem[] = [];

  if (style.needsAcid) {
    const hco3 = ionInfo(style, 'hco3');
    if (hco3) {
      items.push({
        salt: 'Acide lactique ou phosphorique',
        action: 'Réduire les bicarbonates (HCO₃⁻)',
        detail: `${Math.round(hco3.current)} → ${Math.round(hco3.rangeMax)} mg/L`,
        delta: `−${Math.round(hco3.current - hco3.rangeMax)}`,
        sensory: SENSORY_IMPACT.hco3!.tooHigh!,
        type: 'reduce',
      });
    }
  }

  if (style.needsBicarbonate) {
    const hco3 = ionInfo(style, 'hco3');
    if (hco3) {
      items.push({
        salt: 'Bicarbonate de sodium (NaHCO₃)',
        action: 'Augmenter les bicarbonates (HCO₃⁻)',
        detail: `${Math.round(hco3.current)} → ${Math.round(hco3.rangeMin)} mg/L`,
        delta: `+${Math.round(hco3.rangeMin - hco3.current)}`,
        sensory: SENSORY_IMPACT.hco3!.tooLow!,
        type: 'add',
      });
    }
  }

  if (style.needsSalts) {
    const so4 = ionInfo(style, 'so4');
    const cl  = ionInfo(style, 'cl');
    const ca  = ionInfo(style, 'ca');

    if (so4 && so4.current < so4.rangeMin) {
      items.push({
        salt: 'Gypse (CaSO₄)',
        action: 'Augmenter les sulfates (SO₄²⁻)',
        detail: `${Math.round(so4.current)} → ${Math.round(so4.target)} mg/L`,
        delta: `+${Math.round(so4.rangeMin - so4.current)}`,
        sensory: SENSORY_IMPACT.so4!.tooLow!,
        type: 'add',
      });
    }

    if (cl && cl.current < cl.rangeMin) {
      items.push({
        salt: 'Chlorure de calcium (CaCl₂)',
        action: 'Augmenter les chlorures (Cl⁻)',
        detail: `${Math.round(cl.current)} → ${Math.round(cl.target)} mg/L`,
        delta: `+${Math.round(cl.rangeMin - cl.current)}`,
        sensory: SENSORY_IMPACT.cl!.tooLow!,
        type: 'add',
      });
    }

    const so4AlreadyLow = so4 && so4.current < so4.rangeMin;
    const clAlreadyLow  = cl  && cl.current  < cl.rangeMin;
    if (ca && ca.current < ca.rangeMin && !so4AlreadyLow && !clAlreadyLow) {
      items.push({
        salt: 'Gypse (CaSO₄) ou CaCl₂',
        action: 'Augmenter le calcium (Ca²⁺)',
        detail: `${Math.round(ca.current)} → ${Math.round(ca.target)} mg/L`,
        delta: `+${Math.round(ca.rangeMin - ca.current)}`,
        sensory: SENSORY_IMPACT.ca!.tooLow!,
        type: 'add',
      });
    }
  }

  return items;
}

function adjustmentPlanBoxClass(status: BrewableStyleResult['status']): string {
  if (status === 'IDEAL') {
    return 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/30 calculator:border-calc-border calculator:bg-calc-bg-surface';
  }
  if (status === 'HORS_PORTEE') {
    return 'border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/25 calculator:border-calc-border calculator:bg-calc-bg-surface';
  }
  return 'border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/20 calculator:border-calc-border calculator:bg-calc-bg-surface';
}

interface StyleStatusConfig {
  dot: string;
  chip: string;
  label: string;
}

const RED_CHIP = 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50 calculator:bg-calc-bg-surface calculator:text-calc-error calculator:border-calc-border';

const STATUS_CONFIG: Partial<Record<StyleBrewabilityStatus, StyleStatusConfig>> = {
  IDEAL: {
    dot: 'bg-emerald-500 calculator:bg-calc-text',
    chip: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 calculator:bg-calc-bg-surface calculator:text-calc-text calculator:border-calc-border',
    label: 'Idéal tel quel',
  },
  HORS_PORTEE: {
    dot: 'bg-red-400 calculator:bg-calc-error',
    chip: RED_CHIP,
    label: 'Hors de portée',
  },
  SPECIALITE: {
    dot: 'bg-gray-400 calculator:bg-calc-text-muted',
    chip: 'bg-gray-50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 calculator:bg-calc-bg-surface calculator:text-calc-text-muted calculator:border-calc-border',
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
  const adjustmentItems = buildAdjustmentItems(style);

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
    : missingChips.length > 0 ? 'bg-red-400 calculator:bg-calc-error' : 'bg-emerald-500 calculator:bg-calc-text';

  return (
    <div className={`rounded-lg calculator:rounded-none border calculator:border-2 transition-colors ${
      style.status === 'HORS_PORTEE' && searchActive
        ? 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 calculator:border-calc-border calculator:bg-calc-bg-surface'
        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 calculator:bg-calc-bg-card'
    }`}>
      <button
        type="button"
        onClick={() => canExpand && setExpanded(!expanded)}
        className={`w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-left ${canExpand ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 calculator:hover:bg-calc-bg-surface' : 'cursor-default'} rounded-lg calculator:rounded-none transition-colors`}
      >
        {/* Top line: dot + code + name + chevron */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${dotClass}`} />
          <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted shrink-0">{style.bjcpCode}</span>
          <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 calculator:text-calc-text calculator:font-mac leading-snug min-w-0 truncate">{style.name}</span>
          {specialiteNote && (
            <span className="text-xs text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted italic hidden lg:block mr-2 shrink-0">{specialiteNote}</span>
          )}
          {canExpand && (
            <svg className={`w-3.5 h-3.5 shrink-0 text-gray-400 calculator:text-calc-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {/* Bottom line: status chips + recettes link */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1 ml-[calc(0.5rem+1rem)] sm:ml-[calc(0.75rem+1.25rem)]">
          {staticCfg ? (
            <span className={`text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded calculator:rounded-none border font-medium ${staticCfg.chip}`}>
              {staticCfg.label}
            </span>
          ) : (
            missingChips.map(label => (
              <span key={label} className={`text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded calculator:rounded-none border font-medium ${RED_CHIP}`}>
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
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded calculator:rounded-none border font-medium text-[#2563FF] dark:text-blue-400 calculator:text-calc-text border-[#2563FF]/30 dark:border-blue-400/30 calculator:border-calc-border bg-blue-50/50 dark:bg-blue-900/10 calculator:bg-calc-bg-surface hover:bg-blue-50 dark:hover:bg-blue-900/20 calculator:hover:bg-calc-highlight transition-colors"
            >
              Recettes
              <Icons.ArrowTopRightOnSquareIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </button>

      {expanded && canExpand && (
        <div className="px-2.5 pb-3 sm:px-3 pt-0">
          {specialiteNote && (
            <p className="text-xs italic text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted mb-1 sm:hidden">{specialiteNote}</p>
          )}
          <div className="border-t border-gray-100 dark:border-gray-700 calculator:border-calc-border pt-2 mt-0.5 space-y-2">
            {adjustmentItems.length > 0 && (
              <div className={`rounded-lg calculator:rounded-none border px-2.5 py-2 ${adjustmentPlanBoxClass(style.status)}`}>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 calculator:text-calc-text mb-1.5 calculator:font-mac">
                  Ajustement pour ce style
                </p>
                <div className="space-y-2">
                  {adjustmentItems.map((item, i) => (
                    <div key={i} className={`text-xs ${i > 0 ? 'border-t border-gray-200/50 dark:border-gray-600/30 calculator:border-calc-border pt-2' : ''}`}>
                      <div className="flex items-start gap-2">
                        {item.type !== 'reduce' && (
                          <span className={`mt-0.5 shrink-0 ${
                            item.type === 'ok' ? 'text-emerald-500 calculator:text-calc-text' :
                            item.type === 'dilute' ? 'text-red-400 calculator:text-calc-error' :
                            'text-blue-500 calculator:text-calc-text'
                          }`}>
                            {item.type === 'ok' ? (
                              <Icons.CheckCircleIcon className="w-3.5 h-3.5" />
                            ) : item.type === 'dilute' ? (
                              <Icons.XCircleIcon className="w-3.5 h-3.5" />
                            ) : (
                              <Icons.PlusCircleIcon className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] text-gray-800 dark:text-gray-100 calculator:text-calc-text leading-snug">
                            {item.salt}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 calculator:text-calc-text-muted leading-snug mt-0.5">
                            {item.action}
                          </p>
                        </div>
                        {item.delta && (
                          <span className={`shrink-0 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded calculator:rounded-none ${
                            item.type === 'reduce'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 calculator:bg-calc-bg-surface calculator:text-calc-text'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 calculator:bg-calc-bg-surface calculator:text-calc-text'
                          }`}>
                            {item.delta}
                          </span>
                        )}
                      </div>
                      {item.detail && (
                        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted mt-1 ml-[22px]">
                          {item.detail}
                        </p>
                      )}
                      {item.sensory && (
                        <div className="flex items-start gap-1.5 mt-1.5 ml-[22px] px-2 py-1 rounded calculator:rounded-none bg-amber-50/80 dark:bg-amber-950/20 calculator:bg-calc-bg-surface">
                          <Icons.ExclamationTriangleIcon className="w-3 h-3 text-amber-500 dark:text-amber-400 calculator:text-calc-text-muted shrink-0 mt-0.5" />
                          <p className="text-amber-700 dark:text-amber-400 calculator:text-calc-text italic leading-snug">
                            Sans ajustement : {item.sensory}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {style.ionRanges ? (
              <>
                {/* Ion range bars */}
                <div className="space-y-1.5 py-1">
                  {style.ionRanges.map(info => (
                    <IonRangeBar key={info.ion} info={info} styleName={style.name} />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted pt-0.5">
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
                    <span className="text-gray-600 dark:text-gray-400 calculator:text-calc-text-muted">{diff}</span>
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
    <div className="bg-white dark:bg-gray-800 calculator:bg-calc-bg-card rounded-xl calculator:rounded-none border border-gray-200 dark:border-gray-700 calculator:border-calc-border shadow-sm calculator:shadow-mac overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between px-4 py-4 sm:p-6 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 calculator:hover:bg-calc-bg-surface transition-colors"
      >
        <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 calculator:text-calc-text flex items-center gap-2 flex-wrap">
          <Icons.BeakerIcon className="w-5 h-5 text-[#2563FF] dark:text-gray-100 calculator:text-calc-text shrink-0" />
          <span>Quels styles puis-je brasser ?</span>
          <span className="text-xs sm:text-sm font-normal px-2 py-0.5 rounded-full calculator:rounded-none bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 calculator:bg-calc-bg-surface calculator:text-calc-text calculator:border-calc-border">
            {achievableCount} styles
          </span>
        </h4>
        <svg
          className={`w-5 h-5 shrink-0 ml-2 text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-4 sm:px-6 sm:pb-6 pt-0 border-t border-gray-100 dark:border-gray-700 calculator:border-calc-border">
          {/* Capabilities */}
          <div className="mt-4 mb-4 sm:mt-5 sm:mb-5 p-3 sm:p-4 rounded-lg calculator:rounded-none bg-gray-50 dark:bg-gray-800/50 dark:bg-gray-900 calculator:bg-calc-bg border border-gray-200 dark:border-gray-700 calculator:border-calc-border">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-100 calculator:text-calc-text mb-3 calculator:font-mac">
              Mes capacités d'ajustement
            </p>
            <div className="space-y-2.5">
              {([
                { key: 'canAddAcid'  as keyof WaterCapabilities, label: 'Acide lactique ou phosphorique', sub: 'Réduit les bicarbonates (HCO₃⁻)' },
                { key: 'canAddBicarbonate' as keyof WaterCapabilities, label: 'Bicarbonate de sodium', sub: 'Augmente les bicarbonates (HCO₃⁻) — cas rare' },
                { key: 'canAddSalts' as keyof WaterCapabilities, label: 'Ajout de sels minéraux', sub: 'CaSO₄, CaCl₂… sulfates, chlorures, calcium' },
              ] as const).map(({ key, label, sub }) => (
                <label key={key} className="flex items-start gap-2.5 sm:gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={capabilities[key]}
                    onChange={e => onCapabilityChange(key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded calculator:rounded-none text-[#2563FF] dark:text-blue-400 calculator:text-calc-accent border-gray-300 dark:border-gray-700 cursor-pointer accent-[#2563FF] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[13px] sm:text-sm font-medium text-gray-800 dark:text-gray-100 calculator:text-calc-text calculator:font-mac group-hover:text-[#2563FF] calculator:group-hover:text-calc-text transition-colors">
                      {label}
                    </span>
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted calculator:font-mac mt-0.5">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted italic calculator:font-mac">
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
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:border-gray-700 calculator:border-calc-border rounded-lg calculator:rounded-none bg-white dark:bg-gray-800 dark:bg-gray-900 calculator:bg-calc-bg dark:text-gray-100 calculator:text-calc-text focus:ring-2 focus:ring-[#2563FF] calculator:focus:ring-calc-border focus:border-transparent outline-none transition-all calculator:font-mac"
            />
            {styleSearchQuery && (
              <button
                onClick={() => onStyleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-100 calculator:text-calc-text-muted calculator:hover:text-calc-text"
              >
                ×
              </button>
            )}
          </div>

          {/* Hint when search is active */}
          {searchActive && (
            <p className="text-xs text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted italic mb-3 calculator:font-mac">
              Recherche dans tous les styles BJCP, quel que soit leur statut.
            </p>
          )}

          {/* Style list */}
          <div className="space-y-1.5">
            {filteredStyles.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted italic py-6 text-center calculator:font-mac">
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
            <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted calculator:font-mac">
              {achievableCount} style{achievableCount > 1 ? 's' : ''} atteignable{achievableCount > 1 ? 's' : ''} avec ton eau et tes capacités actuelles
            </p>
          )}

          {/* Source attribution */}
          <p className="mt-3 text-[11px] text-center text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted calculator:font-mac">
            Profils d'eau basés sur le{' '}
            <a
              href="https://www.bjcp.org/bjcp-style-guidelines/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 dark:hover:text-gray-300 calculator:hover:text-calc-text"
            >
              BJCP Style Guidelines 2021
            </a>
            {' '}· Recettes via{' '}
            <a
              href="https://www.brewersfriend.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 dark:hover:text-gray-300 calculator:hover:text-calc-text"
            >
              BrewersFriend
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default BrewableStylesSection;
