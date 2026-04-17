import './treasury.css';
import { useStore, formatUSD, formatCompact } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { LiveValue } from '../../components/live-value/LiveValue';
import { useWallet } from '../../state/wallet';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import addresses from '../../config/contractAddresses.json';
import abis from '../../config/contractABIs.json';

export function Treasury() {
  const s = useStore();
  const [pulse, setPulse] = useState(false);

  // Simulation of terminal pulse
  useEffect(() => {
    const int = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(int);
  }, []);

  useRightRail(<EconomyRail />, [s.capitalVelocity, s.protocolRevenue]);

  return (
    <div className="economy-terminal">
      {/* Terminal Title Bar */}
      <div className="terminal-header animate-fade-in-up">
        <div className="terminal-dot" />
        <h1 className="terminal-title">YIELDRA ECONOMY CORE // LIVE ACTION MONITOR</h1>
        <div className="terminal-status">
          <span className={pulse ? 'pulse-on' : 'pulse-off'}>●</span>
          SYNCING ARC L1
        </div>
      </div>

      {/* Top Grid: Pulse Metrics */}
      <div className="economy-grid animate-fade-in-up stagger-1">
        <div className="terminal-card terminal-card--glow">
          <div className="terminal-card__label">CAPITAL VELOCITY</div>
          <div className="terminal-card__value">
            {s.capitalVelocity?.toFixed(1) || '0.0'}x
            <span className="terminal-card__sub">DAILY CIRCULATION</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="terminal-card__label">TX VOLUME 24H</div>
          <div className="terminal-card__value">
            {formatCompact(s.txVolume24h || 0)}
            <span className="terminal-card__sub">USDC PROCESSED</span>
          </div>
        </div>
        <div className="terminal-card">
          <div className="terminal-card__label">CUMULATIVE NANO DEBT</div>
          <div className="terminal-card__value" style={{ color: 'var(--accent)' }}>
            {formatUSD(s.protocolTotalBorrowed)}
            <span className="terminal-card__sub">INSTITUTIONAL LEVERAGE</span>
          </div>
        </div>
      </div>

      {/* The Formula Lab */}
      <div className="formula-lab animate-fade-in-up stagger-2">
        <div className="formula-box">
          <div className="formula-header">
            <span className="formula-tag">MATH ENGINE</span>
            <h2>UTILITY YIELD FORMULA</h2>
          </div>
          <div className="formula-display">
            <div className="formula-part">
              <span className="formula-val">{formatCompact(s.txVolume24h / 100)}</span>
              <span className="formula-lbl">TXs</span>
            </div>
            <div className="formula-op">×</div>
            <div className="formula-part">
              <span className="formula-val">$0.001</span>
              <span className="formula-lbl">FEE</span>
            </div>
            <div className="formula-op">×</div>
            <div className="formula-part">
              <span className="formula-val">{s.capitalVelocity.toFixed(1)}</span>
              <span className="formula-lbl">VELOCITY</span>
            </div>
            <div className="formula-eq">=</div>
            <div className="formula-result">
              <span className="formula-val">{s.activeYieldAPY}%</span>
              <span className="formula-lbl">CURRENT APY</span>
            </div>
          </div>
          <div className="formula-footer">
            Dynamic yield generation driven by on-chain agent revenue injections. APY levels spike with transaction volume and decay during idle periods.
          </div>
        </div>
      </div>

      {/* Live Transaction Matrix */}
      <div className="terminal-matrix animate-fade-in-up stagger-3">
        <div className="matrix-header">
          <span>SOURCE AGENT</span>
          <span>ACTION TYPE</span>
          <span>AMOUNT</span>
          <span>FEE BPS</span>
          <span>TIMESTAMP</span>
        </div>
        <div className="matrix-scroll">
          {s.agentLog.slice(0, 8).map((log, i) => (
            <div key={i} className={`matrix-row matrix-row--${log.type}`}>
               <div className="matrix-cell">AGENT 00{i+4}</div>
               <div className="matrix-cell">{log.type?.toUpperCase()}</div>
               <div className="matrix-cell">${(Math.random()*100).toFixed(2)}</div>
               <div className="matrix-cell">1.0</div>
               <div className="matrix-cell">{log.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EconomyRail() {
  const s = useStore();
  const { wallet } = useWallet();
  const [injectAmount, setInjectAmount] = useState('1.0');
  const [loading, setLoading] = useState(false);

  const handleInjectRevenue = async () => {
    if (!wallet.signer || !injectAmount) return;
    setLoading(true);
    try {
      const creditContract = new ethers.Contract(addresses.ArcCreditManager, abis.ArcCreditManager, wallet.signer);
      const usdcContract = new ethers.Contract(addresses.MockUSDC, abis.MockUSDC, wallet.signer);
      const amount = ethers.parseUnits(injectAmount, 6);

      // Approve & Inject
      const approveTx = await usdcContract.approve(addresses.ArcCreditManager, amount);
      await approveTx.wait();
      const tx = await creditContract.injectProtocolRevenue(amount);
      await tx.wait();
      
      alert('YIELD ACCELERATED: Faucet revenue injected into the protocol.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-rail animate-fade-in-up stagger-4">
      {/* SIMULATOR CONSOLE */}
      <div className="section-label">DEMO: YIELD ACCELERATOR</div>
      <div className="sim-console">
        <div className="sim-input-box">
          <input 
            type="number" 
            value={injectAmount} 
            onChange={(e) => setInjectAmount(e.target.value)}
            className="sim-input"
          />
          <span className="sim-unit">USDC</span>
        </div>
        <button 
          className="sim-btn" 
          onClick={handleInjectRevenue}
          disabled={loading}
        >
          {loading ? 'ACCELERATING...' : 'INJECT AGENT REVENUE'}
        </button>
        <p className="sim-hint">Simulate high-frequency agent traffic using faucet funds.</p>
      </div>

      <div className="section-label" style={{ marginTop: 'var(--space-6)' }}>Revenue Stream</div>
      <div className="revenue-card">
        <div className="revenue-val">{formatUSD(s.protocolRevenue)}</div>
        <div className="revenue-lbl">TOTAL NANOPAYMENTS ACCRUED</div>
      </div>

      <div className="section-label" style={{ marginTop: 'var(--space-6)' }}>Network Load</div>
      <div className="load-box">
        <div className="load-header">
          <span>UTILIZATION</span>
          <span>{s.protocolUtilization.toFixed(1)}%</span>
        </div>
        <div className="load-bar">
          <div className="load-bar-fill" style={{ width: `${s.protocolUtilization}%` }} />
        </div>
      </div>
      
      <p className="rail-desc-mono" style={{ marginTop: '16px' }}>
        PROTOCOL HEALTH: OPERATIONAL<br />
        LATENCY: 12ms<br />
        NET SETTLEMENT: BATCHED
      </p>
    </div>
  );
}
