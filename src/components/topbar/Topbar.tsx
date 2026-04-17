import './topbar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../../state/wallet';
import { useStore } from '../../state/store';
import { useState, useEffect } from 'react';

interface TopbarProps {
  onMenuClick?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  '/overview': 'Overview',
  '/credit': 'Credit',
  '/treasury': 'Treasury',
  '/autopilot': 'Autopilot',
  '/risk': 'Risk',
  '/settings': 'Settings',
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet, connect } = useWallet();
  const s = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const label = ROUTE_LABELS[location.pathname] || 'Overview';
  // We enforce Dark Mode natively
  useEffect(() => {
    document.documentElement.classList.add('theme-dark');
  }, []);



  const unreadAlerts = s.alerts.filter(a => !a.read).length;

  return (
    <>
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <rect x="3" y="5" width="14" height="1.5" rx="0.75"/>
            <rect x="3" y="9.5" width="14" height="1.5" rx="0.75"/>
            <rect x="3" y="14" width="14" height="1.5" rx="0.75"/>
          </svg>
        </button>
        <div className="topbar__breadcrumb">
          <span>ARC</span>
          <span>›</span>
          <span className="topbar__breadcrumb-current">{label}</span>
        </div>
      </div>
      <div className="topbar__right">
        {/* Autopilot Status */}
        <div className="topbar__autopilot-status">
          <span className={`topbar__autopilot-dot topbar__autopilot-dot--${s.autopilotStatus}`} />
          <span className="topbar__autopilot-label">
            {s.autopilotStatus === 'active' ? 'Engine Active' : 'Engine Paused'}
          </span>
        </div>



        {/* Notifications */}
        <div className="topbar__notif-wrap">
          <button className="topbar__notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 2a5 5 0 00-5 5v3l-2 3h14l-2-3V7a5 5 0 00-5-5z"/>
              <path d="M8 16a2 2 0 004 0"/>
            </svg>
            {unreadAlerts > 0 && (
              <span className="topbar__notif-badge">{unreadAlerts}</span>
            )}
          </button>

          {notifOpen && (
            <div className="topbar__notif-dropdown">
              <div className="topbar__notif-header">
                <span>Notifications</span>
                <span className="topbar__notif-count">{unreadAlerts} unread</span>
              </div>
              {s.alerts.slice(0, 5).map(a => (
                <div key={a.id} className={`topbar__notif-item topbar__notif-item--${a.severity}${!a.read ? ' topbar__notif-item--unread' : ''}`}>
                  <div className="topbar__notif-msg">{a.message}</div>
                  <div className="topbar__notif-time">{a.time}</div>
                </div>
              ))}
              <button className="topbar__notif-viewall" onClick={() => { navigate('/risk'); setNotifOpen(false); }}>
                View all alerts →
              </button>
            </div>
          )}
        </div>

        {/* Network */}
        <div className="topbar__network">
          <span className="topbar__network-dot" />
          <span>Arc Testnet</span>
        </div>

        {/* Wallet */}
        {wallet.connected ? (
          <div className="topbar__account" onClick={() => navigate('/settings')}>
            <div className="topbar__avatar">{wallet.shortAddress?.slice(2, 4).toUpperCase()}</div>
            <span className="topbar__address">{wallet.shortAddress}</span>
          </div>
        ) : (
          <button className="topbar__connect-btn" onClick={connect} disabled={wallet.connecting}>
            {wallet.connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </>
  );
}
