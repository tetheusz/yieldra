import './sidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../../state/wallet';
import { useStore } from '../../state/store';

interface SidebarProps {
  onNavigate?: () => void;
}

const NAV_SECTIONS = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Overview', route: '/overview', icon: <GridIcon /> },
      { label: 'Credit', route: '/credit', icon: <CreditIcon /> },
      { label: 'APY', route: '/treasury', icon: <TreasuryIcon /> },
    ]
  },
  {
    section: 'Automation',
    items: [
      { label: 'Autopilot', route: '/autopilot', icon: <AutopilotIcon /> },
      { label: 'Risk', route: '/risk', icon: <RiskIcon /> },
    ]
  },
  {
    section: 'Account',
    items: [
      { label: 'Activity', route: '/activity', icon: <ActivityIcon /> },
      { label: 'Settings', route: '/settings', icon: <SettingsIcon /> },
    ]
  }
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const state = useStore();
  const currentPath = location.pathname;

  const handleNav = (route: string) => {
    navigate(route);
    onNavigate?.();
  };

  return (
    <>
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 14L9 3L14 14H4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <circle cx="9" cy="11" r="1.5" fill="white"/>
          </svg>
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">Yieldra</span>
          <span className="sidebar__brand-sub">Credit &amp; Yield</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.section}>
            <div className="sidebar__section-label">{section.section}</div>
            {section.items.map(item => (
              <button
                key={item.route}
                className={`nav-item${currentPath === item.route ? ' nav-item--active' : ''}`}
                data-route={item.route}
                onClick={() => handleNav(item.route)}
              >
                <span className="nav-item__icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'not-allowed', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Arc Points</span>
          <span style={{ fontSize: '10px', background: 'var(--accent-hover)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>soon</span>
        </div>
      </div>

      <div className="sidebar__footer">
        {wallet.connected && (
          <div className="sidebar__wallet-info">
            <div className="sidebar__wallet-avatar">{wallet.shortAddress?.slice(2, 4).toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="sidebar__wallet-addr">{wallet.shortAddress}</div>
              {state.agentId !== '0' && (
                <div style={{ 
                  fontSize: '9px', 
                  color: 'var(--accent-hover)', 
                  fontWeight: 'bold', 
                  letterSpacing: '0.05em', 
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                  </svg>
                  ARC AGENT #{state.agentId}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="sidebar__status">
          <span className="sidebar__status-dot" />
          <span>System operational</span>
        </div>
      </div>
    </>
  );
}

// ── SVG Icons ──
function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <rect x="3" y="3" width="6" height="6" rx="1.5"/>
      <rect x="11" y="3" width="6" height="6" rx="1.5"/>
      <rect x="3" y="11" width="6" height="6" rx="1.5"/>
      <rect x="11" y="11" width="6" height="6" rx="1.5"/>
    </svg>
  );
}

function CreditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="7"/>
      <path d="M10 6v8M7 9.5h6M8 13h4"/>
    </svg>
  );
}

function TreasuryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="14" height="10" rx="1.5"/>
      <path d="M6 7V5a4 4 0 018 0v2"/>
      <circle cx="10" cy="12" r="1.5"/>
    </svg>
  );
}

function AutopilotIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 10h2l2-5 3 10 2-7 2 4h3"/>
    </svg>
  );
}

function RiskIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3L17 16H3L10 3z"/>
      <line x1="10" y1="8" x2="10" y2="12"/>
      <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3"/>
      <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2.1 2.1M13.7 13.7l2.1 2.1M4.2 15.8l2.1-2.1M13.7 6.3l2.1-2.1"/>
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h12M4 10h12M4 14h8"/>
    </svg>
  );
}

