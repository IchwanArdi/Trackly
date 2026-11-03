import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHead, UnheadProvider } from '@unhead/react/client';
import './index.css';
import App from './App.tsx';
import { initAnalytics } from './utils/analytics';
import { initWebVitals } from './utils/vitals';

const head = createHead();
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnheadProvider value={head}>
      <App />
    </UnheadProvider>
  </StrictMode>,
);

initWebVitals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
  });
}
