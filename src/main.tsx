import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { FirebaseProvider } from './context/FirebaseContext.tsx';
import { uploadProductsToFirestore } from './scripts/uploadProducts';
import './index.css';

// =========================================================================
// TEMPORARY BULK PRODUCT UPLAOD HOOK
// =========================================================================
// This script will automatically run on application startup to synchronize 
// 25 premium non-veg restaurant menu items to your live Firebase Cloud Firestore.
// 
// 🌟 INSTRUCTIONS:
// 1. Let the app start up and load once in your browser.
// 2. Open the browser Developer Console (or look at your terminal logs) to see 
//    the complete detailed uploader sync execution report.
// 3. Once you verify that the 25 files are successfully loaded/updated, you 
//    SHOULD delete or comment out the lines below!
// 
// Why do we remove this trigger?
// Leaving it active in main.tsx means every single end user launching the website 
// will trigger duplicate read/write check calls, incurring severe database cost, 
// slowing client boot, and risking unauthorized edits. 
// =========================================================================
// uploadProductsToFirestore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </StrictMode>,
);
