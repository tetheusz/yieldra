import './risk.css';
import { useStore } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { ScoreGauge } from '../../components/score-gauge/ScoreGauge';
import { AlertItem } from '../../components/alert-item/AlertItem';
import { ProgressBar } from '../../components/mini-chart/MiniChart';
import { StatusBadge } from '../../components/status-badge/StatusBadge';

const RISK_DESCRIPTIONS: Record<string, string> = {
  low: 'All metrics within healthy parameters. No immediate action required.',
  medium: 'Some metrics approaching thresholds. Monitor closely.',
  high: 'Multiple risk factors elevated. Consider reducing exposure.',
  critical: 'Immediate action recommended. Risk thresholds exceeded.',
};

export function Risk() {
  const s = useStore();

  useRightRail(<RiskRail />, []);
  
  // Real dynamic risk assessment based on Protocol Utilization
  const systemRisk = s.protocolUtilization > 80 ? 'critical' : s.protocolUtilization > 60 ? 'high' : s.protocolUtilization > 30 ? 'medium' : 'low';
  const riskScore = systemRisk === 'low' ? 1 : systemRisk === 'medium' ? 2 : systemRisk === 'high' ? 3 : 4;
  const healthGrade = s.healthFactor >= 3 ? 'Excellent' : s.healthFactor >= 2 ? 'Good' : s.healthFactor >= 1.5 ? 'Fair' : 'Poor';

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Risk</h1>
        <p className="screen-header__subtitle">Risk monitoring and exposure analysis</p>
      </div>

      {/* Hero: Risk Level + Health Factor */}
      <div className="risk-hero animate-fade-in-up stagger-2">
        <Panel variant="bordered" title="Overall Protocol Risk">
          <div className="risk-level-display">
            <div className={`risk-level-indicator risk-level-indicator--${systemRisk}`}>{riskScore}</div>
            <div className="risk-level-meta">
              <span className={`risk-level-label risk-level-label--${systemRisk}`}>{systemRisk.toUpperCase()}</span>
              <span className="risk-level-desc">Utilization Rate: {s.protocolUtilization.toFixed(1)}%</span>
            </div>
          </div>
        </Panel>

        <Panel variant="bordered" title="Health Factor" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <ScoreGauge
              score={s.healthFactor * 100}
              max={500}
              grade={healthGrade}
              variant="large"
              label={`Health Factor: ${s.healthFactor.toFixed(1)}x`}
            />
          </div>
        </Panel>
      </div>

      {/* Alerts */}
      <div className="risk-alerts animate-fade-in-up stagger-3">
        <Panel variant="bordered" title="Active Alerts" subtitle={`${s.alerts.filter(a => !a.read).length} unread`}>
          <div className="alert-list">
            {s.alerts.map(a => (
              <AlertItem key={a.id} severity={a.severity} message={a.message} time={a.time} read={a.read} />
            ))}
          </div>
        </Panel>
      </div>

      {/* Analytics Breakdown */}
      <div className="risk-exposure animate-fade-in-up stagger-4">
        <Panel variant="bordered" title="System BalanceSheet (Verified)">
          <div className="exposure-list">
              <div className="exposure-row">
                <div className="exposure-row__header">
                  <span className="exposure-row__label">Protocol TVL</span>
                  <div className="exposure-row__values">
                    <span>Value: <span className="exposure-row__risk">${s.protocolTVL.toFixed(2)}</span></span>
                  </div>
                </div>
                <ProgressBar value={100} color="accent" height={6} />
              </div>

              <div className="exposure-row" style={{ marginTop: '16px' }}>
                <div className="exposure-row__header">
                  <span className="exposure-row__label">Credit Liquidity</span>
                  <div className="exposure-row__values">
                    <span>Available: <span className="exposure-row__risk">${s.creditManagerLiquidity.toFixed(2)}</span></span>
                  </div>
                </div>
                <ProgressBar 
                  value={(s.creditManagerLiquidity / s.protocolTVL) * 100 || 0} 
                  color={s.creditManagerLiquidity < 10 ? 'danger' : 'success'} 
                  height={6} 
                />
                {s.creditManagerLiquidity < 10 && (
                  <p style={{ fontSize: '11px', color: 'var(--status-danger)', marginTop: '4px' }}>⚠ LOW LIQUIDITY DETECTED: Deposits are encouraged.</p>
                )}
              </div>
          </div>
        </Panel>
      </div>

      {/* Concentration Risks */}
      <div className="risk-concentration animate-fade-in-up stagger-5">
        <Panel variant="bordered" title="Concentration Risks">
          <div className="concentration-list">
            {s.concentrationRisks.map((risk, i) => (
              <div key={i} className="concentration-item">
                <div className="concentration-item__header">
                  <span className="concentration-item__label">{risk.label}</span>
                  <StatusBadge
                    label={risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                    variant={risk.level === 'low' ? 'success' : risk.level === 'medium' ? 'warning' : 'danger'}
                  />
                </div>
                <ProgressBar
                  value={risk.percentage}
                  color={risk.level === 'low' ? 'success' : risk.level === 'medium' ? 'warning' : 'danger'}
                  height={6}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function RiskRail() {
  const s = useStore();

  return (
    <div className="animate-fade-in-up stagger-2">
      <div className="section-label">Risk Thresholds</div>
      <div className="risk-thresholds">
        {[
          { label: 'Health Factor Min', value: '1.5x', status: s.healthFactor >= 1.5 ? 'success' : 'danger' },
          { label: 'Max Single Allocation', value: '30%', status: 'success' as const },
          { label: 'Credit Utilization Max', value: '80%', status: s.creditUtilization <= 80 ? 'success' : 'danger' },
          { label: 'Reserve Minimum', value: '15%', status: 'success' as const },
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
