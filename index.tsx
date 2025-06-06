
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { THEME_COLORS } from './constants'; // To ensure Tailwind JIT picks up arbitrary colors

// This is a trick to make Tailwind's JIT compiler aware of the dynamic colors used in constants.tsx
// It won't render anything, but ensures the classes are generated.
const TailwindColorHelper = () => (
  <div style={{ display: 'none' }}>
    {/* Light theme direct values */}
    <div className={`bg-[${THEME_COLORS.light.primary}] text-[${THEME_COLORS.light.onPrimary}] border-[${THEME_COLORS.light.primary}]`}></div>
    <div className={`text-[${THEME_COLORS.light.primary}]`}></div> {/* Added for icon */}
    <div className={`bg-[${THEME_COLORS.light.primaryContainer}] text-[${THEME_COLORS.light.onPrimaryContainer}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.surface}] text-[${THEME_COLORS.light.onSurface}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.background}] text-[${THEME_COLORS.light.onBackground}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.error}] text-[${THEME_COLORS.light.onPrimary}] border-[${THEME_COLORS.light.error}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.errorContainer}] text-[${THEME_COLORS.light.onErrorContainer}]`}></div>
    
    {/* Dark theme direct values (ensuring these are generated for direct use, not just via dark: prefix) */}
    <div className={`bg-[${THEME_COLORS.dark.primary}] text-[${THEME_COLORS.dark.onPrimary}] border-[${THEME_COLORS.dark.primary}]`}></div>
    <div className={`text-[${THEME_COLORS.dark.primary}]`}></div> {/* Added for icon */}
    <div className={`bg-[${THEME_COLORS.dark.primaryContainer}] text-[${THEME_COLORS.dark.onPrimaryContainer}]`}></div>
    <div className={`bg-[${THEME_COLORS.dark.surface}] text-[${THEME_COLORS.dark.onSurface}]`}></div>
    <div className={`bg-[${THEME_COLORS.dark.background}] text-[${THEME_COLORS.dark.onBackground}]`}></div>
    <div className={`bg-[${THEME_COLORS.dark.error}] text-[${THEME_COLORS.dark.onPrimary}] border-[${THEME_COLORS.dark.error}]`}></div>
    <div className={`bg-[${THEME_COLORS.dark.errorContainer}] text-[${THEME_COLORS.dark.onErrorContainer}]`}></div>

    {/* Classes that combine with dark: prefix (these are generally fine but ensuring direct ones are covered above is key) */}
    <div className={`dark:bg-[${THEME_COLORS.dark.primary}] dark:text-[${THEME_COLORS.dark.onPrimary}] dark:border-[${THEME_COLORS.dark.error}]`}></div>
    <div className={`dark:bg-[${THEME_COLORS.dark.primaryContainer}] dark:text-[${THEME_COLORS.dark.onPrimaryContainer}]`}></div>
    <div className={`dark:bg-[${THEME_COLORS.dark.surface}] dark:text-[${THEME_COLORS.dark.onSurface}]`}></div>
    <div className={`dark:bg-[${THEME_COLORS.dark.background}] dark:text-[${THEME_COLORS.dark.onBackground}]`}></div>
    <div className={`dark:bg-[${THEME_COLORS.dark.errorContainer}] dark:text-[${THEME_COLORS.dark.onErrorContainer}]`}></div>

    {/* Focus rings */}
    <div className={`focus:ring-[${THEME_COLORS.light.primary}] dark:focus:ring-[${THEME_COLORS.dark.primary}]`}></div>
    <div className={`focus:ring-[${THEME_COLORS.light.error}] dark:focus:ring-[${THEME_COLORS.dark.error}]`}></div>
    
    {/* Specific opacity classes (these are fine as they have unique names) */}
    <div className={`bg-green-900_bg_opacity_30 dark:bg-green-900_bg_opacity_30`}></div>
    <div className={`bg-blue-900_bg_opacity_20 dark:bg-blue-900_bg_opacity_20`}></div>
    <div className={`bg-yellow-900_bg_opacity_30 dark:bg-yellow-900_bg_opacity_30`}></div>
  </div>
);


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TailwindColorHelper />
    <App />
  </React.StrictMode>
);
