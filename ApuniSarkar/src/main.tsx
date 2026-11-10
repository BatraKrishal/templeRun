import React from 'react';
import ReactDOM from 'react-dom/client';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { VoiceProvider } from './context/VoiceContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </AccessibilityProvider>
  </React.StrictMode>
);

