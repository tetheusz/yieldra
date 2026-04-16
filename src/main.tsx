/* ============================================
   MAIN ENTRY POINT
   Yieldra — Autonomous Credit & Yield
   ============================================ */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// ── Styles (order matters) ──
import './styles/index.css';
import './layouts/app-shell.css';
import './layouts/grid.css';
import './layouts/responsive.css';

// ── App ──
import { App } from './App';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
