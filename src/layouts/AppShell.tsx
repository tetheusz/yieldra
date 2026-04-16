/* ============================================
   APP SHELL — Layout Wrapper
   Sidebar + Topbar + Main + Rail
   ============================================ */

import React, { useState, createContext, useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Topbar } from '../components/topbar/Topbar';
import { useStore } from '../state/store';
import { OnboardingState } from '../components/onboarding/OnboardingState';

// ── Right Rail Context ──
const RailContext = createContext<{
  setRailContent: (content: React.ReactNode) => void;
}>({ setRailContent: () => {} });

export function useRightRail(content: React.ReactNode, deps: React.DependencyList = []) {
  const { setRailContent } = useContext(RailContext);
  useEffect(() => {
    setRailContent(content);
    return () => setRailContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ── Mobile sidebar ──
export function AppShell() {
  const [railContent, setRailContent] = useState<React.ReactNode>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const s = useStore();

  return (
    <RailContext.Provider value={{ setRailContent }}>
      <div className="app-shell">
        {/* Mobile overlay */}
        <div
          className={`app-shell__overlay${mobileOpen ? ' is-visible' : ''}`}
          style={{ display: mobileOpen ? 'block' : 'none' }}
          onClick={() => setMobileOpen(false)}
        />

        <aside className={`sidebar${mobileOpen ? ' sidebar--mobile-open' : ''}`}>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </aside>

        <header className="topbar">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
        </header>

        <main className="app-main">
          <div className="app-main__content">
            <div id="screen-container">
              {!s.hasDeposited ? <OnboardingState /> : <Outlet />}
            </div>
          </div>
          {s.hasDeposited && (
            <aside className="app-main__rail" id="right-rail">
              {railContent}
            </aside>
          )}
        </main>
      </div>
    </RailContext.Provider>
  );
}
