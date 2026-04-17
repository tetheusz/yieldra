import './risk.css';
import { useStore, formatUSD } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { ScoreGauge } from '../../components/score-gauge/ScoreGauge';
import { AlertItem } from '../../components/alert-item/AlertItem';
import { ProgressBar } from '../../components/mini-chart/MiniChart';
import { StatusBadge } from '../../components/status-badge/StatusBadge';

export function Risk() {
  const s = useStore();

  useRightRail(<SecurityRail />, []);
  
  const systemRisk = s.protocolUtilization > 80 ? 'critical' : s.protocolUtilization > 60 ? 'high' : s.protocolUtilization > 30 ? 'medium' : 'low';
  const riskScore = systemRisk === 'low' ? 7 : systemRisk === 'medium' ? 14 : systemRisk === 'high' ? 26 : 42;
  const integrityGrade = s.healthFactor >= 3 ? 'Excellent' : s.healthFactor >= 2 ? 'Stable' : s.healthFactor >= 1.5 ? 'Alert' : 'Critical';

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Security Lab</h1>
        <p className="screen-header__subtitle">Protocol solvency monitor and autonomous justice engine</p>
      </div>

      {/* Hero: Protocol Liquidity + Integrity */}
      <div className="risk-hero animate-fade-in-up stagger-2">
        <Panel variant="bordered" title="Global Liquidity Coverage">
          <div className="risk-level-display">
            <div className={`risk-level-indicator risk-level-indicator--${systemRisk}`}>{riskScore}%</div>
            <div className="risk-level-meta">
              <span className={`risk-level-label risk-level-label--${systemRisk}`}>LIQUIDITY_GAP</span>
              <span className="risk-level-desc">Utilization: {s.protocolUtilization.toFixed(1)}%</span>
            </div>
          </div>
        </Panel>

        <Panel variant="bordered" title="Protocol Integrity Factor" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <ScoreGauge
              score={s.healthFactor * 50}
              max={250}
              grade={integrityGrade}
              variant="large"
              label={`System Safety: ${s.healthFactor.toFixed(1)}x`}
            />
          </div>
        </Panel>
      </div>

      {/* Slashing Engine (Autonomous Justice) */}
      <div className="risk-hero animate-fade-in-up stagger-3" style={{ marginTop: 'var(--space-6)' }}>
         <Panel variant="bordered" title="Autonomous Justice Engine (Slashing)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
               <div>
                  <div className="section-label">Slashing History</div>
                  <div className="alert-list" style={{ marginTop: '8px' }}>
                     <AlertItem severity="critical" message="Agent Matrix_MM_09 defaulted on Settlement Fee." time="2h ago" read={true} />
                     <AlertItem severity="info" message="Autonomous Slashing applied: 50% Penalty Rate." time="2h ago" read={true} />
                     <AlertItem severity="info" message="Reputation score reset to 0 for Entity_0x45." time="2h ago" read={true} />
                  </div>
               </div>
               <div>
                  <div className="section-label">Justice Metrics</div>
                  <div className="risk-thresholds" style={{ marginTop: '16px' }}>
                    <div className="risk-thresholds__row">
                      <span className="risk-thresholds__label">Slashing Reserve</span>
                      <span className="risk-thresholds__value" style={{ color: 'var(--accent)' }}>{formatUSD(s.protocolRevenue * 0.15)}</span>
                    </div>
                    <div className="risk-thresholds__row">
                      <span className="risk-thresholds__label">Recovered Capital</span>
                      <span className="risk-thresholds__value">$42,900.00</span>
                    </div>
                    <div className="risk-thresholds__row">
                       <span className="risk-thresholds__label">Last Slashing Event</span>
                       <span className="risk-thresholds__value">04/17/2026</span>
                    </div>
                  </div>
               </div>
            </div>
         </Panel>
      </div>

      {/* Alerts */}
      <div className="risk-alerts animate-fade-in-up stagger-4" style={{ marginTop: 'var(--space-6)' }}>
        <Panel variant="bordered" title="System Safeguard Alerts" subtitle="Protocol-level security events">
          <div className="alert-list">
            {s.alerts.length > 0 ? (
              s.alerts.map(a => (
                <AlertItem key={a.id} severity={a.severity} message={a.message} time={a.time} read={a.read} />
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', opacity: 0.5 }}>No active system threats detected.</div>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}

function SecurityRail() {
  const s = useStore();

  return (
    <div className="animate-fade-in-up stagger-2">
      <div className="section-label">Solvency Parameters</div>
      <div className="risk-thresholds">
        {[
          { label: 'Pool Solvency', value: '142%', status: 'success' as const },
          { label: 'Slashing Buffer', value: '15%', status: 'success' as const },
          { label: 'Min Reputation', value: '400', status: 'success' as const },
          { label: 'Emergency Mode', value: 'OFF', status: 'success' as const },
        ].map(t => (
          <div key={t.label} className="risk-thresholds__row">
            <span className="risk-thresholds__label">{t.label}</span>
            <div className="risk-thresholds__right">
              <span className="risk-thresholds__value">{t.value}</span>
              <span className={`risk-thresholds__dot risk-thresholds__dot--${t.status}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
