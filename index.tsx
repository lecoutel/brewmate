import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { THEME_COLORS } from './constants'; // To ensure Tailwind JIT picks up arbitrary colors

// This is a trick to make Tailwind's JIT compiler aware of the dynamic colors used in constants.tsx
// Il ne reste que les couleurs du light theme
const TailwindColorHelper = () => (
  <div style={{ display: 'none' }}>
    {/* Light theme direct values */}
    <div className={`bg-[${THEME_COLORS.light.primary}] text-[${THEME_COLORS.light.onPrimary}] border-[${THEME_COLORS.light.primary}]`}></div>
    <div className={`text-[${THEME_COLORS.light.primary}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.primaryContainer}] text-[${THEME_COLORS.light.onPrimaryContainer}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.surface}] text-[${THEME_COLORS.light.onSurface}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.background}] text-[${THEME_COLORS.light.onBackground}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.error}] text-[${THEME_COLORS.light.onPrimary}] border-[${THEME_COLORS.light.error}]`}></div>
    <div className={`bg-[${THEME_COLORS.light.errorContainer}] text-[${THEME_COLORS.light.onErrorContainer}]`}></div>
    <div className={`focus:ring-[${THEME_COLORS.light.primary}]`}></div>
    <div className={`focus:ring-[${THEME_COLORS.light.error}]`}></div>
    <div className={`bg-green-900_bg_opacity_30`}></div>
    <div className={`bg-blue-900_bg_opacity_20`}></div>
    <div className={`bg-yellow-900_bg_opacity_30`}></div>
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
