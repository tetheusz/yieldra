import React, { useState, useEffect } from 'react';
import { useStore, formatUSD } from '../../state/store';
import { calculateNetYield } from '../../engines/risk';
import './leverage-slider.css';

interface LeverageSliderProps {
  onBoost: (amount: number) => Promise<void>;
  isProcessing: boolean;
}

export function LeverageSlider({ onBoost, isProcessing }: LeverageSliderProps) {
  const { state } = useStore();
  const [factor, setFactor] = useState(1.0);
  
  // Mathematical limits and constants
  const vaultApy = 5.0;     // 5% from contract
  const borrowRate = 3.0;   // 3% from contract
  const maxFactor = state.behavioralScore > 800 ? 1.8 : 1.6;

  // Real-time projected stats
  const principal = state.netWorth;
  const borrowAmount = principal * (factor - 1.0);
  const projectedApy = calculateNetYield(principal, borrowAmount, vaultApy, borrowRate);
  
  // Autonomous Recommendation
  const isProfitable = projectedApy > vaultApy;
  const riskStatus = factor > 1.5 ? 'high' : factor > 1.3 ? 'medium' : 'low';

  return (
    <div className="leverage-container">
      <div className="leverage-header">
        <span className="leverage-header__label">Autonomous Leverage</span>
        <span className={`leverage-header__factor leverage-header__factor--${riskStatus}`}>
          {factor.toFixed(2)}x
        </span>
      </div>

      <input
        type="range"
        min="1.0"
        max={maxFactor.toString()}
        step="0.05"
        value={factor}
        onChange={(e) => setFactor(parseFloat(e.target.value))}
        className={`leverage-slider leverage-slider--${riskStatus}`}
        disabled={isProcessing}
      />

      <div className="leverage-preview">
        <div className="leverage-preview__item">
          <span className="preview-label">Projected Net APY</span>
          <span className={`preview-value ${isProfitable ? 'text-success' : 'text-warning'}`}>
            {projectedApy.toFixed(2)}%
          </span>
        </div>
        <div className="leverage-preview__item">
          <span className="preview-label">Additional Debt</span>
          <span className="preview-value">{formatUSD(borrowAmount)}</span>
        </div>
      </div>

      {factor > 1.0 && (
        <div className="agent-recommendation">
           <span className="agent-recommendation__icon">🤖</span>
           <span className="agent-recommendation__text">
             {isProfitable 
               ? `Agent: Strategy is profitable. Net increase: +${(projectedApy - vaultApy).toFixed(2)}% APY.`
               : `Agent: Warning! Debt interest reduces your total yield. Not recommended.`}
           </span>
        </div>
      )}

      <button 
        className="leverage-boost-btn"
        disabled={isProcessing || factor <= 1.0 || !isProfitable}
        onClick={() => onBoost(borrowAmount)}
      >
        {isProcessing ? 'Processing Boost...' : 'Boost My Yield'}
      </button>
    </div>
  );
}
