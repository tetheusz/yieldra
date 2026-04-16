import './treasury.css';
import { useStore, formatUSD, formatPercent } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { MetricDisplay } from '../../components/metric-display/MetricDisplay';
import { DataTable } from '../../components/data-table/DataTable';
import { MiniChart, ProgressBar } from '../../components/mini-chart/MiniChart';
import { AllocationBar } from '../../components/allocation-bar/AllocationBar';
import { StatusBadge } from '../../components/status-badge/StatusBadge';
import { LiveValue } from '../../components/live-value/LiveValue';

export function Treasury() {
  const s = useStore();

  useRightRail(<TreasuryRail />, []);

  // For the demo, we read the real Net Worth from the ArcVault (inflated algorithmically)
  // We'll calculate the difference between real deposit and initial principal visually if we want, 
  // but for simplicity, we just show their total equity as "Total Locked".

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">APY</h1>
        <p className="screen-header__subtitle">Lock capital and farm yield strategies</p>
      </div>

      {/* Yield Metrics */}
      <div className="treasury-equity animate-fade-in-up stagger-2">
        <Panel variant="bordered">
          <MetricDisplay label="Total Locked (Native" value={<LiveValue value={formatUSD(s.netWorth)} />} variant="compact" />
        </Panel>
        <Panel variant="bordered">
          <MetricDisplay label="Current Base APY" value={<span style={{ color: 'var(--status-success)' }}>5%</span>} variant="compact" />
        </Panel>
        <Panel variant="bordered">
          <MetricDisplay label="Yield Earned" value={<LiveValue value={formatUSD(s.accumulatedYield)} />} variant="compact" />
        </Panel>
      </div>

      {/* Strategy Marketplace */}
      <div className="treasury-strategies animate-fade-in-up stagger-3" style={{ marginTop: 'var(--space-4)' }}>
        <Panel variant="bordered" title="Yield Strategies">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Allocate your idle capital or credit line to strategies. Lock periods multiply your APY rewards.
          </p>

          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            
            {/* Strategy Card 1 */}
            <div style={{ border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Arc Native Base Pool</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Default algorithmic yield. Instant withdrawal.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--status-success)', fontWeight: 'bold', fontSize: '18px' }}>5% APY</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No Lock</div>
              </div>
            </div>

            {/* Strategy Card 2 */}
            <div style={{ border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>DeFi Degen (Alice's Loop)</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>High risk leveraging on Layer-2s. Lock for 30 days.</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '18px' }}>15% APY</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>30D Lock</div>
                </div>
                <button style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>Lock</button>
              </div>
            </div>

            {/* Strategy Card 3 */}
            <div style={{ border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Institutional RWA Yield</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Safe haven backing tokenized T-Bills. Lock for 90 days.</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--status-success)', fontWeight: 'bold', fontSize: '18px' }}>15% APY</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>90D Lock</div>
                </div>
                <button style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', opacity: 0.5 }}>Soon</button>
              </div>
            </div>

          </div>
        </Panel>
      </div>
    </>
  );
}

function TreasuryRail() {
  return (
    <>
      <div className="animate-fade-in-up stagger-2">
        <div className="section-label">How Locking Works</div>
        <p className="rail-desc">
          When you lock your collateral, you temporarily lose the ability to withdraw or use it to back your credit line, but in exchange, the APY yields are significantly multiplied.
        </p>
      </div>

      <div className="animate-fade-in-up stagger-4" style={{ marginTop: 'var(--space-8)' }}>
        <div className="section-label">Copy-Trade Mechanics</div>
        <p className="rail-desc">
          Social strategies allow you to allocate funds to an expert's vault. They take a small percentage fee (e.g. 2%) of the generated yield for managing the active trades.
        </p>
      </div>
    </>
  );
}
