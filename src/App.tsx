/* ============================================
   APP — Root component with routing
   Yieldra — Autonomous Credit & Yield
   ============================================ */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './state/store';
import { WalletProvider } from './state/wallet';
import { AppShell } from './layouts/AppShell';
import { Landing } from './screens/landing/Landing';
import { Overview } from './screens/overview/Overview';
import { Vault } from './screens/credit/Vault';
import { Treasury } from './screens/treasury/Treasury';
import { Autopilot } from './screens/autopilot/Autopilot';
import { Risk } from './screens/risk/Risk';
import { Activity } from './screens/activity/Activity';
import { Settings } from './screens/settings/Settings';

export function App() {
  return (
    <WalletProvider>
      <StoreProvider>
        <HashRouter>
          <Routes>
            {/* Landing — standalone, no shell */}
            <Route path="/" element={<Landing />} />

            {/* Workspace — inside app shell */}
            <Route element={<AppShell />}>
              <Route path="/overview" element={<Overview />} />
              <Route path="/credit" element={<Vault />} />
              <Route path="/treasury" element={<Treasury />} />
              <Route path="/autopilot" element={<Autopilot />} />
              <Route path="/risk" element={<Risk />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </StoreProvider>
    </WalletProvider>
  );
}

