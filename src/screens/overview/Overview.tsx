import './overview.css';
import { useStore, formatUSD, formatPercent } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { MetricDisplay } from '../../components/metric-display/MetricDisplay';
import { MiniChart } from '../../components/mini-chart/MiniChart';
import { AllocationBar } from '../../components/allocation-bar/AllocationBar';
import { ScoreGauge } from '../../components/score-gauge/ScoreGauge';
import { AlertItem } from '../../components/alert-item/AlertItem';
import { LiveValue } from '../../components/live-value/LiveValue';
import { useWallet } from '../../state/wallet';
import { ethers } from 'ethers';
import addresses from '../../config/contractAddresses.json';
import abis from '../../config/contractABIs.json';
import { useState } from 'react';

const ACTIVITY_ICONS: Record<string, string> = {
  rebalance: '⟲',
  payment: '✓',
  harvest: '↗',
  check: '◉',
  snapshot: '◻',
  allocation: '→',
  registration: '★'
};

export function Overview() {
  const s = useStore();

  useRightRail(<OverviewRail />, []);

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="screen-header__title">Overview</h1>
          <p className="screen-header__subtitle">Your autonomous account at a glance</p>
        </div>
        <ManageFunds />
      </div>

      {/* Hero Metrics */}
      <div className="overview-metrics animate-fade-in-up stagger-2">
        <Panel variant="bordered">
          <MetricDisplay
            label="Net Worth"
            value={<LiveValue value={formatUSD(s.netWorth)} />}
            change={formatPercent(s.netWorthChange)}
            changeType="positive"
            variant="compact"
          />
        </Panel>
        <Panel variant="bordered">
          <MetricDisplay label="Available Credit" value={formatUSD(s.availableCredit)} variant="compact" />
        </Panel>
        <Panel variant="bordered">
          <MetricDisplay label="Active Yield APY" value={<LiveValue value={`5%`} />} variant="compact" />
        </Panel>
        <Panel variant="bordered">
          <span className="overview-autopilot-label">
            Official Agent
          </span>
          <div className="autopilot-mini">
            <span className="autopilot-mini__indicator" style={{ backgroundColor: s.agentId !== '0' ? 'var(--status-success)' : 'var(--text-tertiary)' }} />
            <span className="autopilot-mini__label">{s.agentId !== '0' ? `ID #${s.agentId}` : 'Unregistered'}</span>
          </div>
          <span className="overview-autopilot-sub">
            System: Connected
          </span>
        </Panel>
      </div>

      {/* Performance Chart */}
      <div className="overview-chart-section animate-fade-in-up stagger-3">
        <Panel variant="bordered" title="Treasury Performance" subtitle="Last 30 days">
          <MiniChart data={s.equityHistory} color="accent" variant="area" height={220} />
        </Panel>
      </div>

      {/* Allocation */}
      <div className="overview-allocation animate-fade-in-up stagger-4">
        <Panel variant="bordered" title="Capital Allocation">
          <AllocationBar
            segments={[
              ...s.strategies.map((st, i) => ({
                label: st.name.split('(')[0].trim(),
                value: st.allocated,
                color: ['primary', 'secondary', 'tertiary', 'muted'][i],
              })),
              { label: 'Reserve', value: s.reserveCurrent, color: 'success' },
              { label: 'Idle', value: s.idleCapital, color: 'muted' },
            ]}
            large
          />
        </Panel>
      </div>

      {/* Recent Activity */}
      <div className="overview-activity animate-fade-in-up stagger-5">
        <Panel variant="bordered" title="Recent Activity" action="View All">
          <div className="overview-activity__list">
            {s.agentLog.slice(0, 5).map((log, i) => (
              <div key={i} className="activity-row">
                <div className={`activity-row__icon activity-row__icon--${log.type}`}>
                  {ACTIVITY_ICONS[log.type] || '•'}
                </div>
                <div className="activity-row__content">
                  <div className="activity-row__action">{log.action}</div>
                </div>
                <div className="activity-row__time">{log.time}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function OverviewRail() {
  const s = useStore();

  return (
    <>
      {/* Score mini */}
      <div className="animate-fade-in-up stagger-2">
        <div className="section-label">Behavioral Score</div>
        <ScoreGauge
          score={s.behavioralScore}
          grade={s.scoreGrade}
          variant="small"
          label="Updated 2 days ago"
        />
      </div>

      {/* Alerts */}
      <div className="animate-fade-in-up stagger-4 overview-rail-section">
        <div className="section-label">Alerts</div>
        <div className="alert-list">
          {s.alerts.slice(0, 3).map(a => (
            <AlertItem
              key={a.id}
              severity={a.severity}
              message={a.message}
              time={a.time}
              read={a.read}
            />
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="animate-fade-in-up stagger-5 overview-rail-section">
        <div className="section-label">Monthly Summary</div>
        <div className="overview-rail-metrics">
          <MetricDisplay label="Yield this month" value={formatUSD(s.yieldThisMonth)} variant="inline" />
          <MetricDisplay label="Protocol TVL" value={formatUSD(s.protocolTVL)} variant="inline" />
          <MetricDisplay label="Protocol Utilization" value={`${s.protocolUtilization.toFixed(1)}%`} variant="inline" />
        </div>
      </div>
    </>
  );
}

function ManageFunds() {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState<'idle' | 'depositing' | 'withdrawing'>('idle');

  const handleDeposit = async () => {
    if (!wallet.signer || !amount) return;
    try {
      setTxState('depositing');
      const usdcContract = new ethers.Contract(addresses.MockUSDC, abis.MockUSDC, wallet.signer);
      const vaultContract = new ethers.Contract(addresses.ArcVault, abis.ArcVault, wallet.signer);
      const parsedAmount = ethers.parseUnits(amount, 6);
      
      const approveTx = await usdcContract.approve(addresses.ArcVault, parsedAmount);
      await approveTx.wait();
      const depositTx = await vaultContract.deposit(parsedAmount);
      await depositTx.wait();
      setAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setTxState('idle');
    }
  };

  const handleWithdraw = async () => {
    if (!wallet.signer || !amount) return;
    try {
      setTxState('withdrawing');
      const vaultContract = new ethers.Contract(addresses.ArcVault, abis.ArcVault, wallet.signer);
      const parsedAmount = ethers.parseUnits(amount, 6);
      const withdrawTx = await vaultContract.withdraw(parsedAmount);
      await withdrawTx.wait();
      setAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setTxState('idle');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <input
        type="number"
        placeholder="0.00 USDC"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ 
          width: '130px', 
          padding: '10px 12px', 
          borderRadius: '8px', 
          border: '1px solid var(--accent)', 
          background: 'rgba(0,0,0,0.4)', 
          color: '#FFFFFF', /* PURE WHITE */
          fontSize: '14px',
          fontWeight: '600'
        }}
      />
      <button 
        onClick={handleDeposit}
        disabled={txState !== 'idle' || !amount}
        style={{ 
          background: 'var(--accent)', 
          color: '#000', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: '800', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          opacity: txState !== 'idle' ? 0.5 : 1 
        }}
      >
        {txState === 'depositing' ? '...' : 'Top Up'}
      </button>
      <button 
        onClick={handleWithdraw}
        disabled={txState !== 'idle' || !amount}
        style={{ 
          background: 'transparent', 
          border: '2px solid var(--border-strong)', 
          color: '#FFFFFF', /* PURE WHITE */
          padding: '10px 20px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: '700',
          opacity: txState !== 'idle' ? 0.5 : 1 
        }}
      >
        {txState === 'withdrawing' ? '...' : 'Withdraw'}
      </button>
    </div>
  );
}
