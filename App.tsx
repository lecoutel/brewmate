
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { CalculatorRoute } from './types';

// Import screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import PhCalculatorScreen from './screens/PhCalculatorScreen';
import PreBoilDensityScreen from './screens/PreBoilDensityScreen';
import PostBoilDensityScreen from './screens/PostBoilDensityScreen';
import RefractometerScreen from './screens/RefractometerScreen';
import KombuchaGeneratorScreen from './screens/KombuchaGeneratorScreen'; // New Screen

const App: React.FC = () => {
  useTheme(); // Initialize and apply theme

  return (
    <HashRouter>
      <Routes>
        <Route path={CalculatorRoute.Splash} element={<SplashScreen />} />
        <Route path={CalculatorRoute.Home} element={<HomeScreen />} />
        <Route path={CalculatorRoute.PhCorrection} element={<PhCalculatorScreen />} />
        <Route path={CalculatorRoute.PreBoilDensity} element={<PreBoilDensityScreen />} />
        <Route path={CalculatorRoute.PostBoilDensity} element={<PostBoilDensityScreen />} />
        <Route path={CalculatorRoute.Refractometer} element={<RefractometerScreen />} />
        <Route path={CalculatorRoute.KombuchaGenerator} element={<KombuchaGeneratorScreen />} /> {/* New Route */}
        <Route path="*" element={<Navigate to={CalculatorRoute.Splash} replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
