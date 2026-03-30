import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TDSMobileProvider } from '@toss/tds-mobile';
import App from './App';
import { getDefaultUserAgent } from './tdsUserAgent';
import './index.css';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <TDSMobileProvider userAgent={getDefaultUserAgent()}>
        <App />
      </TDSMobileProvider>
    </StrictMode>
  );
}
