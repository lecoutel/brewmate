
# BrewMate - Modern Brewing Calculators

BrewMate is a sleek, user-friendly web application designed to provide amateur brewers with a suite of reliable calculation utilities. Whether you're perfecting your beer's pH or crafting your first batch of kombucha, BrewMate offers precise tools in a modern, responsive interface with an adaptive light/dark theme.

## ✨ Key Features

*   **Comprehensive Brewing & Fermentation Calculators:**
    *   **pH Correction (Mash / Pre-boil):** Advanced pH adjustment for mash (utilizing BeerXML for malt analysis) and a simplified calculation for pre-boil. Supports acidification with Lactic/Phosphoric acid and alkalinization with Sodium Bicarbonate. Accounts for acidulated malt.
    *   **Pre-Boil Density Correction:** Helps you hit your target gravity before the boil by calculating water additions or evaporation.
    *   **Post-Boil Density Correction:** Correct your final gravity through dilution, evaporation, or sugar additions.
    *   **Refractometer Correction & ABV:** Calculates the true final gravity from refractometer readings in the presence of alcohol and estimates ABV.
    *   **Kombucha Recipe Generator:** Create custom first fermentation (F1) kombucha recipes based on desired volume, aromatic profile, and tea type.
*   **Modern & Responsive UI:** Clean, intuitive design built with React and styled with TailwindCSS.
*   **Adaptive Theming:** Automatically detects system preference for light or dark mode and applies a visually appealing theme.
*   **BeerXML Integration:** Leverages BeerXML files for accurate malt bill analysis in the pH (Mash) calculator.
*   **Detailed Results:** Provides clear, actionable results, often with detailed calculation steps for transparency.
*   **RGAA Compliant Toasts & UI:** Notification and result messages are designed with accessibility in mind, ensuring good contrast and modern aesthetics.
*   **Offline Functionality:** Designed to work offline after initial load, ensuring access to tools anywhere.

## 🛠️ Technologies Used

*   **Frontend:** React 19, TypeScript
*   **Styling:** TailwindCSS (via CDN)
*   **Routing:** React Router (HashRouter)
*   **Icons:** Heroicons
*   **Core Logic:** Custom-built calculation services for brewing and kombucha.

## 🚀 How to Use

BrewMate is a web application. To use it:

1.  Ensure you have a modern web browser with JavaScript enabled.
2.  Open the `index.html` file in your browser.
    *   Alternatively, if deployed, navigate to the application's URL.
3.  The application will load with a splash screen and then navigate to the home screen.
4.  Select the desired calculator from the list.
5.  Input the required parameters.
6.  View the calculated results.

For the **pH Correction (Mash)** calculator, you will need a BeerXML file of your recipe for the most accurate calculations.

## 🧮 Available Calculators & Modules

*   **Correction de pH (Mash / Pré-ébullition):**
    *   Adjust pH for mash (using BeerXML for malt analysis) or pre-boil stages (simplified calculation).
    *   Calculates additions for Lactic Acid (80%), Phosphoric Acid (75%), or Sodium Bicarbonate.
    *   Accounts for the contribution of acidulated malt.
*   **Correction Densité Pré-Ébullition:**
    *   Reach your target pre-boil gravity by diluting or concentrating your wort.
*   **Correction Densité Fin d'Ébullition:**
    *   Correct your final wort density through dilution, evaporation, or adding sugar (candy or powder).
*   **Correction Réfractomètre & Alcool:**
    *   Get accurate final gravity readings from your refractometer post-fermentation and estimate ABV.
*   **Générateur de Recette de Kombucha:**
    *   Generate custom Kombucha F1 recipes based on desired volume, taste profile (Léger et Doux, Classique et Équilibré, Intense et Vinaigré), and tea type (Noir, Vert, Mélange).
    *   Provides expected taste profile, detailed ingredient list, and step-by-step instructions.

## 🎨 Theme

BrewMate features an adaptive light and dark theme that respects your operating system's settings. The dark theme utilizes a modern dark blue background (`slate-900`) for a comfortable viewing experience in low-light conditions. UI elements and toast notifications are styled for good contrast and RGAA considerations in both themes.

*(Note: The manual theme toggle button in the header has been removed in the current version of `HomeScreen.tsx`. The core theme-switching logic based on system preference and `localStorage` remains active.)*

---

This README provides a comprehensive overview of the BrewMate application, its features, and how to use it, reflecting the current state of the provided files.
