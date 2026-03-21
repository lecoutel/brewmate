import React from 'react';
import { IonRangeInfo } from '../types';
import { IonInfoTrigger } from './IonInfoPanel';

interface IonRangeBarProps {
  info: IonRangeInfo;
  styleName?: string;
}

const IonRangeBar: React.FC<IonRangeBarProps> = ({ info, styleName }) => {
  const { current, adjusted, rangeMin, rangeMax, axisMax, symbol } = info;

  const isCurrentInRange = current >= rangeMin && current <= rangeMax;
  const isAdjusted = adjusted !== current;
  const isAdjustedInRange = adjusted >= rangeMin && adjusted <= rangeMax;

  // Clamp a value to [0, axisMax] then express as a percentage
  const pct = (v: number) =>
    `${Math.min(100, Math.max(0, (Math.max(0, v) / axisMax) * 100)).toFixed(2)}%`;

  const rangeMinDisplay = Math.max(0, rangeMin);
  const rangeLeft  = pct(rangeMinDisplay);
  const rangeRightPct = pct(rangeMax);
  const rangeWidth = `${Math.min(100, Math.max(0, ((rangeMax - rangeMinDisplay) / axisMax) * 100)).toFixed(2)}%`;

  // Current marker color:
  //   green  = already in range
  //   amber  = out of range but adjustable (adjusted lands in range)
  //   red    = out of range, stuck
  const currentColor = isCurrentInRange
    ? 'bg-emerald-500'
    : isAdjusted && isAdjustedInRange
    ? 'bg-amber-400'
    : 'bg-red-500';

  const valueColor = isCurrentInRange
    ? 'text-emerald-600 dark:text-emerald-400 calculator:text-calc-text'
    : isAdjusted && isAdjustedInRange
    ? 'text-amber-600 dark:text-amber-400 calculator:text-calc-text'
    : 'text-red-600 dark:text-red-400 calculator:text-calc-error';

  return (
    <div className="flex items-start gap-2 text-xs">
      {/* Ion label — fixed width, right-aligned */}
      <span className="w-12 shrink-0 text-right font-mono text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted select-none mt-0.5 inline-flex items-center justify-end gap-0.5">
        {symbol}
        <IonInfoTrigger
          ionKey={info.ion}
          currentValue={info.current}
          iconClassName="w-3 h-3"
          styleContext={styleName ? { styleName, rangeMin: info.rangeMin, rangeMax: info.rangeMax, target: info.target, adjusted: info.adjusted } : undefined}
        />
      </span>

      {/* Bar + min/max labels */}
      <div className="flex-1 min-w-0">
        {/* Bar track */}
        <div className="relative h-2.5 bg-gray-200 dark:bg-gray-700 calculator:bg-calc-bg-surface rounded-full calculator:rounded-none overflow-hidden">
          {/* Acceptable range band */}
          <div
            className="absolute top-0 h-full bg-emerald-400/40 dark:bg-emerald-500/25 calculator:bg-emerald-700/30"
            style={{ left: rangeLeft, width: rangeWidth }}
          />

          {/* Adjusted marker — shown first (behind current) when different from current */}
          {isAdjusted && (
            <div
              className="absolute top-0 h-full w-px bg-blue-500 dark:bg-blue-400"
              style={{ left: pct(adjusted) }}
            />
          )}

          {/* Current marker */}
          <div
            className={`absolute top-0 h-full w-0.5 ${currentColor}`}
            style={{ left: pct(current) }}
          />
        </div>

        {/* Min/max labels below the bar */}
        <div className="relative h-3.5 select-none">
          <span
            className="absolute text-[10px] text-gray-400 dark:text-gray-500 -translate-x-1/2 leading-none pt-0.5"
            style={{ left: rangeLeft }}
          >
            {Math.max(0, Math.round(rangeMin))}
          </span>
          <span
            className="absolute text-[10px] text-gray-400 dark:text-gray-500 -translate-x-1/2 leading-none pt-0.5"
            style={{ left: rangeRightPct }}
          >
            {Math.round(rangeMax)}
          </span>
        </div>
      </div>

      {/* Current value label */}
      <span className={`w-10 shrink-0 text-right font-mono tabular-nums mt-0.5 ${valueColor}`}>
        {current.toFixed(0)}
      </span>
    </div>
  );
};

export default IonRangeBar;
