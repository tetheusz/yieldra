import React, { useState } from 'react';
import './credit.css';
import { useStore, formatUSD } from '../../state/store';
import { useWallet } from '../../state/wallet';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { MetricDisplay } from '../../components/metric-display/MetricDisplay';
import { ScoreGauge } from '../../components/score-gauge/ScoreGauge';
import { StatusBadge } from '../../components/status-badge/StatusBadge';
import { ProgressBar } from '../../components/mini-chart/MiniChart';
import { LiveValue } from '../../components/live-value/LiveValue';
import { ethers } from 'ethers';
import addresses from '../../config/contractAddresses.json';
import abis from '../../config/contractABIs.json';

export function Credit() {
  const s = useStore();
  const { wallet } = useWallet();

  const [borrowAmountStr, setBorrowAmountStr] = useState('');
  const [repayAmountStr, setRepayAmountStr] = useState('');
  const [txState, setTxState] = useState<'idle' | 'borrowing' | 'repaying'>('idle');
  const [error, setError] = useState<string | null>(null);

  useRightRail(<CreditRail />, []);

  const handleBorrow = async () => {
    if (!wallet.provider || !wallet.signer) return;
    try {
      setTxState('borrowing');
      setError(null);
      const creditContract = new ethers.Contract(addresses.ArcCreditManager, abis.ArcCreditManager, wallet.signer);
      const amount = ethers.parseUnits(borrowAmountStr || '0', 6);
      const tx = await creditContract.borrow(amount);
      await tx.wait();
      setBorrowAmountStr('');
      setTxState('idle');
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Borrow failed.');
      setTxState('idle');
    }
  };

  const handleRepay = async () => {
    if (!wallet.provider || !wallet.signer) return;
    try {
      setTxState('repaying');
      setError(null);
      const creditContract = new ethers.Contract(addresses.ArcCreditManager, abis.ArcCreditManager, wallet.signer);
      const usdcContract = new ethers.Contract(addresses.MockUSDC, abis.MockUSDC, wallet.signer);
      
      const amount = ethers.parseUnits(repayAmountStr || '0', 6);
      
      // 1. Approve USDC first
      const approveTx = await usdcContract.approve(addresses.ArcCreditManager, amount);
      await approveTx.wait();

      // 2. Repay
      const tx = await creditContract.repay(amount);
      await tx.wait();
      
      setRepayAmountStr('');
      setTxState('idle');
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Repay failed.');
      setTxState('idle');
    }
  };

  const utilColor = s.creditUtilization > 75 ? 'danger' : s.creditUtilization > 50 ? 'warning' : 'accent';
  const utilDesc = s.creditUtilization <= 30
    ? 'Excellent — low utilization maintains a healthy score.'
    : s.creditUtilization <= 50
    ? 'Good — moderate utilization within healthy range.'
    : 'Attention — high utilization may impact your score.';

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Credit</h1>
        <p className="screen-header__subtitle">Behavioral scoring and dynamic credit line</p>
      </div>

      {/* Hero: Score + Credit */}
      <div className="credit-hero animate-fade-in-up stagger-2">
        <Panel variant="bordered" className="credit-hero__score-panel">
          <ScoreGauge
            score={s.behavioralScore}
            grade={s.scoreGrade}
            variant="large"
            label="Behavioral Score (0-850)"
          />
        </Panel>

        <Panel variant="bordered" title="Credit Line">
          <div className="credit-line-metrics">
            <MetricDisplay label="Total Limit" value={<LiveValue value={formatUSD(s.creditLimit)} />} variant="compact" />
            <MetricDisplay label="Available" value={<LiveValue value={formatUSD(s.availableCredit)} />} variant="compact" changeType="positive" />
            <MetricDisplay label="Used" value={<LiveValue value={formatUSD(s.currentDebt)} />} variant="compact" />
          </div>
        </Panel>
      </div>

      {/* Credit Details */}
      <div className="credit-details animate-fade-in-up stagger-3">
        <Panel variant="bordered" title="Current Debt">
          <div className="credit-debt-metrics">
            <MetricDisplay label="Outstanding Principal" value={<LiveValue value={formatUSD(s.currentDebt)} />} variant="compact" />
            <MetricDisplay label="Accrued Interest" value={<LiveValue value={formatUSD(s.debtInterest)} />} variant="compact" />
            
            <div className="credit-next-payment">
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', alignItems: 'center' }}>
                <input 
                  type="number" 
                  value={borrowAmountStr} 
                  onChange={e => setBorrowAmountStr(e.target.value)} 
                  placeholder="0.00" 
                  style={{ width: '90px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--accent)', background: 'rgba(0,0,0,0.3)', color: '#FFFFFF', fontSize: '14px' }}
                />
                <button 
                  onClick={handleBorrow} 
                  disabled={txState !== 'idle' || !borrowAmountStr}
                  style={{ background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', opacity: txState !== 'idle' ? 0.5 : 1, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {txState === 'borrowing' ? '...' : 'Borrow'}
                </button>

                <div style={{ width: '1px', background: 'var(--border-subtle)', height: '32px', margin: '0 12px' }} />

                <input 
                  type="number" 
                  value={repayAmountStr} 
                  onChange={e => setRepayAmountStr(e.target.value)} 
                  placeholder="0.00" 
                  style={{ width: '90px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: 'rgba(0,0,0,0.3)', color: '#FFFFFF', fontSize: '14px' }}
                />
                <button 
                  onClick={handleRepay} 
                  disabled={txState !== 'idle' || !repayAmountStr}
                  style={{ background: 'transparent', border: '2px solid var(--border-strong)', color: '#FFFFFF', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', opacity: txState !== 'idle' ? 0.5 : 1, fontWeight: '700' }}
                >
                  {txState === 'repaying' ? '...' : 'Repay'}
                </button>
              </div>
              {error && <div style={{ color: 'var(--status-danger)', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
            </div>
          </div>
        </Panel>

        <Panel variant="bordered" title="Credit Utilization">
          <div className="credit-utilization__bar-wrap">
            <span className="credit-utilization__pct">{s.creditUtilization}%</span>
            <ProgressBar value={s.creditUtilization} color={utilColor} height={10} style={{ flex: 1 }} />
          </div>
          <p className="credit-utilization__desc">{utilDesc}</p>
        </Panel>
      </div>

      {/* Repayment History */}
      <div className="credit-repayment animate-fade-in-up stagger-4">
        <Panel variant="bordered" title="Repayment History">
          {s.repaymentHistory.map((r, i) => (
            <div key={i} className="repayment-row">
              <span className="repayment-row__date">{r.date}</span>
              <span className="repayment-row__amount">{formatUSD(r.amount)}</span>
              <span className="repayment-row__status">
                <StatusBadge
                  label={r.status === 'paid' ? 'Paid' : 'Pending'}
                  variant={r.status === 'paid' ? 'success' : 'warning'}
                />
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function CreditRail() {
  return (
    <div className="animate-fade-in-up stagger-3">
      <div className="section-label">How It Works</div>
      <div className="credit-rail__info">
        {[
          { title: 'Behavioral Score', desc: 'Calculated from cash flow patterns, payment history, and account stability.' },
          { title: 'Dynamic Credit', desc: 'Your credit limit adjusts automatically based on your behavioral score and equity.' },
          { title: 'Auto-Repayment', desc: 'The autopilot allocates a portion of yield to automatically repay debt.' },
        ].map(item => (
          <div key={item.title}>
            <div className="credit-rail__info-title">{item.title}</div>
            <div>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
