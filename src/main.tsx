import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { GoogleAuth } from './components/GoogleAuth';
import './index.css';

const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string') {
    if (args[0].includes('Quota exceeded') || args[0].includes('gmp-place-autocomplete') || args[0].includes('AutocompletePlacesRequest')) {
      console.warn("Google Maps API Quota Exceeded:", args[0]);
      return;
    }
  }
  originalError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleAuth>
      <App />
    </GoogleAuth>
  </StrictMode>
);