import './autopilot.css';
import { useStore, formatUSD } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { MetricDisplay } from '../../components/metric-display/MetricDisplay';
import { StatusBadge } from '../../components/status-badge/StatusBadge';
import { ProgressBar } from '../../components/mini-chart/MiniChart';

export function Autopilot() {
  const s = useStore();

  useRightRail(<AutopilotRail />, []);

  const perf = s.performanceSinceActivation;

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Autopilot</h1>
        <p className="screen-header__subtitle">Automated yield management and profit distribution</p>
      </div>

      {/* Status Hero */}
      <div className="autopilot-status-hero animate-fade-in-up stagger-2">
        <Panel variant="bordered" title="System Status">
          <div className="autopilot-status-display">
            <div className={`autopilot-toggle autopilot-toggle--${s.autopilotStatus === 'active' ? 'on' : 'off'}`}>
              <div className="autopilot-toggle__knob" />
            </div>
            <div className="autopilot-status-info">
              <StatusBadge
                label={s.autopilotStatus === 'active' ? 'Active' : 'Paused'}
                variant={s.autopilotStatus === 'active' ? 'success' : 'neutral'}
                live={s.autopilotStatus === 'active'}
              />
              <span className="autopilot-status-info__sub">Uptime: {s.autopilotUptime}</span>
              <span className="autopilot-status-info__sub">Last action: {s.lastAction}</span>
            </div>
          </div>
        </Panel>

        <Panel variant="bordered" title="Since Activation">
          <div className="autopilot-perf-grid">
            <MetricDisplay label="Total Gains" value={formatUSD(s.accumulatedYield)} variant="compact" />
            <MetricDisplay label="Actions Taken" value={s.agentLog.length.toString()} variant="compact" />
            <MetricDisplay label="Days Active" value={perf.daysActive.toString()} variant="compact" />
            <MetricDisplay label="Avg Daily Yield" value={formatUSD(s.accumulatedYield / Math.max(perf.daysActive, 1))} variant="compact" />
          </div>
        </Panel>
      </div>

      {/* Profit Distribution */}
      <div className="autopilot-distribution animate-fade-in-up stagger-3">
        <Panel variant="bordered" title="Profit Distribution" subtitle="How yield is allocated">
          <div className="distribution-bars">
            {[
              { label: 'Amortization', value: s.profitDistribution.amortization, color: 'accent' as const },
              { label: 'Reinvestment', value: s.profitDistribution.reinvestment, color: 'success' as const },
              { label: 'Reserve', value: s.profitDistribution.reserve, color: 'warning' as const },
            ].map(d => (
              <div key={d.label} className="distribution-row">
                <span className="distribution-row__label">{d.label}</span>
                <div className="distribution-row__bar">
                  <ProgressBar value={d.value} color={d.color} height={8} />
                </div>
                <span className="distribution-row__value">{d.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Agent Log */}
      <div className="autopilot-log animate-fade-in-up stagger-4">
        <Panel variant="bordered" title="Agent Activity Log" subtitle="Recent automated actions">
          <div className="log-list">
            {s.agentLog.map((log, i) => (
              <div key={i} className="log-entry">
                <span className="log-entry__time">{log.time}</span>
                <span className={`log-entry__dot log-entry__dot--${log.type}`} />
                <span className="log-entry__action">{log.action}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Configuration */}
      <div className="autopilot-config animate-fade-in-up stagger-5">
        <Panel variant="bordered" title="Configuration">
          <div className="config-grid">
            {[
              { label: 'Max Single Allocation', value: `${s.autopilotConfig.maxSingleAllocation}%` },
              { label: 'Rebalance Threshold', value: `${s.autopilotConfig.rebalanceThreshold}%` },
              { label: 'Auto-Repayment', value: s.autopilotConfig.autoRepayment ? 'Enabled' : 'Disabled' },
              { label: 'Min Reserve', value: `${s.autopilotConfig.minReserve}%` },
              { label: 'Risk Tolerance', value: s.autopilotConfig.riskTolerance.charAt(0).toUpperCase() + s.autopilotConfig.riskTolerance.slice(1) },
            ].map(c => (
              <div key={c.label} className="config-item">
                <span className="config-item__label">{c.label}</span>
                <span className="config-item__value">{c.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function AutopilotRail() {
  return (
    <div className="animate-fade-in-up stagger-3">
      <div className="section-label">How Autopilot Works</div>
      <div className="rail-info-blocks">
        {[
          { title: 'Monitoring', desc: 'Continuously monitors yield strategies and cash flow patterns.' },
          { title: 'Rebalancing', desc: 'Automatically moves capital between strategies when thresholds are crossed.' },
          { title: 'Repayment', desc: 'Allocates yield toward debt amortization based on distribution rules.' },
          { title: 'Harvesting', desc: 'Collects accrued yield and routes it per profit distribution settings.' },
        ].map(item => (
          <div key={item.title}>
            <div className="rail-info-blocks__title">{item.title}</div>
            <div>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
