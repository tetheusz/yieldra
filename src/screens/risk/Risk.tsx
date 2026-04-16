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

  const riskScore = s.riskLevel === 'low' ? 1 : s.riskLevel === 'medium' ? 2 : s.riskLevel === 'high' ? 3 : 4;

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Risk</h1>
        <p className="screen-header__subtitle">Risk monitoring and exposure analysis</p>
      </div>

      {/* Hero: Risk Level + Health Factor */}
      <div className="risk-hero animate-fade-in-up stagger-2">
        <Panel variant="bordered" title="Overall Risk Level">
          <div className="risk-level-display">
            <div className={`risk-level-indicator risk-level-indicator--${s.riskLevel}`}>{riskScore}</div>
            <div className="risk-level-meta">
              <span className={`risk-level-label risk-level-label--${s.riskLevel}`}>{s.riskLevel.toUpperCase()}</span>
              <span className="risk-level-desc">{RISK_DESCRIPTIONS[s.riskLevel]}</span>
            </div>
          </div>
        </Panel>

        <Panel variant="bordered" title="Health Factor" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <ScoreGauge
              score={s.healthFactor * 100}
              max={500}
              grade={s.healthFactor >= 3 ? 'Excellent' : s.healthFactor >= 2 ? 'Good' : s.healthFactor >= 1.5 ? 'Fair' : 'Poor'}
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

      {/* Exposure Breakdown */}
      <div className="risk-exposure animate-fade-in-up stagger-4">
        <Panel variant="bordered" title="Exposure by Strategy">
          <div className="exposure-list">
            {s.exposureBreakdown.map((exp, i) => (
              <div key={i} className="exposure-row">
                <div className="exposure-row__header">
                  <span className="exposure-row__label">{exp.strategy}</span>
                  <div className="exposure-row__values">
                    <span>Weight: <span className="exposure-row__risk">{exp.weight}%</span></span>
                    <span>Risk: <span className="exposure-row__risk">{exp.risk}/100</span></span>
                  </div>
                </div>
                <ProgressBar
                  value={exp.risk}
                  color={exp.risk > 30 ? 'warning' : exp.risk > 60 ? 'danger' : 'accent'}
                  height={6}
                />
              </div>
            ))}
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
