
import React, { useState } from 'react';
import { Icons } from '../constants';

export interface FormulaSource {
  label: string;
  url: string;
}

export interface FormulaEntry {
  /** Name of the method, e.g. "Formule de Terrill (2011)" */
  name: string;
  /** Short description of what the formula computes */
  description?: string;
  /** Each string is one line displayed in a monospace block (generic formula) */
  formulas: string[];
  /** Formula applied step-by-step with the user's actual values */
  computed?: string[];
  sources: FormulaSource[];
}

interface FormulaInfoSectionProps {
  entries: FormulaEntry[];
  /** Section header label — defaults to "Méthodes & Sources" */
  title?: string;
}

const FormulaInfoSection: React.FC<FormulaInfoSectionProps> = ({
  entries,
  title = 'Méthodes & Sources',
}) => {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/30 calculator:bg-calc-bg-surface hover:bg-gray-100 dark:hover:bg-gray-800/50 calculator:hover:bg-calc-bg-card rounded-lg border border-gray-200 dark:border-gray-700 calculator:border-calc-border transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 calculator:text-calc-text-muted">
          {title}
        </span>
        <Icons.ChevronRightIcon
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 calculator:border-calc-border bg-gray-50 dark:bg-gray-800/60 calculator:bg-calc-bg-card divide-y divide-gray-200 dark:divide-gray-700 calculator:divide-calc-border text-sm">
          {entries.map((entry, idx) => (
            <div key={idx} className="px-4 py-4 space-y-2">
              {/* Method name */}
              <p className="font-semibold text-gray-800 dark:text-gray-100 calculator:text-calc-text">
                {entry.name}
              </p>

              {/* Optional description */}
              {entry.description && (
                <p className="text-gray-500 dark:text-gray-400 calculator:text-calc-text-muted text-xs">
                  {entry.description}
                </p>
              )}

              {/* Generic formula lines */}
              {entry.formulas.length > 0 && (
                <div className="rounded-md bg-white dark:bg-gray-700 calculator:bg-calc-bg-surface border border-gray-200 dark:border-gray-600 calculator:border-calc-border px-3 py-2 space-y-0.5">
                  {entry.formulas.map((line, i) =>
                    line === '' ? (
                      <div key={i} className="h-1" />
                    ) : (
                      <p
                        key={i}
                        className="font-mono text-xs text-gray-700 dark:text-gray-300 calculator:text-calc-text leading-relaxed"
                      >
                        {line}
                      </p>
                    )
                  )}
                </div>
              )}

              {/* Computed block — formula applied to user's actual values */}
              {entry.computed && entry.computed.length > 0 && (
                <div className="rounded-md bg-indigo-50 dark:bg-indigo-900/20 calculator:bg-calc-bg-surface border border-indigo-200 dark:border-indigo-700 calculator:border-calc-border px-3 py-2 space-y-0.5">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 calculator:text-calc-text mb-1.5">
                    Avec vos valeurs :
                  </p>
                  {entry.computed.map((line, i) =>
                    line === '' ? (
                      <div key={i} className="h-1" />
                    ) : (
                      <p
                        key={i}
                        className="font-mono text-xs text-indigo-800 dark:text-indigo-300 calculator:text-calc-text leading-relaxed"
                      >
                        {line}
                      </p>
                    )
                  )}
                </div>
              )}

              {/* Source links */}
              {entry.sources.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 calculator:text-calc-text-muted self-center">
                    Source :
                  </span>
                  {entry.sources.map((src, si) => (
                    <a
                      key={si}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 calculator:text-calc-text hover:underline"
                    >
                      {src.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormulaInfoSection;
