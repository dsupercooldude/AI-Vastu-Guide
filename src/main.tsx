import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { GoogleAuth } from './components/GoogleAuth';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleAuth>
      <App />
    </GoogleAuth>
  </StrictMode>
);
