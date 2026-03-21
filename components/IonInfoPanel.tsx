import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { IonKey } from '../types';
import { Icons } from './Common';
import { ION_EDUCATION, STAT_EDUCATION, IonEducationEntry, StatEducationEntry, interpretIonValue, interpretStatValue } from '../data/ionEducation';

// ── Shared panel content ───────────────────────────────────────────

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted mb-1">
    {children}
  </h5>
);

const IonPanelContent: React.FC<{ entry: IonEducationEntry; ionKey: IonKey; currentValue?: number }> = ({ entry, ionKey, currentValue }) => {
  const interpretation = currentValue != null ? interpretIonValue(ionKey, currentValue) : null;
  const statusColor = interpretation
    ? interpretation.status === 'ok'
      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
      : interpretation.status === 'low'
      ? 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
      : 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
    : '';

  return (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-base font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">{entry.symbol}</span>
      <span className="text-sm text-gray-600 dark:text-gray-300 calculator:text-calc-text">{entry.name}</span>
    </div>

    {/* Current value interpretation */}
    {interpretation && (
      <div className={`p-2.5 rounded-lg border text-sm leading-relaxed calculator:bg-calc-bg-surface calculator:border-calc-border calculator:text-calc-text ${statusColor}`}>
        <SectionHeading>Votre eau</SectionHeading>
        {interpretation.text}
      </div>
    )}

    {/* Definition */}
    <div>
      <SectionHeading>C'est quoi ?</SectionHeading>
      <p className="text-sm text-gray-700 dark:text-gray-200 calculator:text-calc-text leading-relaxed">{entry.definition}</p>
    </div>

    {/* Sensory impact */}
    <div>
      <SectionHeading>Impact sensoriel</SectionHeading>
      <p className="text-sm text-gray-700 dark:text-gray-200 calculator:text-calc-text leading-relaxed">{entry.sensoryImpact}</p>
    </div>

    {/* Thresholds */}
    <div>
      <SectionHeading>Seuils</SectionHeading>
      <div className="space-y-1 text-sm">
        {entry.thresholds.low && entry.thresholds.low.value > 0 && (
          <p className="text-amber-700 dark:text-amber-300 calculator:text-calc-text leading-relaxed">
            <span className="font-semibold">&lt; {entry.thresholds.low.value} ppm :</span> {entry.thresholds.low.text}
          </p>
        )}
        {entry.thresholds.high && (
          <p className="text-red-700 dark:text-red-300 calculator:text-calc-text leading-relaxed">
            <span className="font-semibold">&gt; {entry.thresholds.high.value} ppm :</span> {entry.thresholds.high.text}
          </p>
        )}
      </div>
    </div>

    {/* Ratio info */}
    {entry.ratioInfo && (
      <div>
        <SectionHeading>Ratio</SectionHeading>
        <p className="text-sm text-gray-700 dark:text-gray-200 calculator:text-calc-text leading-relaxed">{entry.ratioInfo}</p>
      </div>
    )}
  </div>
  );
};

const StatPanelContent: React.FC<{ entry: StatEducationEntry; statKey: string; currentValue?: number }> = ({ entry, statKey, currentValue }) => {
  const interpretation = currentValue != null ? interpretStatValue(statKey, currentValue) : null;

  return (
  <div className="space-y-3">
    {/* Header */}
    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 calculator:text-calc-text">{entry.name}</span>

    {/* Current value interpretation */}
    {interpretation && (
      <div className="p-2.5 rounded-lg border text-sm leading-relaxed
                      text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20
                      calculator:bg-calc-bg-surface calculator:border-calc-border calculator:text-calc-text">
        <SectionHeading>Votre eau — {currentValue!.toFixed(statKey === 'ratio' ? 2 : 0)}</SectionHeading>
        {interpretation.text}
      </div>
    )}

    {/* Definition */}
    <div>
      <SectionHeading>C'est quoi ?</SectionHeading>
      <p className="text-sm text-gray-700 dark:text-gray-200 calculator:text-calc-text leading-relaxed">{entry.definition}</p>
    </div>

    {/* Significance */}
    <div>
      <SectionHeading>Pourquoi c'est important ?</SectionHeading>
      <p className="text-sm text-gray-700 dark:text-gray-200 calculator:text-calc-text leading-relaxed">{entry.significance}</p>
    </div>

    {/* Interpretation table */}
    <div>
      <SectionHeading>Comment l'interpréter ?</SectionHeading>
      <div className="space-y-1 text-sm">
        {entry.interpretation.map((item, i) => (
          <div key={i} className={`flex gap-2 ${interpretation && interpretation.matchedRange === i ? 'font-bold' : ''}`}>
            <span className="font-mono font-semibold text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted shrink-0 w-16 text-right">{item.range}</span>
            <span className="text-gray-700 dark:text-gray-200 calculator:text-calc-text leading-relaxed">{item.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

// ── Panel overlay (portal) ─────────────────────────────────────────

interface InfoPanelOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

const InfoPanelOverlay: React.FC<InfoPanelOverlayProps> = ({ children, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-sm max-h-[70vh] overflow-y-auto
                   rounded-t-2xl sm:rounded-xl
                   bg-white dark:bg-gray-800 calculator:bg-calc-bg-card
                   text-gray-800 dark:text-gray-100 calculator:text-calc-text
                   border border-gray-200 dark:border-gray-600 calculator:border-calc-border
                   shadow-2xl p-5"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full
                     text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                     calculator:text-calc-text-muted calculator:hover:text-calc-text
                     hover:bg-gray-100 dark:hover:bg-gray-700 calculator:hover:bg-calc-bg-surface
                     transition-colors"
          aria-label="Fermer"
        >
          <Icons.XCircleIcon className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
};

// ── Trigger components ─────────────────────────────────────────────

interface IonInfoTriggerProps {
  ionKey: IonKey;
  currentValue?: number;
  iconClassName?: string;
}

export const IonInfoTrigger: React.FC<IonInfoTriggerProps> = ({ ionKey, currentValue, iconClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const entry = ION_EDUCATION[ionKey];
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center focus:outline-none ml-1"
        aria-label={`Info ${entry.name}`}
      >
        <Icons.InformationCircleIcon
          className={`${iconClassName ?? 'w-4 h-4'} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 calculator:text-calc-text-muted calculator:hover:text-calc-text transition-colors`}
        />
      </button>
      {isOpen && (
        <InfoPanelOverlay onClose={handleClose}>
          <IonPanelContent entry={entry} ionKey={ionKey} currentValue={currentValue} />
        </InfoPanelOverlay>
      )}
    </>
  );
};

interface StatInfoTriggerProps {
  statKey: string;
  currentValue?: number;
  iconClassName?: string;
}

export const StatInfoTrigger: React.FC<StatInfoTriggerProps> = ({ statKey, currentValue, iconClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const entry = STAT_EDUCATION[statKey];
  const handleClose = useCallback(() => setIsOpen(false), []);

  if (!entry) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center focus:outline-none ml-1"
        aria-label={`Info ${entry.name}`}
      >
        <Icons.InformationCircleIcon
          className={`${iconClassName ?? 'w-4 h-4'} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 calculator:text-calc-text-muted calculator:hover:text-calc-text transition-colors`}
        />
      </button>
      {isOpen && (
        <InfoPanelOverlay onClose={handleClose}>
          <StatPanelContent entry={entry} statKey={statKey} currentValue={currentValue} />
        </InfoPanelOverlay>
      )}
    </>
  );
};
