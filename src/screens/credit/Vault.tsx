import React, { useState } from 'react';
import './vault.css';
import { useStore, formatUSD } from '../../state/store';
import { useWallet } from '../../state/wallet';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { MetricDisplay } from '../../components/metric-display/MetricDisplay';
import { LiveValue } from '../../components/live-value/LiveValue';
import { ethers } from 'ethers';
import addresses from '../../config/contractAddresses.json';
import abis from '../../config/contractABIs.json';

export function Vault() {
  const s = useStore();
  const { wallet } = useWallet();

  // LP Actions: 'deposit' or 'withdraw'
  const [activeAction, setActiveAction] = useState<string>('deposit');
  
  const [amountStr, setAmountStr] = useState('');
  const [txState, setTxState] = useState<'idle' | 'pending'>('idle');
  const [error, setError] = useState<string | null>(null);

  // No separate rail anymore, we use the space in the grid
  useRightRail(null, []);

  const handleAction = async () => {
    if (!wallet.provider || !wallet.signer || !amountStr) return;
    
    setTxState('pending');
    setError(null);

    try {
      const vaultContract = new ethers.Contract(addresses.ArcVault, abis.ArcVault, wallet.signer);
      const usdcContract = new ethers.Contract(addresses.MockUSDC, abis.MockUSDC, wallet.signer);
      const amount = ethers.parseUnits(amountStr, 6);

      if (activeAction === 'deposit') {
        const approveTx = await usdcContract.approve(addresses.ArcVault, amount);
        await approveTx.wait();
        const tx = await vaultContract.deposit(amount);
        await tx.wait();
      } else if (activeAction === 'withdraw') {
        const tx = await vaultContract.withdraw(amount);
        await tx.wait();
      }

      setAmountStr('');
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Transaction failed.');
    } finally {
      setTxState('idle');
    }
  };

  // Health Gauge Math (Based on global protocol health for LP view)
  const healthPercent = 98; 
  const gaugeColor = '#00ff88';

  return (
    <>
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Vault</h1>
        <p className="screen-header__subtitle">Provide liquidity to the agentic economy and earn yield</p>
      </div>

      <div className="vault-container animate-fade-in-up stagger-2">
        {/* LEFT COLUMN: Actions & Analytics */}
        <div className="vault-left-col">
          <div className="vault-action-panel">
            <div className="vault-tabs" style={{ marginBottom: 'var(--space-4)' }}>
              <button 
                className={`vault-tab ${activeAction === 'deposit' ? 'vault-tab--active' : ''}`}
                onClick={() => setActiveAction('deposit')}
              >
                Deposit
              </button>
              <button 
                className={`vault-tab ${activeAction === 'withdraw' ? 'vault-tab--active' : ''}`}
                onClick={() => setActiveAction('withdraw')}
              >
                Withdraw
              </button>
            </div>

            <div className="vault-input-group">
              <label className="vault-input-label">Amount in USDC</label>
              <div className="vault-input-wrapper">
                <input 
                  type="number" 
                  className="vault-input-field" 
                  placeholder="0.00"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                />
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>USDC</span>
              </div>
            </div>

            <button 
              className="vault-confirm-btn vault-confirm-btn--primary"
              onClick={handleAction}
              disabled={txState !== 'idle' || !amountStr}
            >
              {txState === 'pending' ? 'Processing...' : `Confirm ${activeAction}`}
            </button>

            {error && <div style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>{error}</div>}

            <div style={{ marginTop: 'var(--space-5)' }}>
              <div className="vault-info-strip">
                <span>Estimated Gas</span>
                <span style={{ color: '#00ff88' }}>$0.0001 (ARC)</span>
              </div>
              <div className="vault-info-strip">
                <span>Settlement</span>
                <span>Instant</span>
              </div>
            </div>
          </div>

          <Panel variant="bordered" title="Economy Overview" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ padding: '4px' }}>
              <div className="vault-info-strip" style={{ background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                <span>Capital Velocity</span>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{s.capitalVelocity.toFixed(1)}x</span>
              </div>
              <div className="vault-info-strip" style={{ background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                <span>Agent Utilization</span>
                <span>{s.protocolUtilization.toFixed(1)}%</span>
              </div>
              <div className="vault-info-strip" style={{ background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                <span>Slashing Reserve</span>
                <span>{formatUSD(s.protocolRevenue * 0.2)}</span>
              </div>
            </div>
          </Panel>

          <div className="vault-security-notice" style={{ marginTop: 'var(--space-4)' }}>
             <div className="section-label">Vault Security</div>
             <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: '1.6', margin: '8px 0' }}>
               Your liquidity is utilized by high-reputation agents. Real-time slashing and the H2A Safety Module ensure capital protection.
             </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Stats & Gauge */}
        <div className="vault-stats-panel">
          <div className="vault-stats-grid">
            <div className="vault-stat-card">
              <div className="vault-stat-label">Your Liquidity</div>
              <div className="vault-stat-value vault-stat-value--success">
                <LiveValue value={formatUSD(s.netWorth)} />
              </div>
            </div>
            <div className="vault-stat-card">
              <div className="vault-stat-label">Agentic Debt</div>
              <div className="vault-stat-value vault-stat-value--danger">
                <LiveValue value={formatUSD(s.protocolTotalBorrowed)} />
              </div>
            </div>
            <div className="vault-stat-card">
              <div className="vault-stat-label">Protocol APY</div>
              <div className="vault-stat-value">
                {s.activeYieldAPY}%
              </div>
            </div>
            <div className="vault-stat-card" style={{ border: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div className="vault-stat-label">Total Fee Revenue</div>
              <div className="vault-stat-value vault-stat-value--success">
                <LiveValue value={formatUSD(s.protocolRevenue || 0)} />
              </div>
            </div>
            <div className="vault-stat-card">
              <div className="vault-stat-label">Active Agents</div>
              <div className="vault-stat-value">
                {s.agentRegistry.filter(a => a.status === 'active').length}
              </div>
            </div>
            <div className="vault-stat-card">
              <div className="vault-stat-label">Accumulated Yield</div>
              <div className="vault-stat-value vault-stat-value--accent">
                <LiveValue value={formatUSD(s.accumulatedYield)} />
              </div>
            </div>
          </div>

          <div className="vault-health-panel">
            <div className="health-gauge-container">
              <svg className="health-gauge-svg" width="240" height="240">
                <circle className="health-gauge-bg" cx="120" cy="120" r="110" />
                <circle 
                  className="health-gauge-fill" 
                  cx="120" 
                  cy="120" 
                  r="110" 
                  stroke={gaugeColor}
                  strokeDasharray={`${2 * Math.PI * 110}`}
                  strokeDashoffset={0}
                />
              </svg>
              <div className="health-gauge-content">
                <div className="health-gauge-value">
                   98%
                </div>
                <div className="health-gauge-label">PROTOCOL PROTECTION</div>
              </div>
            </div>
            
            <div className="lp-status-banner">
               <span className="pulse-dot"></span>
               Lending Pool Status: Optimal Growth
            </div>
          </div>
        </div>
      </div>

      {/* Agent Trust Registry */}
      <div className="animate-fade-in-up stagger-3" style={{ marginTop: 'var(--space-6)' }}>
        <Panel variant="bordered" title="Agent Trust Registry (ERC-8004)">
          <div className="agent-registry-grid">
            <table className="agent-table">
              <thead>
                <tr>
                  <th>Agent ID</th>
                  <th>Entity Name</th>
                  <th>Reputation Score</th>
                  <th>Status</th>
                  <th>Interest Rate</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {s.agentRegistry.map(agent => (
                  <tr key={agent.id} className={agent.status === 'slashed' ? 'row--slashed' : ''}>
                    <td className="cell--id">#{agent.id.padStart(4, '0')}</td>
                    <td className="cell--name">{agent.name}</td>
                    <td>
                      <div className="cell--score">
                        <div className="score-bar-bg">
                          <div 
                            className="score-bar-fill" 
                            style={{ 
                              width: `${agent.score / 10}%`,
                              background: agent.status === 'slashed' ? '#ff4d4d' : 'var(--accent)'
                            }} 
                          />
                        </div>
                        <span>{agent.score}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-tag status--${agent.status}`}>
                        {agent.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: agent.interestRate > 15 ? '#ff4d4d' : 'inherit' }}>
                      {agent.interestRate.toFixed(1)}%
                    </td>
                    <td className="cell--activity">{agent.lastAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
