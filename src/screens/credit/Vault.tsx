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

  // Tabs: 'collateral' or 'debt'
  const [activeMode, setActiveMode] = useState<'collateral' | 'debt'>('collateral');
  // Sub-tabs: 'deposit'/'withdraw' or 'borrow'/'repay'
  const [activeAction, setActiveAction] = useState<string>('deposit');
  
  const [amountStr, setAmountStr] = useState('');
  const [txState, setTxState] = useState<'idle' | 'pending'>('idle');
  const [error, setError] = useState<string | null>(null);

  useRightRail(<VaultRail />, []);

  const handleAction = async () => {
    if (!wallet.provider || !wallet.signer || !amountStr) return;
    
    setTxState('pending');
    setError(null);

    try {
      const vaultContract = new ethers.Contract(addresses.ArcVault, abis.ArcVault, wallet.signer);
      const creditContract = new ethers.Contract(addresses.ArcCreditManager, abis.ArcCreditManager, wallet.signer);
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
      } else if (activeAction === 'borrow') {
        const tx = await creditContract.borrow(amount);
        await tx.wait();
      } else if (activeAction === 'repay') {
        const approveTx = await usdcContract.approve(addresses.ArcCreditManager, amount);
        await approveTx.wait();
        const tx = await creditContract.repay(amount);
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

  // Health Gauge Math
  const healthPercent = Math.min(100, Math.max(0, s.healthFactor * 20)); // Normalized for UI
  const gaugeColor = s.healthFactor > 3 ? '#00ff88' : s.healthFactor > 1.5 ? 'var(--accent)' : '#ff4d4d';
  
  // Liquidation Price Simulation
  const liqPrice = s.currentDebt > 0 ? (s.currentDebt / (s.netWorth * 0.8)) : 0;

  return (
    <>
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Vault</h1>
        <p className="screen-header__subtitle">Institution-grade smart vault management</p>
      </div>

      <div className="vault-container animate-fade-in-up stagger-2">
        {/* Left: Action Panel */}
        <div className="vault-action-panel">
          <div className="vault-tabs">
            <div 
              className={`vault-tab ${activeMode === 'collateral' ? 'vault-tab--active' : ''}`}
              onClick={() => { setActiveMode('collateral'); setActiveAction('deposit'); }}
            >
              Collateral
            </div>
            <div 
              className={`vault-tab ${activeMode === 'debt' ? 'vault-tab--active' : ''}`}
              onClick={() => { setActiveMode('debt'); setActiveAction('borrow'); }}
            >
              Debt
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {activeMode === 'collateral' ? (
              <>
                <button 
                  className={`vault-tab ${activeAction === 'deposit' ? 'vault-tab--active' : ''}`}
                  onClick={() => setActiveAction('deposit')}
                  style={{ background: 'transparent', border: activeAction === 'deposit' ? '1px solid var(--accent)' : 'none' }}
                >
                  Deposit
                </button>
                <button 
                  className={`vault-tab ${activeAction === 'withdraw' ? 'vault-tab--active' : ''}`}
                  onClick={() => setActiveAction('withdraw')}
                  style={{ background: 'transparent', border: activeAction === 'withdraw' ? '1px solid var(--accent)' : 'none' }}
                >
                  Withdraw
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`vault-tab ${activeAction === 'borrow' ? 'vault-tab--active' : ''}`}
                  onClick={() => setActiveAction('borrow')}
                  style={{ background: 'transparent', border: activeAction === 'borrow' ? '1px solid var(--accent)' : 'none' }}
                >
                  Borrow
                </button>
                <button 
                  className={`vault-tab ${activeAction === 'repay' ? 'vault-tab--active' : ''}`}
                  onClick={() => setActiveAction('repay')}
                  style={{ background: 'transparent', border: activeAction === 'repay' ? '1px solid var(--accent)' : 'none' }}
                >
                  Repay
                </button>
              </>
            )}
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

        {/* Right: Stats Panel */}
        <div className="vault-stats-panel">
          <div className="vault-stats-grid">
            <div className="vault-stat-card">
              <div className="vault-stat-label">Total Collateral</div>
              <div className="vault-stat-value vault-stat-value--success">
                <LiveValue value={formatUSD(s.netWorth)} />
              </div>
            </div>
            <div className="vault-stat-card">
              <div className="vault-stat-label">Total Debt</div>
              <div className="vault-stat-value vault-stat-value--danger">
                <LiveValue value={formatUSD(s.currentDebt)} />
              </div>
            </div>
            <div className="vault-stat-card">
              <div className="vault-stat-label">Liquidation Diff</div>
              <div className="vault-stat-value">
                {s.currentDebt > 0 ? (s.healthFactor.toFixed(2)) : '∞'}
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
                  strokeDashoffset={`${2 * Math.PI * 110 * (1 - healthPercent/100)}`}
                />
              </svg>
              <div className="health-gauge-content">
                <div className="health-gauge-value">
                   {Math.round(healthPercent)}%
                </div>
                <div className="health-gauge-label">GOOD STANDING</div>
              </div>
            </div>
          </div>

          <Panel variant="bordered" title="Risk Overview" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ padding: '4px' }}>
              <div className="vault-info-strip" style={{ background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                <span>Health Factor</span>
                <span style={{ color: gaugeColor, fontWeight: 800 }}>{s.healthFactor.toFixed(2)}</span>
              </div>
              <div className="vault-info-strip" style={{ background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                <span>Credit Utilization</span>
                <span>{s.creditUtilization}%</span>
              </div>
              <div className="vault-info-strip" style={{ background: 'transparent', paddingLeft: 0, paddingRight: 0 }}>
                <span>Max LTV</span>
                <span>80.00%</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function VaultRail() {
  const s = useStore();

  return (
    <div className="animate-fade-in-up stagger-3">
      <div className="section-label">Vault Security</div>
      <Panel variant="bordered" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Your positions are protected by autonomous liquidators. Maintain a health factor above <strong>1.5</strong> to avoid liquidation risk.
        </div>
      </Panel>
      
      <div className="section-label">Yield Stats</div>
      <div className="vault-info-strip" style={{ marginBottom: '8px' }}>
        <span>Last Update</span>
        <span>Just now</span>
      </div>
      <div className="vault-info-strip">
        <span>Accumulated Yield</span>
        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{formatUSD(s.accumulatedYield)}</span>
      </div>
    </div>
  );
}
