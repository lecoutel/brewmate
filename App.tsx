
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
import KombuchaGeneratorScreen from './screens/KombuchaGeneratorScreen';
import WaterQualityScreen from './screens/WaterQualityScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import DonationScreen from './screens/DonationScreen';

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
        <Route path={CalculatorRoute.AbvCalculator} element={<RefractometerScreen />} />
        <Route path={CalculatorRoute.RefractometerLegacy} element={<Navigate to={CalculatorRoute.AbvCalculator} replace />} />
        <Route path={CalculatorRoute.KombuchaGenerator} element={<KombuchaGeneratorScreen />} />
        <Route path={CalculatorRoute.WaterQuality} element={<WaterQualityScreen />} />
        <Route path={CalculatorRoute.Feedback} element={<FeedbackScreen />} />
        <Route path={CalculatorRoute.Don} element={<DonationScreen />} />
        <Route path="*" element={<Navigate to={CalculatorRoute.Splash} replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
